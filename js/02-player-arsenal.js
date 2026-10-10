// ============================================================================
// MODULE 02: PLAYER CHASSIS, 6 SKILLS, PROJECTILES, MISSILES & BLACK HOLES
// ============================================================================
class Player {
  constructor() {
    this.reset();
  }

  reset(chassis = selectedChassis || 'interceptor') {
    this.x = WORLD_W / 2;
    this.y = WORLD_H / 2;
    camX = Math.max(0, Math.min(WORLD_W - canvas.width, this.x - canvas.width / 2));
    camY = Math.max(0, Math.min(WORLD_H - canvas.height, this.y - canvas.height / 2));
    this.vx = 0;
    this.vy = 0;
    this.radius = 16;
    this.angle = 0;

    this.chassis = chassis;
    if (chassis === 'titan') {
      this.speed = 5.5;
      this.maxHp = 160;
      this.hp = 160;
      this.shieldCharges = 1;
      this.themeColor = '#ff2a55';
      this.accentColor = '#ffe600';
      this.chassisName = 'AEGIS GOLIATH';
    } else if (chassis === 'phantom') {
      this.speed = 6.9;
      this.maxHp = 80;
      this.hp = 80;
      this.shieldCharges = 0;
      this.critBonus = 0.25;
      this.themeColor = '#d946ef';
      this.accentColor = '#00f0ff';
      this.chassisName = 'VOID REAPER';
    } else {
      // interceptor
      this.speed = 6.4;
      this.maxHp = 100;
      this.hp = 100;
      this.shieldCharges = 0;
      this.critBonus = 0;
      this.themeColor = '#00f0ff';
      this.accentColor = '#ff0077';
      this.chassisName = 'VALKYRIE MK-IV';
    }

    this.dashCooldown = 0;
    this.dashMaxCooldown = 64;
    this.isDashing = false;
    this.dashDuration = 0;
    this.invulnTimer = 0;
    this.boostTimer = 0;
    this.frenzyTimer = 0;

    // [Q] Dimension Rift Katana Slash & Parry Deflector
    this.katanaCooldown = 0;
    this.katanaMaxCooldown = 48;
    this.katanaSlashTimer = 0;
    this.katanaSlashAngle = 0;
    this.katanaLevel = 0;
    this.katanaCombo = 0;
    this.katanaIsCross = false;
    this.parryRingTimer = 0;

    // [R] Omega Ion Laser Cannon + Autonomous Fin-Funnel Bits
    this.ionBeamCooldown = 0;
    this.ionBeamMaxCooldown = 190;
    this.ionBeamTimer = 0;
    this.ionBeamMaxTimer = 260;
    this.ionBeamLevel = 0;

    // [F] Chrono-Stasis Singularity Dome
    this.chronoCooldown = 0;
    this.chronoMaxCooldown = 200;
    this.chronoLevel = 0;

    // [X] Phantom Squadron Clone, Laser Tether & Phase-Swap
    this.phantomCooldown = 0;
    this.phantomMaxCooldown = 190;
    this.phantomLevel = 0;

    this.lastShot = 0;
    this.fireInterval = 10;
    this.shotCounter = 0;

    // [E] Seraphim Overdrive Ultimate (Ready immediately + shortcut-extendable!)
    this.overdrive = 100;
    this.overdriveActive = 0; // frames remaining
    this.overdriveMaxActive = 2400;

    // Progression & Upgrade stacks
    this.xp = 0;
    this.xpNext = 90;
    this.level = 1;
    this.perks = {};
    this.rerolls = 3;

    this.multishot = 1;
    this.railgunLevel = 0;
    this.lightningLevel = 0;
    this.droneCount = 0;
    this.homingLevel = 0;
    this.ricochetLevel = 0;
    this.blackholeLevel = 0;
    this.empLevel = 0;
    this.naniteLevel = 0;
    this.shieldMax = 0;
    this.shieldCharges = 0;
    this.shieldRechargeTimer = 0;

    this.homingTimer = 0;
    this.blackholeTimer = 0;
    this.orbitAngle = 0;
    this.daggerOrbitAngle = 0;
    this.dashTrail = [];
    this.tetherOverloadCooldown = 0;
    this.slowTimer = 0;
    this.dashBuffered = 0;
  }

  // SKILL [Q]: DIMENSION RIFT KATANA // JUDGEMENT CUT END (Screen-Cleaving Web + Multi-Rifts + 3x Split Riposte!)
  tryKatana() {
    if (this.katanaCooldown > 0 && this.overdriveActive <= 0 && this.frenzyTimer <= 0) return;

    this.katanaCombo = (this.katanaCombo + 1) % 3;
    const isCrossCut = (this.katanaCombo === 0) || this.overdriveActive > 0 || this.frenzyTimer > 0;
    this.katanaIsCross = isCrossCut;

    const maxCd = Math.max(20, this.katanaMaxCooldown - this.katanaLevel * 10);
    this.katanaCooldown = (this.overdriveActive > 0 || this.frenzyTimer > 0) ? 10 : maxCd;
    this.katanaSlashTimer = isCrossCut ? 22 : 16;
    this.katanaSlashAngle = this.angle;
    this.invulnTimer = Math.max(this.invulnTimer, isCrossCut ? 28 : 18);

    sound.katanaSlash();
    screenShake = Math.max(screenShake, isCrossCut ? 22 : 14);
    if (isCrossCut) {
      hitStopFrames = Math.max(hitStopFrames, 2);
      chromaticFlash = Math.max(chromaticFlash, 11);
    }
    const slashRadius = (185 + this.katanaLevel * 36) * (isCrossCut ? 1.38 : 1.15);
    addGridRipple(this.x, this.y, slashRadius + 120, isCrossCut ? 44 : 32, isCrossCut ? '#ffe600' : '#00ff88');
    addGridRipple(this.x, this.y, slashRadius * 0.75, -28, '#00f0ff');

    // Spawn Twin Dimensional Vortex Rifts on Judgement Cut / Overdrive (or single Rift on standard slash!)
    if (typeof spatialRifts !== 'undefined') {
      const riftX = this.x + Math.cos(this.katanaSlashAngle) * (slashRadius * 0.56);
      const riftY = this.y + Math.sin(this.katanaSlashAngle) * (slashRadius * 0.56);
      spatialRifts.push(new SpatialRift(riftX, riftY, this.katanaSlashAngle, isCrossCut ? 165 : 110, isCrossCut, isCrossCut ? '#ffe600' : '#00ff88'));
      if (isCrossCut) {
        const perpA = this.katanaSlashAngle + Math.PI * 0.5;
        spatialRifts.push(new SpatialRift(riftX + Math.cos(perpA) * 65, riftY + Math.sin(perpA) * 65, this.katanaSlashAngle - 0.5, 135, true, '#ff0077'));
      }
    }

    // Launch massive fan of piercing Crescent Sword-Beam Waves + Hyper-Rail Javelins!
    const waveCount = 5 + this.katanaLevel * 2 + (isCrossCut ? 4 : 0);
    for (let w = 0; w < waveCount; w++) {
      const wAng = this.angle + (w - (waveCount - 1) / 2) * 0.17;
      const isCenterRail = (w % 2 === 1 && isCrossCut);
      projectiles.push(new Projectile(
        this.x + Math.cos(wAng) * 24,
        this.y + Math.sin(wAng) * 24,
        wAng,
        isCrossCut ? (w % 2 === 0 ? '#ffe600' : '#00f0ff') : (w % 2 === 0 ? '#00ff88' : '#ff0077'),
        isCenterRail ? 23.5 : 20.5,
        (88 + this.level * 12 + this.katanaLevel * 28) * (isCrossCut ? 1.45 : 1.15),
        1 + this.ricochetLevel + (isCrossCut ? 1 : 0),
        true,
        isCenterRail ? 'rail' : 'overdrive'
      ));
    }

    // 1. OMNI-PARRY & 3X SPLIT RIPOSTE: Deflect enemy bullets into twin Golden Rail Javelins + Homing Missile!
    let deflected = 0;
    for (let i = 0; i < enemyProjectiles.length; i++) {
      const ep = enemyProjectiles[i];
      if (!ep.active) continue;
      const dist = Math.hypot(ep.x - this.x, ep.y - this.y);
      if (dist <= slashRadius + 45) {
        ep.active = false;
        deflected++;
        let targetAng = this.angle + (Math.random() - 0.5) * 0.14;
        let bestDist = 1100;
        for (let j = 0; j < enemies.length; j++) {
          const en = enemies[j];
          if (!en.active) continue;
          const dEn = Math.hypot(en.x - ep.x, en.y - ep.y);
          if (dEn < bestDist) {
            bestDist = dEn;
            targetAng = Math.atan2(en.y - ep.y, en.x - ep.x);
          }
        }
        for (const spread of [-0.08, 0.08]) {
          projectiles.push(new Projectile(
            ep.x,
            ep.y,
            targetAng + spread,
            '#ffe600',
            24,
            (105 + this.level * 15) * (1 + this.katanaLevel * 0.32),
            1 + this.ricochetLevel,
            true,
            'rail'
          ));
        }
        if (missiles.length < 56) {
          missiles.push(new HomingMissile(ep.x, ep.y, targetAng));
        }
        lightningBolts.push({ x1: this.x, y1: this.y, x2: ep.x, y2: ep.y, color: '#ffe600', life: 12 });
      }
    }

    // 2. JUDGEMENT CUT END WEB: Cleave all enemies in massive radius & connect them with spatial fracture lines!
    let cleaved = 0;
    let prevCleavedEnemy = null;
    const cleaveDmg = (155 + this.level * 28) * (1 + this.katanaLevel * 0.35) * (isCrossCut ? 1.45 : 1.0);
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const dist = Math.hypot(e.x - this.x, e.y - this.y);
      if (dist <= slashRadius + 65 + e.radius) {
        cleaved++;
        const pushAng = Math.atan2(e.y - this.y, e.x - this.x);
        if (e.type !== 'boss') {
          e.x += Math.cos(pushAng) * 48;
          e.y += Math.sin(pushAng) * 48;
        }
        e.takeDamage(cleaveDmg, true);
        lightningBolts.push({ x1: this.x, y1: this.y, x2: e.x, y2: e.y, color: isCrossCut ? '#ffe600' : '#00ff88', life: 13 });
        // Draw spatial X-rift across cleaved target + web line to previous target!
        lightningBolts.push({ x1: e.x - 36, y1: e.y - 36, x2: e.x + 36, y2: e.y + 36, color: '#00f0ff', life: 15 });
        lightningBolts.push({ x1: e.x - 36, y1: e.y + 36, x2: e.x + 36, y2: e.y - 36, color: '#ff0077', life: 15 });
        if (prevCleavedEnemy && isCrossCut) {
          lightningBolts.push({ x1: prevCleavedEnemy.x, y1: prevCleavedEnemy.y, x2: e.x, y2: e.y, color: '#ffe600', life: 16 });
        }
        prevCleavedEnemy = e;
      }
    }

