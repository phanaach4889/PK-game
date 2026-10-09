param(
    [string]$Message = "feat: sync and deploy NEON PROTOCOL // OVERDRIVE updates"
)

$ErrorActionPreference = "Stop"

$SourceHtml = "E:\Code\neon_protocol_overdrive.html"
$SourceLogo = "E:\Code\neon_protocol_logo.svg"
$RepoDir    = "E:\Code\PK-game"

if (Test-Path $SourceHtml) {
    Copy-Item -Path $SourceHtml -Destination "$RepoDir\neon_protocol_overdrive.html" -Force
    Copy-Item -Path $SourceHtml -Destination "$RepoDir\index.html" -Force
    Write-Host "[OK] Synced neon_protocol_overdrive.html -> PK-game/neon_protocol_overdrive.html and PK-game/index.html" -ForegroundColor Cyan
}

if (Test-Path $SourceLogo) {
    Copy-Item -Path $SourceLogo -Destination "$RepoDir\neon_protocol_logo.svg" -Force
}

Push-Location $RepoDir
try {
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m $Message
        git push origin main
        Write-Host "[DEPLOYED] Successfully committed and pushed to GitHub (origin/main)!" -ForegroundColor Green
    } else {
        Write-Host "[OK] Working tree clean. Pushing any unpushed commits to origin/main..." -ForegroundColor Yellow
        git push origin main
    }
} finally {
    Pop-Location
}

