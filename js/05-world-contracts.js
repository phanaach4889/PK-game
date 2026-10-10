// ============================================================================
// MODULE 05: PARTICLES, WORLD PROPS, BUILDINGS, WINGMEN, CONTRACTS & WAVES
// ============================================================================
class Particle {
  constructor(x, y, vx, vy, color, maxLife, radius = 3) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.maxLife = maxLife;
    this.life = maxLife;
    this.radius = radius;
  }

  reset(x, y, vx, vy, color, maxLife, radius = 3) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.maxLife = maxLife;
    this.life = maxLife;
    this.radius = radius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.life--;
  }

  draw() {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

const MAX_PARTICLES = 135;
function spawnParticle(x, y, vx, vy, color, maxLife, radius = 3) {
  if (particles.length >= MAX_PARTICLES) {
    // Recycle oldest particle in-place (zero GC pressure!)
    const p = particles.shift();
    p.reset(x, y, vx, vy, color, maxLife, radius);
    particles.push(p);
  } else {
    particles.push(new Particle(x, y, vx, vy, color, maxLife, radius));
  }
}

// Floating Damage / Status Texts (capped to prevent text rasterization lag)
let floatingTexts = [];
function spawnFloatingText(x, y, text, color = '#fff', scale = 1.0) {
  if (floatingTexts.length >= 14) floatingTexts.shift();
  floatingTexts.push({ x, y, vy: -1.6, text, color, scale, life: 32, maxLife: 32 });
}

// Starfield
const stars = [];
for (let i = 0; i < 85; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: Math.random() * 2.5 + 0.5
  });
}

// Interactive Open-World Structures & Discoverables
class WorldProp {
  constructor(type, x, y, extraAngle = 0) {
    this.id = Math.random();
    this.type = type; // 'shrine' | 'cache' | 'turret' | 'boost_ring' | 'emp_pylon' | 'warp_gate'
    this.x = x;
    this.y = y;
    this.angle = extraAngle;
    this.active = true;
    this.hitFlash = 0;
    this.charge = 0; // 0..100 for shrines & warp gates
    this.cooldown = 0;

    if (type === 'shrine') {
      this.radius = 44;
      this.color = '#ffe600';
      this.label = 'AUGMENTATION SHRINE';
    } else if (type === 'cache') {
      this.radius = 22;
      this.hp = 65;
      this.maxHp = 65;
      this.color = '#00f0ff';
      this.label = 'QUANTUM DATA VAULT';
    } else if (type === 'turret') {
      this.radius = 26;
      this.online = false;
      this.color = '#00ff88';
      this.label = 'ALLIED ION TURRET';
    } else if (type === 'boost_ring') {
      this.radius = 38;
      this.color = '#00f0ff';
      this.label = 'SLIPSTREAM BOOST GATE';
    } else if (type === 'emp_pylon') {
      this.radius = 20;
      this.hp = 35;
      this.maxHp = 35;
      this.color = '#ff0077';
      this.label = 'VOLATILE EMP PYLON';
    } else if (type === 'warp_gate') {
      this.radius = 58;
      this.color = '#d946ef';
      this.label = 'DIMENSIONAL WARP GATE';
    } else if (type === 'slot_obelisk') {
      this.radius = 36;
      this.color = '#ff0077';
      this.spinsLeft = 2;
      this.label = 'NEON JACKPOT OBELISK';
    }
  }

