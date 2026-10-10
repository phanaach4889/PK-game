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

// Headless VM Runtime & Canvas Transform Balance Check (Tests all 27 Enemies & Bosses)
try {
  const vm = require('vm');
  let saveStack = 0;
  const mockCtx = new Proxy({}, {
    get(t, prop) {
      if (prop === 'save') return () => { saveStack++; };
      if (prop === 'restore') return () => { saveStack--; };
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
        return () => ({ addColorStop: () => {} });
      }
      if (prop === 'measureText') return () => ({ width: 50 });
      return () => {};
    },
    set() { return true; }
  });

  const makeMockEl = () => ({
    width: 1920,
    height: 1080,
    getContext: () => mockCtx,
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    style: { setProperty: () => {} },
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => ({ style: {} }),
    dataset: {}
  });

  const sandbox = {
    getSaveStack: () => saveStack,
    window: { innerWidth: 1920, innerHeight: 1080, addEventListener: () => {}, devicePixelRatio: 1 },
    document: {
      getElementById: () => makeMockEl(),
      querySelectorAll: () => [],
      querySelector: () => makeMockEl(),
      createElement: () => makeMockEl(),
      body: makeMockEl()
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    performance: { now: () => 1000 },
    requestAnimationFrame: () => {},
    AudioContext: function() {},
    webkitAudioContext: function() {},
    Math, Number, String, Object, Array, Set, Map, console, parseInt, parseFloat, isNaN, setTimeout: () => {}, clearTimeout: () => {}
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.performance = sandbox.performance;

  vm.createContext(sandbox);
  vm.runInContext(combinedJs, sandbox);

  const simCode = `
    const types = [
      'drone_bit', 'scout', 'mini', 'striker', 'splitter', 'cruiser',
      'aegis', 'sniper', 'phantom', 'weaver', 'juggernaut', 'nemesis',
      'boss_colossus', 'boss_seraphim', 'boss_leviathan', 'boss_architect',
      'boss_ignis', 'boss_tempest', 'boss_chronos', 'boss_reaper',
      'boss_behemoth', 'boss_pulsar', 'boss_valkyrie_zero', 'boss_hivemind',
      'boss_banshee', 'boss_glacier', 'boss_oblivion'
    ];
    for (const t of types) {
      for (const elite of [false, true]) {
        const e = new Enemy(t, player.x + 220, player.y - 220, elite);
        for (let step = 0; step < 25; step++) {
          frameCount++;
          e.update();
          const s0 = getSaveStack();
          e.draw();
          const s1 = getSaveStack();
          if (s0 !== s1) throw new Error('Canvas save/restore mismatch on ' + t + ': delta=' + (s1 - s0));
        }
        for (let hit = 0; hit < 14; hit++) {
          e.takeDamage(e.maxHp * 0.08, true);
          e.update();
          const s0 = getSaveStack();
          e.draw();
          const s1 = getSaveStack();
          if (s0 !== s1) throw new Error('Canvas save/restore mismatch on damaged ' + t + ': delta=' + (s1 - s0));
        }
        e.die();
      }
    }
  `;
  vm.runInContext(simCode, sandbox);
  console.log('[SIM-OK] All 27 Enemy & Boss Archetypes (Phase I/II/III + Canvas Stack) Verified!');
} catch (e) {
  console.error('[SIM-ERROR] Runtime simulation failed:', e.stack || e.message);
  hasError = true;
}

console.log('============================================================================');
if (hasError) {
  console.error('[FAIL] One or more checks failed.');
  process.exit(1);
} else {
  console.log('[PASS] All modular HTML/CSS/JS files & standalone bundle are 100% healthy!');
}


