# CareSaathi-AI Continuous Auto-Sync (Pull & Push)
# Watches for local file changes, auto-commits & pushes, and regularly pulls remote updates.

$RepoPath = $PSScriptRoot
if (-not $RepoPath) { $RepoPath = (Get-Location).Path }
Set-Location $RepoPath

# Git Configuration
$Remote = "origin"
$QuietSeconds = 5        # Debounce delay after editing stops before committing
$PollSeconds = 2         # Frequency of file system check (seconds)
$RemotePullInterval = 15 # Frequency of remote update checks when idle (seconds)
$RetryInterval = 20      # Retry interval after a failed push

# Verify Git repository
$InsideRepo = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $InsideRepo -ne "true") {
    throw "Directory '$RepoPath' is not a valid Git repository."
}

$Branch = (git branch --show-current).Trim()
if (-not $Branch) {
    $Branch = "main"
}

git remote get-url $Remote *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Git remote '$Remote' is not configured."
}

$LastStatus = $null
$LastChangeTime = Get-Date
$LastRemoteCheck = (Get-Date).AddSeconds(-$RemotePullInterval)
$LastPushAttempt = (Get-Date).AddSeconds(-$RetryInterval)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "CareSaathi-AI Real-Time Git Auto-Sync Active" -ForegroundColor Green
Write-Host "Repository : $RepoPath"
Write-Host "Branch     : $Branch"
Write-Host "Remote     : $Remote"
Write-Host "Commit lag : $QuietSeconds seconds after editing"
Write-Host "Auto-pull  : Every $RemotePullInterval seconds when idle"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to terminate auto-sync.`n"

while ($true) {
    $StatusLines = @(git status --porcelain --untracked-files=all)
    $StatusText = $StatusLines -join "`n"

    # Reset quiet-period timer if changes are ongoing
    if ($StatusText -ne $LastStatus) {
        $LastStatus = $StatusText
        $LastChangeTime = Get-Date

        if ($StatusText) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Action detected! Debouncing ($QuietSeconds s)..." -ForegroundColor Yellow
        }
    }

    $QuietFor = ((Get-Date) - $LastChangeTime).TotalSeconds

    # Action has settled for $QuietSeconds: Stage, Pull --rebase, Commit & Push
    if ($StatusText -and $QuietFor -ge $QuietSeconds) {
        $SensitivePattern = '(?i)(^|[\s"\\/])(\.env($|[\s\\/])|\.env\.[^\\/\s]+|[^\\/\s]*(secret|credential|service.account)[^\\/\s]*|[^\\/\s]+\.(pem|key|p12|pfx))'

        if ($StatusText -match $SensitivePattern) {
            Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Sensitive file detected (.env/keys). Review manually; skipping auto-commit."
            $LastChangeTime = Get-Date
        }
        else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Syncing changes to GitHub..." -ForegroundColor Cyan

            # Pull remote changes first with rebase and autostash
            git pull --rebase --autostash $Remote $Branch *> $null

            # Stage all changes
            git add -A

            if ($LASTEXITCODE -ne 0) {
                Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] git add failed. Will retry..."
                $LastChangeTime = Get-Date
            }
            else {
                $Staged = git diff --cached --name-only

                if ($Staged) {
                    $Message = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                    git commit -m $Message

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Created commit. Pushing to origin/$Branch..." -ForegroundColor DarkCyan
                        git push $Remote $Branch

                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push successful!" -ForegroundColor Green
                        }
                        else {
                            Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Push failed. Will retry automatically."
                        }
                        $LastPushAttempt = Get-Date
                    }
                    else {
                        Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Commit failed."
                    }
                }

                $LastChangeTime = Get-Date
                $LastStatus = $null
            }
        }
    }

    # Idle sync: Periodically check and pull latest commits from remote
    $TimeSinceRemoteCheck = ((Get-Date) - $LastRemoteCheck).TotalSeconds
    if (-not $StatusText -and $TimeSinceRemoteCheck -ge $RemotePullInterval) {
        $LastRemoteCheck = Get-Date

        # Check for remote updates quietly
        git fetch $Remote $Branch *> $null
        if ($LASTEXITCODE -eq 0) {
            $BehindCount = (git rev-list --count "HEAD..$Remote/$Branch" 2>$null)
            $AheadCount  = (git rev-list --count "$Remote/$Branch..HEAD" 2>$null)

            if ($BehindCount -and [int]$BehindCount -gt 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] New updates found on origin ($BehindCount commits behind). Pulling..." -ForegroundColor Magenta
                git pull --rebase $Remote $Branch
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pulled and updated to latest version." -ForegroundColor Green
                }
                else {
                    Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Pull conflict. Please review."
                }
            }

            if ($AheadCount -and [int]$AheadCount -gt 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Local commits pending push ($AheadCount commits ahead). Pushing..." -ForegroundColor DarkCyan
                git push $Remote $Branch
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push successful!" -ForegroundColor Green
                }
            }
        }
    }

    Start-Sleep -Seconds $PollSeconds
}