  takeDamage(dmg) {
    if (this.type !== 'cache' && this.type !== 'emp_pylon') return;
    this.hp -= dmg;
    this.hitFlash = 4;
    if (this.hp <= 0 && this.active) {
      this.active = false;
      sound.explode(true);
      screenShake = Math.max(screenShake, 14);
      addGridRipple(this.x, this.y, 260, 26, this.color);

      if (this.type === 'cache') {
        score += 350 * combo;
        spawnFloatingText(this.x, this.y - 18, 'VAULT BREACHED! +350', '#ffe600', 1.25);
        for (let i = 0; i < 6; i++) {
          shards.push(new DataShard(this.x + (Math.random() - 0.5) * 30, this.y + (Math.random() - 0.5) * 30, 22, 'xp'));
        }
        shards.push(new DataShard(this.x, this.y, 0, Math.random() < 0.55 ? 'heal' : 'overdrive'));
        for (let i = 0; i < 18; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 8 + 2;
          spawnParticle(this.x, this.y, Math.cos(a) * s, Math.sin(a) * s, '#ffe600', 24, 3.8);
        }
      } else if (this.type === 'emp_pylon') {
        spawnFloatingText(this.x, this.y - 18, 'EMP OVERLOAD! 280px BLAST', '#ff0077', 1.25);
        const blastR = 290;
        enemies.forEach(e => {
          if (e.active && Math.hypot(e.x - this.x, e.y - this.y) < blastR) {
            e.takeDamage(110 + wave * 18, true);
            lightningBolts.push({ x1: this.x, y1: this.y, x2: e.x, y2: e.y, color: '#ff0077', life: 12 });
          }
        });
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 9 + 2;
          spawnParticle(this.x, this.y, Math.cos(a) * s, Math.sin(a) * s, '#ff0077', 24, 4);
        }
      }
    }
  }

  update() {
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.cooldown > 0) this.cooldown--;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    // 1. CYBER AUGMENTATION SHRINE (Hold inside ring to unlock free perk!)
    if (this.type === 'shrine') {
      if (dist < this.radius + player.radius) {
        this.charge = Math.min(100, this.charge + 1.45);
        if (frameCount % 3 === 0) {
          const a = Math.random() * Math.PI * 2;
          spawnParticle(this.x + Math.cos(a) * this.radius, this.y + Math.sin(a) * this.radius, 0, -1.5, '#ffe600', 14, 2.8);
        }
        if (this.charge >= 100) {
          this.active = false;
          sound.levelUp();
          screenShake = 16;
          addGridRipple(this.x, this.y, 380, 34, '#ffe600');
          player.hp = Math.min(player.maxHp, player.hp + 25);
          score += 500;
          announce('// ANCIENT SHRINE SYNCHRONIZED — SELECT AUGMENTATION //', '#ffe600');
          showUpgradeMenu();
        }
      } else if (this.charge > 0) {
        this.charge = Math.max(0, this.charge - 0.5);
      }
    }

    // 2. ALLIED ION TURRET (Fly near to hack online, then auto-fires at enemies!)
    else if (this.type === 'turret') {
      if (!this.online && dist < this.radius + player.radius + 24) {
        this.online = true;
        sound.pickup(10);
        addGridRipple(this.x, this.y, 220, 20, '#00ff88');
        spawnFloatingText(this.x, this.y - 26, 'ION TURRET ONLINE!', '#00ff88', 1.2);
      }
      if (this.online) {
        let closest = null;
        let minD = 540;
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.active) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minD) {
            minD = d;
            closest = e;
          }
        }
        if (closest) {
          this.angle = Math.atan2(closest.y - this.y, closest.x - this.x);
          if (this.cooldown <= 0) {
            this.cooldown = 14;
            projectiles.push(new Projectile(
              this.x + Math.cos(this.angle) * 20,
              this.y + Math.sin(this.angle) * 20,
              this.angle,
              '#00ff88',
              17,
              26 + wave * 4,
              0,
              false,
              'drone'
            ));
          }
        } else {
          this.angle += 0.02;
        }
      }
    }

    // 3. HYPER-SLIPSTREAM BOOST GATE (Fly through for massive speed & Overdrive surge!)
    else if (this.type === 'boost_ring') {
      if (this.cooldown <= 0 && dist < this.radius + player.radius) {
        this.cooldown = 90;
        player.boostTimer = 160;
        player.overdrive = Math.min(100, player.overdrive + 15);
        sound.dash();
        addGridRipple(this.x, this.y, 260, 24, '#00f0ff');
        spawnFloatingText(player.x, player.y - 22, '// SLIPSTREAM HYPER-BOOST //', '#00f0ff', 1.2);
      }
    }

    // 4. DIMENSIONAL STARGATE PORTAL (Charge inside to warp to a fresh uncharted sector!)
    else if (this.type === 'warp_gate') {
      if (dist < this.radius + player.radius) {
        this.charge = Math.min(100, this.charge + 1.25);
        if (this.charge >= 100) {
          warpToNewSector();
        }
      } else if (this.charge > 0) {
        this.charge = Math.max(0, this.charge - 0.6);
      }
    }

    // 5. NEON JACKPOT OBELISK (Fly near to spin the Cyber-Roulette for Wingmen, Frenzy, or Loot!)
    else if (this.type === 'slot_obelisk') {
      if (this.cooldown <= 0 && dist < this.radius + player.radius + 14) {
        this.cooldown = 320;
        this.spinsLeft--;
        if (this.spinsLeft <= 0) this.active = false;
        screenShake = Math.max(screenShake, 14);
        addGridRipple(this.x, this.y, 340, 30, '#ff0077');

        const roll = Math.random();
        if (roll < 0.30) {
          // Outcome 1: Deploy Autonomous Allied Valkyrie Wingman!
          sound.levelUp();
          wingmen.push(new AlliedWingman(this.x, this.y));
          score += 650 * combo;
          spawnFloatingText(this.x, this.y - 26, '777 JACKPOT: VALKYRIE WINGMAN DEPLOYED!', '#00ff88', 1.35);
          announce('// 777 JACKPOT: AUTONOMOUS VALKYRIE WINGMAN DEPLOYED FOR 45s //', '#00ff88');
        } else if (roll < 0.60) {
          // Outcome 2: 7 Seconds of Hyper-Frenzy (2x Fire Rate + Infinite Dash + Katana Reset)
          sound.overdrive();
          player.frenzyTimer = Math.max(player.frenzyTimer, 420);
          player.katanaCooldown = 0;
          player.overdrive = Math.min(100, player.overdrive + 40);
          score += 500 * combo;
          spawnFloatingText(this.x, this.y - 26, '777 HYPER-FRENZY SURGE! 2X FIRE & INFINITE DASH!', '#ffe600', 1.35);
          announce('// JACKPOT OVERCLOCK: 7s HYPER-FRENZY (2X FIRE & ZERO DASH CD) //', '#ffe600');
        } else if (roll < 0.86) {
          // Outcome 3: Mega Loot Vault Eruption
          sound.ringPass(4);
          score += 600 * combo;
          for (let i = 0; i < 10; i++) {
            shards.push(new DataShard(this.x + (Math.random() - 0.5) * 45, this.y + (Math.random() - 0.5) * 45, 24, 'xp'));
          }
          shards.push(new DataShard(this.x - 16, this.y, 0, 'heal'));
          shards.push(new DataShard(this.x + 16, this.y, 0, 'overdrive'));
          spawnFloatingText(this.x, this.y - 26, '777 LOOT VAULT JACKPOT! +600 PTS', '#00f0ff', 1.35);
        } else {
          // Outcome 4: High-Stakes Elite Ambush + Instant Overdrive Charge!
          sound.parryDeflect();
          player.overdrive = Math.min(100, player.overdrive + 60);
          player.katanaCooldown = 0;
          for (let i = 0; i < 2; i++) {
            const a = Math.random() * Math.PI * 2;
            enemies.push(new Enemy('striker', this.x + Math.cos(a) * 180, this.y + Math.sin(a) * 180, true));
          }
          shards.push(new DataShard(this.x, this.y, 0, 'overdrive'));
          spawnFloatingText(this.x, this.y - 26, '777 HIGH-STAKES AMBUSH! +60% OVERDRIVE!', '#ff0077', 1.3);
          announce('// OBELISK SECURITY TRIGGERED: ELITE HUNTERS + 60% OVERDRIVE //', '#ff0077');
        }
      }
    }
  }

  draw() {
    // Viewport frustum culling for zero off-screen draw cost
    if (
      this.x + this.radius + 60 < camX ||
      this.x - this.radius - 60 > camX + canvas.width ||
      this.y + this.radius + 60 < camY ||
      this.y - this.radius - 60 > camY + canvas.height
    ) {
      return;
    }

    const pulse = sound.beatPulse;
    const isHit = this.hitFlash > 0;
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. CYBER AUGMENTATION SHRINE
    if (this.type === 'shrine') {
      const gR = this.radius * 2.1;
      ctx.drawImage(getGlowSprite('#ffe600'), -gR, -gR, gR * 2, gR * 2);

      // Outer rotating rune ring
      ctx.save();
      ctx.rotate(frameCount * 0.018);
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Progress arc when player is synchronizing
      if (this.charge > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 6, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * this.charge) / 100);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Inner spinning sacred star obelisk
      ctx.save();
      ctx.rotate(-frameCount * 0.03);
      ctx.fillStyle = 'rgba(255, 230, 0, 0.18)';
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(-16, -16, 32, 32);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-16, -16, 32, 32);
      ctx.strokeRect(-16, -16, 32, 32);
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5 + pulse * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "900 10px 'Segoe UI', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe600';
      ctx.fillText(this.charge > 0 ? `SYNCING ${Math.floor(this.charge)}%` : '[AUGMENT SHRINE]', 0, -this.radius - 12);
    }

    // 2. QUANTUM DATA VAULT (Destructible Crystal Loot Node)
    else if (this.type === 'cache') {
      ctx.drawImage(getGlowSprite('#00f0ff'), -42, -42, 84, 84);
      ctx.save();
      ctx.rotate(frameCount * 0.025 + this.id);
      ctx.fillStyle = isHit ? '#ffffff' : '#062638';
      ctx.strokeStyle = isHit ? '#ffffff' : '#00f0ff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const r = this.radius + pulse * 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner golden loot core
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 9);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (this.hp < this.maxHp) {
        ctx.fillStyle = 'rgba(8, 12, 24, 0.8)';
        ctx.fillRect(-20, -this.radius - 12, 40, 4);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(-20, -this.radius - 12, (this.hp / this.maxHp) * 40, 4);
      }
    }

    // 3. ALLIED ION TURRET
    else if (this.type === 'turret') {
      const col = this.online ? '#00ff88' : '#64748b';
      if (this.online) {
        ctx.drawImage(getGlowSprite('#00ff88'), -48, -48, 96, 96);
      }
      // Octagonal base platform
      ctx.fillStyle = '#071712';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating twin barrel assembly
      ctx.save();
      ctx.rotate(this.angle);
      ctx.fillStyle = '#0d261e';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.fillRect(4, -6, 18, 4);
      ctx.strokeRect(4, -6, 18, 4);
      ctx.fillRect(4, 2, 18, 4);
      ctx.strokeRect(4, 2, 18, 4);
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();

      ctx.font = "900 9px 'Segoe UI', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = col;
      ctx.fillText(this.online ? 'ION TURRET [ONLINE]' : 'FLY NEAR TO HACK TURRET', 0, -this.radius - 10);
    }

    // 4. HYPER-SLIPSTREAM BOOST GATE
    else if (this.type === 'boost_ring') {
      ctx.drawImage(getGlowSprite('#00f0ff'), -56, -56, 112, 112);
      ctx.save();
      ctx.rotate(this.angle);
      ctx.strokeStyle = this.cooldown > 0 ? 'rgba(0, 240, 255, 0.35)' : '#00f0ff';
      ctx.lineWidth = 3;
      // Gate chevrons
      for (let k = -1; k <= 1; k++) {
        const ox = k * 12 + ((frameCount * 0.8) % 12) - 6;
        ctx.beginPath();
        ctx.moveTo(ox - 6, -22);
        ctx.lineTo(ox + 8, 0);
        ctx.lineTo(ox - 6, 22);
        ctx.stroke();
      }
      // Outer gate pylons
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-18, -32, 36, 5);
      ctx.fillRect(-18, 27, 36, 5);
      ctx.restore();
    }

    // 5. VOLATILE EMP PYLON
    else if (this.type === 'emp_pylon') {
      ctx.drawImage(getGlowSprite('#ff0077'), -42, -42, 84, 84);
      ctx.save();
      ctx.rotate(-frameCount * 0.04);
      ctx.fillStyle = isHit ? '#ffffff' : '#290417';
      ctx.strokeStyle = '#ff0077';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const r = this.radius + pulse * 3;
        const aMid = a + Math.PI / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(aMid) * 8, Math.sin(aMid) * 8);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. DIMENSIONAL STARGATE PORTAL
    else if (this.type === 'warp_gate') {
      const gR = this.radius * 2.2;
      ctx.drawImage(getGlowSprite('#d946ef'), -gR, -gR, gR * 2, gR * 2);

      // Swirling event horizon
      ctx.save();
      ctx.rotate(frameCount * 0.03);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.rotate(-frameCount * 0.045);
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 3;
      ctx.strokeRect(-32, -32, 64, 64);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-32, -32, 64, 64);
      ctx.restore();

      if (this.charge > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 8, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * this.charge) / 100);
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      ctx.font = "900 11px 'Segoe UI', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f0abfc';
      ctx.fillText(this.charge > 0 ? `WARP CHARGING ${Math.floor(this.charge)}%` : '[DIMENSIONAL WARP GATE]', 0, -this.radius - 14);
    }

    // 7. NEON JACKPOT OBELISK (Interactive Cyber-Roulette Shrine)
    else if (this.type === 'slot_obelisk') {
      const ready = this.cooldown <= 0;
      const gCol = ready ? '#ff0077' : '#64748b';
      if (ready) {
        ctx.drawImage(getGlowSprite('#ff0077'), -64, -64, 128, 128);
        ctx.drawImage(getGlowSprite('#ffe600'), -38, -38, 76, 76);
      }

      ctx.save();
      ctx.rotate(frameCount * (ready ? 0.04 : 0.01));
      ctx.strokeStyle = ready ? '#ffe600' : '#475569';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.rotate(-frameCount * 0.035);
      ctx.fillStyle = ready ? 'rgba(255, 0, 119, 0.25)' : 'rgba(30, 41, 59, 0.5)';
      ctx.strokeStyle = gCol;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 22);
      ctx.lineTo(-22, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.font = "900 10px 'Segoe UI', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = ready ? '#ffe600' : '#94a3b8';
      ctx.fillText('777', 0, 4);
      ctx.fillStyle = ready ? '#ff66b2' : '#64748b';
      ctx.fillText(ready ? `[777] JACKPOT OBELISK (${this.spinsLeft} SPINS)` : `RECHARGING ${Math.ceil(this.cooldown / 60)}s`, 0, -this.radius - 11);
    }

    ctx.restore();
  }
}

let worldProps = [];
let buildings = [];

