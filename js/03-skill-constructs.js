// ============================================================================
// MODULE 03: CHRONO DOME, PHANTOM SQUADRON, SPATIAL RIFTS & DATA SHARDS
// ============================================================================
// === SKILL [F]: CHRONO-STASIS SINGULARITY DOME (ORBITAL BULLET CAPTURE + TEMPORAL CHAINS) ===
class ChronoField {
  constructor(x, y, radius = 275, maxLife = 340) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.active = true;
    this.rot = 0;
    this.refractionTimer = 0;
    this.refractionAngle = 0;
  }

  update() {
    this.life--;
    this.rot += 0.032;
    if (this.refractionTimer > 0) this.refractionTimer--;
    const dmgTick = frameCount % 8 === 0;
    const dmgMult = 1 + (player.level - 1) * 0.14;
    const tickDmg = (26 + player.chronoLevel * 10) * dmgMult;

    // Freeze & pull enemies inside the temporal dome + apply +75% damage vulnerability
    let trappedTarget = null;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const dx = this.x - e.x;
      const dy = this.y - e.y;
      const d = Math.hypot(dx, dy);
      if (d < this.radius + e.radius) {
        e.chronoSlowTimer = 8;
        trappedTarget = e;
        const pullStrength = (e.isBoss || e.type === 'boss') ? 0.55 : 2.1;
        if (d > 14) {
          e.x += (dx / d) * pullStrength;
          e.y += (dy / d) * pullStrength;
        }
        if (dmgTick) {
          e.takeDamage(tickDmg, false);
        }
      }
    }

    // Chrono-Lance Temporal Barrage: Every 16 frames, fire piercing Chrono-Rail Lances + Temporal Lightning from the dome core!
    if (frameCount % 16 === 0 && enemies.length > 0) {
      const aimBase = trappedTarget
        ? Math.atan2(trappedTarget.y - this.y, trappedTarget.x - this.x)
        : this.rot * 3;
      for (const side of [-0.18, 0.18]) {
        projectiles.push(
          new Projectile(this.x, this.y, aimBase + side, '#d946ef', 22, 54 * dmgMult, 1, true, 'rail')
        );
      }
      if (trappedTarget) {
        lightningBolts.push({ x1: this.x, y1: this.y, x2: trappedTarget.x, y2: trappedTarget.y, color: '#d946ef', life: 10 });
      }
    }

    // Capture hostile projectiles into a high-speed particle accelerator orbit inside the Chrono-Stasis matrix!
    for (let i = 0; i < enemyProjectiles.length; i++) {
      const ep = enemyProjectiles[i];
      if (!ep.active) continue;
      const dx = ep.x - this.x;
      const dy = ep.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d < this.radius && d > 4) {
        const tangAng = Math.atan2(dy, dx) + Math.PI * 0.52;
        const orbitPull = (this.radius * 0.68 - d) * 0.06;
        ep.vx = Math.cos(tangAng) * 4.5 + (dx / d) * orbitPull;
        ep.vy = Math.sin(tangAng) * 4.5 + (dy / d) * orbitPull;
        ep.color = '#d946ef';
      }
    }

    // Ambient temporal clockwork particles
    if (frameCount % 3 === 0) {
      const a = Math.random() * Math.PI * 2;
      const r = this.radius * (0.4 + Math.random() * 0.6);
      spawnParticle(
        this.x + Math.cos(a) * r,
        this.y + Math.sin(a) * r,
        -Math.sin(a) * 1.8,
        Math.cos(a) * 1.8,
        Math.random() < 0.5 ? '#d946ef' : '#00f0ff',
        18,
        2.6
      );
    }

    if (this.life <= 0 && this.active) {
      this.detonate();
    }
  }

  detonate() {
    if (!this.active) return;
    this.active = false;
    const dmgMult = 1 + (player.level - 1) * 0.14;
    sound.chronoField(true);
    screenShake = Math.max(screenShake, 26);
    chromaticFlash = Math.max(chromaticFlash, 18);
    hitStopFrames = Math.max(hitStopFrames, 3);
    addGridRipple(this.x, this.y, this.radius * 2.4, 48, '#d946ef');
    addGridRipple(this.x, this.y, this.radius * 1.6, -34, '#00f0ff');
    addGridRipple(this.x, this.y, this.radius * 1.1, 30, '#ffe600');

    // Convert every captured enemy projectile in the dome into a high-velocity friendly Supernova Glaive!
    let convertedShots = 0;
    for (let i = 0; i < enemyProjectiles.length; i++) {
      const ep = enemyProjectiles[i];
      if (!ep.active) continue;
      const d = Math.hypot(ep.x - this.x, ep.y - this.y);
      if (d <= this.radius + 55) {
        ep.active = false;
        convertedShots++;
        let targetAng = Math.atan2(ep.y - this.y, ep.x - this.x);
        let bestD = Infinity;
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (!e.active) continue;
          const ed = Math.hypot(e.x - ep.x, e.y - ep.y);
          if (ed < bestD) {
            bestD = ed;
            targetAng = Math.atan2(e.y - ep.y, e.x - ep.x);
          }
        }
        projectiles.push(
          new Projectile(ep.x, ep.y, targetAng, '#00f0ff', 21, 82 * dmgMult, 1, true, 'overdrive')
        );
      }
    }
    if (convertedShots > 0 && typeof recordContractAction === 'function') {
      recordContractAction('parry', convertedShots);
    }

    // Launch 16 Radial Chrono-Lance Rail Blades + 8 Homing Seekers outward on Shatter!
    const lanceCount = 16 + player.chronoLevel * 4;
    for (let k = 0; k < lanceCount; k++) {
      const lAng = (k * Math.PI * 2) / lanceCount;
      projectiles.push(
        new Projectile(this.x, this.y, lAng, k % 2 === 0 ? '#d946ef' : '#00f0ff', 22, 88 * dmgMult, 1, true, k % 2 === 0 ? 'rail' : 'overdrive')
      );
    }
    for (let m = 0; m < 8; m++) {
      missiles.push(new HomingMissile(this.x, this.y, (m * Math.PI) / 4));
    }

    // Massive Temporal Shatter Supernova across the entire dome radius
    const shatterDmg = (265 + player.chronoLevel * 90 + convertedShots * 18) * dmgMult;
    let hitCount = 0;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d <= this.radius * 1.38 + e.radius) {
        e.takeDamage(shatterDmg, true);
        hitCount++;
        lightningBolts.push({ x1: this.x, y1: this.y, x2: e.x, y2: e.y, color: hitCount % 2 === 0 ? '#00f0ff' : '#d946ef', life: 16 });
      }
    }
    for (let i = 0; i < worldProps.length; i++) {
      const wp = worldProps[i];
      if (!wp.active || (wp.type !== 'cache' && wp.type !== 'emp_pylon')) continue;
      if (Math.hypot(wp.x - this.x, wp.y - this.y) <= this.radius * 1.38 + wp.radius) {
        wp.takeDamage(210 * dmgMult);
      }
    }

    // Radial glass-shatter particle burst
    for (let i = 0; i < 40; i++) {
      const a = (i * Math.PI * 2) / 40;
      const sp = 6 + Math.random() * 10;
      spawnParticle(
        this.x + Math.cos(a) * 18,
        this.y + Math.sin(a) * 18,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        i % 2 === 0 ? '#d946ef' : '#00f0ff',
        26,
        3.8
      );
    }

    // Leave behind a persistent Gravitational Shard Vacuum + Twin Singularity Black Holes at the shatter epicenter!
    if (typeof spatialRifts !== 'undefined') {
      spatialRifts.push(new SpatialRift(this.x, this.y, 0, 175, true, '#d946ef'));
    }
    if (typeof blackHoles !== 'undefined') {
      if (blackHoles.length > 4) blackHoles.splice(0, blackHoles.length - 4);
      blackHoles.push(new BlackHole(this.x, this.y, 0));
      blackHoles.push(new BlackHole(this.x, this.y, Math.PI));
    }

    spawnFloatingText(
      this.x,
      this.y - 28,
      `// TIME-SHATTER CATACLYSM (${hitCount} HIT + 2x SINGULARITY) //`,
      '#00f0ff',
      1.4
    );
  }

  draw() {
    const lifeRatio = Math.max(0, this.life / this.maxLife);
    const pulse = 1 + Math.sin(frameCount * 0.15) * 0.025;
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Soft pre-baked glow aura
    ctx.globalAlpha = 0.36;
    ctx.drawImage(getGlowSprite('#d946ef'), -r * 1.15, -r * 1.15, r * 2.3, r * 2.3);
    ctx.globalAlpha = 1;

    // Translucent stasis field dome fill
    const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
    grad.addColorStop(0.65, 'rgba(217, 70, 239, 0.14)');
    grad.addColorStop(1, 'rgba(217, 70, 239, 0.32)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Chrono-Astrolabe Gear Teeth
    ctx.save();
    ctx.rotate(-this.rot * 0.6);
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.52)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let g = 0; g < 24; g++) {
      const ga = (g * Math.PI) / 12;
      const gr1 = r - 2;
      const gr2 = r + 7;
      ctx.moveTo(Math.cos(ga) * gr1, Math.sin(ga) * gr1);
      ctx.lineTo(Math.cos(ga) * gr2, Math.sin(ga) * gr2);
    }
    ctx.stroke();
    ctx.restore();

    // Glowing accretion aura for captured bullets (single batched path, zero drawImage calls!)
    ctx.fillStyle = '#d946ef';
    ctx.beginPath();
    for (let i = 0; i < enemyProjectiles.length; i++) {
      const ep = enemyProjectiles[i];
      if (!ep.active) continue;
      const edx = ep.x - this.x;
      const edy = ep.y - this.y;
      if (edx * edx + edy * edy < r * r) {
        ctx.moveTo(edx + 5, edy);
        ctx.arc(edx, edy, 5, 0, Math.PI * 2);
      }
    }
    ctx.fill();

    // PRISMATIC MEGA-LASER REFRACTION (When struck by [R] Omega Ion Beam!)
    if (this.refractionTimer > 0) {
      const refColors = ['#ff0077', '#00f0ff', '#ffe600', '#00ff88', '#d946ef'];
      const refLen = 860;
      for (let rb = 0; rb < 7; rb++) {
        const refAng = (this.refractionAngle || 0) + (rb - 3) * 0.26;
        const refCos = Math.cos(refAng);
        const refSin = Math.sin(refAng);
        ctx.strokeStyle = refColors[rb % 5];
        ctx.lineWidth = 6 + Math.sin(frameCount * 0.5 + rb) * 2;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(refCos * refLen, refSin * refLen);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(refCos * refLen, refSin * refLen);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.drawImage(getGlowSprite('#ffffff'), -48, -48, 96, 96);
    }

    // Draw Temporal Tether Chains from the central clock core to trapped enemies!
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.52)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      if (dx * dx + dy * dy < r * r) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(dx, dy);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Outer containment perimeter + life progress arc
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.72)';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // 12 Cyber-Chronometer dial ticks around the perimeter
    ctx.save();
    ctx.rotate(this.rot * 0.4);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const inner = i % 3 === 0 ? r - 18 : r - 10;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
      ctx.strokeStyle = i % 3 === 0 ? '#00f0ff' : 'rgba(217, 70, 239, 0.7)';
      ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.4;
      ctx.stroke();
    }
    ctx.restore();

    // Rotating Chronometer Clock Hands in the center
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fast minute hand
    const minAng = frameCount * 0.16;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(minAng) * 44, Math.sin(minAng) * 44);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Slow hour hand
    const hrAng = frameCount * 0.03;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(hrAng) * 28, Math.sin(hrAng) * 28);
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 3.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tactical HUD tag on top of dome
    ctx.font = '700 10px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0abfc';
    ctx.fillText('ABYSSAL CHRONO-DOME // +75% DMG // [F] TIME-SHATTER', 0, -r - 12);

    ctx.restore();
  }
}

