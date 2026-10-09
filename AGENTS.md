# NEON PROTOCOL // OVERDRIVE — Mandatory GitHub Sync & Auto-Deploy Rule

Whenever you finish making any code, UI, gameplay, or asset changes to **NEON PROTOCOL // OVERDRIVE** (`e:\Code\neon_protocol_overdrive.html`, `e:\Code\PK-game\neon_protocol_overdrive.html`, `e:\Code\PK-game\index.html`, or `neon_protocol_logo.svg`), you **MUST ALWAYS**:

1. **Validate JS Syntax**:
   ```powershell
   node -e "const fs = require('fs'); const html = fs.readFileSync('e:/Code/neon_protocol_overdrive.html', 'utf8'); const m = html.match(/<script>([\s\S]*?)<\/script>/); new Function(m[1]); console.log('JS Syntax OK!');"
   ```
2. **Sync All Copies**:
   Keep `e:\Code\neon_protocol_overdrive.html`, `e:\Code\PK-game\neon_protocol_overdrive.html`, and `e:\Code\PK-game\index.html` identical.
3. **Commit & Push to GitHub (`origin/main`)**:
   Run `e:\Code\PK-game\deploy.ps1 -Message "<descriptive commit message>"` (or `git add -A && git commit -m "..." && git push origin main` inside `e:\Code\PK-game`) so that GitHub Actions (`.github/workflows/deploy.yml`) automatically deploys the latest build to GitHub Pages (`https://phanaach4889.github.io/PK-game/`).