// === CYBER-SKYSCRAPERS & MEGAPOLIS ARCHITECTURE (TACTICAL SOLID COVER) ===
function generateBuildings() {
  buildings = [
    // 1. NEXUS CORE // CITADEL PROMENADE
    { x: 3600, y: 3600, w: 200, h: 200, style: 'monolith', color: '#00f0ff', label: 'NEXUS TOWER 01', bannerText: 'KAIROS // HQ', roofType: 'helipad' },
    { x: 4800, y: 3600, w: 200, h: 200, style: 'monolith', color: '#00f0ff', label: 'NEXUS TOWER 02', bannerText: 'OVERDRIVE LABS', roofType: 'satellite' },
    { x: 3600, y: 4800, w: 200, h: 200, style: 'monolith', color: '#00f0ff', label: 'NEXUS TOWER 03', bannerText: 'CYBERDYNE-07', roofType: 'solar' },
    { x: 4800, y: 4800, w: 200, h: 200, style: 'monolith', color: '#00f0ff', label: 'NEXUS TOWER 04', bannerText: 'AEROSPACE PRIME', roofType: 'helipad' },
    { x: 4200, y: 3350, w: 260, h: 160, style: 'monolith', color: '#38bdf8', label: 'CENTRAL CITADEL', bannerText: 'CENTRAL MAINFRAME', roofType: 'satellite' },
    { x: 4200, y: 5050, w: 260, h: 160, style: 'monolith', color: '#38bdf8', label: 'DEFENSE BARRACKS', bannerText: 'SECURITY GRID // 01', roofType: 'vent' },
    { x: 3350, y: 4200, w: 160, h: 260, style: 'monolith', color: '#00f0ff', label: 'WEST ARCHIVE', bannerText: 'WEST TERMINAL', roofType: 'vent' },
    { x: 5050, y: 4200, w: 160, h: 260, style: 'monolith', color: '#00f0ff', label: 'EAST ARCHIVE', bannerText: 'EAST TERMINAL', roofType: 'helipad' },

    // 2. CYBER-MEGAPOLIS // SKYLINE SECTOR (High-Density Towers)
    { x: 3750, y: 1250, w: 220, h: 240, style: 'monolith', color: '#38bdf8', label: 'SKYLINE TOWER A', bannerText: 'NEO-TOKYO COMMERCE', roofType: 'helipad' },
    { x: 4650, y: 1250, w: 220, h: 240, style: 'monolith', color: '#38bdf8', label: 'SKYLINE TOWER B', bannerText: 'KAIROS FINANCE', roofType: 'satellite' },
    { x: 3750, y: 1850, w: 210, h: 200, style: 'monolith', color: '#38bdf8', label: 'STRATOS MONOLITH', bannerText: 'ORBITAL COMMS TOWER', roofType: 'satellite' },
    { x: 4650, y: 1850, w: 210, h: 200, style: 'monolith', color: '#38bdf8', label: 'ZENITH SPIRE', bannerText: 'HYPER-NET APEX', roofType: 'helipad' },
    { x: 4200, y: 2250, w: 190, h: 180, style: 'monolith', color: '#00f0ff', label: 'METRO COMMERCE', bannerText: 'AVENUE TRANSIT HUB', roofType: 'solar' },
    { x: 3300, y: 1550, w: 180, h: 220, style: 'monolith', color: '#38bdf8', label: 'NEXUS MEDIA RIG', bannerText: 'HOLO-BROADCAST', roofType: 'vent' },
    { x: 5100, y: 1550, w: 180, h: 220, style: 'monolith', color: '#38bdf8', label: 'CYBER-VENTURES', bannerText: 'VENTURE CAPITAL', roofType: 'satellite' },

    // 3. CRIMSON FOUNDRY // WEAPON FORGE & HEAVY INDUSTRY
    { x: 1450, y: 1450, w: 260, h: 240, style: 'foundry', color: '#ff0055', label: 'MAGMA REFINERY 01', bannerText: 'VULCAN SMELTING', roofType: 'vent' },
    { x: 2150, y: 1450, w: 240, h: 220, style: 'foundry', color: '#ff0055', label: 'HEAVY FORGE RIG', bannerText: 'WEAPONS CORP', roofType: 'vent' },
    { x: 1450, y: 2150, w: 220, h: 240, style: 'foundry', color: '#ff7b00', label: 'ASSEMBLY DOCK 04', bannerText: 'WAR-ENGINE ASSEMBLY', roofType: 'vent' },
    { x: 2150, y: 2150, w: 250, h: 250, style: 'foundry', color: '#ff7b00', label: 'BLAST FURNACE CORE', bannerText: 'CRITICAL CORE // 1200C', roofType: 'vent' },
    { x: 1800, y: 1150, w: 200, h: 180, style: 'foundry', color: '#ff0055', label: 'MUNITIONS SILO', bannerText: 'ORDNANCE STORAGE', roofType: 'vent' },
    { x: 2550, y: 1800, w: 190, h: 200, style: 'foundry', color: '#ff7b00', label: 'EXHAUST CHIMNEY', bannerText: 'PLASMA EMISSION // 09', roofType: 'vent' },

    // 4. QUANTUM VAULT // DATA ARCHIVE
    { x: 6250, y: 1450, w: 240, h: 220, style: 'vault', color: '#ffe600', label: 'QUANTUM VAULT A', bannerText: 'ENCRYPTED ARCHIVE', roofType: 'satellite' },
    { x: 6950, y: 1450, w: 220, h: 240, style: 'vault', color: '#ffe600', label: 'SYNAPSE ARCHIVE', bannerText: 'NEURAL DATA BANK', roofType: 'satellite' },
    { x: 6250, y: 2150, w: 240, h: 240, style: 'vault', color: '#ffe600', label: 'STORAGE SILO 07', bannerText: 'DEEP MEMORY STORAGE', roofType: 'helipad' },
    { x: 6950, y: 2150, w: 230, h: 220, style: 'vault', color: '#ffe600', label: 'QUANTUM CITADEL', bannerText: 'ALGO CORP HQ', roofType: 'satellite' },
    { x: 6600, y: 1150, w: 210, h: 180, style: 'vault', color: '#ffe600', label: 'OPTICAL RELAY RIG', bannerText: 'RELAY BEACON ALPHA', roofType: 'satellite' },
    { x: 5850, y: 1800, w: 180, h: 210, style: 'vault', color: '#ffe600', label: 'CRYPTOGRAPHIC ARRAY', bannerText: 'CRYPTO MATRIX', roofType: 'solar' },

    // 5. ION NEBULA // NANITE SANCTUARY (Biotech Domes)
    { x: 1450, y: 6250, w: 230, h: 230, style: 'nanite', color: '#00ff88', label: 'NANITE BIO-DOME A', bannerText: 'NANITE SYNTHESIS', roofType: 'solar' },
    { x: 2150, y: 6250, w: 230, h: 230, style: 'nanite', color: '#00ff88', label: 'BIO-LAB 09', bannerText: 'GENOMIC STORAGE', roofType: 'helipad' },
    { x: 1450, y: 6950, w: 240, h: 220, style: 'nanite', color: '#00ff88', label: 'CELLULAR MATRIX', bannerText: 'ORGANIC TECH LAB', roofType: 'solar' },
    { x: 2150, y: 6950, w: 220, h: 240, style: 'nanite', color: '#00ff88', label: 'NANITE FACTORY', bannerText: 'BIO-DEFENSE CORP', roofType: 'satellite' },
    { x: 1800, y: 7350, w: 200, h: 180, style: 'nanite', color: '#00ff88', label: 'PURIFICATION RIG', bannerText: 'TOXIN REMOVAL VENTS', roofType: 'vent' },
    { x: 2550, y: 6600, w: 180, h: 210, style: 'nanite', color: '#00ff88', label: 'BIO-HYDROPONICS', bannerText: 'SUSTAINMENT LAB', roofType: 'solar' },

    // 6. VOID SINGULARITY // DARK SECTOR (Obsidian Megastructures)
    { x: 6250, y: 6250, w: 240, h: 240, style: 'void', color: '#d946ef', label: 'VOID MONOLITH I', bannerText: 'DARK MATTER LAB', roofType: 'satellite' },
    { x: 6950, y: 6250, w: 220, h: 240, style: 'void', color: '#d946ef', label: 'EVENT HORIZON LAB', bannerText: 'GRAVITATIONAL HUB', roofType: 'vent' },
    { x: 6250, y: 6950, w: 240, h: 220, style: 'void', color: '#d946ef', label: 'SINGULARITY CORE', bannerText: 'ANTIMATTER VAULT', roofType: 'satellite' },
    { x: 6950, y: 6950, w: 230, h: 230, style: 'void', color: '#d946ef', label: 'VOID MONOLITH II', bannerText: 'RIFT CONTAINMENT', roofType: 'helipad' },
    { x: 6600, y: 7350, w: 200, h: 180, style: 'void', color: '#d946ef', label: 'TELEPORT BEACON', bannerText: 'INTER-DIMENSIONAL', roofType: 'satellite' },
    { x: 5850, y: 6600, w: 180, h: 210, style: 'void', color: '#d946ef', label: 'DARK AURA GENERATOR', bannerText: 'EVENT SHIELDING', roofType: 'vent' },

    // 7. ABYSSAL MECHA // TITAN CRATER (Heavy Warship Gantries)
    { x: 3750, y: 6500, w: 250, h: 230, style: 'foundry', color: '#f97316', label: 'MECHA GANTRY 01', bannerText: 'TITAN SHIPYARD', roofType: 'vent' },
    { x: 4650, y: 6500, w: 250, h: 230, style: 'foundry', color: '#f97316', label: 'MECHA GANTRY 02', bannerText: 'COLOSSUS DOCK', roofType: 'vent' },
    { x: 3750, y: 7150, w: 230, h: 210, style: 'foundry', color: '#f97316', label: 'HEAVY FABRICATION', bannerText: 'CHASSIS WELDING', roofType: 'helipad' },
    { x: 4650, y: 7150, w: 230, h: 210, style: 'foundry', color: '#f97316', label: 'WEAPONS TESTING', bannerText: 'ORDNANCE FACILITY', roofType: 'vent' },
    { x: 4200, y: 6150, w: 190, h: 170, style: 'foundry', color: '#f97316', label: 'SHIPYARD COMMAND', bannerText: 'CONTROL TOWER', roofType: 'satellite' },
    { x: 4200, y: 7450, w: 220, h: 180, style: 'foundry', color: '#f97316', label: 'REACTOR COOLING', bannerText: 'HEAT EXCHANGER', roofType: 'vent' }
  ];
}

// Physical Circle-AABB Collision Resolution against Building Perimeters (Smooth sliding physics!)
function resolveBuildingCollision(entity, radius) {
  if (!buildings || buildings.length === 0) return;
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const halfW = b.w / 2;
    const halfH = b.h / 2;
    if (Math.abs(entity.x - b.x) > halfW + radius + 15 || Math.abs(entity.y - b.y) > halfH + radius + 15) continue;
    const nearestX = Math.max(b.x - halfW, Math.min(b.x + halfW, entity.x));
    const nearestY = Math.max(b.y - halfH, Math.min(b.y + halfH, entity.y));
    const dx = entity.x - nearestX;
    const dy = entity.y - nearestY;
    const distSq = dx * dx + dy * dy;
    if (distSq < radius * radius && distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      const push = radius - dist;
      entity.x += (dx / dist) * push;
      entity.y += (dy / dist) * push;
    }
  }
}

// Tactical Projectile Cover Absorption against Building Walls
function checkBuildingProjectileCollision(proj) {
  if (!buildings || buildings.length === 0) return false;
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const halfW = b.w / 2;
    const halfH = b.h / 2;
    if (Math.abs(proj.x - b.x) > halfW + 15 || Math.abs(proj.y - b.y) > halfH + 15) continue;
    if (proj.x >= b.x - halfW && proj.x <= b.x + halfW &&
        proj.y >= b.y - halfH && proj.y <= b.y + halfH) {
      proj.active = false;
      if (Math.random() < 0.35) {
        spawnParticle(proj.x, proj.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, b.color, 9, 2.2);
      }
      return true;
    }
  }
  return false;
}