// === SKILL [X]: PHANTOM HOLO-DECOY SQUADRON + TRIANGULAR VOLTAIC LASER WEB + PHASE-SWAP ===
class PhantomDecoy {
  constructor(x, y, angle, maxLife = 420) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.radius = 52;
    this.active = true;
    this.fireTimer = 14;
    this.hasSwapped = false;
    this.tetherOverloaded = false;
  }

  update() {
    this.life--;
    this.angle += 0.09;
    this.fireTimer--;
    const dmgMult = 1 + (player.level - 1) * 0.14;

    // Gently drift toward the nearest enemy cluster to hold aggro
    let nearest = null;
    let bestD = Infinity;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < bestD) {
        bestD = d;
        nearest = e;
      }
    }
    if (nearest && bestD > 100) {
      const dir = Math.atan2(nearest.y - this.y, nearest.x - this.x);
      this.x += Math.cos(dir) * 2.5;
      this.y += Math.sin(dir) * 2.5;
    }

    // Voltaic Laser Tether between Player and Phantom Clone (+ between sibling Clones!): electrocutes enemies crossing the web!
    const tdx = player.x - this.x;
    const tdy = player.y - this.y;
    const tLenSq = tdx * tdx + tdy * tdy;
    if (tLenSq > 100 && tLenSq < 840 * 840 && frameCount % 5 === 0) {
      const tetherDmg = (34 + player.phantomLevel * 12) * dmgMult;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.active) continue;
        const proj = Math.max(0, Math.min(1, ((e.x - this.x) * tdx + (e.y - this.y) * tdy) / tLenSq));
        const cx = this.x + proj * tdx;
        const cy = this.y + proj * tdy;
        if (Math.hypot(e.x - cx, e.y - cy) <= e.radius + 22) {
          e.takeDamage(tetherDmg, true);
          spawnParticle(e.x, e.y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, '#ffe600', 10, 2.8);
        }
      }
    }

    // Absorb & reflect enemy bullets that hit the decoy's 52px holographic barrier!
    for (let i = 0; i < enemyProjectiles.length; i++) {
      const ep = enemyProjectiles[i];
      if (!ep.active) continue;
      if (Math.hypot(ep.x - this.x, ep.y - this.y) <= this.radius + 8) {
        ep.active = false;
        const aimAng = nearest
          ? Math.atan2(nearest.y - this.y, nearest.x - this.x)
          : Math.atan2(this.y - ep.y, this.x - ep.x) + Math.PI;
        projectiles.push(
          new Projectile(this.x, this.y, aimAng, '#00f0ff', 19.5, 56 * dmgMult, 1, true, 'overdrive')
        );
        spawnParticle(ep.x, ep.y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, '#00f0ff', 12, 2.5);
      }
    }

    // Periodic 8-way Overdrive Glaive Pulse + Twin Homing Micro-Missiles
    if (this.fireTimer <= 0) {
      this.fireTimer = 22;
      sound.shoot();
      for (let k = 0; k < 8; k++) {
        const a = this.angle + (k * Math.PI) / 4;
        projectiles.push(
          new Projectile(this.x, this.y, a, k % 2 === 0 ? '#00f0ff' : '#ff0077', 17.5, 38 * dmgMult, 1, true, 'overdrive')
        );
      }
      if (missiles.length < 56) {
        missiles.push(new HomingMissile(this.x, this.y, this.angle - 0.5));
        missiles.push(new HomingMissile(this.x, this.y, this.angle + 0.5));
      }
      addGridRipple(this.x, this.y, 150, 16, '#00f0ff');
    }

    // Detonate in a final Holographic Plasma Supernova when duration expires
    if (this.life <= 0) {
      this.active = false;
      sound.explosion(false);
      screenShake = Math.max(screenShake, 16);
      addGridRipple(this.x, this.y, 280, 36, '#00f0ff');
      const blastDmg = (195 + player.phantomLevel * 65) * dmgMult;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.active) continue;
        if (Math.hypot(e.x - this.x, e.y - this.y) <= 240 + e.radius) {
          e.takeDamage(blastDmg, true);
        }
      }
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI * 2) / 16;
        projectiles.push(new Projectile(this.x, this.y, a, k % 2 === 0 ? '#ffe600' : '#00f0ff', 18, 48 * dmgMult, 1, true, 'overdrive'));
      }
      spawnFloatingText(this.x, this.y - 20, '// PHANTOM CLONE SUPERNOVA //', '#00f0ff', 1.28);
    }
  }

  draw() {
    const lifeRatio = Math.max(0, this.life / this.maxLife);

    // Draw Voltaic Laser Tether between Player and Phantom Clone (+ between sibling clones!)
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer < 840) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(player.x, player.y);
      for (let c = 0; c < phantomDecoys.length; c++) {
        const other = phantomDecoys[c];
        if (other !== this && other.active && Math.hypot(other.x - this.x, other.y - this.y) < 700) {
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(other.x, other.y);
        }
      }
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.38)';
      ctx.lineWidth = 6.5;
      ctx.stroke();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // High-voltage lightning sparks arcing across the tether
      if (frameCount % 4 === 0) {
        const tRatio = Math.random();
        const tx = this.x + (player.x - this.x) * tRatio;
        const ty = this.y + (player.y - this.y) * tRatio;
        spawnParticle(tx, ty, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, '#ffe600', 8, 2.2);
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Pre-baked holographic glow
    ctx.drawImage(getGlowSprite('#00f0ff'), -72, -72, 144, 144);
    ctx.drawImage(getGlowSprite('#ff0077'), -48, -48, 96, 96);

    // Taunt aggro wave ring
    const waveR = ((frameCount * 2.4) % 110) + 20;
    ctx.beginPath();
    ctx.arc(0, 0, waveR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - waveR / 130) * 0.38})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 52px Hexagonal Bullet-Conversion Barrier
    ctx.save();
    ctx.rotate(-frameCount * 0.04);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = Math.cos(a) * this.radius;
      const hy = Math.sin(a) * this.radius;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.09)';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Holographic Glitch-Clone Ship Silhouette
    ctx.save();
    ctx.rotate(this.angle);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-14, -15);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Holographic Glitch Scanlines
    ctx.beginPath();
    ctx.rect(-16, -16, 32, 32);
    ctx.clip();
    for (let sl = -16; sl < 16; sl += 4) {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-16, sl);
      ctx.lineTo(16, sl);
      ctx.stroke();
    }
    ctx.restore();

    // Remaining duration arc & label
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '700 9px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.hasSwapped ? '#00f0ff' : '#ffe600';
    ctx.fillText(this.hasSwapped ? 'PHANTOM CLONE // TETHERED' : 'PHANTOM CLONE // [X] PHASE-SWAP', 0, -this.radius - 12);

    ctx.restore();
  }
}

