param(
    [string]$Message = "feat: sync and deploy NEON PROTOCOL // OVERDRIVE modular HTML/CSS/JS & bundle"
)

$ErrorActionPreference = "Stop"

$RepoDir    = "E:\Code\PK-game"
$SourceLogo = "E:\Code\neon_protocol_logo.svg"

Push-Location $RepoDir
try {
    # 1. Run modular build & syntax/emoji verification tool
    node "$RepoDir\tools\build.js"
    if ($LASTEXITCODE -ne 0) {
        throw "Build / validation failed!"
    }

    if (Test-Path $SourceLogo) {
        Copy-Item -Path $SourceLogo -Destination "$RepoDir\neon_protocol_logo.svg" -Force
    }

    # 2. Commit and push to GitHub (origin/main)
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m $Message
        git push origin main
        Write-Host "[DEPLOYED] Successfully built, committed, and pushed to GitHub (origin/main)!" -ForegroundColor Green
    } else {
        Write-Host "[OK] Working tree clean. Pushing any unpushed commits to origin/main..." -ForegroundColor Yellow
        git push origin main
    }
} finally {
    Pop-Location
}