// Camera-Culled Cyber-Building Renderer (Isometric Depth + Rooftop Infrastructure + Zero Emojis)
function drawBuildings() {
  if (!buildings || buildings.length === 0) return;
  const minX = camX - 180;
  const maxX = camX + canvas.width + 180;
  const minY = camY - 180;
  const maxY = camY + canvas.height + 180;

  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    if (b.x + b.w / 2 < minX || b.x - b.w / 2 > maxX || b.y + b.h / 2 < minY || b.y - b.h / 2 > maxY) continue;

    const left = b.x - b.w / 2;
    const top = b.y - b.h / 2;

    // 1. Isometric Deep Ground Shadow
    ctx.fillStyle = 'rgba(2, 4, 10, 0.65)';
    ctx.fillRect(left + 16, top + 20, b.w, b.h);

    // 2. Main Cyber-Structure Footprint
    ctx.fillStyle = '#060a14';
    ctx.fillRect(left, top, b.w, b.h);

    // 3. Neon Trim Outline
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2.2;
    ctx.strokeRect(left, top, b.w, b.h);

    // 4. Subtle Structural Floor Beams & Window Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = left + 28; gx < left + b.w - 14; gx += 32) {
      ctx.moveTo(gx, top); ctx.lineTo(gx, top + b.h);
    }
    for (let gy = top + 28; gy < top + b.h - 14; gy += 32) {
      ctx.moveTo(left, gy); ctx.lineTo(left + b.w, gy);
    }
    ctx.stroke();

    // 5. Rooftop Infrastructure (Helipad, Satellite Dish, Vent, or Solar Grid)
    if (b.roofType === 'helipad') {
      const hr = Math.min(32, b.w * 0.26);
      ctx.beginPath();
      ctx.arc(b.x, b.y, hr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "900 13px 'Segoe UI', sans-serif";
      ctx.fillStyle = '#ffe600';
      ctx.textAlign = 'center';
      ctx.fillText('H', b.x, b.y + 4.5);
    } else if (b.roofType === 'satellite') {
      const dishAng = frameCount * 0.015 + i;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(dishAng);
      ctx.beginPath();
      ctx.arc(0, 0, 16, -Math.PI * 0.6, Math.PI * 0.6);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(14, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    } else if (b.roofType === 'vent') {
      ctx.fillStyle = 'rgba(255, 0, 85, 0.18)';
      ctx.fillRect(b.x - 24, b.y - 14, 48, 28);
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x - 24, b.y - 14, 48, 28);
    } else if (b.roofType === 'solar') {
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x - 22, b.y - 16, 44, 32);
    }

    // 6. Blinking Aviation Warning Beacons on Building Corners
    const blink = (frameCount + i * 15) % 45 < 15;
    if (blink) {
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(left + 5, top + 5, 2.5, 0, Math.PI * 2);
      ctx.arc(left + b.w - 5, top + 5, 2.5, 0, Math.PI * 2);
      ctx.arc(left + 5, top + b.h - 5, 2.5, 0, Math.PI * 2);
      ctx.arc(left + b.w - 5, top + b.h - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Holographic Rooftop Corporate Billboard
    ctx.font = "800 10px Orbitron, monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = b.color;
    ctx.fillText(b.bannerText || b.label, b.x, top + 16);
  }
}

function generateWorldProps() {
  worldProps = [];
  generateBuildings();

  // 1. Spawn 10 Cyber Augmentation Shrines across the 7 biomes
  const shrineSpots = [
    { x: 4200, y: 3100 }, // Nexus North
    { x: 4200, y: 1100 }, // Skyline Apex
    { x: 1800, y: 1800 }, // Crimson Foundry Core
    { x: 1150, y: 2450 }, // Crimson Foundry West
    { x: 6600, y: 1800 }, // Quantum Vault Core
    { x: 7250, y: 2450 }, // Quantum Vault East
    { x: 1800, y: 6600 }, // Ion Nebula Core
    { x: 1150, y: 5950 }, // Ion Nebula West
    { x: 6600, y: 6600 }, // Void Singularity Core
    { x: 4200, y: 6050 }  // Titan Crater North
  ];
  shrineSpots.forEach(pt => {
    worldProps.push(new WorldProp('shrine', pt.x + (Math.random() - 0.5) * 160, pt.y + (Math.random() - 0.5) * 160));
  });

  // 2. Spawn 4 Dimensional Warp Gates at cardinal extremes
  worldProps.push(new WorldProp('warp_gate', 4200, 850));
  worldProps.push(new WorldProp('warp_gate', 4200, 7550));
  worldProps.push(new WorldProp('warp_gate', 850, 4200));
  worldProps.push(new WorldProp('warp_gate', 7550, 4200));

  // 3. Spawn 6 Neon Jackpot Spin Obelisks around major avenues
  const slotSpots = [
    { x: 3500, y: 4200 },
    { x: 4900, y: 4200 },
    { x: 4200, y: 3500 },
    { x: 4200, y: 4900 },
    { x: 4200, y: 2100 },
    { x: 4200, y: 6300 }
  ];
  slotSpots.forEach(pt => {
    worldProps.push(new WorldProp('slot_obelisk', pt.x + (Math.random() - 0.5) * 80, pt.y + (Math.random() - 0.5) * 80));
  });

  // 4. Spawn 12 Hackable Allied Ion Turrets
  const turretSpots = [
    { x: 3300, y: 3500 }, { x: 5100, y: 3500 },
    { x: 3300, y: 4900 }, { x: 5100, y: 4900 },
    { x: 2300, y: 4200 }, { x: 6100, y: 4200 },
    { x: 4200, y: 2300 }, { x: 4200, y: 6100 },
    { x: 2300, y: 2300 }, { x: 6100, y: 2300 },
    { x: 2300, y: 6100 }, { x: 6100, y: 6100 }
  ];
  turretSpots.forEach(pt => {
    worldProps.push(new WorldProp('turret', pt.x + (Math.random() - 0.5) * 120, pt.y + (Math.random() - 0.5) * 120));
  });

  // 5. Spawn 16 Hyper-Slipstream Boost Gates along highways between biomes
  for (let i = 0; i < 16; i++) {
    const ang = (i * Math.PI) / 8;
    const dist = 950 + (i % 2) * 850;
    const bx = WORLD_W / 2 + Math.cos(ang) * dist;
    const by = WORLD_H / 2 + Math.sin(ang) * dist;
    worldProps.push(new WorldProp('boost_ring', bx, by, ang));
  }

  // 6. Spawn 28 Quantum Data Vaults & 20 Volatile EMP Pylons across the world
  for (let i = 0; i < 28; i++) {
    const x = 350 + Math.random() * (WORLD_W - 700);
    const y = 350 + Math.random() * (WORLD_H - 700);
    if (Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2) > 350) {
      worldProps.push(new WorldProp('cache', x, y));
    }
  }
  for (let i = 0; i < 20; i++) {
    const x = 380 + Math.random() * (WORLD_W - 760);
    const y = 380 + Math.random() * (WORLD_H - 760);
    if (Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2) > 320) {
      worldProps.push(new WorldProp('emp_pylon', x, y));
    }
  }
}

// Autonomous Allied Valkyrie Wingman (Summoned via Jackpot Obelisks & Cyber-Contracts!)
class AlliedWingman {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.life = 2700; // 45 seconds of autonomous air support
    this.maxLife = 2700;
    this.fireTimer = 0;
    this.active = true;
    this.orbitOffset = Math.random() * Math.PI * 2;
  }

  update() {
    this.life--;
    if (this.life <= 0) {
      this.active = false;
      spawnFloatingText(this.x, this.y, 'VALKYRIE RTB', '#00ff88', 1.0);
      return;
    }

    // Orbit smoothly in wingman formation near player
    this.orbitOffset += 0.025;
    const targetX = player.x + Math.cos(this.orbitOffset) * 88;
    const targetY = player.y + Math.sin(this.orbitOffset) * 88;
    this.vx += (targetX - this.x) * 0.045;
    this.vy += (targetY - this.y) * 0.045;
    this.vx *= 0.84;
    this.vy *= 0.84;
    this.x += this.vx;
    this.y += this.vy;

    // Acquire nearest hostile target
    let closest = null;
    let minD = 560;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < minD) {
        minD = d;
        closest = e;
      }
    }

    if (closest) {
      this.angle = Math.atan2(closest.y - this.y, closest.x - this.x);
      this.fireTimer--;
      if (this.fireTimer <= 0) {
        this.fireTimer = 11;
        const dmg = 20 + wave * 3.5;
        projectiles.push(new Projectile(
          this.x + Math.cos(this.angle + 0.25) * 14,
          this.y + Math.sin(this.angle + 0.25) * 14,
          this.angle,
          '#00ff88',
          19,
          dmg,
          0,
          false,
          'drone'
        ));
        projectiles.push(new Projectile(
          this.x + Math.cos(this.angle - 0.25) * 14,
          this.y + Math.sin(this.angle - 0.25) * 14,
          this.angle,
          '#00f0ff',
          19,
          dmg,
          0,
          false,
          'drone'
        ));
      }
    } else {
      this.angle = Math.atan2(this.vy, this.vx);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(getGlowSprite('#00ff88'), -34, -34, 68, 68);

    ctx.save();
    ctx.rotate(this.angle);
    ctx.fillStyle = '#052e16';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-10, -12);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Remaining wingman duration bar
    const pct = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = 'rgba(6, 20, 14, 0.8)';
    ctx.fillRect(-16, -20, 32, 3.5);
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(-16, -20, 32 * pct, 3.5);
    ctx.restore();
  }
}

let wingmen = [];

// =========================================================
// LIVE INTERACTIVE CYBER-CONTRACTS SYSTEM ([C] OR AUTO)
// =========================================================
let activeContract = null;
let contractCooldownTimer = 180; // Auto-triggers first fun activity 3s into Sector 1!
let lastContractType = '';