// === SPATIAL RIFT: PERSISTENT DIMENSIONAL TEARS (GRAVITATIONAL VORTEX + RAPID SLICE DAMAGE + BLADE VOLLEYS) ===
class SpatialRift {
  constructor(x, y, angle, maxLife = 135, isCross = false, color = '#00ff88') {
    if (typeof spatialRifts !== 'undefined' && spatialRifts.length >= 6) {
      const old = spatialRifts.shift();
      if (old) old.active = false;
    }
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.isCross = isCross;
    this.color = color;
    this.radius = isCross ? 95 : 70;
    this.active = true;
    this.pulse = 0;
  }

  update() {
    this.life--;
    this.pulse += 0.2;
    const dmgMult = 1 + (player.level - 1) * 0.14;
    const tickDmg = (this.isCross ? 42 : 28) * dmgMult;

    // Gravitational vortex: suck nearby enemies inward toward the dimensional tear
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const dx = this.x - e.x;
      const dy = this.y - e.y;
      const d = Math.hypot(dx, dy);
      const pullR = this.radius * 2.5 + e.radius;
      if (d < pullR) {
        if (d > 14 && e.type !== 'boss') {
          const pull = (1 - d / pullR) * 4.4;
          e.x += (dx / d) * pull;
          e.y += (dy / d) * pull;
        }
        if (frameCount % 4 === 0 && d <= this.radius + e.radius) {
          e.takeDamage(tickDmg, false);
          spawnParticle(e.x, e.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, this.color, 8, 2.4);
        }
      }
    }

