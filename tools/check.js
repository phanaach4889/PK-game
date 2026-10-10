/**
 * NEON PROTOCOL // OVERDRIVE — Diagnostic & Health Check Tool
 * Usage:
 *   node tools/check.js   (or npm run check)
 */
const fs = require('fs');
const path = require('path');

const REPO_DIR = path.resolve(__dirname, '..');

const FILES = [
  'index.html',
  'css/style.css',
  'js/01-audio-core.js',
  'js/02-player-arsenal.js',
  'js/03-skill-constructs.js',
  'js/04-enemies-bosses.js',
  'js/05-world-contracts.js',
  'js/06-renderer-loop.js',
  'js/07-sandbox-tools.js',
  'neon_protocol_overdrive.html'
];

const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

console.log('============================================================================');
console.log(' NEON PROTOCOL // OVERDRIVE — MODULE DIAGNOSTICS & HEALTH REPORT');
console.log('============================================================================');
console.log(
  'FILE'.padEnd(32) +
  'LINES'.padStart(9) +
  'SIZE (KB)'.padStart(12) +
  'SYNTAX'.padStart(10) +
  'EMOJIS'.padStart(9)
);
console.log('----------------------------------------------------------------------------');

let hasError = false;
let combinedJs = '';

for (const rel of FILES) {
  const full = path.join(REPO_DIR, rel);
  if (!fs.existsSync(full)) {
    console.log(rel.padEnd(32) + 'MISSING!'.padStart(9));
    hasError = true;
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split(/\r?\n/).length;
  const kb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1) + ' KB';
  const emojis = (content.match(emojiRe) || []).length;

  let syntaxStatus = 'OK';
  if (rel.endsWith('.js')) {
    try {
      new Function(content);
      combinedJs += '\n' + content;
    } catch (e) {
      syntaxStatus = 'ERR';
      hasError = true;
    }
  } else if (rel === 'neon_protocol_overdrive.html') {
    const m = content.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) {
      syntaxStatus = 'NO-JS';
      hasError = true;
    } else {
      try {
        new Function(m[1]);
      } catch (e) {
        syntaxStatus = 'ERR';
        hasError = true;
      }
    }
  }

  if (emojis > 0) hasError = true;

  console.log(
    rel.padEnd(32) +
    String(lines).padStart(9) +
    kb.padStart(12) +
    syntaxStatus.padStart(10) +
    String(emojis).padStart(9)
  );
}

try {
  new Function(combinedJs);
} catch (e) {
  console.error('[ERROR] Combined JS modules failed syntax check:', e.message);
  hasError = true;
}

console.log('============================================================================');
if (hasError) {
  console.error('[FAIL] One or more checks failed.');
  process.exit(1);
} else {
  console.log('[PASS] All modular HTML/CSS/JS files & standalone bundle are 100% healthy!');
}