function triggerLiveContract(manual = false) {
  if (gameState !== 'PLAYING') return;
  if (activeContract && !manual) return;

  // Clean up any existing VIP bounty enemy if manually cycling contract
  if (activeContract && activeContract.type === 'bounty' && activeContract.vipEnemy) {
    activeContract.vipEnemy.active = false;
  }

  const pool = ['slalom', 'heist', 'bounty', 'parry_blitz'].filter(t => t !== lastContractType);
  const type = pool[Math.floor(Math.random() * pool.length)] || 'slalom';
  lastContractType = type;

  if (type === 'slalom') {
    // 1. NEON DRIFT SLALOM: 5 curving Golden Holo-Gates ahead of the player
    const gates = [];
    let gx = player.x;
    let gy = player.y;
    let baseAng = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    if (isNaN(baseAng)) baseAng = 0;

    for (let i = 0; i < 5; i++) {
      baseAng += (Math.random() - 0.5) * 0.85;
      const stepDist = 250 + i * 25;
      gx = Math.max(240, Math.min(WORLD_W - 240, gx + Math.cos(baseAng) * stepDist));
      gy = Math.max(240, Math.min(WORLD_H - 240, gy + Math.sin(baseAng) * stepDist));
      gates.push({ x: gx, y: gy, r: 54, angle: baseAng, cleared: false });
    }

    activeContract = {
      type: 'slalom',
      svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none"><polygon points="3,2 10,8 3,14" stroke="currentColor" stroke-width="1.8"/><polygon points="8,2 15,8 8,14" stroke="#00f0ff" stroke-width="1.6"/></svg>`,
      title: 'NEON DRIFT SLALOM [C]',
      desc: 'Dash/Fly through all 5 Golden Holo-Gates in sequence!',
      timer: 24 * 60,
      maxTimer: 24 * 60,
      progress: 0,
      target: 5,
      gates
    };
    sound.ringPass(0);
    announce('// LIVE CONTRACT: NEON DRIFT SLALOM — FLY THROUGH 5 GOLDEN HOLO-GATES //', '#ffe600');
  } else if (type === 'heist') {
    // 2. ORBITAL PAYLOAD HEIST: Tether to the Orbital Data Core while fending off Elite Ambushers
    const ang = Math.random() * Math.PI * 2;
    const hx = Math.max(320, Math.min(WORLD_W - 320, player.x + Math.cos(ang) * 380));
    const hy = Math.max(320, Math.min(WORLD_H - 320, player.y + Math.sin(ang) * 380));

    activeContract = {
      type: 'heist',
      svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none"><polygon points="8,1 14,5 14,11 8,15 2,11 2,5" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="2.5" fill="#00f0ff"/></svg>`,
      title: 'ORBITAL PAYLOAD HEIST [C]',
      desc: 'Stay inside the Orbital Data Core ring to hack 100%!',
      timer: 26 * 60,
      maxTimer: 26 * 60,
      progress: 0,
      target: 100,
      x: hx,
      y: hy,
      radius: 195,
      ambush1: false,
      ambush2: false
    };
    sound.pickup(8);
    addGridRipple(hx, hy, 360, 30, '#00f0ff');
    announce('// LIVE CONTRACT: ORBITAL PAYLOAD HEIST — HOLD INSIDE DATA CORE RING //', '#00f0ff');
  } else if (type === 'bounty') {
    // 3. CRIMSON NEMESIS VIP BOUNTY: Hunt down the high-speed VIP Dread-Cruiser
    const ang = Math.random() * Math.PI * 2;
    const bx = Math.max(260, Math.min(WORLD_W - 260, player.x + Math.cos(ang) * 460));
    const by = Math.max(260, Math.min(WORLD_H - 260, player.y + Math.sin(ang) * 460));
    const vip = new Enemy('nemesis', bx, by, true);
    enemies.push(vip);

    activeContract = {
      type: 'bounty',
      svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.6"/><line x1="8" y1="0" x2="8" y2="16" stroke="#ff0055" stroke-width="1.4"/><line x1="0" y1="8" x2="16" y2="8" stroke="#ff0055" stroke-width="1.4"/></svg>`,
      title: 'VIP NEMESIS BOUNTY [C]',
      desc: 'Hunt down & destroy the Crimson Nemesis VIP Gunship!',
      timer: 28 * 60,
      maxTimer: 28 * 60,
      progress: 0,
      target: 1,
      vipEnemy: vip
    };
    sound.parryDeflect();
    announce('// LIVE CONTRACT: CRIMSON NEMESIS VIP GUNSHIP DETECTED — ELIMINATE FOR AUGMENT //', '#ff0077');
  } else {
    // 4. CYBER-KATANA BLITZ TRIAL: Deflect bullets / cleave enemies with [Q] Katana or rapid kills!
    activeContract = {
      type: 'parry_blitz',
      svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none"><line x1="2" y1="14" x2="14" y2="2" stroke="#00ff88" stroke-width="2"/><line x1="14" y1="14" x2="2" y2="2" stroke="#00f0ff" stroke-width="2"/></svg>`,
      title: 'DIMENSION KATANA BLITZ [C]',
      desc: 'Press [Q] to Parry Bullets / Cleave Hostiles (or score Kills)!',
      timer: 22 * 60,
      maxTimer: 22 * 60,
      progress: 0,
      target: 6
    };
    player.katanaCooldown = 0;
    sound.katanaSlash();
    announce('// LIVE CONTRACT: DIMENSION KATANA BLITZ — PARRY OR CLEAVE WITH [Q] //', '#00ff88');
  }
}

function completeLiveContract() {
  if (!activeContract) return;
  const c = activeContract;
  activeContract = null;
  contractCooldownTimer = 660; // Next auto-contract in 11s
  totalContractsDone++;

  sound.levelUp();
  screenShake = Math.max(screenShake, 18);
  chromaticFlash = 14;
  addGridRipple(player.x, player.y, 480, 42, '#ffe600');

  const rewardPts = (1500 + wave * 250) * combo;
  score += rewardPts;
  player.hp = Math.min(player.maxHp, player.hp + 35);
  player.overdrive = Math.min(100, player.overdrive + 50);
  player.katanaCooldown = 0;

  if (c.type === 'slalom' || c.type === 'bounty') {
    player.frenzyTimer = Math.max(player.frenzyTimer, 360);
    spawnFloatingText(player.x, player.y - 30, `// CONTRACT COMPLETE! +${rewardPts.toLocaleString()} & FREE AUGMENT //`, '#ffe600', 1.4);
    announce(`// CONTRACT COMPLETED (+${rewardPts.toLocaleString()} PTS) — SELECT BONUS AUGMENTATION //`, '#ffe600');
    showUpgradeMenu();
  } else {
    wingmen.push(new AlliedWingman(player.x + 40, player.y - 40));
    player.frenzyTimer = Math.max(player.frenzyTimer, 420);
    for (let i = 0; i < 10; i++) {
      shards.push(new DataShard(player.x + (Math.random() - 0.5) * 60, player.y + (Math.random() - 0.5) * 60, 25, 'xp'));
    }
    shards.push(new DataShard(player.x, player.y, 0, 'overdrive'));
    spawnFloatingText(player.x, player.y - 30, `// CONTRACT COMPLETE! VALKYRIE ALLY + FRENZY //`, '#00ff88', 1.4);
    announce(`// CONTRACT COMPLETED (+${rewardPts.toLocaleString()} PTS) — VALKYRIE WINGMAN & HYPER-FRENZY //`, '#00ff88');
  }
}

function recordContractAction(actionType, amount = 1) {
  if (actionType === 'parry') {
    totalParries += Math.max(1, Math.round(amount));
  }
  if (!activeContract) return;
  if (activeContract.type === 'bounty' && actionType === 'nemesis_kill') {
    activeContract.progress = 1;
    completeLiveContract();
  } else if (activeContract.type === 'parry_blitz') {
    if (actionType === 'parry') {
      activeContract.progress = Math.min(activeContract.target, activeContract.progress + amount * 1.5);
    } else if (actionType === 'katana_hit' || actionType === 'kill') {
      activeContract.progress = Math.min(activeContract.target, activeContract.progress + amount);
    }
    if (activeContract.progress >= activeContract.target) {
      completeLiveContract();
    }
  }
}

function updateLiveContract() {
  if (gameState !== 'PLAYING') return;

  if (!activeContract) {
    if (contractCooldownTimer > 0) {
      contractCooldownTimer--;
      if (contractCooldownTimer <= 0) {
        triggerLiveContract(false);
      }
    }
    return;
  }

  activeContract.timer--;
  if (activeContract.timer <= 0) {
    if (activeContract.type === 'bounty' && activeContract.vipEnemy) {
      activeContract.vipEnemy.active = false;
    }
    spawnFloatingText(player.x, player.y - 24, 'CONTRACT EXPIRED — PRESS [C] FOR NEW CONTRACT', '#94a3b8', 1.1);
    activeContract = null;
    contractCooldownTimer = 540;
    return;
  }

  if (activeContract.type === 'slalom') {
    const nextGate = activeContract.gates[activeContract.progress];
    if (nextGate && !nextGate.cleared) {
      const d = Math.hypot(player.x - nextGate.x, player.y - nextGate.y);
      if (d < nextGate.r + player.radius + 10) {
        nextGate.cleared = true;
        activeContract.progress++;
        sound.ringPass(activeContract.progress);
        player.boostTimer = Math.max(player.boostTimer, 80);
        player.overdrive = Math.min(100, player.overdrive + 15);
        score += 250 * combo;
        addGridRipple(nextGate.x, nextGate.y, 260, 24, '#ffe600');
        spawnFloatingText(nextGate.x, nextGate.y - 20, `GATE ${activeContract.progress}/5 CLEARED! +BOOST`, '#ffe600', 1.25);
        if (activeContract.progress >= activeContract.target) {
          completeLiveContract();
        }
      }
    }
  } else if (activeContract.type === 'heist') {
    const d = Math.hypot(player.x - activeContract.x, player.y - activeContract.y);
    if (d <= activeContract.radius) {
      activeContract.progress = Math.min(100, activeContract.progress + 0.24);
      if (frameCount % 6 === 0) {
        spawnParticle(
          activeContract.x + (Math.random() - 0.5) * 30,
          activeContract.y + (Math.random() - 0.5) * 30,
          (player.x - activeContract.x) * 0.04,
          (player.y - activeContract.y) * 0.04,
          '#00f0ff',
          16,
          3
        );
      }
      if (!activeContract.ambush1 && activeContract.progress >= 32) {
        activeContract.ambush1 = true;
        const a = Math.random() * Math.PI * 2;
        enemies.push(new Enemy('striker', activeContract.x + Math.cos(a) * 260, activeContract.y + Math.sin(a) * 260, true));
        spawnFloatingText(activeContract.x, activeContract.y - 36, '// SECURITY AMBUSH INBOUND //', '#ff0077', 1.2);
      }
      if (!activeContract.ambush2 && activeContract.progress >= 72) {
        activeContract.ambush2 = true;
        const a = Math.random() * Math.PI * 2;
        enemies.push(new Enemy('cruiser', activeContract.x + Math.cos(a) * 270, activeContract.y + Math.sin(a) * 270, true));
      }
      if (activeContract.progress >= 100) {
        completeLiveContract();
      }
    }
  } else if (activeContract.type === 'bounty') {
    if (!activeContract.vipEnemy || !activeContract.vipEnemy.active) {
      activeContract.progress = 1;
      completeLiveContract();
    } else {
      // Progress bar reflects damage dealt to the VIP Nemesis
      const dealtPct = Math.max(0, 1 - activeContract.vipEnemy.hp / activeContract.vipEnemy.maxHp);
      activeContract.progress = dealtPct;
    }
  }
}