    // Launch 2 Dimensional Crescent Blades every 22 frames from the rift!
    if (this.life % 22 === 0 && enemies.length > 0) {
      for (let b = 0; b < 2; b++) {
        const bAng = this.angle + this.pulse + b * Math.PI;
        projectiles.push(new Projectile(this.x, this.y, bAng, this.color, 19, 44 * dmgMult, 0, true, 'overdrive'));
      }
    }

    // Rapid vacuum pull on nearby collectible shards (throttled to 15Hz)
    if (frameCount % 4 === 0) {
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        if (!s.active) continue;
        const dx = this.x - s.x;
        const dy = this.y - s.y;
        const d = Math.hypot(dx, dy);
        if (d < this.radius * 3.0) {
          s.magnetized = true;
          s.vx += (dx / (d || 1)) * 2.8;
          s.vy += (dy / (d || 1)) * 2.8;
        }
      }
    }

    // Ambient dimensional distortion particles
    if (frameCount % 4 === 0) {
      const off = (Math.random() - 0.5) * this.radius * 1.3;
      const pAng = this.angle + (Math.random() - 0.5) * 0.4;
      spawnParticle(
        this.x + Math.cos(pAng) * off,
        this.y + Math.sin(pAng) * off,
        -Math.sin(pAng) * (Math.random() - 0.5) * 3.5,
        Math.cos(pAng) * (Math.random() - 0.5) * 3.5,
        this.color,
        14,
        2.2
      );
    }

    // Collapse detonation + 8-way Dimensional Blade Burst
    if (this.life <= 0) {
      this.active = false;
      sound.parryDeflect();
      screenShake = Math.max(screenShake, 10);
      addGridRipple(this.x, this.y, this.radius * 2.2, 30, this.color);
      const burstDmg = (this.isCross ? 140 : 95) * dmgMult;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.active && Math.hypot(e.x - this.x, e.y - this.y) <= this.radius * 1.8 + e.radius) {
          e.takeDamage(burstDmg, true);
        }
      }
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI * 2) / 8;
        projectiles.push(new Projectile(this.x, this.y, a, this.color, 18, 46 * dmgMult, 0, true, 'overdrive'));
        spawnParticle(this.x, this.y, Math.cos(a) * 7, Math.sin(a) * 7, this.color, 16, 3.2);
      }
    }
  }

  draw() {
    const lifeRatio = Math.max(0, this.life / this.maxLife);
    const alpha = Math.min(1, lifeRatio * 1.4);
    const len = this.radius * 1.35 * (0.88 + Math.sin(this.pulse) * 0.12);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = alpha;

    const drawTear = (rot, col) => {
      ctx.save();
      ctx.rotate(rot);

      // Deep dark cosmic void
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.quadraticCurveTo(0, -12, len, 0);
      ctx.quadraticCurveTo(0, 12, -len, 0);
      ctx.fillStyle = '#020208';
      ctx.fill();

      // Smooth glowing distortion perimeter
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.quadraticCurveTo(0, Math.sin(frameCount * 0.2) * 5, len, 0);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Blinding white dimensional seam
      ctx.beginPath();
      ctx.moveTo(-len * 0.88, 0);
      ctx.lineTo(len * 0.88, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
    };

    drawTear(0, this.color);
    if (this.isCross) {
      drawTear(Math.PI * 0.5, '#00f0ff');
    }

    ctx.restore();
  }
}