    if (deflected > 0) {
      this.parryRingTimer = 22;
      sound.parryDeflect();
      score += deflected * 180 * combo;
      this.overdrive = Math.min(100, this.overdrive + deflected * 12);
      this.hp = Math.min(this.maxHp, this.hp + deflected * 5);
      spawnFloatingText(this.x, this.y - 28, `[PARRY STORM] ${deflected}x RIPOSTE! +${deflected * 180}`, '#ffe600', 1.38);
      if (typeof recordContractAction === 'function') {
        recordContractAction('parry', deflected);
      }
    } else if (isCrossCut) {
      spawnFloatingText(this.x, this.y - 26, '// JUDGEMENT CUT END //', '#ffe600', 1.32);
    }

    if (cleaved > 0 && typeof recordContractAction === 'function') {
      recordContractAction('parry', cleaved);
    }

    if (deflected >= 1 || cleaved >= 2) {
      this.katanaCooldown = Math.floor(this.katanaCooldown * 0.35);
    }

    for (let i = 0; i < 24; i++) {
      const a = this.angle + ((i / 23) - 0.5) * 2.8;
      const sp = 7.5 + Math.random() * 8.5;
      spawnParticle(this.x + Math.cos(a) * 24, this.y + Math.sin(a) * 24, Math.cos(a) * sp, Math.sin(a) * sp, i % 3 === 0 ? '#00ff88' : (i % 3 === 1 ? '#ffe600' : '#ff0077'), 20, 3.8);
    }
  }

  // SKILL [R]: TRIPLE OMEGA HYPER-ION CANNON + 6 AUTONOMOUS FIN-FUNNELS + PRISM OVERCHARGE
  tryIonBeam() {
    // Pressing [R] while beam is ALREADY firing triggers an instant OMEGA PRISM OVERCHARGE BURST & extends duration!
    if (this.ionBeamTimer > 0) {
      this.ionBeamTimer = Math.min(900, this.ionBeamTimer + 150);
      this.ionBeamMaxTimer = Math.max(this.ionBeamMaxTimer, this.ionBeamTimer);
      sound.laser(true);
      screenShake = Math.max(screenShake, 20);
      chromaticFlash = Math.max(chromaticFlash, 14);
      addGridRipple(this.x, this.y, 520, 42, '#ffe600');
      for (let k = 0; k < 16; k++) {
        const a = this.angle + (k * Math.PI * 2) / 16;
        projectiles.push(new Projectile(this.x, this.y, a, k % 2 === 0 ? '#00f0ff' : '#ffe600', 24, 115 + this.level * 15, 1 + this.ricochetLevel, true, 'rail'));
      }
      for (let m = 0; m < 8; m++) {
        missiles.push(new HomingMissile(this.x, this.y, this.angle + (m - 3.5) * 0.35));
      }
      spawnFloatingText(this.x, this.y - 30, '// OMEGA PRISM OVERCHARGE (+2.5s)! //', '#ffe600', 1.38);
      return;
    }
    if (this.ionBeamCooldown > 0 && this.overdriveActive <= 0 && this.frenzyTimer <= 0) return;

    this.ionBeamMaxTimer = 260 + this.ionBeamLevel * 50;
    this.ionBeamTimer = this.ionBeamMaxTimer;
    const maxCd = Math.max(110, this.ionBeamMaxCooldown - this.ionBeamLevel * 35);
    this.ionBeamCooldown = (this.overdriveActive > 0 || this.frenzyTimer > 0) ? 35 : maxCd;
    this.invulnTimer = Math.max(this.invulnTimer, 45);

    sound.ionBeam();
    screenShake = Math.max(screenShake, 20);
    chromaticFlash = 14;
    addGridRipple(this.x, this.y, 560, 44, '#00f0ff');
    addGridRipple(this.x, this.y, 380, -30, '#ff0077');

    // Launch 10 Autonomous Funnel Homing Missiles + 8 Radial Rail Sabots on ignition!
    for (let m = 0; m < 10; m++) {
      const mAng = this.angle + (m - 4.5) * 0.32;
      missiles.push(new HomingMissile(this.x, this.y, mAng));
    }
    for (let s = -2; s <= 2; s++) {
      projectiles.push(new Projectile(this.x, this.y, this.angle + s * 0.14, '#00f0ff', 23, 95 + this.level * 12, 1 + this.ricochetLevel, true, 'rail'));
    }

    const funnelCount = 4 + Math.min(4, this.ionBeamLevel * 2);
    spawnFloatingText(this.x, this.y - 28, `// TRIPLE OMEGA BEAM + ${funnelCount}x FUNNELS //`, '#00f0ff', 1.38);
    announce(`// TRIPLE OMEGA HYPER-CANNON & ${funnelCount} ORBITAL FIN-FUNNELS ENGAGED — PRESS [R] AGAIN TO OVERCHARGE //`, '#00f0ff');
  }

  // SKILL [F]: CHRONO-STASIS ABYSSAL SINGULARITY DOME (Press [F] again to trigger Time-Shatter Cataclysm!)
  tryChronoField() {
    if (typeof chronoFields !== 'undefined' && chronoFields.length > 0) {
      let detonatedAny = false;
      for (let i = 0; i < chronoFields.length; i++) {
        if (chronoFields[i].active) {
          chronoFields[i].detonate();
          detonatedAny = true;
        }
      }
      if (detonatedAny) return;
    }
    if (this.chronoCooldown > 0 && this.overdriveActive <= 0 && this.frenzyTimer <= 0) return;

    const maxCd = Math.max(110, this.chronoMaxCooldown - this.chronoLevel * 35);
    this.chronoCooldown = (this.overdriveActive > 0 || this.frenzyTimer > 0) ? 35 : maxCd;

    // Deploy at cursor (clamped within 480px of player)
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.min(480, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx);
    const cx = Math.max(120, Math.min(WORLD_W - 120, this.x + Math.cos(ang) * dist));
    const cy = Math.max(120, Math.min(WORLD_H - 120, this.y + Math.sin(ang) * dist));

    const domeR = 275 + this.chronoLevel * 45;
    const domeLife = 340 + this.chronoLevel * 50;
    if (chronoFields.length >= 3) chronoFields.shift();
    chronoFields.push(new ChronoField(cx, cy, domeR, domeLife));

    // Immediately fire 12 Radial Chrono-Lance Rail Javelins from the Singularity Dome epicenter!
    for (let k = 0; k < 12; k++) {
      const lAng = (k * Math.PI * 2) / 12;
      projectiles.push(new Projectile(cx, cy, lAng, k % 2 === 0 ? '#d946ef' : '#00f0ff', 21, 82 + this.level * 10, 1 + this.ricochetLevel, true, 'rail'));
    }

    sound.chronoField(false);
    screenShake = Math.max(screenShake, 16);
    chromaticFlash = Math.max(chromaticFlash, 10);
    addGridRipple(cx, cy, domeR * 1.65, -38, '#d946ef');
    addGridRipple(cx, cy, domeR * 1.1, 28, '#00f0ff');
    spawnFloatingText(cx, cy - 26, '// ABYSSAL CHRONO-SINGULARITY (+75% DMG) //', '#f0abfc', 1.35);
    announce('// CHRONO-STASIS SINGULARITY ACTIVE — PRESS [F] AGAIN FOR TIME-SHATTER CATACLYSM //', '#f0abfc');
  }

  // SKILL [X]: PHANTOM SQUADRON ARMADA, TRIANGULAR LASER WEB & QUANTUM PHASE-STORM SWAP
  tryPhantomBarrage() {
    // Recasting [X] while Phantom Clones are active triggers a QUANTUM PHASE-STORM SWAP across the armada!
    const activeClone = (typeof phantomDecoys !== 'undefined') ? phantomDecoys.find(pd => pd.active && !pd.hasSwapped) : null;
    if (activeClone) {
      activeClone.hasSwapped = true;
      const oldX = this.x;
      const oldY = this.y;
      this.x = activeClone.x;
      this.y = activeClone.y;
      activeClone.x = oldX;
      activeClone.y = oldY;
      this.invulnTimer = Math.max(this.invulnTimer, 60);
      this.dashCooldown = 0;
      this.katanaCooldown = 0;
      sound.dash();
      sound.parryDeflect();
      screenShake = Math.max(screenShake, 22);
      chromaticFlash = Math.max(chromaticFlash, 15);
      addGridRipple(this.x, this.y, 420, 42, '#00f0ff');
      addGridRipple(activeClone.x, activeClone.y, 420, 42, '#ff0077');
      lightningBolts.push({ x1: oldX, y1: oldY, x2: this.x, y2: this.y, color: '#ffe600', life: 18 });
      lightningBolts.push({ x1: oldX - 18, y1: oldY + 18, x2: this.x + 18, y2: this.y - 18, color: '#00f0ff', life: 16 });

      afterimages.push({ x: oldX, y: oldY, angle: this.angle, life: 28, maxLife: 28 });
      afterimages.push({ x: this.x, y: this.y, angle: this.angle, life: 28, maxLife: 28 });

      if (typeof spatialRifts !== 'undefined') {
        spatialRifts.push(new SpatialRift(oldX, oldY, 0, 130, true, '#00f0ff'));
        spatialRifts.push(new SpatialRift(this.x, this.y, 0, 130, true, '#ff0077'));
      }

      // Deal Phase-Swap EMP Supernova damage around player AND all active Phantom Clones!
      const swapDmg = 155 + this.level * 22;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.active) continue;
        let hitBySwap = (Math.hypot(e.x - this.x, e.y - this.y) < 280 || Math.hypot(e.x - activeClone.x, e.y - activeClone.y) < 280);
        if (!hitBySwap && typeof phantomDecoys !== 'undefined') {
          for (let c = 0; c < phantomDecoys.length; c++) {
            if (phantomDecoys[c].active && Math.hypot(e.x - phantomDecoys[c].x, e.y - phantomDecoys[c].y) < 240) {
              hitBySwap = true;
              break;
            }
          }
        }
        if (hitBySwap) {
          e.takeDamage(swapDmg, true);
          lightningBolts.push({ x1: this.x, y1: this.y, x2: e.x, y2: e.y, color: '#00f0ff', life: 12 });
        }
      }
      // Launch 24 Homing Seekers + 16 Radial Piercing Railgun Javelins!
      for (let k = 0; k < 24; k++) {
        const mAng = (k * Math.PI * 2) / 24;
        missiles.push(new HomingMissile(this.x, this.y, mAng));
      }
      for (let r = 0; r < 16; r++) {
        const rAng = (r * Math.PI * 2) / 16;
        projectiles.push(new Projectile(this.x, this.y, rAng, r % 2 === 0 ? '#ffe600' : '#00f0ff', 23, 95 + this.level * 12, 1 + this.ricochetLevel, true, 'rail'));
      }
      spawnFloatingText(this.x, this.y - 30, '// QUANTUM PHASE-STORM SWAP! //', '#00f0ff', 1.4);
      return;
    }

    if (this.phantomCooldown > 0 && this.overdriveActive <= 0 && this.frenzyTimer <= 0) return;

    const maxCd = Math.max(110, this.phantomMaxCooldown - this.phantomLevel * 35);
    this.phantomCooldown = (this.overdriveActive > 0 || this.frenzyTimer > 0) ? 35 : maxCd;
    this.invulnTimer = Math.max(this.invulnTimer, 50);
    this.boostTimer = Math.max(this.boostTimer, 130);

    sound.phantomSalvo();
    screenShake = Math.max(screenShake, 18);
    chromaticFlash = Math.max(chromaticFlash, 10);
    addGridRipple(this.x, this.y, 420, 36, '#ffe600');

    // 1. Deploy a Tactical Squadron of 2 to 3 Holographic Phantom Clones connected by a Triangular Laser Web!
    const cloneCount = 2 + Math.min(1, this.phantomLevel);
    const cloneLife = 440 + this.phantomLevel * 70;
    for (let c = 0; c < cloneCount; c++) {
      const spreadAng = this.angle + Math.PI + (c - (cloneCount - 1) / 2) * 1.15;
      const cx = Math.max(70, Math.min(WORLD_W - 70, this.x + Math.cos(spreadAng) * 95));
      const cy = Math.max(70, Math.min(WORLD_H - 70, this.y + Math.sin(spreadAng) * 95));
      if (phantomDecoys.length >= 4) phantomDecoys.shift();
      phantomDecoys.push(new PhantomDecoy(cx, cy, this.angle + c * 0.4, cloneLife));
    }

    // 2. Launch 24+ Macross "Itano Circus" Micro-Missile Swarm + 12 Supernova Glaives in a 360° spiral!
    const salvoCount = 24 + this.phantomLevel * 6;
    for (let i = 0; i < salvoCount; i++) {
      const mAng = this.angle + (i * Math.PI * 2) / salvoCount;
      const m = new HomingMissile(
        this.x + Math.cos(mAng) * 20,
        this.y + Math.sin(mAng) * 20,
        mAng
      );
      m.damage = 78 + this.level * 10 + this.phantomLevel * 20;
      m.speed = 12.2;
      missiles.push(m);
    }
    for (let g = 0; g < 12; g++) {
      const gAng = this.angle + (g * Math.PI * 2) / 12;
      projectiles.push(new Projectile(this.x, this.y, gAng, g % 2 === 0 ? '#ffe600' : '#ff0077', 20, 72 + this.level * 9, 1 + this.ricochetLevel, true, 'overdrive'));
    }

    spawnFloatingText(this.x, this.y - 28, `// ${cloneCount}x PHANTOM SQUADRON + ${salvoCount}x ITANO SALVO //`, '#ffe600', 1.38);
    announce(`// ${cloneCount}x PHANTOM HOLO-SQUADRON & ${salvoCount}-MISSILE ITANO CIRCUS DEPLOYED — PRESS [X] AGAIN TO PHASE-SWAP //`, '#ffe600');
  }

  // SKILL [SPACE / RMB]: PHASE-RIFT HYPER-DASH (Explosive Rift Afterimage + 6 Homing Darts + 360° EMP!)
  tryDash() {
    if (this.dashCooldown <= 0 || this.overdriveActive > 0 || this.frenzyTimer > 0) {
      const startX = this.x;
      const startY = this.y;
      this.isDashing = true;
      this.dashDuration = 14;
      this.invulnTimer = 28;
      this.dashCooldown = (this.overdriveActive > 0 || this.frenzyTimer > 0) ? 12 : this.dashMaxCooldown;
      sound.dash();
      screenShake = 11;
      addGridRipple(this.x, this.y, 290, 28, '#00f0ff');

      // Leave an Explosive Dimensional Tear at departure point!
      if (typeof spatialRifts !== 'undefined') {
        spatialRifts.push(new SpatialRift(startX, startY, this.angle, 85, false, '#00f0ff'));
      }

      // Launch 6 Homing Cyber-Missiles on every dash!
      for (let m = 0; m < 6; m++) {
        const mAng = this.angle + Math.PI + (m - 2.5) * 0.35;
        missiles.push(new HomingMissile(this.x, this.y, mAng));
      }

      // Absorb enemy projectiles within 135px & fire them back as Golden Rail Javelins!
      let absorbed = 0;
      enemyProjectiles.forEach(ep => {
        if (!ep.active) return;
        const d = Math.hypot(ep.x - this.x, ep.y - this.y);
        if (d < 135) {
          ep.active = false;
          absorbed++;
          this.overdrive = Math.min(100, this.overdrive + 10);
          spawnParticle(ep.x, ep.y, 0, 0, '#00f0ff', 14, 3.5);
          projectiles.push(new Projectile(ep.x, ep.y, this.angle + (Math.random() - 0.5) * 0.2, '#ffe600', 23, 85 + this.level * 10, 1, true, 'rail'));
        } else if (d < 280) {
          ep.vx *= 0.3;
          ep.vy *= 0.3;
        }
      });
      if (absorbed > 0) {
        spawnFloatingText(this.x, this.y - 22, `PHASE RIPOSTE x${absorbed}!`, '#00f0ff', 1.2);
      }

      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 9 + 2;
        spawnParticle(this.x, this.y, Math.cos(a) * s, Math.sin(a) * s, i % 2 === 0 ? '#00f0ff' : '#ff0077', 20, 3.8);
      }

      // Built-in 360° Voltaic EMP Discharge on every dash (scales with empLevel)!
      const radius = 210 + this.empLevel * 50;
      const empDmg = 72 + this.level * 10 + this.empLevel * 38;
      addGridRipple(this.x, this.y, radius * 1.3, 32, '#ff0077');
      enemies.forEach(e => {
        if (e.active && Math.hypot(e.x - this.x, e.y - this.y) < radius) {
          e.takeDamage(empDmg, true);
          lightningBolts.push({ x1: this.x, y1: this.y, x2: e.x, y2: e.y, color: '#ff0077', life: 11 });
        }
      });
    } else if (this.dashCooldown <= 12) {
      this.dashBuffered = 12;
    }
  }

  // SKILL [E] / [5]: SERAPHIM SUPERNOVA (Instant Shortcut Activation + Ultra-Long 40s Duration + Stackable +30s Extension!)
  tryOverdrive() {
    const wasActive = this.overdriveActive > 0;
    this.overdrive = 100;
    if (wasActive) {
      this.overdriveActive = Math.min(7200, this.overdriveActive + 1800); // Stack +30 seconds (up to 120s!)
      this.overdriveMaxActive = Math.max(this.overdriveMaxActive || 2400, this.overdriveActive);
    } else {
      this.overdriveActive = 2400; // 40 FULL SECONDS of Seraphim Supernova on single shortcut press!
      this.overdriveMaxActive = 2400;
    }
    this.invulnTimer = Math.max(this.invulnTimer, 90);
    this.boostTimer = Math.max(this.boostTimer, 180);

    // Instantly refresh all tactical skill cooldowns so every skill can be chained immediately!
    this.katanaCooldown = 0;
    this.ionBeamCooldown = 0;
    this.chronoCooldown = 0;
    this.phantomCooldown = 0;
    this.dashCooldown = 0;

    sound.overdrive();
    screenShake = 28;
    chromaticFlash = 22;
    addGridRipple(this.x, this.y, 780, 62, '#ffe600');
    addGridRipple(this.x, this.y, 520, -45, '#ff0077');
    addGridRipple(this.x, this.y, 340, 38, '#00f0ff');

    const secsLeft = Math.round(this.overdriveActive / 60);
    spawnFloatingText(
      this.x,
      this.y - 34,
      wasActive ? `// SUPERNOVA EXTENDED: ${secsLeft}s CHAOS! //` : `// SERAPHIM SUPERNOVA UNLEASHED (${secsLeft}s)! //`,
      '#ffe600',
      1.45
    );
    announce(
      `// SERAPHIM SUPERNOVA OVERDRIVE ONLINE (${secsLeft}s) — PRESS [E] TO EXTEND +30s OR [V] FOR ALL-SKILL CHAOS //`,
      '#ffe600'
    );

    // Convert all active enemy projectiles into friendly homing seekers!
    enemyProjectiles.forEach((ep) => {
      spawnParticle(ep.x, ep.y, 0, 0, '#ffe600', 16, 4.5);
      if (missiles.length < 56) {
        missiles.push(new HomingMissile(ep.x, ep.y, Math.atan2(ep.y - this.y, ep.x - this.x)));
      }
    });
    enemyProjectiles = [];

    // Launch 24 Radial Piercing Supernova Glaives + 12 Hyper-Railgun Javelins + 12 Homing Missiles!
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24;
      projectiles.push(new Projectile(
        this.x + Math.cos(a) * 20,
        this.y + Math.sin(a) * 20,
        a,
        i % 2 === 0 ? '#ffe600' : '#ff0077',
        22,
        115 + this.level * 14,
        1 + this.ricochetLevel,
        true,
        i % 3 === 0 ? 'rail' : 'overdrive'
      ));
    }
    for (let m = 0; m < 12; m++) {
      const mAng = (m * Math.PI * 2) / 12;
      missiles.push(new HomingMissile(this.x, this.y, mAng));
    }

    // Smite all active enemies & drop Orbital Judgment Lightning Pillars!
    let pillarsDropped = 0;
    enemies.forEach(e => {
      if (e.active) {
        e.takeDamage(145 + this.level * 16, true);
        if (pillarsDropped < 6) {
          pillarsDropped++;
          lightningBolts.push({ x1: e.x, y1: e.y - 520, x2: e.x, y2: e.y, color: '#ffe600', life: 18 });
          lightningBolts.push({ x1: e.x - 24, y1: e.y - 520, x2: e.x + 24, y2: e.y, color: '#ff0077', life: 16 });
        }
      }
    });
  }

  // SKILL [V] / [6]: TOTAL CHAOS OVERLOAD (90-Second Eternal Nova + Fires ALL 5 Ultimate Skills Simultaneously!)
  tryChaosOverload() {
    this.overdriveActive = Math.max(this.overdriveActive + 3600, 5400); // 90 FULL SECONDS of Eternal Seraphim Nova!
    this.overdriveMaxActive = Math.max(this.overdriveMaxActive || 5400, this.overdriveActive);
    this.tryOverdrive();

    // Force-fire every single tactical skill simultaneously for maximum screen-filling chaos!
    this.katanaCooldown = 0;
    this.tryKatana();

    this.ionBeamTimer = 0;
    this.ionBeamCooldown = 0;
    this.tryIonBeam();

    if (typeof chronoFields !== 'undefined' && chronoFields.length === 0) {
      this.chronoCooldown = 0;
      this.tryChronoField();
    }

    this.phantomCooldown = 0;
    this.tryPhantomBarrage();

    // Spawn Twin Swirling Black Hole Singularities!
    if (typeof blackHoles !== 'undefined') {
      if (blackHoles.length > 4) blackHoles.splice(0, blackHoles.length - 4);
      blackHoles.push(new BlackHole(this.x, this.y, this.angle - 0.35));
      blackHoles.push(new BlackHole(this.x, this.y, this.angle + 0.35));
    }

    const totalSecs = Math.round(this.overdriveActive / 60);
    spawnFloatingText(this.x, this.y - 46, `// OMEGA CHAOS CATACLYSM (${totalSecs}s NOVA)! //`, '#ff0077', 1.55);
    announce(`// OMEGA CHAOS OVERLOAD UNLEASHED — ALL 5 ULTIMATES + ${totalSecs}s SERAPHIM SUPERNOVA ACTIVE //`, '#ff0077');
  }

  update() {
    let dx = 0;
    let dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (this.boostTimer > 0) {
      this.boostTimer--;
      if (frameCount % 2 === 0) {
        afterimages.push({ x: this.x, y: this.y, angle: this.angle, life: 9, maxLife: 9 });
      }
    }
    if (this.frenzyTimer > 0) {
      this.frenzyTimer--;
    }

    if (this.slowTimer > 0) {
      this.slowTimer--;
      if (frameCount % 6 === 0) {
        spawnParticle(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, '#06b6d4', 10, 2);
      }
    }

    const speedMult = (this.overdriveActive > 0 ? 1.35 : 1.0) * (this.boostTimer > 0 ? 1.5 : 1.0) * (this.frenzyTimer > 0 ? 1.25 : 1.0) * (this.slowTimer > 0 ? 0.62 : 1.0);

    if (this.isDashing) {
      const dashDirX = (dx !== 0 || dy !== 0) ? dx : Math.cos(this.angle);
      const dashDirY = (dx !== 0 || dy !== 0) ? dy : Math.sin(this.angle);
      this.vx = dashDirX * (this.speed * 2.9);
      this.vy = dashDirY * (this.speed * 2.9);
      this.dashDuration--;
      if (this.dashDuration <= 0) {
        this.isDashing = false;
      }
      if (afterimages.length > 10) afterimages.shift();
      afterimages.push({ x: this.x, y: this.y, angle: this.angle, life: 12, maxLife: 12 });
      if (this.dashTrail) {
        if (this.dashTrail.length > 8) this.dashTrail.shift();
        this.dashTrail.push({ x: this.x, y: this.y, angle: this.angle, life: 14, maxLife: 14 });
      }

      // 1. Kinetic Collision Ramming: Ramming enemies during dash deals heavy kinetic impact
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.active) continue;
        if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius + e.radius + 14) {
          e.takeDamage(75 + this.level * 14, true);
          if (e.type !== 'boss') {
            const pushA = Math.atan2(e.y - this.y, e.x - this.x);
            e.x += Math.cos(pushA) * 36;
            e.y += Math.sin(pushA) * 36;
          }
          spawnParticle(e.x, e.y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, '#00f0ff', 12, 3.2);
          screenShake = Math.max(screenShake, 7);
        }
      }

      // 2. Tether Overload Combo: Dashing near or through the Voltaic Tether supercharges it!
      if (typeof phantomDecoys !== 'undefined' && this.tetherOverloadCooldown <= 0) {
        for (let i = 0; i < phantomDecoys.length; i++) {
          const pd = phantomDecoys[i];
          if (!pd.active || pd.tetherOverloaded) continue;
          const tdx = pd.x - this.x;
          const tdy = pd.y - this.y;
          const tDist = Math.hypot(tdx, tdy);
          if (tDist < 750 && tDist > 30) {
            pd.tetherOverloaded = true;
            this.tetherOverloadCooldown = 180;
            sound.dash();
            sound.parryDeflect();
            screenShake = Math.max(screenShake, 12);
            chromaticFlash = Math.max(chromaticFlash, 8);
            addGridRipple(this.x, this.y, 250, 25, '#ffe600');
            if (lightningBolts.length < 10) {
              lightningBolts.push({
                x1: this.x,
                y1: this.y,
                x2: pd.x,
                y2: pd.y,
                color: '#ffe600',
                life: 10
              });
              lightningBolts.push({
                x1: this.x + (Math.random() - 0.5) * 20,
                y1: this.y + (Math.random() - 0.5) * 20,
                x2: pd.x + (Math.random() - 0.5) * 20,
                y2: pd.y + (Math.random() - 0.5) * 20,
                color: '#00f0ff',
                life: 8
              });
            }
            const overloadDmg = 120 + this.level * 22;
            for (let ie = 0; ie < enemies.length; ie++) {
              const e = enemies[ie];
              if (!e.active) continue;
              const ex = e.x - this.x;
              const ey = e.y - this.y;
              const proj = Math.max(0, Math.min(1, (ex * tdx + ey * tdy) / (tDist * tDist)));
              const nx = this.x + proj * tdx;
              const ny = this.y + proj * tdy;
              if (Math.hypot(e.x - nx, e.y - ny) <= 85 + e.radius) {
                e.takeDamage(overloadDmg, true);
                spawnParticle(e.x, e.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, '#ffe600', 8, 2.5);
              }
            }
            this.dashCooldown = Math.floor(this.dashCooldown * 0.5);
            spawnFloatingText(this.x, this.y - 30, '// TETHER OVERLOAD EMP //', '#ffe600', 1.2);
            break;
          }
        }
      }

      // 3. Dimensional Slingshot through Spatial Rifts
      if (typeof spatialRifts !== 'undefined') {
        for (let r = 0; r < spatialRifts.length; r++) {
          const sr = spatialRifts[r];
          if (!sr.active) continue;
          if (Math.hypot(this.x - sr.x, this.y - sr.y) < sr.radius + 35) {
            this.vx *= 1.32;
            this.vy *= 1.32;
            spawnParticle(this.x, this.y, 0, 0, '#00ff88', 12, 3);
          }
        }
      }
    } else {
      const targetVx = dx * this.speed * speedMult;
      const targetVy = dy * this.speed * speedMult;
      const accelRate = (dx !== 0 || dy !== 0) ? 0.38 : 0.52;
      this.vx += (targetVx - this.vx) * accelRate;
      this.vy += (targetVy - this.vy) * accelRate;
    }

    this.x += this.vx;
    this.y += this.vy;

    resolveBuildingCollision(this, this.radius);

    this.x = Math.max(36, Math.min(WORLD_W - 36, this.x));
    this.y = Math.max(36, Math.min(WORLD_H - 36, this.y));

    // Smooth camera tracking with subtle cursor look-ahead
    const lookX = ((mouse.screenX || canvas.width / 2) - canvas.width / 2) * 0.14;
    const lookY = ((mouse.screenY || canvas.height / 2) - canvas.height / 2) * 0.14;
    const targetCamX = Math.max(0, Math.min(WORLD_W - canvas.width, this.x - canvas.width / 2 + lookX));
    const targetCamY = Math.max(0, Math.min(WORLD_H - canvas.height, this.y - canvas.height / 2 + lookY));
    camX += (targetCamX - camX) * 0.14;
    camY += (targetCamY - camY) * 0.14;

    mouse.x = (mouse.screenX || canvas.width / 2) + camX;
    mouse.y = (mouse.screenY || canvas.height / 2) + camY;

    const baseAim = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    let bestAim = baseAim;
    let bestTarget = null;
    let bestTargetScore = -1;
    let katanaRangeThreat = false;
    const katanaRadius = 165 + this.katanaLevel * 28;

    // Cursor-Priority Smart Target Lock + Predictive Ballistic Lead
    if (enemies.length > 0) {
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.active) continue;
        const edx = e.x - this.x;
        const edy = e.y - this.y;
        const eDist = Math.hypot(edx, edy);
        if (eDist <= katanaRadius + e.radius) katanaRangeThreat = true;
        if (eDist > 920) continue;
        const eAngle = Math.atan2(edy, edx);
        const aDiff = Math.abs(Math.atan2(Math.sin(eAngle - baseAim), Math.cos(eAngle - baseAim)));
        const mDist = Math.hypot(e.x - mouse.x, e.y - mouse.y);
        const cursorSnapRadius = e.radius + (e.isBoss ? 185 : 135);
        if (mDist < cursorSnapRadius || aDiff < 0.40) {
          const cursorWeight = mDist < cursorSnapRadius ? (3.6 - (mDist / cursorSnapRadius) * 2.2) : 0.65;
          const tierWeight = e.isBoss ? 3.2 : (e.type === 'nemesis' || e.isElite ? 2.0 : 1.0);
          const priority = (tierWeight * cursorWeight) / (0.18 + eDist * 0.0009 + aDiff * 1.45);
          if (priority > bestTargetScore) {
            bestTargetScore = priority;
            bestTarget = e;
          }
        }
      }
    }

    if (!katanaRangeThreat && enemyProjectiles.length > 0) {
      for (let i = 0; i < enemyProjectiles.length; i++) {
        const ep = enemyProjectiles[i];
        if (Math.hypot(ep.x - this.x, ep.y - this.y) <= katanaRadius) {
          katanaRangeThreat = true;
          break;
        }
      }
    }

    this.lockedTarget = bestTarget;
    this.katanaInRange = katanaRangeThreat;
    if (bestTarget) {
      const eDist = Math.hypot(bestTarget.x - this.x, bestTarget.y - this.y);
      const projSpd = this.overdriveActive > 0 ? 21 : (this.chassis === 'phantom' ? 21.5 : 18);
      const leadFrames = Math.min(24, eDist / projSpd);
      const leadX = bestTarget.x + (bestTarget.vx || 0) * leadFrames;
      const leadY = bestTarget.y + (bestTarget.vy || 0) * leadFrames;
      this.lockedLeadX = leadX;
      this.lockedLeadY = leadY;
      const leadAngle = Math.atan2(leadY - this.y, leadX - this.x);
      const mDist = Math.hypot(bestTarget.x - mouse.x, bestTarget.y - mouse.y);
      const lockStrength = mDist < bestTarget.radius + 145 ? 0.92 : 0.78;
      bestAim = baseAim + Math.atan2(Math.sin(leadAngle - baseAim), Math.cos(leadAngle - baseAim)) * lockStrength;
    } else {
      this.lockedLeadX = mouse.x;
      this.lockedLeadY = mouse.y;
    }

    this.angle = bestAim;
    this.orbitAngle += 0.06;
    this.reticleBloom = Math.max(0, (this.reticleBloom || 0) * 0.82);
    if (this.reticleHitTimer > 0) this.reticleHitTimer--;
    if (this.reticleKillTimer > 0) this.reticleKillTimer--;

    if (this.invulnTimer > 0) this.invulnTimer--;
    if (this.parryRingTimer > 0) this.parryRingTimer--;
    if (this.tetherOverloadCooldown > 0) this.tetherOverloadCooldown--;
    if (this.dashTrail) {
      for (let i = this.dashTrail.length - 1; i >= 0; i--) {
        this.dashTrail[i].life--;
        if (this.dashTrail[i].life <= 0) this.dashTrail.splice(i, 1);
      }
    }

    if (this.overdriveActive > 0) {
      this.overdriveActive--;
      this.daggerOrbitAngle = (this.daggerOrbitAngle || 0) + 0.16;

      // 1. Dual-Ring Hard-Light Celestial Daggers shredding radius (135px)
      if (frameCount % 3 === 0) {
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.active) continue;
          if (Math.hypot(e.x - this.x, e.y - this.y) <= 135 + e.radius) {
            e.takeDamage(46 + this.level * 6, false);
            const sAng = Math.random() * Math.PI * 2;
            spawnParticle(e.x, e.y, Math.cos(sAng) * 5, Math.sin(sAng) * 5, '#ffe600', 9, 2.8);
          }
        }
      }

      // 2. 360° Spiral Supernova Glaive Barrage every 10 frames!
      if (frameCount % 10 === 0) {
        for (let s = 0; s < 4; s++) {
          const sAng = this.daggerOrbitAngle + (s * Math.PI) / 2;
          projectiles.push(new Projectile(
            this.x + Math.cos(sAng) * 28,
            this.y + Math.sin(sAng) * 28,
            sAng,
            s % 2 === 0 ? '#ffe600' : (s === 1 ? '#ff0077' : '#00f0ff'),
            21,
            58 + this.level * 8,
            this.ricochetLevel,
            true,
            'overdrive'
          ));
        }
      }

      // 3. Celestial Railgun Javelin + Twin Homing Seekers fired at closest enemies every 12 frames!
      if (frameCount % 12 === 0 && enemies.length > 0) {
        let closestEn = null;
        let closestD = 850;
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.active) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < closestD) {
            closestD = d;
            closestEn = e;
          }
        }
        if (closestEn) {
          const aNeedle = Math.atan2(closestEn.y - this.y, closestEn.x - this.x);
          projectiles.push(new Projectile(
            this.x,
            this.y,
            aNeedle,
            '#ffe600',
            24,
            68 + this.level * 9,
            1 + this.ricochetLevel,
            true,
            'rail'
          ));
          if (missiles.length < 56) {
            missiles.push(new HomingMissile(this.x, this.y, aNeedle - 0.25));
            missiles.push(new HomingMissile(this.x, this.y, aNeedle + 0.25));
          }
        }
      }

      // 4. Multi-Pillar Orbital Judgment Smite every 20 frames (Up to 3 simultaneous Sky-Pillars)!
      if (this.overdriveActive % 20 === 0 && enemies.length > 0) {
        const pillarColors = ['#ffe600', '#ff0077', '#00f0ff'];
        let smiteCount = 0;
        let prevSmited = null;
        for (let i = 0; i < enemies.length && smiteCount < 3; i++) {
          const e = enemies[(i + frameCount) % enemies.length];
          if (e && e.active && Math.hypot(e.x - this.x, e.y - this.y) < 900) {
            const col = pillarColors[smiteCount % 3];
            const jDmg = 135 + this.level * 18;
            e.takeDamage(jDmg, true);
            addGridRipple(e.x, e.y, 240, 34, col);
            lightningBolts.push({ x1: e.x, y1: e.y - 480, x2: e.x, y2: e.y, color: col, life: 15 });
            lightningBolts.push({ x1: e.x - 22, y1: e.y - 480, x2: e.x + 22, y2: e.y, color: '#ffffff', life: 13 });
            if (prevSmited) {
              lightningBolts.push({ x1: prevSmited.x, y1: prevSmited.y, x2: e.x, y2: e.y, color: '#ffe600', life: 14 });
            }
            if (smiteCount === 0) {
              spawnFloatingText(e.x, e.y - 26, '// ORBITAL JUDGMENT! //', col, 1.28);
            }
            prevSmited = e;
            smiteCount++;
          }
        }
      }

      // 5. Auto-Singularity Tear every 105 frames during Seraphim Nova!
      if (this.overdriveActive % 105 === 0 && enemies.length > 0) {
        if (typeof spatialRifts !== 'undefined') {
          const rDist = 180 + Math.random() * 140;
          const rAng = this.angle + (Math.random() - 0.5) * 0.8;
          spatialRifts.push(new SpatialRift(
            this.x + Math.cos(rAng) * rDist,
            this.y + Math.sin(rAng) * rDist,
            rAng,
            125,
            true,
            '#ff0077'
          ));
        }
      }
    }
    if (this.katanaCooldown > 0) this.katanaCooldown--;
    if (this.katanaSlashTimer > 0) this.katanaSlashTimer--;
    if (this.ionBeamCooldown > 0) this.ionBeamCooldown--;
    if (this.chronoCooldown > 0) this.chronoCooldown--;
    if (this.phantomCooldown > 0) this.phantomCooldown--;

    // Active Triple Omega Hyper-Ion Laser Beam [R] + 6 Orbital Fin-Funnels + Finale Rail Supernova!
    if (this.ionBeamTimer > 0) {
      this.ionBeamTimer--;
      const cosA = Math.cos(this.angle);
      const sinA = Math.sin(this.angle);
      const beamLen = 1220;
      const beamHalfW = 46 + this.ionBeamLevel * 12;
      const scissorSpread = Math.sin(frameCount * 0.14) * 0.28;
      screenShake = Math.max(screenShake, 5.5);

      // Autonomous Fin-Funnels fire Homing Missiles & Rail Bolts every 12 frames while beam is active!
      if (this.ionBeamTimer % 12 === 0 && enemies.length > 0) {
        if (missiles.length < 56) {
          missiles.push(new HomingMissile(this.x, this.y, this.angle - 0.45));
          missiles.push(new HomingMissile(this.x, this.y, this.angle + 0.45));
        }
        projectiles.push(new Projectile(this.x, this.y, this.angle + scissorSpread, '#00f0ff', 24, 65 + this.level * 8, 1, true, 'rail'));
        projectiles.push(new Projectile(this.x, this.y, this.angle - scissorSpread, '#ff0077', 24, 65 + this.level * 8, 1, true, 'rail'));
      }

      // Check Prismatic Refraction through active ChronoFields [F]!
      if (typeof chronoFields !== 'undefined') {
        for (let c = 0; c < chronoFields.length; c++) {
          const cf = chronoFields[c];
          if (!cf.active) continue;
          const rdx = cf.x - this.x;
          const rdy = cf.y - this.y;
          const projDist = rdx * cosA + rdy * sinA;
          if (projDist > 0 && projDist < beamLen) {
            const perpDist = Math.abs(-rdx * sinA + rdy * cosA);
            if (perpDist <= cf.radius + 30) {
              cf.refractionTimer = 5;
              cf.refractionAngle = this.angle;
              if (this.ionBeamTimer % 6 === 0) {
                const refColors = ['#ff0077', '#00f0ff', '#ffe600', '#00ff88', '#d946ef'];
                for (let rb = 0; rb < 7; rb++) {
                  const refAng = this.angle + (rb - 3) * 0.26;
                  const refCos = Math.cos(refAng);
                  const refSin = Math.sin(refAng);
                  const refLen = 860;
                  for (let ie = 0; ie < enemies.length; ie++) {
                    const en = enemies[ie];
                    if (!en.active) continue;
                    const edx = en.x - cf.x;
                    const edy = en.y - cf.y;
                    const epProj = edx * refCos + edy * refSin;
                    if (epProj > 0 && epProj < refLen) {
                      const epPerp = Math.abs(-edx * refSin + edy * refCos);
                      if (epPerp <= 34 + en.radius) {
                        en.takeDamage((68 + this.level * 12) * (1 + this.ionBeamLevel * 0.32), false);
                        if (Math.random() < 0.35) {
                          spawnParticle(en.x, en.y, refCos * 5, refSin * 5, refColors[rb % 5], 10, 2.8);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Vaporize all enemy projectiles caught inside the Triple Ion Beam & Scissor Corridor!
      for (let i = 0; i < enemyProjectiles.length; i++) {
        const ep = enemyProjectiles[i];
        if (!ep.active) continue;
        const relX = ep.x - this.x;
        const relY = ep.y - this.y;
        const proj = relX * cosA + relY * sinA;
        if (proj > 0 && proj < beamLen) {
          const perp = Math.abs(-relX * sinA + relY * cosA);
          if (perp <= beamHalfW + 65) {
            ep.active = false;
            spawnParticle(ep.x, ep.y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, '#00f0ff', 10, 3);
            if (typeof recordContractAction === 'function') {
              recordContractAction('parry', 0.5);
            }
          }
        }
      }

      // Deal high-frequency plasma melt ticks every 3 frames across Main Beam + Twin Scissor Side Beams!
      if (this.ionBeamTimer % 3 === 0) {
        const tickDmg = (44 + this.level * 7) * (1 + this.ionBeamLevel * 0.35);
        const beamAngles = [this.angle, this.angle + scissorSpread, this.angle - scissorSpread];
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.active) continue;
          let hitByAnyBeam = false;
          for (let b = 0; b < beamAngles.length; b++) {
            const bCos = Math.cos(beamAngles[b]);
            const bSin = Math.sin(beamAngles[b]);
            const relX = e.x - this.x;
            const relY = e.y - this.y;
            const proj = relX * bCos + relY * bSin;
            const halfW = b === 0 ? beamHalfW + 26 : beamHalfW * 0.55;
            if (proj > -15 && proj < beamLen && Math.abs(-relX * bSin + relY * bCos) <= halfW + e.radius) {
              hitByAnyBeam = true;
              break;
            }
          }
          if (hitByAnyBeam) {
            e.takeDamage(tickDmg, true);
            if (e.type !== 'boss') {
              e.x += cosA * 8;
              e.y += sinA * 8;
            }
            spawnParticle(e.x, e.y, cosA * 6 + (Math.random() - 0.5) * 4, sinA * 6 + (Math.random() - 0.5) * 4, '#ffe600', 12, 3.4);

            // Arc-chain from beam targets to up to 2 nearby enemies within 195px
            if (this.ionBeamTimer % 9 === 0) {
              let chains = 0;
              for (let k = 0; k < enemies.length && chains < 2; k++) {
                const other = enemies[k];
                if (other.active && other.id !== e.id && Math.hypot(other.x - e.x, other.y - e.y) < 195) {
                  other.takeDamage(tickDmg * 0.65, false);
                  lightningBolts.push({ x1: e.x, y1: e.y, x2: other.x, y2: other.y, color: chains === 0 ? '#00f0ff' : '#ff0077', life: 8 });
                  chains++;
                }
              }
            }
          }
        }
        for (let w = 0; w < worldProps.length; w++) {
          const wp = worldProps[w];
          if (!wp.active || (wp.type !== 'cache' && wp.type !== 'emp_pylon')) continue;
          const relX = wp.x - this.x;
          const relY = wp.y - this.y;
          const proj = relX * cosA + relY * sinA;
          if (proj > 0 && proj < beamLen && Math.abs(-relX * sinA + relY * cosA) <= beamHalfW + wp.radius) {
            wp.takeDamage(tickDmg);
          }
        }
      }

      if (this.ionBeamTimer % 8 === 0) {
        addGridRipple(this.x + cosA * 360, this.y + sinA * 360, 290, 26, '#00f0ff');
      }

      // Final Frame 16-Way 360° Overcharge Rail-Pulse Supernova Finale!
      if (this.ionBeamTimer === 1) {
        sound.laser(true);
        screenShake = Math.max(screenShake, 20);
        chromaticFlash = Math.max(chromaticFlash, 12);
        for (let s = 0; s < 16; s++) {
          const a = this.angle + (s * Math.PI * 2) / 16;
          projectiles.push(new Projectile(this.x, this.y, a, s % 2 === 0 ? '#ffe600' : '#00f0ff', 25, 125 + this.level * 16, 1 + this.ricochetLevel, true, 'rail'));
        }
        spawnFloatingText(this.x, this.y - 24, '// 16-WAY OMEGA RAIL SUPERNOVA //', '#ffe600', 1.35);
      }
    }

    // Shield recharge
    if (this.shieldMax > 0 && this.shieldCharges < this.shieldMax) {
      this.shieldRechargeTimer++;
      if (this.shieldRechargeTimer >= 360) {
        this.shieldCharges++;
        this.shieldRechargeTimer = 0;
        announce('// AEGIS HARD-LIGHT BARRIER RECHARGED //', '#00f0ff');
      }
    }

    // Twin thruster particles
    const thrustMag = Math.hypot(this.vx, this.vy);
    if (frameCount % 2 === 0 && (thrustMag > 0.5 || Math.random() < 0.4)) {
      const rearX = this.x - Math.cos(this.angle) * 15;
      const rearY = this.y - Math.sin(this.angle) * 15;
      const pColor = (this.overdriveActive > 0 || this.frenzyTimer > 0) ? '#ffe600' : '#00f0ff';
      spawnParticle(
        rearX + (Math.random() - 0.5) * 6,
        rearY + (Math.random() - 0.5) * 6,
        -Math.cos(this.angle) * 2.8 + (Math.random() - 0.5),
        -Math.sin(this.angle) * 2.8 + (Math.random() - 0.5),
        pColor, 14, 3.2
      );
    }

    // Primary Firing
    this.lastShot++;
    const isHyper = this.overdriveActive > 0 || this.frenzyTimer > 0;
    const effectiveInterval = isHyper ? Math.max(3, Math.floor(this.fireInterval * 0.4)) : this.fireInterval;
    if ((mouse.down || autoFire) && this.lastShot >= effectiveInterval) {
      this.shoot();
      this.lastShot = 0;
    }

    // Orbital Drones firing
    if (this.droneCount > 0 && frameCount % 20 === 0 && enemies.length > 0) {
      for (let d = 0; d < this.droneCount; d++) {
        const dAngle = this.orbitAngle + (d * Math.PI * 2) / this.droneCount;
        const dxPos = this.x + Math.cos(dAngle) * 46;
        const dyPos = this.y + Math.sin(dAngle) * 46;
        let closest = null;
        let minD = 540;
        enemies.forEach(e => {
          const dist = Math.hypot(e.x - dxPos, e.y - dyPos);
          if (dist < minD) { minD = dist; closest = e; }
        });
        if (closest) {
          const aim = Math.atan2(closest.y - dyPos, closest.x - dxPos);
          projectiles.push(new Projectile(dxPos, dyPos, aim, '#00ff88', 16, 22 + this.level * 2, 0, false, 'drone'));
        }
      }
    }

    // Homing missile pods
    if (this.homingLevel > 0) {
      this.homingTimer++;
      const hInterval = Math.max(16, 46 - this.homingLevel * 8);
      if (this.homingTimer >= hInterval && enemies.length > 0) {
        this.homingTimer = 0;
        for (let i = 0; i < this.homingLevel; i++) {
          missiles.push(new HomingMissile(this.x, this.y, this.angle + (i - (this.homingLevel - 1) / 2) * 0.4));
        }
      }
    }

    // Singularity Black Hole Launcher
    if (this.blackholeLevel > 0) {
      this.blackholeTimer++;
      if (this.blackholeTimer >= Math.max(120, 220 - this.blackholeLevel * 35) && enemies.length > 0) {
        this.blackholeTimer = 0;
        blackHoles.push(new BlackHole(this.x, this.y, this.angle));
      }
    }

    if (this.dashCooldown > 0) {
      this.dashCooldown--;
      if (this.dashCooldown <= 0 && this.dashBuffered > 0) {
        this.dashBuffered = 0;
        this.tryDash();
      }
    }
    if (this.dashBuffered > 0) this.dashBuffered--;
  }

  shoot() {
    this.shotCounter++;
    const isOver = this.overdriveActive > 0 || this.frenzyTimer > 0;
    const isRailShot = (this.railgunLevel > 0 && (this.shotCounter % Math.max(2, 5 - this.railgunLevel) === 0)) || (isOver && this.shotCounter % 3 === 0);
    sound.laser(isRailShot);
    screenShake = Math.max(screenShake, isRailShot ? 5 : 2.2);
    this.reticleBloom = Math.min(11, (this.reticleBloom || 0) + (isRailShot ? 4.5 : 2.8));

    const totalShots = isOver ? this.multishot + 4 : this.multishot;
    const spreadStep = this.chassis === 'titan' ? 0.14 : 0.105;
    const startOffset = -((totalShots - 1) / 2) * spreadStep;

    this.x -= Math.cos(this.angle) * 1.1;
    this.y -= Math.sin(this.angle) * 1.1;

    for (let i = 0; i < totalShots; i++) {
      const shotAngle = this.angle + startOffset + (i * spreadStep);
      let color = isOver
        ? (i % 3 === 0 ? '#ffe600' : (i % 3 === 1 ? '#ff0077' : '#00f0ff'))
        : (isRailShot ? '#ff0077' : (this.themeColor || '#00f0ff'));
      let speed = isRailShot ? 23 : (isOver ? 20.5 : 16.5);
      let dmg = (isRailShot ? 54 : 28) * (isOver ? 1.45 : 1);
      if (this.chassis === 'titan') {
        dmg *= 1.3;
        speed *= 0.94;
      } else if (this.chassis === 'phantom') {
        speed *= 1.16;
      }
      const pierce = (isRailShot || isOver || this.chassis === 'phantom');
      const style = (isRailShot || (isOver && i === Math.floor(totalShots / 2))) ? 'rail' : (isOver ? 'overdrive' : (this.chassis === 'phantom' ? 'laser' : 'plasma'));
      projectiles.push(new Projectile(
        this.x + Math.cos(this.angle) * 16,
        this.y + Math.sin(this.angle) * 16,
        shotAngle, color, speed, dmg, this.ricochetLevel + (isOver ? 1 : 0), pierce, style
      ));
    }

    // Bonus Homing Seekers every 4th shot during Seraphim Nova!
    if (isOver && this.shotCounter % 4 === 0 && missiles.length < 56) {
      missiles.push(new HomingMissile(this.x, this.y, this.angle - 0.5));
      missiles.push(new HomingMissile(this.x, this.y, this.angle + 0.5));
    }
  }

  takeDamage(amount) {
    if (this.isDashing || this.invulnTimer > 0) return;

    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      this.invulnTimer = 35;
      screenShake = 10;
      addGridRipple(this.x, this.y, 200, 25, '#00f0ff');
      spawnFloatingText(this.x, this.y - 22, 'AEGIS BLOCKED!', '#00f0ff');
      return;
    }

    this.hp -= amount;
    this.invulnTimer = 25;
    screenShake = 16;
    chromaticFlash = 12;
    spawnFloatingText(this.x, this.y - 20, `-${Math.round(amount)}`, '#ff0055');

    if (this.hp <= 0) {
      this.hp = 0;
      gameOver();
    }
  }

  addXp(amount) {
    const mult = 1 + this.naniteLevel * 0.2;
    this.xp += amount * mult;
    let leveled = false;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = Math.floor(this.xpNext * 1.35);
      this.hp = Math.min(this.maxHp, this.hp + 20);
      pendingLevelUps++;
      leveled = true;
    }
    if (leveled) {
      sound.levelUp();
      addGridRipple(this.x, this.y, 400, 35, '#ffe600');
    }
    if (pendingLevelUps > 0 && gameState === 'PLAYING') {
      pendingLevelUps--;
      showUpgradeMenu();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpNext;
    this.xpNext = Math.floor(this.xpNext * 1.35);
    this.hp = Math.min(this.maxHp, this.hp + 20);
    sound.levelUp();
    addGridRipple(this.x, this.y, 400, 35, '#ffe600');
    if (gameState === 'PLAYING') {
      showUpgradeMenu();
    } else {
      pendingLevelUps++;
    }
  }

  draw() {
    // Draw Prismatic Hyper-Slipstream Ribbon Trails during dash
    if (this.dashTrail && this.dashTrail.length > 1) {
      const colors = ['#00f0ff', '#ff0077', '#ffe600'];
      for (let c = 0; c < 3; c++) {
        const offset = (c - 1) * 6;
        ctx.save();
        ctx.strokeStyle = colors[c];
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let t = 0; t < this.dashTrail.length; t++) {
          const pt = this.dashTrail[t];
          const perpX = -Math.sin(pt.angle) * offset;
          const perpY = Math.cos(pt.angle) * offset;
          if (t === 0) ctx.moveTo(pt.x + perpX, pt.y + perpY);
          else ctx.lineTo(pt.x + perpX, pt.y + perpY);
        }
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 1. Draw Triple Omega Hyper-Ion Laser Cannon [R] + Scissor Beams + 6 Floating Fin-Funnel Bits!
    if (this.ionBeamTimer > 0) {
      const beamLen = 1220;
      const beamW = (58 + this.ionBeamLevel * 14) + Math.sin(frameCount * 0.7) * 10;
      const scissorSpread = Math.sin(frameCount * 0.14) * 0.28;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      // Muzzle focusing lens flare
      ctx.drawImage(getGlowSprite('#00f0ff'), -40, -68, 136, 136);
      ctx.drawImage(getGlowSprite('#ff0077'), -18, -46, 92, 92);

      // Twin Scissor-Sweep Secondary Hyper-Lasers!
      for (const sDir of [-1, 1]) {
        ctx.save();
        ctx.rotate(sDir * scissorSpread);
        ctx.strokeStyle = sDir > 0 ? 'rgba(0, 255, 136, 0.42)' : 'rgba(255, 0, 119, 0.42)';
        ctx.lineWidth = beamW * 0.45;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(beamLen * 0.92, 0);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = beamW * 0.14;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(beamLen * 0.92, 0);
        ctx.stroke();
        ctx.restore();
      }

      // Autonomous Floating Fin-Funnel Bits (Up to 3 pairs = 6 Funnels!) flanking the ship
      const funnelPairs = 2 + Math.min(1, this.ionBeamLevel);
      for (let fp = 1; fp <= funnelPairs; fp++) {
        for (const side of [-1, 1]) {
          const fy = side * (42 + fp * 24) + Math.sin(frameCount * 0.22 + side * fp) * 6;
          const fx = -12 + fp * 8;
          // Converging sub-beam from Funnel Bit into main beam
          ctx.strokeStyle = side > 0 ? 'rgba(0, 240, 255, 0.78)' : 'rgba(255, 230, 0, 0.78)';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(fx + 10, fy);
          ctx.lineTo(beamLen * 0.85, 0);
          ctx.stroke();

          // Funnel Bit geometric chassis
          ctx.fillStyle = '#061024';
          ctx.strokeStyle = fp % 2 === 0 ? '#00f0ff' : '#ffe600';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(fx + 15, fy);
          ctx.lineTo(fx - 7, fy - 8);
          ctx.lineTo(fx - 2, fy);
          ctx.lineTo(fx - 7, fy + 8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // Outer magenta/cyan plasma sheath
      ctx.strokeStyle = 'rgba(255, 0, 119, 0.42)';
      ctx.lineWidth = beamW * 1.45;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(beamLen, 0);
      ctx.stroke();

      // Mid-layer high-voltage cyan beam
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.86)';
      ctx.lineWidth = beamW * 0.76;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(beamLen, 0);
      ctx.stroke();

      // Braided triple-helix energy arcs winding down the beam
      const helixColors = ['rgba(0, 240, 255, 0.92)', 'rgba(255, 0, 119, 0.92)', 'rgba(255, 230, 0, 0.92)'];
      for (let h = 0; h < 3; h++) {
        const hPhase = (h * Math.PI * 2) / 3;
        ctx.strokeStyle = helixColors[h];
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        for (let bx = 22; bx < beamLen; bx += 24) {
          const by = Math.sin(bx * 0.038 + frameCount * 0.38 + hPhase) * (beamW * 0.52);
          if (bx === 22) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }

      // Inner blinding white-gold core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = beamW * 0.34;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(beamLen, 0);
      ctx.stroke();

      // Helical shockwave rings traveling down the beam
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2.4;
      const ringOffset = (frameCount * 28) % 95;
      for (let rx = 45 + ringOffset; rx < beamLen - 60; rx += 95) {
        ctx.beginPath();
        ctx.ellipse(rx, 0, 11, beamW * 0.68, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Draw Dimension Rift Katana Slash Arc (Triple-Layer Prismatic Sweep & X-Cross Judgement Cut!)
    if (this.katanaSlashTimer > 0) {
      const maxT = this.katanaIsCross ? 22 : 16;
      const prog = 1 - this.katanaSlashTimer / maxT;
      const slashR = (168 + this.katanaLevel * 32) * (0.8 + prog * 0.38) * (this.katanaIsCross ? 1.28 : 1.0);
      const slashes = this.katanaIsCross ? [-0.36, 0, 0.36] : [-0.14, 0.14];
      const slashPalette = ['rgba(0, 255, 136, 0.38)', 'rgba(0, 240, 255, 0.38)', 'rgba(255, 0, 119, 0.4)'];

      for (let s = 0; s < slashes.length; s++) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.katanaSlashAngle + slashes[s]);
        ctx.globalAlpha = Math.min(1, (this.katanaSlashTimer / maxT) * 1.45);

        // Outer neon crescent blade sweep
        ctx.beginPath();
        ctx.arc(0, 0, slashR, -1.52, 1.52, false);
        ctx.arc(-24, 0, slashR * 0.74, 1.42, -1.42, true);
        ctx.closePath();
        ctx.fillStyle = slashPalette[s % 3];
        ctx.fill();
        ctx.strokeStyle = this.katanaIsCross ? (s === 1 ? '#ffe600' : '#00f0ff') : '#00ff88';
        ctx.lineWidth = 3.2;
        ctx.stroke();

        // Inner white-hot katana edge
        ctx.beginPath();
        ctx.arc(0, 0, slashR - 4, -1.32, 1.32);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Golden Hex-Parry Riposte Ring when bullets are deflected
    if (this.parryRingTimer > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(-frameCount * 0.08);
      const pr = this.radius + 26 + (18 - this.parryRingTimer) * 2.5;
      ctx.strokeStyle = `rgba(255, 230, 0, ${this.parryRingTimer / 18})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        if (i === 0) ctx.moveTo(Math.cos(a) * pr, Math.sin(a) * pr);
        else ctx.lineTo(Math.cos(a) * pr, Math.sin(a) * pr);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Orbital Drones (Mini Cyber-Interceptors)
    const droneGlow = getGlowSprite('#00ff88');
    for (let d = 0; d < this.droneCount; d++) {
      const dAngle = this.orbitAngle + (d * Math.PI * 2) / this.droneCount;
      const dx = this.x + Math.cos(dAngle) * 46;
      const dy = this.y + Math.sin(dAngle) * 46;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.drawImage(droneGlow, -18, -18, 36, 36);
      ctx.rotate(this.angle);
      ctx.strokeStyle = '#00ff88';
      ctx.fillStyle = '#041a12';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.lineTo(-6, -7);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(1, 0, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Aegis Shield Hex-Ring
    if (this.shieldCharges > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(frameCount * 0.025);
      const sr = this.radius + 11 + Math.sin(frameCount * 0.1) * 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * sr;
        const py = Math.sin(a) * sr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const isOver = this.overdriveActive > 0 || this.frenzyTimer > 0;
    const glowColor = isOver ? '#ffe600' : (this.isDashing ? '#ff0077' : '#00f0ff');
    const gR = isOver ? 74 : 36;
    ctx.drawImage(getGlowSprite(glowColor), -gR, -gR, gR * 2, gR * 2);
    if (isOver) {
      ctx.drawImage(getGlowSprite('#ff0077'), -54, -54, 108, 108);
    }

    // 5. SERAPHIM 12-WING PRISMATIC ENERGY PINIONS + SACRED CYBER-HALO + 12 CELESTIAL GLAIVES during [E] Nova!
    if (isOver) {
      // Rotating Sacred Geometry Cyber-Halo Ring behind the ship
      ctx.save();
      ctx.rotate(-this.angle + frameCount * 0.05);
      const haloR = 38 + Math.sin(frameCount * 0.18) * 3;
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, haloR, 0, Math.PI * 2);
      ctx.stroke();
      for (let h = 0; h < 8; h++) {
        const ha = (h * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ha) * (haloR - 6), Math.sin(ha) * (haloR - 6));
        ctx.lineTo(Math.cos(ha) * (haloR + 9), Math.sin(ha) * (haloR + 9));
        ctx.strokeStyle = h % 2 === 0 ? '#ffe600' : '#00f0ff';
        ctx.stroke();
      }
      ctx.restore();

      // 12-Wing Seraphim Energy Pinions (6 pairs of sweeping prismatic hard-light wings)
      const wingBeat = Math.sin(frameCount * 0.28) * 6;
      const wingFills = [
        'rgba(255, 230, 0, 0.52)',
        'rgba(255, 0, 119, 0.45)',
        'rgba(0, 240, 255, 0.40)',
        'rgba(0, 255, 136, 0.36)',
        'rgba(217, 70, 239, 0.34)',
        'rgba(255, 230, 0, 0.30)'
      ];
      const wingStrokes = ['#ffe600', '#ff0077', '#00f0ff', '#00ff88', '#d946ef', '#ffffff'];
      for (let w = 0; w < 6; w++) {
        const span = 28 + w * 9.5 + wingBeat;
        const sweep = -8 - w * 6.5;
        ctx.fillStyle = wingFills[w];
        ctx.strokeStyle = wingStrokes[w];
        ctx.lineWidth = 1.7;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(-4, side * 6);
          ctx.lineTo(sweep, side * span);
          ctx.lineTo(sweep - 14, side * (span - 5));
          ctx.lineTo(-14, side * 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // Dual Counter-Rotating Rings of 12 Hard-Light Celestial Glaive-Daggers orbiting the ship
      const innerR = 52 + Math.sin(frameCount * 0.16) * 4;
      const outerR = 86 + Math.cos(frameCount * 0.16) * 5;
      const dBaseAng = (this.daggerOrbitAngle || 0) - this.angle;
      for (let d = 0; d < 12; d++) {
        const isOuter = d >= 6;
        const ringIdx = d % 6;
        const dAng = (isOuter ? -dBaseAng * 0.85 : dBaseAng) + (ringIdx * Math.PI) / 3;
        const curR = isOuter ? outerR : innerR;
        const dX = Math.cos(dAng) * curR;
        const dY = Math.sin(dAng) * curR;
        ctx.save();
        ctx.translate(dX, dY);
        ctx.rotate(dAng + Math.PI * 0.5);
        ctx.fillStyle = isOuter ? (ringIdx % 2 === 0 ? '#ff0077' : '#00ff88') : (ringIdx % 2 === 0 ? '#ffe600' : '#00f0ff');
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(4.5, 2);
        ctx.lineTo(1.8, 10);
        ctx.lineTo(-1.8, 10);
        ctx.lineTo(-4.5, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Twin flickering afterburner plumes
    const flameLen = 10 + Math.random() * 8 + (isOver ? 10 : 0);
    ctx.fillStyle = isOver ? '#ff0077' : (this.themeColor || '#00f0ff');
    ctx.beginPath();
    ctx.moveTo(-13, -6);
    ctx.lineTo(-13 - flameLen, -4);
    ctx.lineTo(-13, -2);
    ctx.moveTo(-13, 2);
    ctx.lineTo(-13 - flameLen, 4);
    ctx.lineTo(-13, 6);
    ctx.fill();

    // Outer cyber wings custom to active chassis
    if (this.chassis === 'titan') {
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.lineTo(8, -12);
      ctx.lineTo(-6, -22);
      ctx.lineTo(-18, -16);
      ctx.lineTo(-12, -6);
      ctx.lineTo(-18, 0);
      ctx.lineTo(-12, 6);
      ctx.lineTo(-18, 16);
      ctx.lineTo(-6, 22);
      ctx.lineTo(8, 12);
      ctx.closePath();
    } else if (this.chassis === 'phantom') {
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(7, -7);
      ctx.lineTo(-2, -25);
      ctx.lineTo(-15, -20);
      ctx.lineTo(-9, -4);
      ctx.lineTo(-18, 0);
      ctx.lineTo(-9, 4);
      ctx.lineTo(-15, 20);
      ctx.lineTo(-2, 25);
      ctx.lineTo(7, 7);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(4, -7);
      ctx.lineTo(-12, -17);
      ctx.lineTo(-16, -12);
      ctx.lineTo(-10, -4);
      ctx.lineTo(-16, 0);
      ctx.lineTo(-10, 4);
      ctx.lineTo(-16, 12);
      ctx.lineTo(-12, 17);
      ctx.lineTo(4, 7);
      ctx.closePath();
    }
    ctx.fillStyle = isOver ? '#2a082e' : '#060a18';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.4;
    ctx.fill();
    ctx.stroke();

    // Wingtip cannon rails
    ctx.strokeStyle = this.accentColor || '#ff0077';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, -13);
    ctx.lineTo(8, -10);
    ctx.moveTo(-6, 13);
    ctx.lineTo(8, 10);
    ctx.stroke();

    // Inner armored cockpit & energy core
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = isOver ? '#ffe600' : (this.themeColor || '#00f0ff');
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-1, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, angle, color, speed, damage, bounces = 0, pierce = false, style = 'auto') {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.angle = angle;
    this.speed = speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.damage = damage;
    this.radius = pierce ? 6 : 4.5;
    this.bounces = bounces;
    this.pierce = pierce;
    this.spin = Math.random() * Math.PI * 2;
    if (style === 'auto') {
      if (speed >= 13 && color === '#ff0055') this.style = 'enemy_sniper';
      else if (color === '#d946ef') this.style = 'enemy_wave';
      else this.style = 'enemy_orb';
    } else {
      this.style = style;
    }
    this.hitIds = new Set();
    this.active = true;
    this.distTraveled = 0;
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx;
    this.y += this.vy;
    this.distTraveled += Math.hypot(this.vx, this.vy);
    this.spin += 0.22;

    // Wall bounce if ricochet perk is unlocked (bounces off viewport edges or world borders)
    if (this.bounces > 0) {
      let bounced = false;
      const minX = Math.max(8, camX + 6);
      const maxX = Math.min(WORLD_W - 8, camX + canvas.width - 6);
      const minY = Math.max(8, camY + 6);
      const maxY = Math.min(WORLD_H - 8, camY + canvas.height - 6);
      if (this.x <= minX || this.x >= maxX) {
        this.vx *= -1;
        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.bounces--;
        bounced = true;
        spawnParticle(this.x, this.y, 0, 0, this.color, 10, 4);
      }
      if (this.y <= minY || this.y >= maxY) {
        this.vy *= -1;
        this.y = Math.max(minY, Math.min(maxY, this.y));
        this.bounces--;
        bounced = true;
        spawnParticle(this.x, this.y, 0, 0, this.color, 10, 4);
      }
      if (bounced) this.angle = Math.atan2(this.vy, this.vx);
    } else if (
      this.distTraveled > 1150 ||
      this.x < -30 || this.x > WORLD_W + 30 ||
      this.y < -30 || this.y > WORLD_H + 30
    ) {
      this.active = false;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. ENEMY PLASMA SHURIKEN / DARK-CORE STAR ORB (Cruiser & Boss)
    if (this.style === 'enemy_orb') {
      ctx.drawImage(getGlowSprite(this.color), -16, -16, 32, 32);
      ctx.rotate(this.spin);

      // 4-Pointed Razor Energy Star
      ctx.fillStyle = this.color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const aMid = a + Math.PI / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * 8.5, Math.sin(a) * 8.5);
        else ctx.lineTo(Math.cos(a) * 8.5, Math.sin(a) * 8.5);
        ctx.lineTo(Math.cos(aMid) * 3.2, Math.sin(aMid) * 3.2);
      }
      ctx.closePath();
      ctx.fill();

      // Dark void core + white-hot pin
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#090314';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
      return;
    }

    // All directional projectiles rotate along flight vector
    ctx.rotate(this.angle);

    // 2. ENEMY WEAVER PSIONIC CRESCENT WAVE
    if (this.style === 'enemy_wave') {
      ctx.drawImage(getGlowSprite('#d946ef'), -18, -18, 36, 36);
      // Swept crescent scythe blade
      ctx.beginPath();
      ctx.arc(-2, 0, 8.5, -Math.PI * 0.48, Math.PI * 0.48, false);
      ctx.arc(-5.5, 0, 7.5, Math.PI * 0.42, -Math.PI * 0.42, true);
      ctx.closePath();
      ctx.fillStyle = '#d946ef';
      ctx.fill();

      // Bright leading edge
      ctx.beginPath();
      ctx.arc(-1, 0, 6.5, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
      return;
    }

    // 3. ENEMY SNIPER HIGH-VELOCITY RAIL SABOT
    if (this.style === 'enemy_sniper') {
      ctx.drawImage(getGlowSprite('#ff0055'), -22, -14, 44, 28);
      // Long crimson laser wake
      ctx.fillStyle = 'rgba(255, 0, 85, 0.38)';
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-38, -3.5);
      ctx.lineTo(-30, 0);
      ctx.lineTo(-38, 3.5);
      ctx.closePath();
      ctx.fill();

      // Sharp needle dart head
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-5, -4);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-5, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(-2, -1.6);
      ctx.lineTo(-2, 1.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // 4. ORBITAL DRONE TWIN-LINKED PULSE NEEDLES
    if (this.style === 'drone') {
      ctx.drawImage(getGlowSprite('#00ff88'), -15, -12, 30, 24);
      ctx.fillStyle = '#00ff88';
      // Twin parallel laser bolts
      ctx.fillRect(-14, -3.8, 18, 2);
      ctx.fillRect(-14, 1.8, 18, 2);
      // White-hot leading tips
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -3.8, 6, 2);
      ctx.fillRect(0, 1.8, 6, 2);
      ctx.restore();
      return;
    }

    // 5. PLAYER HYPER-RAILGUN ELECTROMAGNETIC JAVELIN
    if (this.style === 'rail') {
      ctx.drawImage(getGlowSprite(this.color), -28, -18, 56, 36);

      // Long supersonic plasma wake
      ctx.fillStyle = 'rgba(255, 0, 119, 0.35)';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-48, -5);
      ctx.lineTo(-36, 0);
      ctx.lineTo(-48, 5);
      ctx.closePath();
      ctx.fill();

      // Dual Mach-cone shockwave chevrons along shaft
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, -6.5); ctx.lineTo(3, 0); ctx.lineTo(-4, 6.5);
      ctx.moveTo(-16, -5);  ctx.lineTo(-9, 0); ctx.lineTo(-16, 5);
      ctx.stroke();

      // Outer magenta spear body
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-2, -4.2);
      ctx.lineTo(-26, 0);
      ctx.lineTo(-2, 4.2);
      ctx.closePath();
      ctx.fill();

      // White-hot diamond core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(0, -2);
      ctx.lineTo(-14, 0);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // 6. PLAYER OVERDRIVE SUPERNOVA GLAIVE-BLADE (Replaces the yellow/pink lollipops!)
    if (this.style === 'overdrive') {
      ctx.drawImage(getGlowSprite(this.color), -24, -20, 48, 40);

      // Twin tapered prismatic afterburner tail
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.42;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-34, -5.5);
      ctx.lineTo(-22, 0);
      ctx.lineTo(-34, 5.5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Swept Valkyrie Crescent Energy Wings
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-4, -8);
      ctx.lineTo(-11, -9);
      ctx.lineTo(-5, -2.5);
      ctx.lineTo(-16, 0);
      ctx.lineTo(-5, 2.5);
      ctx.lineTo(-11, 9);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();

      // Razor-sharp white-hot diamond spearhead core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(1, -2.6);
      ctx.lineTo(-10, 0);
      ctx.lineTo(1, 2.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // 7. PLAYER STANDARD CYBER-PLASMA SPEAR ('plasma')
    ctx.drawImage(getGlowSprite(this.color), -20, -14, 40, 28);

    // Tapered energy wake ribbon
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-28, -4);
    ctx.lineTo(-19, 0);
    ctx.lineTo(-28, 4);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Forward-swept plasma stabilizer fins
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-3, -5.2);
    ctx.lineTo(-8, -5.2);
    ctx.lineTo(-4, -1.8);
    ctx.lineTo(-13, 0);
    ctx.lineTo(-4, 1.8);
    ctx.lineTo(-8, 5.2);
    ctx.lineTo(-3, 5.2);
    ctx.closePath();
    ctx.fill();

    // Crisp white-hot needle core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(1, -2);
    ctx.lineTo(-8, 0);
    ctx.lineTo(1, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

class HomingMissile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 9.5;
    this.active = true;
    this.damage = 55;
    this.life = 0;
  }

  update() {
    this.life++;
    let closest = null;
    let minDist = 1100;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    }

    if (closest) {
      const targetAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
      let diff = targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.angle += diff * 0.14;
    }

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (frameCount % 2 === 0) {
      spawnParticle(this.x - Math.cos(this.angle) * 8, this.y - Math.sin(this.angle) * 8, 0, 0, '#ffe600', 9, 2.4);
    }

    if (this.life > 190 || this.x < -30 || this.x > WORLD_W + 30 || this.y < -30 || this.y > WORLD_H + 30) {
      this.active = false;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(getGlowSprite('#ffe600'), -18, -18, 36, 36);
    ctx.rotate(this.angle);

    // Afterburner plasma plume
    const plume = 7 + (frameCount % 3) * 2.5;
    ctx.fillStyle = '#ff0077';
    ctx.beginPath();
    ctx.moveTo(-6, -2.5);
    ctx.lineTo(-6 - plume, 0);
    ctx.lineTo(-6, 2.5);
    ctx.closePath();
    ctx.fill();

    // Swept tail stabilizer fins
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(-1, -2);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-6, -2);
    ctx.moveTo(-1, 2);
    ctx.lineTo(-8, 7);
    ctx.lineTo(-6, 2);
    ctx.fill();

    // Armored micro-torpedo body
    ctx.fillStyle = '#1e1b18';
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(2, -3.5);
    ctx.lineTo(-6, -3);
    ctx.lineTo(-6, 3);
    ctx.lineTo(2, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing warhead nosecone
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(4, -2);
    ctx.lineTo(4, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

class BlackHole {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * 6.5;
    this.vy = Math.sin(angle) * 6.5;
    this.radius = 22;
    this.pullRadius = 210;
    this.life = 170;
    this.active = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.life--;

    if (this.life % 10 === 0) {
      addGridRipple(this.x, this.y, 160, -18, '#9d4edd');
    }

    // Pull enemies inward & deal vortex damage
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const dist = Math.hypot(this.x - e.x, this.y - e.y);
      if (dist < this.pullRadius && dist > 5) {
        const pull = (e.isBoss || e.type === 'boss') ? 0.8 : 2.8;
        const ang = Math.atan2(this.y - e.y, this.x - e.x);
        e.x += Math.cos(ang) * pull;
        e.y += Math.sin(ang) * pull;
        if (this.life % 12 === 0) {
          e.takeDamage(12, false);
        }
      }
    }

    if (this.life <= 0) {
      this.active = false;
      sound.explosion(true);
      addGridRipple(this.x, this.y, 300, 35, '#9d4edd');
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.active && Math.hypot(this.x - e.x, this.y - e.y) < 160) {
          e.takeDamage(90, true);
        }
      }
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 9 + 2;
        spawnParticle(this.x, this.y, Math.cos(a) * s, Math.sin(a) * s, '#9d4edd', 24, 3.5);
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(getGlowSprite('#9d4edd'), -46, -46, 92, 92);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + Math.sin(frameCount * 0.25) * 3, 0, Math.PI * 2);
    ctx.fillStyle = '#04000c';
    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    // Swirling accretion ring
    ctx.rotate(frameCount * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 1.3);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

