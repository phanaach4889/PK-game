/**
 * NEON PROTOCOL // OVERDRIVE — Modular & Single-File Build Tool
 * Usage:
 *   node tools/build.js             -> Validates & bundles index.html + css/ + js/ into neon_protocol_overdrive.html
 *   node tools/build.js --extract   -> Extracts css/style.css, js/01..06, and index.html from E:/Code/neon_protocol_overdrive.html
 */
const fs = require('fs');
const path = require('path');

const REPO_DIR = path.resolve(__dirname, '..');
const ROOT_HTML = path.resolve(REPO_DIR, '..', 'neon_protocol_overdrive.html');
const BUNDLE_HTML = path.join(REPO_DIR, 'neon_protocol_overdrive.html');
const INDEX_HTML = path.join(REPO_DIR, 'index.html');
const CSS_FILE = path.join(REPO_DIR, 'css', 'style.css');
const JS_DIR = path.join(REPO_DIR, 'js');

const JS_MODULES = [
  '01-audio-core.js',
  '02-player-arsenal.js',
  '03-skill-constructs.js',
  '04-enemies-bosses.js',
  '05-world-contracts.js',
  '06-renderer-loop.js',
  '07-sandbox-tools.js'
];

if (process.argv.includes('--extract')) {
  const src = fs.existsSync(ROOT_HTML) ? ROOT_HTML : BUNDLE_HTML;
  const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);

  const slices = [
    {
      name: '01-audio-core.js',
      start: 2991,
      end: 4145,
      title: 'MODULE 01: AUDIO ENGINE, SYNTHWAVE SEQUENCER, INPUT, BIOMES & UPGRADE DATA'
    },
    {
      name: '02-player-arsenal.js',
      start: 4146,
      end: 6399,
      title: 'MODULE 02: PLAYER CHASSIS, 6 SKILLS, PROJECTILES, MISSILES & BLACK HOLES'
    },
    {
      name: '03-skill-constructs.js',
      start: 6400,
      end: 7232,
      title: 'MODULE 03: CHRONO DOME, PHANTOM SQUADRON, SPATIAL RIFTS & DATA SHARDS'
    },
    {
      name: '04-enemies-bosses.js',
      start: 7233,
      end: 10259,
      title: 'MODULE 04: ENEMY AI & 15 APEX MEGA-BOSSES'
    },
    {
      name: '05-world-contracts.js',
      start: 10260,
      end: 12247,
      title: 'MODULE 05: PARTICLES, WORLD PROPS, BUILDINGS, WINGMEN, CONTRACTS & WAVES'
    },
    {
      name: '06-renderer-loop.js',
      start: 12248,
      end: 13943,
      title: 'MODULE 06: WORLD RENDERER, RADAR, A.R.E.S. RETICLE, 3D HOLOGRAM & MAIN LOOP'
    }
  ];

  for (const s of slices) {
    const banner = [
      '// ============================================================================',
      `// ${s.title}`,
      '// ============================================================================'
    ].join('\n');
    const chunk = lines.slice(s.start - 1, s.end).map(l => (l.startsWith('    ') ? l.slice(4) : l));
    fs.writeFileSync(path.join(JS_DIR, s.name), banner + '\n' + chunk.join('\n') + '\n', 'utf8');
    console.log(`[EXTRACT] Wrote js/${s.name} (${chunk.length} lines)`);
  }

  const headTop = lines.slice(0, 7).join('\n');
  const bodyHtml = lines.slice(2231, 2989).join('\n');
  const scriptTags = JS_MODULES.map(m => `  <script src="js/${m}"></script>`).join('\n');
  const modular = `${headTop}\n  <link rel="stylesheet" href="css/style.css" />\n${bodyHtml}\n\n  <!-- Modular Game Engine Scripts -->\n${scriptTags}\n</body>\n</html>\n`;
  fs.writeFileSync(INDEX_HTML, modular, 'utf8');
  console.log(`[EXTRACT] Wrote modular index.html (${modular.split('\n').length} lines)`);
}

// 1. Read modular files
const indexHtml = fs.readFileSync(INDEX_HTML, 'utf8');
const cssContent = fs.readFileSync(CSS_FILE, 'utf8');
const jsContents = JS_MODULES.map(m => {
  const p = path.join(JS_DIR, m);
  const code = fs.readFileSync(p, 'utf8');
  // Validate individual module syntax first
  try {
    new Function(code);
  } catch (err) {
    console.error(`[ERROR] Syntax error in js/${m}:`, err.message);
    process.exit(1);
  }
  return code;
});

const combinedJs = jsContents.join('\n');

// 2. Validate Combined JS Syntax
try {
  new Function(combinedJs);
  console.log(`[OK] JS Syntax Verified (${JS_MODULES.length} modules, ${combinedJs.split(/\r?\n/).length} lines)`);
} catch (err) {
  console.error('[ERROR] Combined JavaScript Syntax Error:', err.message);
  process.exit(1);
}

// 3. Validate Zero-Emoji Rule
const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
const allText = indexHtml + cssContent + combinedJs;
const emojis = allText.match(emojiRe);
if (emojis && emojis.length > 0) {
  console.error(`[ERROR] Found ${emojis.length} forbidden emoji(s):`, emojis.slice(0, 5));
  process.exit(1);
}
console.log('[OK] Zero-Emoji Constraint Verified (0 emojis)');

// 4. Build standalone single-file bundle (neon_protocol_overdrive.html)
let bundled = indexHtml.replace(
  /\s*<link\s+rel="stylesheet"\s+href="css\/style\.css"\s*\/?>/,
  `\n  <style>\n${cssContent}\n  </style>`
);

bundled = bundled.replace(
  /\s*<!-- Modular Game Engine Scripts -->[\s\S]*?<\/body>/,
  `\n  <script>\n${combinedJs}\n  </script>\n</body>`
);

fs.writeFileSync(BUNDLE_HTML, bundled, 'utf8');
fs.writeFileSync(ROOT_HTML, bundled, 'utf8');

console.log(`[BUILT] Synced standalone bundle -> PK-game/neon_protocol_overdrive.html & E:/Code/neon_protocol_overdrive.html (${(Buffer.byteLength(bundled, 'utf8') / 1024).toFixed(1)} KB)`);
