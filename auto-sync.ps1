# CareSaathi-AI Continuous Auto-Sync (Pull & Push)
# Designed for reliable two-collaborator GitHub workflows on Windows.
param(
    [switch]$PullOnly = $false,
    [int]$QuietSeconds = 2,              # Debounce delay after editing stops (2s for safe file flush)
    [int]$PollSeconds = 1,               # Frequency of change detection check (seconds)
    [int]$RemoteCheckInterval = 5,       # Frequency of checking remote updates when idle (seconds)
    [string]$Remote = "origin",
    [string]$Branch = "main"
)

$RepoPath = $PSScriptRoot
if (-not $RepoPath) { $RepoPath = (Get-Location).Path }
Set-Location $RepoPath

# Safety: Test inside git repository
$InsideRepo = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $InsideRepo -ne "true") {
    Write-Error "Directory '$RepoPath' is not a valid Git repository."
    exit 1
}

# Verify branch and remote
$CurrentBranch = (git branch --show-current 2>$null).Trim()
if ($CurrentBranch -ne $Branch) {
    Write-Error "Expected branch '$Branch', but currently on branch '$CurrentBranch'."
    exit 1
}

$RemoteUrl = (git remote get-url $Remote 2>$null).Trim()
if (-not $RemoteUrl) {
    Write-Error "Git remote '$Remote' is not configured."
    exit 1
}

# Concurrency Mutex Lock
$LockFile = Join-Path $RepoPath ".git\caresaathi_sync.lock"
if (Test-Path $LockFile) {
    $ExistingPid = Get-Content $LockFile -ErrorAction SilentlyContinue
    if ($ExistingPid -and (Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue)) {
        Write-Warning "Another auto-sync process (PID $ExistingPid) is already running in this repository."
        exit 0
    } else {
        Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    }
}
$PID | Out-File -FilePath $LockFile -Encoding ascii -Force

# Helper: Check if Git is currently busy (merge, rebase, cherry-pick, lock)
function Test-GitBusy {
    $GitDir = (git rev-parse --git-dir 2>$null).Trim()
    if (-not $GitDir) { return $false }
    $BusyIndicators = @(
        (Join-Path $GitDir "index.lock"),
        (Join-Path $GitDir "MERGE_HEAD"),
        (Join-Path $GitDir "REBASE_HEAD"),
        (Join-Path $GitDir "CHERRY_PICK_HEAD"),
        (Join-Path $GitDir "rebase-merge"),
        (Join-Path $GitDir "rebase-apply"),
        (Join-Path $GitDir "BISECT_LOG")
    )
    foreach ($item in $BusyIndicators) {
        if (Test-Path $item) { return $true }
    }
    return $false
}

# Helper: Safe Pull (Fast-Forward only when clean)
function Invoke-SafePull {
    param([string]$RemoteTarget, [string]$BranchTarget)
    
    if (Test-GitBusy) {
        Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Git operation in progress. Skipping pull."
        return $false
    }
    
    git fetch $RemoteTarget $BranchTarget 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Failed to fetch from $RemoteTarget/$BranchTarget. Network or credentials check needed."
        return $false
    }
    
    $Behind = (git rev-list --count "HEAD..$RemoteTarget/$BranchTarget" 2>$null).Trim()
    $Ahead  = (git rev-list --count "$RemoteTarget/$BranchTarget..HEAD" 2>$null).Trim()
    
    if ($Behind -and [int]$Behind -gt 0) {
        $Status = @(git status --porcelain 2>$null)
        if ($Status.Count -gt 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Collaborator pushed updates ($Behind commit(s)), but you have unstaged local changes." -ForegroundColor Yellow
            Write-Host "Local changes will be preserved. Auto-sync will integrate when saving settles." -ForegroundColor DarkYellow
            return $false
        }
        
        if ($Ahead -and [int]$Ahead -gt 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Branches diverged: Local is $Ahead ahead and $Behind behind." -ForegroundColor Red
            Write-Host "Automatic fast-forward pull paused to protect both collaborators. Rebase manually if desired." -ForegroundColor Yellow
            return $false
        }
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Fast-forward pulling $Behind incoming commit(s) from $RemoteTarget/$BranchTarget..." -ForegroundColor Magenta
        git pull --ff-only $RemoteTarget $BranchTarget
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Workspace updated successfully to $(git rev-parse --short HEAD)." -ForegroundColor Green
            return $true
        } else {
            Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Fast-forward pull failed. Please check local branch."
            return $false
        }
    }
    return $true
}