class DataShard {
  constructor(x, y, val, type = 'xp') {
    this.x = x;
    this.y = y;
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 3 + 1;
    this.vx = Math.cos(a) * sp;
    this.vy = Math.sin(a) * sp;
    this.val = val;
    this.type = type; // 'xp', 'heal', 'overdrive', 'magnet'
    this.active = true;
    this.magnetized = false;
  }

  update() {
    this.vx *= 0.92;
    this.vy *= 0.92;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distSq = dx * dx + dy * dy;
    const magnetRange = 135 + player.naniteLevel * 75 + (player.isDashing ? 120 : 0);

    if (this.magnetized || distSq < magnetRange * magnetRange) {
      this.magnetized = true;
      const dist = Math.sqrt(distSq) || 1;
      this.vx += (dx / dist) * 1.9;
      this.vy += (dy / dist) * 1.9;
    }

    this.x += this.vx;
    this.y += this.vy;

    const pickupR = player.radius + 12;
    if (distSq < pickupR * pickupR) {
      this.active = false;
      sound.pickup(combo);
      if (this.type === 'xp') {
        player.addXp(this.val);
        score += 15 * combo;
      } else if (this.type === 'heal') {
        player.hp = Math.min(player.maxHp, player.hp + 25);
        spawnFloatingText(this.x, this.y, '+25 HULL', '#00ff88');
      } else if (this.type === 'overdrive') {
        player.overdrive = Math.min(100, player.overdrive + 35);
        spawnFloatingText(this.x, this.y, '+OVERDRIVE', '#ffe600');
      } else if (this.type === 'magnet') {
        for (let i = 0; i < shards.length; i++) shards[i].magnetized = true;
        announce('// QUANTUM VACUUM ACTIVATED //', '#00f0ff');
      }
    }
  }

  draw() {
    let color = '#00ff88';
    let sz = 5;
    if (this.type === 'heal') { color = '#ff0055'; sz = 8; }
    else if (this.type === 'overdrive') { color = '#ffe600'; sz = 8; }
    else if (this.type === 'magnet') { color = '#00f0ff'; sz = 8; }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(getGlowSprite(color), -sz * 2.4, -sz * 2.4, sz * 4.8, sz * 4.8);
    ctx.rotate(frameCount * 0.08);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz, 0);
    ctx.lineTo(0, sz);
    ctx.lineTo(-sz, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

