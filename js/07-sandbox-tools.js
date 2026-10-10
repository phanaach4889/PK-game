// ============================================================================
// MODULE 07: A.R.E.S. CYBER-SANDBOX & 15-BOSS SPAWNER TOOLKIT ([~] / [F2])
// ============================================================================
(function initCyberSandboxToolkit() {
  window.sandboxGodMode = false;
  window.sandboxZeroCd = false;

  const BOSS_CATALOG = [
    { type: 'boss_seraphim', label: '01 SERAPHIM', color: '#9d4edd' },
    { type: 'boss_colossus', label: '02 GOLIATH', color: '#ff2a55' },
    { type: 'boss_leviathan', label: '03 LEVIATHAN', color: '#d946ef' },
    { type: 'boss_architect', label: '04 KAIROS AI', color: '#00f0ff' },
    { type: 'boss_ignis', label: '05 VULCAN', color: '#ff6600' },
    { type: 'boss_tempest', label: '06 TEMPEST', color: '#38bdf8' },
    { type: 'boss_chronos', label: '07 OUROBOROS', color: '#eab308' },
    { type: 'boss_reaper', label: '08 THANATOS', color: '#10b981' },
    { type: 'boss_behemoth', label: '09 GORGON', color: '#84cc16' },
    { type: 'boss_pulsar', label: '10 PULSAR', color: '#f43f5e' },
    { type: 'boss_valkyrie_zero', label: '11 VALKYRIE-0', color: '#e11d48' },
    { type: 'boss_hivemind', label: '12 OVERMIND', color: '#14b8a6' },
    { type: 'boss_banshee', label: '13 BANSHEE', color: '#8b5cf6' },
    { type: 'boss_glacier', label: '14 JOTUNN', color: '#06b6d4' },
    { type: 'boss_oblivion', label: '15 OBLIVION', color: '#c084fc' }
  ];

  // Wrap Player.takeDamage & Player.update for God Mode and 0s Cooldowns
  if (typeof Player !== 'undefined') {
    const origTakeDamage = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function(amount) {
      if (window.sandboxGodMode) {
        this.invulnTimer = Math.max(this.invulnTimer, 10);
        return;
      }
      return origTakeDamage.call(this, amount);
    };

    const origUpdate = Player.prototype.update;
    Player.prototype.update = function() {
      if (window.sandboxZeroCd) {
        this.dashCooldown = 0;
        this.katanaCooldown = 0;
        this.ionBeamCooldown = 0;
        this.chronoCooldown = 0;
        this.phantomCooldown = 0;
        this.overdrive = 100;
      }
      if (window.sandboxGodMode) {
        this.hp = this.maxHp;
      }
      return origUpdate.call(this);
    };
  }

  // Inject [~] TOOLS button into HUD audio-controls
  const audioControls = document.querySelector('#rightHudPanel .audio-controls');
  let toggleBtn = null;
  if (audioControls) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.id = 'sandboxToggleBtn';
    toggleBtn.className = 'audio-btn sandbox-toggle-btn';
    toggleBtn.title = '[~] or [F2]: Open A.R.E.S. Cyber-Sandbox & 15-Boss Spawner Toolkit';
    toggleBtn.innerHTML = `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9.5 2.5L13.5 6.5L6.5 13.5L2.5 13.5L2.5 9.5L9.5 2.5Z"/><line x1="7.5" y1="4.5" x2="11.5" y2="8.5"/></svg><span>TOOLS [~]</span>`;
    audioControls.appendChild(toggleBtn);
  }

  // Create Sandbox Dock DOM
  const dock = document.createElement('div');
  dock.id = 'sandboxDock';
  dock.className = 'hidden';
  dock.innerHTML = `
    <div class="sb-header">
      <div class="sb-title">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#ffe600" stroke-width="1.8"><polygon points="8,1 15,5 15,11 8,15 1,11 1,5"/><circle cx="8" cy="8" r="2.5" fill="#00f0ff" stroke="none"/></svg>
        A.R.E.S. SANDBOX &amp; BOSS TOOLKIT [~]
      </div>
      <button type="button" class="sb-close" id="sbCloseBtn">CLOSE [X]</button>
    </div>

    <div class="sb-telemetry">
      <div><div class="sb-stat-lbl">FPS</div><div class="sb-stat-val" id="sbFpsVal">60</div></div>
      <div><div class="sb-stat-lbl">HOSTILES</div><div class="sb-stat-val" id="sbHostilesVal">0</div></div>
      <div><div class="sb-stat-lbl">BULLETS</div><div class="sb-stat-val" id="sbBulletsVal">0</div></div>
      <div><div class="sb-stat-lbl">WAVE</div><div class="sb-stat-val" id="sbWaveVal">1</div></div>
    </div>

    <div class="sb-section-label">// OVERDRIVE &amp; CHAOS SHORTCUTS</div>
    <div class="sb-grid-2">
      <button type="button" class="sb-btn sb-gold" id="sbChaosBtn">[V] 90s ALL-SKILL CHAOS</button>
      <button type="button" class="sb-btn sb-magenta" id="sbNovaBtn">[E] +60s SUPERNOVA</button>
      <button type="button" class="sb-btn" id="sbGodBtn">GOD MODE: OFF</button>
      <button type="button" class="sb-btn" id="sbZeroCdBtn">0s COOLDOWN: OFF</button>
      <button type="button" class="sb-btn sb-gold" id="sbMaxUpgradesBtn">MAX ALL SKILLS (MK-V)</button>
      <button type="button" class="sb-btn" id="sbSpawnWingmenBtn">+3 VALKYRIE WINGMEN</button>
      <button type="button" class="sb-btn" id="sbNextWaveBtn">SKIP +1 WAVE</button>
      <button type="button" class="sb-btn sb-magenta" id="sbNukeBtn">OBLITERATE SCREEN</button>
    </div>

    <div class="sb-section-label">// 1-CLICK 15 APEX MEGA-BOSS SPAWNER</div>
    <div class="sb-grid-3" id="sbBossGrid"></div>
    <div class="sb-grid-2" style="margin-top:4px;">
      <button type="button" class="sb-btn sb-gold sb-full" id="sbPantheonRushBtn">SPAWN ALL 15 BOSSES PANTHEON RUSH!</button>
    </div>
  `;
  document.body.appendChild(dock);

  function ensurePlayingState() {
    if (typeof gameState !== 'undefined' && gameState !== 'PLAYING') {
      if (typeof sound !== 'undefined') sound.init();
      const startSc = document.getElementById('startScreen');
      const overSc = document.getElementById('gameOverScreen');
      const upgSc = document.getElementById('upgradeModal');
      if (startSc) startSc.classList.add('hidden');
      if (overSc) overSc.classList.add('hidden');
      if (upgSc) upgSc.classList.add('hidden');
      if (gameState === 'START' || gameState === 'GAMEOVER') {
        startNewGame();
      } else {
        gameState = 'PLAYING';
      }
    }
  }

  function spawnBossByType(bossType) {
    ensurePlayingState();
    const angle = Math.random() * Math.PI * 2;
    const dist = 340;
    const bx = Math.max(120, Math.min(WORLD_W - 120, player.x + Math.cos(angle) * dist));
    const by = Math.max(120, Math.min(WORLD_H - 120, player.y + Math.sin(angle) * dist));
    const boss = new Enemy(bossType, bx, by);
    enemies.push(boss);
    addGridRipple(bx, by, 520, 48, boss.color || '#ff0077');
    screenShake = Math.max(screenShake, 22);
    chromaticFlash = Math.max(chromaticFlash, 14);
    if (typeof sound !== 'undefined') sound.bossSpawn();
    announce(`// SANDBOX DEPLOYED: ${boss.bossName || bossType.toUpperCase()} //`, boss.color || '#ffe600');
  }

  const bossGrid = document.getElementById('sbBossGrid');
  if (bossGrid) {
    BOSS_CATALOG.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sb-btn';
      btn.style.borderColor = b.color + '88';
      btn.style.color = b.color;
      btn.textContent = b.label;
      btn.onclick = (e) => {
        e.stopPropagation();
        spawnBossByType(b.type);
      };
      bossGrid.appendChild(btn);
    });
  }

  function toggleSandboxDock(forceState) {
    const isHidden = dock.classList.contains('hidden');
    const show = typeof forceState === 'boolean' ? forceState : isHidden;
    dock.classList.toggle('hidden', !show);
    if (toggleBtn) toggleBtn.classList.toggle('active-mode', show);
  }

  if (toggleBtn) {
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleSandboxDock();
    };
  }
  document.getElementById('sbCloseBtn').onclick = (e) => {
    e.stopPropagation();
    toggleSandboxDock(false);
  };

  document.getElementById('sbChaosBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    player.tryChaosOverload();
  };

  document.getElementById('sbNovaBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    player.overdrive = 100;
    player.overdriveMaxActive = 5400;
    player.overdriveActive = Math.min(7200, (player.overdriveActive || 0) + 3600);
    player.tryOverdrive();
  };

  const godBtn = document.getElementById('sbGodBtn');
  godBtn.onclick = (e) => {
    e.stopPropagation();
    window.sandboxGodMode = !window.sandboxGodMode;
    godBtn.textContent = `GOD MODE: ${window.sandboxGodMode ? 'ON' : 'OFF'}`;
    godBtn.classList.toggle('sb-active', window.sandboxGodMode);
    announce(`// SANDBOX GOD MODE: ${window.sandboxGodMode ? 'ENGAGED' : 'DISABLED'} //`, window.sandboxGodMode ? '#00ff88' : '#94a3b8');
  };

  const zeroCdBtn = document.getElementById('sbZeroCdBtn');
  zeroCdBtn.onclick = (e) => {
    e.stopPropagation();
    window.sandboxZeroCd = !window.sandboxZeroCd;
    zeroCdBtn.textContent = `0s COOLDOWN: ${window.sandboxZeroCd ? 'ON' : 'OFF'}`;
    zeroCdBtn.classList.toggle('sb-active', window.sandboxZeroCd);
    announce(`// 0s INSTANT SKILL COOLDOWNS: ${window.sandboxZeroCd ? 'ENGAGED' : 'DISABLED'} //`, window.sandboxZeroCd ? '#00f0ff' : '#94a3b8');
  };

  document.getElementById('sbMaxUpgradesBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    player.level += 5;
    player.maxHp += 100;
    player.hp = player.maxHp;
    player.shieldCharges = Math.max(player.shieldCharges, 4);
    player.multishot = Math.max(player.multishot, 6);
    player.fireRateMod = Math.max(player.fireRateMod, 2.2);
    player.katanaLevel = Math.max(player.katanaLevel, 5);
    player.ionBeamLevel = Math.max(player.ionBeamLevel, 5);
    player.chronoLevel = Math.max(player.chronoLevel, 5);
    player.phantomLevel = Math.max(player.phantomLevel, 5);
    player.droneCount = Math.max(player.droneCount, 4);
    player.missileLevel = Math.max(player.missileLevel, 4);
    player.railgunLevel = Math.max(player.railgunLevel, 4);
    player.ricochetLevel = Math.max(player.ricochetLevel, 4);
    player.arcLevel = Math.max(player.arcLevel, 4);
    player.singularityLevel = Math.max(player.singularityLevel, 3);
    player.novaLevel = Math.max(player.novaLevel, 4);
    if (typeof updatePerkBadges === 'function') {
      ALL_UPGRADES.forEach(u => {
        player.upgradeCounts[u.id] = Math.max(player.upgradeCounts[u.id] || 0, 4);
      });
      updatePerkBadges();
    }
    if (typeof sound !== 'undefined') sound.levelUp();
    addGridRipple(player.x, player.y, 600, 50, '#ffe600');
    announce('// ALL WEAPONS & SKILLS OVERCLOCKED TO MK-V MAX //', '#ffe600');
  };

  document.getElementById('sbSpawnWingmenBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      wingmen.push(new AlliedWingman(player.x + Math.cos(a) * 65, player.y + Math.sin(a) * 65));
    }
    announce('// +3 ALLIED VALKYRIE WINGMEN DEPLOYED //', '#00ff88');
  };

  document.getElementById('sbNextWaveBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    wave++;
    spawnWave();
    announce(`// WARPED TO WAVE ${wave} //`, '#00f0ff');
  };

  document.getElementById('sbNukeBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    enemyProjectiles.length = 0;
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].active) {
        enemies[i].takeDamage(999999, true);
      }
    }
    addGridRipple(player.x, player.y, 900, 75, '#ff0077');
    screenShake = 30;
    chromaticFlash = 22;
    announce('// OMEGA TACTICAL NUKE — ALL HOSTILES OBLITERATED //', '#ff0077');
  };

  document.getElementById('sbPantheonRushBtn').onclick = (e) => {
    e.stopPropagation();
    ensurePlayingState();
    window.sandboxGodMode = true;
    godBtn.textContent = 'GOD MODE: ON';
    godBtn.classList.add('sb-active');
    player.tryChaosOverload();
    BOSS_CATALOG.forEach((b, idx) => {
      const a = (idx / BOSS_CATALOG.length) * Math.PI * 2;
      const bx = Math.max(140, Math.min(WORLD_W - 140, player.x + Math.cos(a) * 440));
      const by = Math.max(140, Math.min(WORLD_H - 140, player.y + Math.sin(a) * 440));
      enemies.push(new Enemy(b.type, bx, by));
    });
    announce('// 15-BOSS APEX PANTHEON RUSH + GOD MODE + 90s CHAOS ENGAGED! //', '#ffe600');
  };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Backquote' || e.code === 'F2') {
      e.preventDefault();
      toggleSandboxDock();
    }
  });

  // Live FPS & Entity Telemetry Updater
  let lastFpsTime = performance.now();
  let framesSinceLast = 0;
  function tickTelemetry() {
    framesSinceLast++;
    const now = performance.now();
    if (now - lastFpsTime >= 500) {
      const fps = Math.min(60, Math.round((framesSinceLast * 1000) / (now - lastFpsTime)));
      framesSinceLast = 0;
      lastFpsTime = now;
      if (!dock.classList.contains('hidden')) {
        const fpsEl = document.getElementById('sbFpsVal');
        const hostEl = document.getElementById('sbHostilesVal');
        const bulEl = document.getElementById('sbBulletsVal');
        const wavEl = document.getElementById('sbWaveVal');
        if (fpsEl) fpsEl.textContent = fps;
        if (hostEl && typeof enemies !== 'undefined') hostEl.textContent = enemies.length;
        if (bulEl && typeof projectiles !== 'undefined') bulEl.textContent = projectiles.length + (typeof missiles !== 'undefined' ? missiles.length : 0);
        if (wavEl && typeof wave !== 'undefined') wavEl.textContent = wave;
      }
    }
    requestAnimationFrame(tickTelemetry);
  }
  requestAnimationFrame(tickTelemetry);
})();

