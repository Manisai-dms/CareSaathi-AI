# CareSaathi-AI automatic Git commit and push
# Wait 60 seconds after file changes stop before committing.

$RepoPath = "C:\Users\Durgamanisai\CareSaathi-AI"
$Branch = "main"
$Remote = "origin"
$QuietSeconds = 60
$PollSeconds = 5
$RetrySeconds = 60

Set-Location $RepoPath

# Verify repository and branch
$InsideRepo = git rev-parse --is-inside-work-tree
if ($LASTEXITCODE -ne 0 -or $InsideRepo -ne "true") {
    throw "This folder is not a Git repository."
}

$CurrentBranch = (git branch --show-current).Trim()
if ($CurrentBranch -ne $Branch) {
    throw "Expected branch '$Branch', found '$CurrentBranch'."
}

git remote get-url $Remote *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Git remote '$Remote' is not configured."
}

$LastStatus = $null
$LastChangeTime = Get-Date
$LastPushAttempt = (Get-Date).AddSeconds(-$RetrySeconds)

Write-Host "CareSaathi-AI Git automation is running." -ForegroundColor Green
Write-Host "Commit/push delay: $QuietSeconds seconds."
Write-Host "Press Ctrl+C to stop."

while ($true) {
    $StatusLines = @(git status --porcelain --untracked-files=all)
    $StatusText = $StatusLines -join "`n"

    # Restart the quiet-period timer whenever files change.
    if ($StatusText -ne $LastStatus) {
        $LastStatus = $StatusText
        $LastChangeTime = Get-Date

        if ($StatusText) {
            Write-Host "Changes detected. Waiting for editing to stop..."
        }
    }

    $QuietFor = ((Get-Date) - $LastChangeTime).TotalSeconds

    if ($StatusText -and $QuietFor -ge $QuietSeconds) {

        # Pause if potentially sensitive files have changed.
        $SensitivePattern = '(?i)(^|[\s"\\/])(\.env($|[\s\\/])|\.env\.[^\\/\s]+|[^\\/\s]*(secret|credential|service.account)[^\\/\s]*|[^\\/\s]+\.(pem|key|p12|pfx))'

        if ($StatusText -match $SensitivePattern) {
            Write-Warning "Potentially sensitive file detected. Review changes manually; automatic commit skipped."
            $LastChangeTime = Get-Date
        }
        else {
            Write-Host "Staging project changes..."

            git add -A

            if ($LASTEXITCODE -ne 0) {
                Write-Warning "git add failed. Will retry later."
                $LastChangeTime = Get-Date
            }
            else {
                $Staged = git diff --cached --name-only

                if ($Staged) {
                    $Message = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

                    git commit -m $Message

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Commit created. Pushing to GitHub..."

                        git push $Remote $Branch

                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "GitHub push successful." -ForegroundColor Green
                        }
                        else {
                            Write-Warning "Push failed. Local commit is retained; a later retry will be attempted."
                        }

                        $LastPushAttempt = Get-Date
                    }
                    else {
                        Write-Warning "Commit failed. Check the terminal output."
                    }
                }

                $LastChangeTime = Get-Date
                $LastStatus = $null
            }
        }
    }

    # Retry pushing commits already ahead of origin/main.
    if (-not $StatusText -and
        ((Get-Date) - $LastPushAttempt).TotalSeconds -ge $RetrySeconds) {

        $AheadText = git rev-list --count "origin/$Branch..HEAD" 2>$null

        if ($LASTEXITCODE -eq 0 -and [int]$AheadText -gt 0) {
            Write-Host "Local commits are waiting to be pushed..."

            git push $Remote $Branch

            if ($LASTEXITCODE -eq 0) {
                Write-Host "GitHub push successful." -ForegroundColor Green
            }
            else {
                Write-Warning "Push failed. Check authentication, connectivity, or branch conflicts."
            }

            $LastPushAttempt = Get-Date
        }
    }

    Start-Sleep -Seconds $PollSeconds
}