# Pre-Session Pull Only Mode
if ($PullOnly) {
    Write-Host "Running pre-session safe pull..." -ForegroundColor Cyan
    $pulled = Invoke-SafePull -RemoteTarget $Remote -BranchTarget $Branch
    Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    exit 0
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " CareSaathi-AI Continuous Git Auto-Sync (Pull & Push)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Repository : $RepoPath"
Write-Host " Remote     : $Remote ($RemoteUrl)"
Write-Host " Branch     : $Branch"
Write-Host " Mode       : Action-triggered (2s write buffer) + idle remote sync (5s)"
Write-Host " Safety     : Fast-forward checks, sensitive file exclusions, zero force-push"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to terminate auto-sync.`n"

# Pre-session pull before starting loop
Invoke-SafePull -RemoteTarget $Remote -BranchTarget $Branch | Out-Null

$LastStatus = $null
$LastChangeTime = Get-Date
$LastRemoteCheck = (Get-Date).AddSeconds(-$RemoteCheckInterval)
$SensitivePattern = '(?i)(^|[\\/])(\.env($|[\\/])|\.env\.[^\\/\s]+|[^\\/\s]*(secret|credential|service.account)[^\\/\s]*|[^\\/\s]+\.(pem|key|p12|pfx|db)($|[\\/]))'

try {
    while ($true) {
        if (Test-GitBusy) {
            Start-Sleep -Seconds $PollSeconds
            continue
        }

        $StatusLines = @(git status --porcelain --untracked-files=all 2>$null)
        $StatusText = $StatusLines -join "`n"

        # Detect any action / file modification
        if ($StatusText -ne $LastStatus) {
            $LastStatus = $StatusText
            $LastChangeTime = Get-Date

            if ($StatusText) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Action detected! Debouncing (${QuietSeconds}s buffer)..." -ForegroundColor Yellow
            }
        }

        $QuietFor = ((Get-Date) - $LastChangeTime).TotalSeconds

        # When action settles for $QuietSeconds: Stage, pull-rebase if safe, commit & push
        if ($StatusText -and $QuietFor -ge $QuietSeconds) {
            # Screen against sensitive files
            $HasSensitive = $false
            foreach ($line in $StatusLines) {
                $filePath = $line.Substring(3).Trim(' "')
                if ($filePath -match $SensitivePattern) {
                    git check-ignore -q $filePath 2>$null
                    if ($LASTEXITCODE -ne 0) {
                        Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Sensitive file flagged ($filePath) and not gitignored! Refusing auto-commit."
                        $HasSensitive = $true
                    }
                }
            }

            if ($HasSensitive) {
                Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Skipping automatic commit due to unignored sensitive file. Resolve before auto-sync."
                $LastChangeTime = Get-Date
            }
            else {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Syncing changes to $Remote/$Branch..." -ForegroundColor Cyan

                # Pull any incoming commits safely with rebase & autostash
                git pull --rebase --autostash $Remote $Branch *> $null
                if ($LASTEXITCODE -ne 0) {
                    git rebase --abort 2>$null
                    Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Remote changes could not be automatically rebased. Local changes are safe. Please merge manually."
                    $LastChangeTime = Get-Date
                    $LastStatus = $null
                    Start-Sleep -Seconds $PollSeconds
                    continue
                }

                # Stage changes
                git add -A 2>$null

                if ($LASTEXITCODE -eq 0) {
                    $Staged = git diff --cached --name-only 2>$null
                    if ($Staged) {
                        $CommitMessage = "Auto-sync: update application files ($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))"
                        git commit -m $CommitMessage 2>$null

                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Commit created. Pushing to $Remote/$Branch..." -ForegroundColor DarkCyan

                            # Safety check before push: verify remote hasn't moved ahead
                            git push $Remote $Branch 2>$null

                            if ($LASTEXITCODE -eq 0) {
                                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push successful!" -ForegroundColor Green
                            } else {
                                Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Push rejected. Collaborator may have pushed concurrently. Will retry on next cycle."
                            }
                        } else {
                            Write-Warning "[$(Get-Date -Format 'HH:mm:ss')] Commit could not be created."
                        }
                    }
                    $LastChangeTime = Get-Date
                    $LastStatus = $null
                }
            }
        }

        # Idle cycle: Check remote for collaborator updates every $RemoteCheckInterval seconds
        $IdleTime = ((Get-Date) - $LastRemoteCheck).TotalSeconds
        if (-not $StatusText -and $IdleTime -ge $RemoteCheckInterval) {
            $LastRemoteCheck = Get-Date
            Invoke-SafePull -RemoteTarget $Remote -BranchTarget $Branch | Out-Null
        }

        Start-Sleep -Seconds $PollSeconds
    }
}
finally {
    if (Test-Path $LockFile) {
        Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    }
}