function drawLiveContract() {
  if (!activeContract) return;

  if (activeContract.type === 'slalom') {
    const gates = activeContract.gates;
    // Draw connecting holo-path between remaining gates
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.28)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    let started = false;
    for (let i = activeContract.progress; i < gates.length; i++) {
      if (!started) {
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(gates[i].x, gates[i].y);
        started = true;
      } else {
        ctx.lineTo(gates[i].x, gates[i].y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (let i = 0; i < gates.length; i++) {
      const g = gates[i];
      if (g.cleared) continue;
      const isCurrent = i === activeContract.progress;
      ctx.save();
      ctx.translate(g.x, g.y);
      if (isCurrent) {
        ctx.drawImage(getGlowSprite('#ffe600'), -72, -72, 144, 144);
      }
      ctx.rotate(frameCount * (isCurrent ? 0.04 : 0.015));
      ctx.strokeStyle = isCurrent ? '#ffe600' : 'rgba(255, 230, 0, 0.35)';
      ctx.lineWidth = isCurrent ? 3.5 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, g.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-frameCount * (isCurrent ? 0.04 : 0.015));
      ctx.font = "900 12px 'Segoe UI', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = isCurrent ? '#ffffff' : 'rgba(255, 230, 0, 0.6)';
      ctx.fillText(isCurrent ? `[ GATE ${i + 1}/5 ]` : `GATE ${i + 1}`, 0, -g.r - 10);
      ctx.restore();
    }
  } else if (activeContract.type === 'heist') {
    const hx = activeContract.x;
    const hy = activeContract.y;
    const r = activeContract.radius;
    const inside = Math.hypot(player.x - hx, player.y - hy) <= r;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.drawImage(getGlowSprite(inside ? '#00f0ff' : '#ffe600'), -85, -85, 170, 170);

    // Outer hacking perimeter ring
    ctx.strokeStyle = inside ? 'rgba(0, 240, 255, 0.75)' : 'rgba(255, 230, 0, 0.45)';
    ctx.lineWidth = inside ? 3 : 2;
    ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Progress arc around the core
    ctx.beginPath();
    ctx.arc(0, 0, 44, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * activeContract.progress) / 100);
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Central Orbital Data Core octagon
    ctx.save();
    ctx.rotate(frameCount * 0.03);
    ctx.fillStyle = '#062032';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-22, -22, 44, 44);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-22, -22, 44, 44);
    ctx.strokeRect(-22, -22, 44, 44);
    ctx.restore();

    ctx.font = "900 11px 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = inside ? '#00ff88' : '#ffe600';
    ctx.fillText(
      inside ? `[HACKING PAYLOAD ${Math.floor(activeContract.progress)}%]` : '[ENTER RING TO HACK PAYLOAD]',
      0,
      -54
    );
    ctx.restore();

    // Draw Neural Tether Beam from Core to Player when inside!
    if (inside) {
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(player.x, player.y);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function warpToNewSector() {
  wave++;
  score += 1000;
  player.hp = Math.min(player.maxHp, player.hp + 40);
  player.overdrive = Math.min(100, player.overdrive + 50);
  player.invulnTimer = 90;
  player.x = WORLD_W / 2;
  player.y = WORLD_H / 2;
  camX = Math.max(0, Math.min(WORLD_W - canvas.width, player.x - canvas.width / 2));
  camY = Math.max(0, Math.min(WORLD_H - canvas.height, player.y - canvas.height / 2));

  enemyProjectiles = [];
  enemies = [];
  spatialRifts = [];
  chronoFields = [];
  phantomDecoys = [];
  waveSpawnQueue = [];
  chromaticFlash = 22;
  screenShake = 24;
  sound.overdrive();
  addGridRipple(player.x, player.y, 680, 55, '#d946ef');
  generateWorldProps();
  spawnWave();
  announce(`// WARPED TO UNCHARTED SECTOR ${wave} (+1,000 PTS) //`, '#f0abfc');
}

// Game collections & state
let player = new Player();
let projectiles = [];
let enemyProjectiles = [];
let missiles = [];
let blackHoles = [];
let spatialRifts = [];
let chronoFields = [];
let phantomDecoys = [];
let shards = [];
let enemies = [];
let waveSpawnQueue = [];
const MAX_ACTIVE_ENEMIES = 22;
let particles = [];
let lightningBolts = [];
let afterimages = [];
generateWorldProps();

let frameCount = 0;
let runPlayFrames = 0;
let wave = 1;
let score = 0;
let highScore = Number(localStorage.getItem('neon_protocol_best') || 0);
let totalKills = 0;
let combo = 1;
let comboCounter = 0;
let comboTimer = 0;
let maxComboReached = 1;
let maxStreakReached = 0;
let totalParries = 0;
let totalContractsDone = 0;
let gameOverTimestamp = 0;
let gameState = 'START';

function startNewGame() {
  player.reset(selectedChassis);
  projectiles = [];
  enemyProjectiles = [];
  missiles = [];
  blackHoles = [];
  spatialRifts = [];
  chronoFields = [];
  phantomDecoys = [];
  shards = [];
  enemies = [];
  waveSpawnQueue = [];
  wingmen = [];
  activeContract = null;
  contractCooldownTimer = 180;
  particles = [];
  lightningBolts = [];
  afterimages = [];
  floatingTexts = [];
  gridRipples = [];
  generateWorldProps();

  score = 0;
  totalKills = 0;
  runPlayFrames = 0;
  wave = 1;
  combo = 1;
  comboCounter = 0;
  maxComboReached = 1;
  maxStreakReached = 0;
  totalParries = 0;
  totalContractsDone = 0;
  gameState = 'PLAYING';

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('upgradeScreen').classList.add('hidden');
  updatePerkBadges();
  announce(`// CHASSIS DEPLOYED: ${player.chassisName} //`, player.themeColor);
  spawnWave();
}

function randomEdgePoint() {
  const side = Math.floor(Math.random() * 4);
  let rx, ry;
  if (side === 0) {
    rx = camX + Math.random() * canvas.width;
    ry = camY - 45;
  } else if (side === 1) {
    rx = camX + canvas.width + 45;
    ry = camY + Math.random() * canvas.height;
  } else if (side === 2) {
    rx = camX + Math.random() * canvas.width;
    ry = camY + canvas.height + 45;
  } else {
    rx = camX - 45;
    ry = camY + Math.random() * canvas.height;
  }
  return {
    x: Math.max(60, Math.min(WORLD_W - 60, rx)),
    y: Math.max(60, Math.min(WORLD_H - 60, ry))
  };
}

function flushSpawnQueue() {
  while (waveSpawnQueue.length > 0 && enemies.length < MAX_ACTIVE_ENEMIES) {
    const entry = waveSpawnQueue.shift();
    const type = typeof entry === 'string' ? entry : entry.type;
    const forceElite = typeof entry === 'object' && !!entry.elite;
    const pt = randomEdgePoint();
    enemies.push(new Enemy(type, pt.x, pt.y, forceElite));
  }
}

function spawnWave() {
  const threatCfg = getThreatConfig();
  const threatLabels = [
    'TIER I: OVERCLOCKED VANGUARD',
    'TIER II: ASSAULT ARMADA',
    'TIER III: HEAVY STRIKE FORCE',
    'TIER IV: RELENTLESS SWARM',
    'TIER V: NIGHTMARE LEGION',
    'TIER VI: APEX GODSLAYER'
  ];
  const shortTiers = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6 APEX'];
  const tierIdx = Math.min(threatLabels.length - 1, wave - 1);
  document.getElementById('waveDisplay').textContent = `SEC ${wave} • ${shortTiers[tierIdx]}`;

  const isBossWave = wave === 3 || (wave >= 5 && wave % 2 === 1);
  waveSpawnQueue = [];

  if (isBossWave) {
    const bossSchedule = [
      { wave: 3,  type: 'boss_colossus',      name: 'TITAN GOLIATH // SIEGE BATTLESHIP',        col: '#ff2a55' },
      { wave: 5,  type: 'boss_seraphim',      name: 'OMEGA SERAPHIM DREADNOUGHT',               col: '#9d4edd' },
      { wave: 7,  type: 'boss_leviathan',     name: 'VOID LEVIATHAN // APEX SINGULARITY',       col: '#d946ef' },
      { wave: 9,  type: 'boss_architect',     name: 'KAIROS HYPER-CORE // AI CONSTRUCT',        col: '#00f0ff' },
      { wave: 11, type: 'boss_ignis',         name: 'SOLAR VULCAN // PYROCLASTIC MEGATANK',     col: '#ff6600' },
      { wave: 13, type: 'boss_tempest',       name: 'ZEPHYR TEMPEST // THUNDERBIRD CARRIER',    col: '#38bdf8' },
      { wave: 15, type: 'boss_chronos',       name: 'OUROBOROS // CHRONO-LORD WEAVER',          col: '#eab308' },
      { wave: 17, type: 'boss_reaper',        name: 'THANATOS // PHANTOM DREAD-STALKER',        col: '#10b981' },
      { wave: 19, type: 'boss_behemoth',      name: 'TERRA GORGON // CYBER-HYDRA DREDGER',      col: '#84cc16' },
      { wave: 21, type: 'boss_pulsar',        name: 'ASTRON PULSAR // NEUTRON STAR CORE',       col: '#f43f5e' },
      { wave: 23, type: 'boss_valkyrie_zero', name: 'SHADOW VALKYRIE ZERO // ROGUE PROTOTYPE', col: '#e11d48' },
      { wave: 25, type: 'boss_hivemind',      name: 'NEXUS OVERMIND // CARRIER MATRIX',         col: '#14b8a6' },
      { wave: 27, type: 'boss_banshee',       name: 'SIREN BANSHEE // ACOUSTIC WARCRUISER',     col: '#8b5cf6' },
      { wave: 29, type: 'boss_glacier',       name: 'FROST JOTUNN // CRYO-AEGIS MONOLITH',      col: '#06b6d4' },
      { wave: 31, type: 'boss_oblivion',      name: 'APEX OBLIVION // COSMIC DOOMSDAY SYSTEM',  col: '#ffffff' }
    ];

    const match = bossSchedule.find(b => b.wave === wave);
    let bType, bTitle, bCol;
    if (match) {
      bType = match.type;
      bTitle = match.name;
      bCol = match.col;
    } else {
      // Wave 33+ Infinite Apex Escalation: Random selection across all 15 Apex Titans
      const randomBoss = bossSchedule[Math.floor(Math.random() * bossSchedule.length)];
      bType = randomBoss.type;
      bTitle = `${randomBoss.name} // OVERDRIVE ENRAGED`;
      bCol = randomBoss.col;
    }

    announce(`// SECTOR ${wave} CRITICAL ALERT: ${bTitle} INBOUND //`, bCol);
    sound.explosion(true);
    screenShake = Math.max(screenShake, 24);
    chromaticFlash = Math.max(chromaticFlash, 18);
    const bossY = Math.max(120, player.y - 480);
    enemies.push(new Enemy(bType, player.x, bossY));

    // Boss Royal Guard Escort & Twin-Titan Escalation (Wave 9+)
    enemies.push(new Enemy('aegis', player.x - 180, bossY + 60, true));
    enemies.push(new Enemy('aegis', player.x + 180, bossY + 60, true));
    if (wave >= 7) {
      enemies.push(new Enemy('phantom', player.x - 260, bossY + 110, true));
      enemies.push(new Enemy('phantom', player.x + 260, bossY + 110, true));
    }
    if (wave >= 11 && wave % 4 === 3) {
      const twinBoss = bossSchedule[(wave + 3) % bossSchedule.length];
      enemies.push(new Enemy(twinBoss.type, player.x + 240, Math.max(120, player.y - 420)));
      spawnFloatingText(player.x, player.y - 90, `TWIN TITAN ALERT: ${twinBoss.name.split(' //')[0]}!`, '#ffe600', 1.45);
    }
  } else if (wave === 1) {
    announce(`// SECTOR 1 (${threatCfg.name}) — ARMED VANGUARD, STRIKERS & ELITE HUNTERS INBOUND //`, '#ff2a55');
  } else if (wave === 2) {
    announce(`// SECTOR 2 — AEGIS GUARDIANS, RAIL SNIPERS & PHANTOM ASSASSINS INBOUND //`, '#ff7b00');
  } else if (wave === 4) {
    announce(`// SECTOR 4 — CHRONO-WEAVERS, NEMESIS ACES & SIEGE JUGGERNAUTS UNLEASHED //`, '#ff2a55');
  } else {
    announce(`// SECTOR ${wave} — ${threatLabels[tierIdx]} HOSTILES INBOUND //`, '#ffe600');
  }

  // Build aggressive, multi-stage combat waves right from Sector 1!
  const sMult = (threatCfg.spawnMult || 1.25) * 1.12;
  const stage1 = []; // Fast armed vanguard: 'drone_bit', 'scout', 'striker'
  const stage2 = []; // Mid-wave pressure: 'striker', 'splitter', 'cruiser'
  const stage3 = []; // Heavy & tactical: 'cruiser', 'aegis', 'sniper'
  const stage4 = []; // Assassin flankers: 'sniper', 'phantom', 'weaver'
  const stage5 = []; // Climax Elite Strike Force, Juggernauts & Nemesis Aces

  // Stage 1: Armed Drones, Lunging Scouts, and Twin-Blaster Strikers right from Sector 1
  const droneCount = Math.round(Math.max(4, 7 - Math.floor(wave / 3)) * sMult);
  const scoutCount = Math.round((6 + wave) * sMult);
  for (let i = 0; i < droneCount; i++) stage1.push({ type: 'drone_bit', elite: i === 0 && wave >= 2 });
  for (let i = 0; i < scoutCount; i++) stage1.push({ type: 'scout', elite: i < 2 });
  stage1.push({ type: 'striker', elite: true });
  stage1.push({ type: 'striker', elite: false });

  // Stage 2: Strikers, Hydra Splitters & Heavy Cruiser support right in Sector 1!
  const strikerCount = Math.round((3 + Math.floor(wave * 1.0)) * sMult);
  const splitterCount = Math.round((2 + Math.floor(wave * 0.75)) * sMult);
  for (let i = 0; i < strikerCount; i++) stage2.push({ type: 'striker', elite: i < 2 && wave >= 2 });
  for (let i = 0; i < splitterCount; i++) stage2.push({ type: 'splitter', elite: i === 0 });
  stage2.push({ type: 'cruiser', elite: wave >= 2 });

  // Stage 3: Cruisers, Aegis Shield Guardians & Rail Snipers (Sector 1 gets Cruiser + Aegis + Sniper!)
  const cruiserCount = Math.round((2 + Math.floor(wave * 0.7)) * sMult);
  const aegisCount = Math.round((2 + Math.floor(wave * 0.6)) * sMult);
  for (let i = 0; i < cruiserCount; i++) stage3.push({ type: 'cruiser', elite: i === 0 });
  for (let i = 0; i < aegisCount; i++) stage3.push({ type: 'aegis', elite: i === 0 });
  stage3.push({ type: 'sniper', elite: wave >= 2 });

  // Stage 4: Snipers, Blinking Phantoms & Chrono-Weavers
  if (wave === 1) {
    stage4.push({ type: 'phantom', elite: true });
    stage4.push({ type: 'sniper', elite: false });
    stage4.push({ type: 'striker', elite: true });
  } else {
    const sniperCount = Math.round((2 + Math.floor((wave - 1) * 0.6)) * sMult);
    const phantomCount = Math.round((2 + Math.floor((wave - 1) * 0.65)) * sMult);
    for (let i = 0; i < sniperCount; i++) stage4.push({ type: 'sniper', elite: i === 0 });
    for (let i = 0; i < phantomCount; i++) stage4.push({ type: 'phantom', elite: i === 0 });
  }

  // Stage 5: Wave Climax — Elite Commanders, Chrono-Weavers, Juggernauts & Nemesis VIP Aces
  if (wave === 1) {
    stage5.push({ type: 'cruiser', elite: true });
    stage5.push({ type: 'aegis', elite: true });
    stage5.push({ type: 'juggernaut', elite: false });
  } else if (wave === 2) {
    stage5.push({ type: 'weaver', elite: true });
    stage5.push({ type: 'juggernaut', elite: true });
    stage5.push({ type: 'phantom', elite: true });
    stage5.push({ type: 'nemesis', elite: true });
  } else {
    const weaverCount = Math.round((1 + Math.floor((wave - 1) * 0.6)) * sMult);
    const juggCount = 1 + Math.floor(wave / 2);
    for (let i = 0; i < weaverCount; i++) stage5.push({ type: 'weaver', elite: i < 2 });
    for (let i = 0; i < juggCount; i++) stage5.push({ type: 'juggernaut', elite: true });
    stage5.push({ type: 'nemesis', elite: true });
    if (wave >= 6) stage5.push({ type: 'nemesis', elite: true });
    stage5.push({ type: 'phantom', elite: true });
    stage5.push({ type: 'aegis', elite: true });
  }

  [stage1, stage2, stage3, stage4, stage5].forEach(st => {
    st.sort(() => Math.random() - 0.5);
    waveSpawnQueue.push(...st);
  });

  // Spawn initial vanguard up to MAX_ACTIVE_ENEMIES
  flushSpawnQueue();
}

function rollUpgradeCards() {
  const container = document.getElementById('upgradeCards');
  container.innerHTML = '';

  document.getElementById('upgradeLevelTag').textContent = `// NEURAL CORE OVERCLOCKED • LVL ${player.level} //`;
  const rerollBtn = document.getElementById('rerollBtn');
  document.getElementById('rerollCountText').textContent = `(${player.rerolls} LEFT)`;
  rerollBtn.disabled = player.rerolls <= 0;

  const picked = [...ALL_UPGRADES].sort(() => 0.5 - Math.random()).slice(0, 3);
  currentUpgradeChoices = picked.map(up => {
    const rRoll = Math.random();
    let rarity = 'standard';
    let rarityLabel = 'MK-I STANDARD';
    let bonusLevels = 1;
    if (rRoll < 0.14) {
      rarity = 'legendary';
      rarityLabel = '[OMEGA] PROTOTYPE (+2 LVL)';
      bonusLevels = 2;
    } else if (rRoll < 0.42) {
      rarity = 'epic';
      rarityLabel = '[MK-II] OVERCLOCK (+25% OD)';
      bonusLevels = 1;
    }
    return { ...up, rarity, rarityLabel, bonusLevels };
  });

  currentUpgradeChoices.forEach((up, idx) => {
    const currentLvl = player.perks[up.id] || 0;
    const nextLvl = currentLvl + up.bonusLevels;
    const card = document.createElement('div');
    card.className = `upgrade-card rarity-${up.rarity}`;
    card.style.setProperty('--card-color', up.rarity === 'legendary' ? '#ffe600' : up.color);

    // Build 5-segment neural power pips
    let pipsHtml = '';
    const maxPips = Math.max(5, nextLvl);
    for (let p = 1; p <= maxPips; p++) {
      let cls = 'lvl-pip';
      if (p <= currentLvl) cls += ' filled';
      else if (p <= nextLvl) cls += ' next-up';
      pipsHtml += `<div class="${cls}"></div>`;
    }

    const extraStat = up.rarity === 'legendary'
      ? `<br><span style="color:#ffe600">[OMEGA BONUS]: INSTANT +2 LEVELS &amp; +20 HP</span>`
      : (up.rarity === 'epic' ? `<br><span style="color:#ff66b2">[OVERCLOCK BONUS]: +25% OVERDRIVE CHARGE</span>` : '');

    card.innerHTML = `
      <div>
        <div class="card-top-row">
          <div class="card-category-tag">${up.category}</div>
          <div class="rarity-badge ${up.rarity}">${up.rarityLabel}</div>
        </div>

        <div class="card-emblem-row">
          <div class="holo-icon-socket">
            ${up.svg}
          </div>
          <div class="upgrade-title-block">
            <div class="upgrade-title">${up.title}</div>
            <div class="level-pips-row">
              ${pipsHtml}
              <span class="lvl-pip-label">LVL ${currentLvl} &gt;&gt; ${nextLvl}</span>
            </div>
          </div>
        </div>

        <div class="upgrade-desc">${up.desc}</div>
      </div>

      <div>
        <div class="telemetry-stat-box">
          ${up.stat}${extraStat}
        </div>
        <div class="card-install-footer">
          <span>INSTALL AUGMENTATION</span>
          <span class="key-shortcut-pill">[ KEY ${idx + 1} ]</span>
        </div>
      </div>
    `;
    card.onclick = () => {
      if (performance.now() - upgradeOpenedTimestamp < 260) return;
      applyUpgrade(up);
    };
    container.appendChild(card);
  });
}

function showUpgradeMenu() {
  gameState = 'UPGRADE';
  upgradeOpenedTimestamp = performance.now();
  mouse.down = false;
  Object.keys(keys).forEach(k => keys[k] = false);

  rollUpgradeCards();

  const screen = document.getElementById('upgradeScreen');
  screen.classList.remove('hidden');

  // Lock pointer clicks on cards & utility buttons for 260ms to prevent accidental clicks
  const cardsEl = document.getElementById('upgradeCards');
  const utilBar = document.querySelector('.upgrade-utility-bar');
  if (cardsEl) cardsEl.style.pointerEvents = 'none';
  if (utilBar) utilBar.style.pointerEvents = 'none';
  setTimeout(() => {
    if (cardsEl) cardsEl.style.pointerEvents = 'auto';
    if (utilBar) utilBar.style.pointerEvents = 'auto';
  }, 260);
}

function rerollUpgrades() {
  if (gameState !== 'UPGRADE' || player.rerolls <= 0) return;
  if (performance.now() - upgradeOpenedTimestamp < 260) return;
  player.rerolls--;
  upgradeOpenedTimestamp = performance.now();
  sound.dash();
  rollUpgradeCards();

  const cardsEl = document.getElementById('upgradeCards');
  if (cardsEl) {
    cardsEl.style.pointerEvents = 'none';
    setTimeout(() => { if (cardsEl) cardsEl.style.pointerEvents = 'auto'; }, 200);
  }
}

function healSkipUpgrade() {
  if (gameState !== 'UPGRADE') return;
  if (performance.now() - upgradeOpenedTimestamp < 260) return;
  player.hp = Math.min(player.maxHp, player.hp + 50);
  player.overdrive = Math.min(100, player.overdrive + 40);
  sound.levelUp();
  spawnFloatingText(player.x, player.y - 24, '+50 HULL & +40% OVERDRIVE!', '#00ff88', 1.25);
  document.getElementById('upgradeScreen').classList.add('hidden');
  gameState = 'PLAYING';
  mouse.down = false;
  Object.keys(keys).forEach(k => keys[k] = false);

  if (pendingLevelUps > 0) {
    pendingLevelUps--;
    setTimeout(() => {
      if (gameState === 'PLAYING') {
        sound.levelUp();
        showUpgradeMenu();
      }
    }, 140);
  }
}

function updatePerkBadges() {
  const container = document.getElementById('perkList');
  container.innerHTML = '';
  Object.entries(player.perks).forEach(([id, lvl]) => {
    const meta = ALL_UPGRADES.find(u => u.id === id);
    if (meta) {
      const pill = document.createElement('span');
      pill.className = 'perk-pill';
      pill.style.setProperty('--pill-color', meta.color);
      pill.title = `${meta.title} (LVL ${lvl})`;
      pill.innerHTML = `${meta.svg}<span>x${lvl}</span>`;
      container.appendChild(pill);
    }
  });
}

function applyUpgrade(choice) {
  if (gameState !== 'UPGRADE') return;
  const id = typeof choice === 'string' ? choice : choice.id;
  const tiers = (typeof choice === 'object' && choice.bonusLevels) ? choice.bonusLevels : 1;
  const rarity = (typeof choice === 'object' && choice.rarity) ? choice.rarity : 'standard';

  for (let t = 0; t < tiers; t++) {
    player.perks[id] = (player.perks[id] || 0) + 1;

    if (id === 'multishot') player.multishot++;
    if (id === 'firerate') player.fireInterval = Math.max(3.5, player.fireInterval - 1.8);
    if (id === 'railgun') player.railgunLevel++;
    if (id === 'lightning') player.lightningLevel++;
    if (id === 'drones') player.droneCount++;
    if (id === 'homing') player.homingLevel++;
    if (id === 'ricochet') player.ricochetLevel++;
    if (id === 'blackhole') player.blackholeLevel++;
    if (id === 'speed') {
      player.speed += 0.9;
      player.dashMaxCooldown = Math.max(38, player.dashMaxCooldown - 14);
    }
    if (id === 'emp') player.empLevel++;
    if (id === 'katana') {
      player.katanaLevel++;
      player.katanaMaxCooldown = Math.max(22, player.katanaMaxCooldown - 8);
      player.katanaCooldown = 0;
    }
    if (id === 'ion_beam') {
      player.ionBeamLevel++;
      player.ionBeamCooldown = 0;
    }
    if (id === 'chrono_phantom') {
      player.chronoLevel++;
      player.phantomLevel++;
      player.chronoCooldown = 0;
      player.phantomCooldown = 0;
    }
    if (id === 'shield') {
      player.shieldMax++;
      player.shieldCharges = player.shieldMax;
      player.hp = Math.min(player.maxHp, player.hp + 30);
    }
    if (id === 'nanites') player.naniteLevel++;
  }

  if (rarity === 'epic') {
    player.overdrive = Math.min(100, player.overdrive + 25);
  } else if (rarity === 'legendary') {
    player.hp = Math.min(player.maxHp, player.hp + 20);
    player.overdrive = Math.min(100, player.overdrive + 30);
    announce(`// OMEGA AUGMENTATION INSTALLED //`, '#ffe600');
  }

  sound.pickup(6);
  updatePerkBadges();
  document.getElementById('upgradeScreen').classList.add('hidden');
  gameState = 'PLAYING';
  mouse.down = false;
  Object.keys(keys).forEach(k => keys[k] = false);

  if (pendingLevelUps > 0) {
    pendingLevelUps--;
    setTimeout(() => {
      if (gameState === 'PLAYING') {
        sound.levelUp();
        showUpgradeMenu();
      }
    }, 140);
  }
}

function gameOver() {
  gameState = 'GAMEOVER';
  gameOverTimestamp = performance.now();

  const isNewRecord = score > highScore && score > 0;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('neon_protocol_best', String(highScore));
  }

  // 1. Header New Record Badge & Active Threat Tag
  const recBadge = document.getElementById('goRecordBadge');
  if (recBadge) recBadge.classList.toggle('hidden', !isNewRecord);

  const threatCfg = getThreatConfig();
  const threatTag = document.getElementById('goThreatTag');
  if (threatTag && threatCfg) {
    threatTag.innerHTML = `${threatCfg.svg}<span>THREAT: ${threatCfg.name}</span>`;
    threatTag.style.color = threatCfg.color;
    threatTag.style.borderColor = threatCfg.color;
  }

  // 2. Tactical Combat Rank Calculation (S+, S, A, B, C)
  const rankScore = score + wave * 3500 + totalKills * 120 + maxComboReached * 900 + totalContractsDone * 4000;
  let rankClass = 'rank-c';
  let rankLetter = 'C';
  let rankTitle = 'CADET INITIATE';
  let rankSub = 'CORE INTEGRITY LOST EARLY';
  if (rankScore >= 110000 || wave >= 8) {
    rankClass = 'rank-sp';
    rankLetter = 'S+';
    rankTitle = 'OMEGA GODSLAYER';
    rankSub = 'TRANSCENDENT NEURAL OVERCLOCK';
  } else if (rankScore >= 60000 || wave >= 6) {
    rankClass = 'rank-s';
    rankLetter = 'S';
    rankTitle = 'APEX VALKYRIE';
    rankSub = 'SUPREME SECTOR DOMINANCE';
  } else if (rankScore >= 28000 || wave >= 4) {
    rankClass = 'rank-a';
    rankLetter = 'A';
    rankTitle = 'PHANTOM VANGUARD';
    rankSub = 'HIGH-LETHALITY COMBAT EXECUTION';
  } else if (rankScore >= 10000 || wave >= 2) {
    rankClass = 'rank-b';
    rankLetter = 'B';
    rankTitle = 'STRIKE OPERATIVE';
    rankSub = 'SOLID TACTICAL INTERDICTION';
  }

  const rankCard = document.getElementById('goRankCard');
  if (rankCard) rankCard.className = `go-rank-card ${rankClass}`;
  const rankLetterEl = document.getElementById('goRankLetter');
  if (rankLetterEl) rankLetterEl.textContent = rankLetter;
  const rankTitleEl = document.getElementById('goRankTitle');
  if (rankTitleEl) rankTitleEl.textContent = rankTitle;
  const rankSubEl = document.getElementById('goRankSub');
  if (rankSubEl) rankSubEl.textContent = rankSub;

  // 3. Score & Record Sync Progress Bar
  document.getElementById('finalScore').textContent = score.toLocaleString();
  document.getElementById('bestScore').textContent = highScore.toLocaleString();
  const recPct = highScore > 0 ? Math.min(100, Math.round((score / highScore) * 100)) : 100;
  const recBar = document.getElementById('goRecordBar');
  if (recBar) recBar.style.width = `${recPct}%`;
  const recPctText = document.getElementById('goRecordPctText');
  if (recPctText) {
    recPctText.textContent = isNewRecord ? '100% (NEW RECORD!)' : `${recPct}%`;
    recPctText.style.color = isNewRecord ? '#ffe600' : '#00f0ff';
  }

  // 4. 6-Card Tactical Telemetry Grid
  document.getElementById('finalWave').textContent = wave;
  const curBiome = getActiveBiome(player.x, player.y);
  const biomeEl = document.getElementById('finalBiome');
  if (biomeEl && curBiome) {
    biomeEl.textContent = curBiome.shortName || curBiome.name;
    biomeEl.style.color = curBiome.color;
  }

  const playSec = Math.max(1, Math.round(runPlayFrames / 60));
  const kpm = ((totalKills / playSec) * 60).toFixed(1);
  document.getElementById('finalKills').textContent = totalKills.toLocaleString();
  const kpmEl = document.getElementById('finalKpm');
  if (kpmEl) kpmEl.textContent = `${kpm} KILLS / MIN`;

  const maxComboEl = document.getElementById('finalMaxCombo');
  if (maxComboEl) maxComboEl.textContent = `x${maxComboReached}`;
  const maxStreakEl = document.getElementById('finalMaxStreak');
  if (maxStreakEl) maxStreakEl.textContent = `MAX STREAK: ${maxStreakReached}`;

  const finalLvlEl = document.getElementById('finalLevel');
  if (finalLvlEl) finalLvlEl.textContent = `LVL ${player.level}`;
  const totalAugs = Object.values(player.perks || {}).reduce((sum, v) => sum + v, 0);
  const augCountEl = document.getElementById('finalAugCount');
  if (augCountEl) augCountEl.textContent = `${totalAugs} AUGMENT${totalAugs === 1 ? '' : 'S'} INSTALLED`;

  const parriesEl = document.getElementById('finalParries');
  if (parriesEl) parriesEl.textContent = totalParries;
  const contractsEl = document.getElementById('finalContracts');
  if (contractsEl) contractsEl.textContent = `CONTRACTS: ${totalContractsDone}`;

  const mins = String(Math.floor(playSec / 60)).padStart(2, '0');
  const secs = String(playSec % 60).padStart(2, '0');
  const timeEl = document.getElementById('finalTime');
  if (timeEl) timeEl.textContent = `${mins}:${secs}`;

  // 5. Installed Cyber-Augmentation Loadout Strip
  const perksListEl = document.getElementById('finalPerksList');
  if (perksListEl) {
    const installedEntries = Object.entries(player.perks || {}).filter(([, lvl]) => lvl > 0);
    if (installedEntries.length === 0) {
      perksListEl.innerHTML = `<span class="go-no-perks">NO EXTERNAL AUGMENTATIONS INSTALLED — BASE CHASSIS RUN</span>`;
    } else {
      perksListEl.innerHTML = installedEntries.map(([id, lvl]) => {
        const up = ALL_UPGRADES.find(u => u.id === id);
        if (!up) return '';
        return `
          <div class="go-perk-chip" style="--chip-color: ${up.color}">
            ${up.svg}
            <span>${up.title}</span>
            <span class="go-perk-lvl">LVL ${lvl}</span>
          </div>
        `;
      }).join('');
    }
  }

  document.getElementById('gameOverScreen').classList.remove('hidden');
}

