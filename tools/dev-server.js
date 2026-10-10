/**
 * NEON PROTOCOL // OVERDRIVE — Zero-Dependency Live-Reload Dev Server
 * Usage:
 *   node tools/dev-server.js   (or npm run dev)
 * Features:
 *   - Serves E:/Code/PK-game at http://localhost:3000
 *   - Injects SSE Live-Reload client into index.html
 *   - Watches index.html, css/, and js/ for changes, auto-runs build.js & reloads browser
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PORT = process.env.PORT || 3000;
const REPO_DIR = path.resolve(__dirname, '..');
const clients = new Set();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const LIVE_RELOAD_SNIPPET = `
<script>
  (function() {
    const es = new EventSource('/__live_reload');
    es.onmessage = function(e) {
      if (e.data === 'reload') location.reload();
    };
  })();
</script>
</body>`;

const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || '/').split('?')[0];

  if (cleanUrl === '/__live_reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('data: connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const relPath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
  const filePath = path.join(REPO_DIR, relPath);

  if (!filePath.startsWith(REPO_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (ext === '.html') {
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace('</body>', LIVE_RELOAD_SNIPPET);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    res.end(html);
  } else {
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  }
});

let debounceTimer = null;
function onFileChanged(filename) {
  if (!filename || filename.includes('neon_protocol_overdrive.html')) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`[WATCH] Change detected in ${filename} -> Rebuilding bundle...`);
    execFile(process.execPath, [path.join(__dirname, 'build.js')], { cwd: REPO_DIR }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (!err) {
        for (const client of clients) {
          client.write('data: reload\n\n');
        }
      }
    });
  }, 140);
}

['css', 'js'].forEach(dir => {
  const fullDir = path.join(REPO_DIR, dir);
  if (fs.existsSync(fullDir)) {
    fs.watch(fullDir, (evt, fname) => onFileChanged(`${dir}/${fname}`));
  }
});
fs.watch(INDEX_HTML_PATH(), () => onFileChanged('index.html'));

function INDEX_HTML_PATH() {
  return path.join(REPO_DIR, 'index.html');
}

server.listen(PORT, () => {
  console.log('====================================================================');
  console.log(` NEON PROTOCOL // OVERDRIVE — Live Dev Server Running!`);
  console.log(` -> URL:        http://localhost:${PORT}`);
  console.log(` -> Hot Reload: Watching index.html, css/style.css, and js/*.js`);
  console.log('====================================================================');
});

