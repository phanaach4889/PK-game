// ============================================================================
// MODULE 04: ENEMY AI & 15 APEX MEGA-BOSSES
// ============================================================================
let nextEnemyId = 1;
class Enemy {
  constructor(type, x, y, forceElite = false) {
    this.id = nextEnemyId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.active = true;
    this.hitFlash = 0;
    this.angle = 0;
    this.hullRot = Math.random() * Math.PI * 2;
    this.recoil = 0;
    this.tier = 1;
    this.isElite = false;
    this.chronoSlowTimer = 0;

    const threatCfg = getThreatConfig();
    const waveScale = (1 + (wave - 1) * 0.22) * threatCfg.hpMult;
    const spdScale = threatCfg.speedMult;
    this.fireScale = threatCfg.fireMult;
    this.dmgScale = threatCfg.dmgMult;

    // TIER 1: HARDENED VANGUARD ENEMIES (Stronger & armed right from Sector 1!)
    if (type === 'drone_bit') {
      this.hp = 42 * waveScale;
      this.maxHp = this.hp;
      this.speed = (3.55 + Math.min(1.1, wave * 0.06)) * spdScale;
      this.radius = 12;
      this.color = '#38bdf8';
      this.scoreVal = 95;
      this.xpVal = 16;
      this.shotCooldown = Math.floor((75 + Math.random() * 35) / this.fireScale);
      this.tier = 1;
    } else if (type === 'scout') {
      this.hp = 60 * waveScale;
      this.maxHp = this.hp;
      this.speed = (4.25 + Math.min(1.5, wave * 0.08)) * spdScale;
      this.radius = 14;
      this.color = '#ff0077';
      this.scoreVal = 135;
      this.xpVal = 20;
      this.lungeCooldown = 70 + Math.floor(Math.random() * 35);
      this.lunging = 0;
      this.tier = 1;
    } else if (type === 'mini') {
      this.hp = 34 * waveScale;
      this.maxHp = this.hp;
      this.speed = 5.35 * spdScale;
      this.radius = 10;
      this.color = '#00ff88';
      this.scoreVal = 80;
      this.xpVal = 12;
      this.tier = 1;
    }
    // TIER 2: ASSAULT SKIRMISHERS
    else if (type === 'striker') {
      this.hp = 92 * waveScale;
      this.maxHp = this.hp;
      this.speed = 3.15 * spdScale;
      this.radius = 16;
      this.color = '#ff7b00';
      this.scoreVal = 210;
      this.xpVal = 28;
      this.shotCooldown = Math.floor((62 + Math.random() * 28) / this.fireScale);
      this.tier = 2;
    } else if (type === 'splitter') {
      this.hp = 140 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.85 * spdScale;
      this.radius = 22;
      this.color = '#00ff88';
      this.scoreVal = 310;
      this.xpVal = 36;
      this.shotCooldown = Math.floor((78 + Math.random() * 30) / this.fireScale);
      this.tier = 2;
    }
    // TIER 3: HEAVY ARMORED FLEET
    else if (type === 'cruiser') {
      this.hp = 200 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.3 * spdScale;
      this.radius = 24;
      this.color = '#ffe600';
      this.scoreVal = 380;
      this.xpVal = 46;
      this.shotCooldown = Math.floor((60 + Math.random() * 30) / this.fireScale);
      this.tier = 3;
    } else if (type === 'aegis') {
      this.hp = 235 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.15 * spdScale;
      this.radius = 23;
      this.color = '#00f0ff';
      this.scoreVal = 440;
      this.xpVal = 52;
      this.shotCooldown = Math.floor(78 / this.fireScale);
      this.tier = 3;
    }
    // TIER 4: SPEC-OPS HUNTERS
    else if (type === 'sniper') {
      this.hp = 128 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.75 * spdScale;
      this.radius = 17;
      this.color = '#00f0ff';
      this.scoreVal = 460;
      this.xpVal = 54;
      this.shotCooldown = Math.floor(88 / this.fireScale);
      this.aimAngle = 0;
      this.tier = 4;
    } else if (type === 'phantom') {
      this.hp = 175 * waveScale;
      this.maxHp = this.hp;
      this.speed = 3.55 * spdScale;
      this.radius = 18;
      this.color = '#a855f7';
      this.scoreVal = 520;
      this.xpVal = 62;
      this.shotCooldown = Math.floor(75 / this.fireScale);
      this.blinkCooldown = Math.floor(105 / this.fireScale);
      this.tier = 4;
    }
    // TIER 5: APEX WAR-MACHINES & VIP NEMESIS
    else if (type === 'weaver') {
      this.hp = 210 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.6 * spdScale;
      this.radius = 21;
      this.color = '#d946ef';
      this.scoreVal = 580;
      this.xpVal = 68;
      this.shotCooldown = Math.floor(68 / this.fireScale);
      this.tier = 5;
    } else if (type === 'juggernaut') {
      this.hp = 460 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.85 * spdScale;
      this.radius = 31;
      this.color = '#ff2a55';
      this.scoreVal = 950;
      this.xpVal = 115;
      this.shotCooldown = Math.floor(84 / this.fireScale);
      this.chargeCooldown = 145;
      this.charging = 0;
      this.tier = 5;
    } else if (type === 'nemesis') {
      this.hp = 420 * waveScale;
      this.maxHp = this.hp;
      this.speed = 3.45 * spdScale;
      this.radius = 25;
      this.color = '#ffe600';
      this.scoreVal = 2200;
      this.xpVal = 165;
      this.shotCooldown = Math.floor(52 / this.fireScale);
      this.dashTimer = 95;
      this.isElite = true;
      this.tier = 5;
    } else if (type === 'boss' || type === 'boss_seraphim') {
      this.isBoss = true;
      this.bossType = 'seraphim';
      this.bossName = 'OMEGA SERAPHIM DREADNOUGHT';
      this.bossSubtitle = 'DIVINE ARBITER // APEX CELESTIAL WAR-MECH';
      this.hp = 3600 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.65 * spdScale;
      this.radius = 62;
      this.color = '#9d4edd';
      this.scoreVal = 7500;
      this.xpVal = 480;
      this.shotCooldown = Math.floor(30 / this.fireScale);
      this.patternStep = 0;
      this.orbitalStrikeTimer = 220;
      this.tier = 6;
    } else if (type === 'boss_colossus') {
      this.isBoss = true;
      this.bossType = 'colossus';
      this.bossName = 'TITAN GOLIATH // SIEGE BATTLESHIP';
      this.bossSubtitle = 'IRON JUGGERNAUT // QUAD-VULCAN FORTRESS';
      this.hp = 4400 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.35 * spdScale;
      this.radius = 70;
      this.color = '#ff2a55';
      this.scoreVal = 8500;
      this.xpVal = 520;
      this.shotCooldown = Math.floor(16 / this.fireScale);
      this.patternStep = 0;
      this.shockwaveCooldown = 180;
      this.tier = 6;
    } else if (type === 'boss_leviathan') {
      this.isBoss = true;
      this.bossType = 'leviathan';
      this.bossName = 'VOID LEVIATHAN // APEX SINGULARITY';
      this.bossSubtitle = 'COSMIC HYDRA // EVENT HORIZON ENTITY';
      this.hp = 5000 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.85 * spdScale;
      this.radius = 66;
      this.color = '#d946ef';
      this.scoreVal = 9500;
      this.xpVal = 560;
      this.shotCooldown = Math.floor(28 / this.fireScale);
      this.patternStep = 0;
      this.vortexCooldown = 240;
      this.tier = 6;
    } else if (type === 'boss_architect') {
      this.isBoss = true;
      this.bossType = 'architect';
      this.bossName = 'KAIROS HYPER-CORE // AI CONSTRUCT';
      this.bossSubtitle = 'SENTIENT MAINFRAME // ROTATING TRIPWIRE MATRIX';
      this.hp = 5400 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.5 * spdScale;
      this.radius = 62;
      this.color = '#00f0ff';
      this.scoreVal = 11000;
      this.xpVal = 620;
      this.shotCooldown = Math.floor(20 / this.fireScale);
      this.patternStep = 0;
      this.laserGridAngle = 0;
      this.empCooldown = 220;
      this.tier = 6;
    } else if (type === 'boss_ignis') {
      this.isBoss = true;
      this.bossType = 'ignis';
      this.bossName = 'SOLAR VULCAN // PYROCLASTIC MEGATANK';
      this.bossSubtitle = 'HELLFIRE CITADEL // THERMAL INFERNO ENGINE';
      this.hp = 5200 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.38 * spdScale;
      this.radius = 68;
      this.color = '#ff6600';
      this.scoreVal = 9000;
      this.xpVal = 540;
      this.shotCooldown = Math.floor(14 / this.fireScale);
      this.patternStep = 0;
      this.mortarCooldown = 150;
      this.overheatWaveCooldown = 260;
      this.tier = 6;
    } else if (type === 'boss_tempest') {
      this.isBoss = true;
      this.bossType = 'tempest';
      this.bossName = 'ZEPHYR TEMPEST // THUNDERBIRD CARRIER';
      this.bossSubtitle = 'VOLTAIC HURRICANE // MACH-4 IONIC STRIKER';
      this.hp = 4200 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.25 * spdScale;
      this.radius = 58;
      this.color = '#38bdf8';
      this.scoreVal = 8800;
      this.xpVal = 510;
      this.shotCooldown = Math.floor(24 / this.fireScale);
      this.patternStep = 0;
      this.lightningStormTimer = 180;
      this.machDashTimer = 160;
      this.isMachDashing = 0;
      this.tier = 6;
    } else if (type === 'boss_chronos') {
      this.isBoss = true;
      this.bossType = 'chronos';
      this.bossName = 'OUROBOROS // CHRONO-LORD WEAVER';
      this.bossSubtitle = 'ETERNAL TEMPORAL ENTROPY // TIME MATRIX ARCHON';
      this.hp = 4800 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.5 * spdScale;
      this.radius = 64;
      this.color = '#eab308';
      this.scoreVal = 10500;
      this.xpVal = 580;
      this.shotCooldown = Math.floor(28 / this.fireScale);
      this.patternStep = 0;
      this.timeDilationTimer = 200;
      this.gearAngle = 0;
      this.hasRewound = false;
      this.tier = 6;
    } else if (type === 'boss_reaper') {
      this.isBoss = true;
      this.bossType = 'reaper';
      this.bossName = 'THANATOS // PHANTOM DREAD-STALKER';
      this.bossSubtitle = 'SPECTRAL HARVESTER // CLOAKED VOID ASSASSIN';
      this.hp = 3900 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.15 * spdScale;
      this.radius = 56;
      this.color = '#10b981';
      this.scoreVal = 9800;
      this.xpVal = 550;
      this.shotCooldown = Math.floor(26 / this.fireScale);
      this.patternStep = 0;
      this.stealthTimer = 180;
      this.isCloaked = false;
      this.cloakDuration = 0;
      this.scytheDashTimer = 130;
      this.tier = 6;
    } else if (type === 'boss_behemoth') {
      this.isBoss = true;
      this.bossType = 'behemoth';
      this.bossName = 'TERRA GORGON // CYBER-HYDRA DREDGER';
      this.bossSubtitle = 'TRI-CORE APEX EXCAVATOR // BIO-MECHANICAL GORGON';
      this.hp = 6200 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.25 * spdScale;
      this.radius = 72;
      this.color = '#84cc16';
      this.scoreVal = 12000;
      this.xpVal = 650;
      this.shotCooldown = Math.floor(18 / this.fireScale);
      this.patternStep = 0;
      this.acidVolleyTimer = 160;
      this.convergeTimer = 240;
      this.tier = 6;
    } else if (type === 'boss_pulsar') {
      this.isBoss = true;
      this.bossType = 'pulsar';
      this.bossName = 'ASTRON PULSAR // NEUTRON STAR CORE';
      this.bossSubtitle = 'COLLAPSED STELLAR ENGINE // RELATIVISTIC BEAM MATRIX';
      this.hp = 4600 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.45 * spdScale;
      this.radius = 60;
      this.color = '#f43f5e';
      this.scoreVal = 11500;
      this.xpVal = 630;
      this.shotCooldown = Math.floor(22 / this.fireScale);
      this.patternStep = 0;
      this.pulsarBeamAngle = 0;
      this.gammaBurstTimer = 260;
      this.gammaCharging = 0;
      this.tier = 6;
    } else if (type === 'boss_valkyrie_zero') {
      this.isBoss = true;
      this.bossType = 'valkyrie_zero';
      this.bossName = 'SHADOW VALKYRIE ZERO // ROGUE PROTOTYPE';
      this.bossSubtitle = 'CORRUPTED EXPERIMENTAL FIGHTER // SHADOW MIRROR';
      this.hp = 4300 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.4 * spdScale;
      this.radius = 52;
      this.color = '#e11d48';
      this.scoreVal = 13000;
      this.xpVal = 680;
      this.shotCooldown = Math.floor(16 / this.fireScale);
      this.patternStep = 0;
      this.shadowDashTimer = 110;
      this.shadowDashDuration = 0;
      this.mirrorOverdriveTimer = 300;
      this.tier = 6;
    } else if (type === 'boss_hivemind') {
      this.isBoss = true;
      this.bossType = 'hivemind';
      this.bossName = 'NEXUS OVERMIND // CARRIER MATRIX';
      this.bossSubtitle = 'AUTONOMOUS SWARM NEST // HEX-COMMAND MOTHERSHIP';
      this.hp = 5800 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.35 * spdScale;
      this.radius = 72;
      this.color = '#14b8a6';
      this.scoreVal = 12500;
      this.xpVal = 670;
      this.shotCooldown = Math.floor(25 / this.fireScale);
      this.patternStep = 0;
      this.droneSpawnTimer = 170;
      this.barrierTimer = 250;
      this.hexBarrierActive = 0;
      this.tier = 6;
    } else if (type === 'boss_banshee') {
      this.isBoss = true;
      this.bossType = 'banshee';
      this.bossName = 'SIREN BANSHEE // ACOUSTIC WARCRUISER';
      this.bossSubtitle = 'SUPER-SONIC DISRUPTION DREAD // DISCORD HARMONIC CORE';
      this.hp = 4500 * waveScale;
      this.maxHp = this.hp;
      this.speed = 2.05 * spdScale;
      this.radius = 60;
      this.color = '#8b5cf6';
      this.scoreVal = 10000;
      this.xpVal = 570;
      this.shotCooldown = Math.floor(20 / this.fireScale);
      this.patternStep = 0;
      this.sonicScreechTimer = 150;
      this.harmonicRingTimer = 220;
      this.tier = 6;
    } else if (type === 'boss_glacier') {
      this.isBoss = true;
      this.bossType = 'glacier';
      this.bossName = 'FROST JOTUNN // CRYO-AEGIS MONOLITH';
      this.bossSubtitle = 'ABSOLUTE ZERO DREADNOUGHT // CRYO-CRYSTALLINE CITADEL';
      this.hp = 6400 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.2 * spdScale;
      this.radius = 70;
      this.color = '#06b6d4';
      this.scoreVal = 13500;
      this.xpVal = 700;
      this.shotCooldown = Math.floor(26 / this.fireScale);
      this.patternStep = 0;
      this.cryoShards = 6;
      this.cryoShardAngle = 0;
      this.blizzardTimer = 200;
      this.shardRegenTimer = 280;
      this.tier = 6;
    } else if (type === 'boss_oblivion') {
      this.isBoss = true;
      this.bossType = 'oblivion';
      this.bossName = 'APEX OBLIVION // COSMIC DOOMSDAY SYSTEM';
      this.bossSubtitle = 'FINAL EXTINCTION PROTOCOL // OMNI-DEATH SINGULARITY';
      this.hp = 8800 * waveScale;
      this.maxHp = this.hp;
      this.speed = 1.6 * spdScale;
      this.radius = 78;
      this.color = '#ffffff';
      this.scoreVal = 25000;
      this.xpVal = 1200;
      this.shotCooldown = Math.floor(18 / this.fireScale);
      this.patternStep = 0;
      this.judgmentStrikeTimer = 150;
      this.doomsdayCollapseTimer = 300;
      this.celestialRingAngles = [0, 0, 0, 0];
      this.isCollapsing = 0;
      this.tier = 6;
    }

    // Overclocked Elite Variant Promotion (Active right from Sector 1!)
    const distFromCenter = Math.hypot(this.x - WORLD_W / 2, this.y - WORLD_H / 2);
    const outerBiomeBonus = distFromCenter > 1800 ? 0.10 : 0;
    const eliteChance = Math.min(0.55, threatCfg.eliteBonus + (wave - 1) * 0.045 + outerBiomeBonus);
    if (
      !this.isBoss &&
      type !== 'boss' &&
      type !== 'nemesis' &&
      type !== 'mini' &&
      (forceElite || Math.random() < eliteChance)
    ) {
      this.isElite = true;
      this.hp *= 1.75;
      this.maxHp = this.hp;
      this.radius = Math.round(this.radius * 1.16);
      this.speed *= 1.12;
      this.scoreVal = Math.round(this.scoreVal * 2.3);
      this.xpVal = Math.round(this.xpVal * 2.1);
    }
  }

  takeDamage(amount, isCrit = false) {
    if (!this.active) return;
    const critRoll = isCrit || Math.random() < 0.15;
    let finalDmg = critRoll ? amount * 1.5 : amount;

    // Chrono-Stasis Singularity Dome amplifies all damage taken by +50%!
    if (this.chronoSlowTimer > 0) {
      finalDmg *= 1.5;
    }

    // Aegis Phalanx Guardian front energy barrier absorbs 55% of non-crit damage
    if (this.type === 'aegis' && !isCrit) {
      finalDmg *= 0.45;
      spawnParticle(
        this.x + Math.cos(this.angle) * (this.radius + 6),
        this.y + Math.sin(this.angle) * (this.radius + 6),
        Math.cos(this.angle) * 3,
        Math.sin(this.angle) * 3,
        '#00f0ff',
        10,
        2.6
      );
    }

    // Titan Goliath heavy front armor plating absorbs 50% of frontal non-crit damage
    if (this.bossType === 'colossus' && !isCrit) {
      const hitAngle = Math.atan2(player.y - this.y, player.x - this.x);
      const angleDiff = Math.abs(Math.atan2(Math.sin(hitAngle - this.angle), Math.cos(hitAngle - this.angle)));
      if (angleDiff < 0.9) {
        finalDmg *= 0.5;
        spawnParticle(this.x + Math.cos(this.angle) * this.radius, this.y + Math.sin(this.angle) * this.radius, 0, 0, '#ffe600', 8, 2.5);
      }
    }

    // Frost Jotunn Cryo-Shard Mirror Shielding
    if (this.bossType === 'glacier' && this.cryoShards > 0 && !isCrit) {
      this.cryoShards--;
      finalDmg *= 0.4;
      spawnParticle(this.x + Math.cos(this.cryoShardAngle || 0) * 55, this.y + Math.sin(this.cryoShardAngle || 0) * 55, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, '#06b6d4', 14, 3.2);
      spawnFloatingText(this.x, this.y - this.radius, 'CRYO SHARD ABSORB', '#06b6d4', 1.05);
    }

    // Thanatos Optical Camouflage Evasion
    if (this.bossType === 'reaper' && this.isCloaked && Math.random() < 0.55) {
      spawnFloatingText(this.x, this.y - 25, 'PHANTOM EVADE', '#10b981', 1.15);
      spawnParticle(this.x, this.y, 0, 0, '#10b981', 10, 2.5);
      return;
    }

    // Nexus Overmind Hex Barrier Forcefield
    if (this.bossType === 'hivemind' && this.hexBarrierActive > 0) {
      finalDmg *= 0.28;
      spawnParticle(this.x, this.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, '#14b8a6', 12, 3);
      spawnFloatingText(this.x, this.y - this.radius, 'HEX BARRIER DEFLECT', '#14b8a6', 1.0);
    }

    // Ouroboros Chrono Paradox Rewind (Heals 22% once below 38% HP)
    if (this.bossType === 'chronos' && !this.hasRewound && (this.hp - finalDmg < this.maxHp * 0.38)) {
      this.hasRewound = true;
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.22);
      sound.chronoField(true);
      screenShake = Math.max(screenShake, 18);
      chromaticFlash = Math.max(chromaticFlash, 14);
      addGridRipple(this.x, this.y, 480, -36, '#eab308');
      spawnFloatingText(this.x, this.y - 45, '// CHRONO PARADOX REWIND //', '#eab308', 1.4);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        spawnParticle(this.x, this.y, Math.cos(a) * 6, Math.sin(a) * 6, '#eab308', 22, 3.8);
      }
      return;
    }

    this.hp -= finalDmg;
    this.hitFlash = 4;
    if (typeof player !== 'undefined' && player) {
      player.reticleHitTimer = Math.max(player.reticleHitTimer || 0, critRoll ? 9 : 5);
      player.reticleHitCrit = critRoll;
    }

    if (critRoll || finalDmg >= 40 || Math.random() < 0.35) {
      spawnFloatingText(
        this.x + (Math.random() - 0.5) * 16,
        this.y - this.radius,
        Math.round(finalDmg) + (critRoll ? '!' : ''),
        critRoll ? '#ffe600' : (this.chronoSlowTimer > 0 ? '#f0abfc' : (this.type === 'aegis' && !isCrit ? '#00f0ff' : '#ffffff')),
        critRoll ? 1.2 : 0.9
      );
    }

    if (Math.random() < 0.5) {
      spawnParticle(this.x, this.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, '#ffffff', 9, 2);
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.active = false;
    totalKills++;
    if (typeof player !== 'undefined' && player) {
      player.reticleKillTimer = 15;
    }
    if (typeof recordContractAction === 'function') {
      recordContractAction('kill', 1, this.type);
    }

    const isBoss = this.isBoss || this.type === 'boss';
    const isNemesis = this.type === 'nemesis';
    const isHeavy = isBoss || isNemesis || this.type === 'juggernaut' || this.isElite;
    sound.explosion(isBoss || isNemesis);
    screenShake = Math.max(screenShake, isBoss ? 28 : (isNemesis ? 22 : (isHeavy ? 13 : 7)));
    if (isBoss) {
      hitStopFrames = this.bossType === 'oblivion' ? 12 : 6;
      chromaticFlash = this.bossType === 'oblivion' ? 26 : 16;
      if (this.bossType === 'oblivion') {
        screenShake = Math.max(screenShake, 42);
        addGridRipple(this.x, this.y, 850, 75, '#ffffff');
      }
      announce(`// ${this.bossName || 'OMEGA APEX BOSS'} OBLITERATED //`, '#ffe600');
    } else if (isNemesis) {
      hitStopFrames = 4;
      chromaticFlash = 12;
      player.frenzyTimer = Math.max(player.frenzyTimer, 420);
      shards.push(new DataShard(this.x, this.y, 0, 'heal'));
      shards.push(new DataShard(this.x, this.y, 0, 'overdrive'));
      announce('// CRIMSON NEMESIS VIP TERMINATED — 7s HYPER-FRENZY //', '#ffe600');
    } else if (this.type === 'juggernaut') {
      announce('// COLOSSUS JUGGERNAUT DESTROYED //', '#ff2a55');
    }

    if (isHeavy || gridRipples.length < 3) {
      addGridRipple(this.x, this.y, isBoss ? 480 : (isHeavy ? 240 : 130), isBoss ? 45 : 18, this.color);
    }

    score += this.scoreVal * combo;
    player.overdrive = Math.min(100, player.overdrive + (isBoss ? 40 : (isNemesis ? 35 : (this.isElite ? 9 : 4.5))));

    // Spawn collectible XP Data Shards (merge if too many shards on screen)
    const shardCount = isBoss ? 10 : (isNemesis ? 7 : (this.type === 'juggernaut' ? 4 : (this.isElite ? 2 : 1)));
    for (let s = 0; s < shardCount; s++) {
      if (shards.length >= 65) {
        const existing = shards.find(sh => sh.active && sh.type === 'xp');
        if (existing) {
          existing.val += this.xpVal / shardCount;
          continue;
        }
      }
      shards.push(new DataShard(this.x, this.y, this.xpVal / shardCount, 'xp'));
    }

    // Chance for tactical power-up drop (higher for Elites & Juggernauts)
    const roll = Math.random();
    const dropBoost = (this.isElite || this.type === 'juggernaut') ? 2.2 : 1.0;
    if (isBoss || roll < 0.045 * dropBoost) {
      shards.push(new DataShard(this.x, this.y, 0, 'heal'));
    } else if (roll < 0.075 * dropBoost) {
      shards.push(new DataShard(this.x, this.y, 0, 'overdrive'));
    } else if (roll < 0.09 * dropBoost) {
      shards.push(new DataShard(this.x, this.y, 0, 'magnet'));
    }

    // Splitter spawns 4 mini drones on death (5 if Elite!)
    if (this.type === 'splitter') {
      const miniCnt = this.isElite ? 5 : 4;
      for (let m = 0; m < miniCnt; m++) {
        const ang = this.hullRot + (m * Math.PI * 2) / miniCnt;
        enemies.push(new Enemy('mini', this.x + Math.cos(ang) * 18, this.y + Math.sin(ang) * 18));
      }
    }

    // Nanites heal check
    if (player.naniteLevel > 0 && Math.random() < 0.28) {
      player.hp = Math.min(player.maxHp, player.hp + 4);
    }

    // Death blast particles (capped via spawnParticle)
    const pCount = isBoss ? 45 : (isHeavy ? 18 : 11);
    for (let i = 0; i < pCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * (isBoss ? 12 : 7.5) + 1;
      spawnParticle(this.x, this.y, Math.cos(a) * sp, Math.sin(a) * sp, this.color, 24, isBoss ? 4.5 : 3.2);
    }

    comboCounter++;
    combo = Math.min(12, 1 + Math.floor(comboCounter / 4));
    comboTimer = 210;
    if (combo > maxComboReached) maxComboReached = combo;
    if (comboCounter > maxStreakReached) maxStreakReached = comboCounter;

    if (comboCounter === 10) announce('// 10x KILLSTREAK — RAMPAGE //', '#00f0ff');
    else if (comboCounter === 25) announce('// 25x KILLSTREAK — CYBER GOD //', '#ff0077');
    else if (comboCounter === 50) announce('// 50x KILLSTREAK — UNSTOPPABLE //', '#ffe600');
  }

  update() {
    const chronoMult = this.chronoSlowTimer > 0 ? 0.18 : 1.0;
    if (this.chronoSlowTimer > 0) this.chronoSlowTimer--;
    const timeScale = (player.overdriveActive > 0 ? 0.65 : 1.0) * chronoMult;
    const cdTick = chronoMult;

    // Phantom Decoy Clone Taunt: non-boss enemies within 460px target the holographic clone!
    let targetX = player.x;
    let targetY = player.y;
    if (typeof phantomDecoys !== 'undefined' && phantomDecoys.length > 0 && this.type !== 'boss') {
      for (let d = 0; d < phantomDecoys.length; d++) {
        const dec = phantomDecoys[d];
        if (dec.active && Math.hypot(dec.x - this.x, dec.y - this.y) < 460) {
          targetX = dec.x;
          targetY = dec.y;
          break;
        }
      }
    }

    const dxT = targetX - this.x;
    const dyT = targetY - this.y;
    const distToTarget = Math.hypot(dxT, dyT);
    const dxP = player.x - this.x;
    const dyP = player.y - this.y;
    this.angle = Math.atan2(dyT, dxT);
    this.hullRot += 0.028 * timeScale;
    if (this.recoil > 0) this.recoil *= 0.82;
    const distToPlayer = Math.hypot(dxP, dyP);

    if (this.type === 'drone_bit') {
      // Aggressive sine-wave swarm + plasma micro-pulse fire
      const weave = this.angle + Math.sin(frameCount * 0.08 + this.id) * 0.36;
      this.x += Math.cos(weave) * this.speed * timeScale;
      this.y += Math.sin(weave) * this.speed * timeScale;
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0 && distToTarget < 470) {
        this.shotCooldown = Math.floor(88 / this.fireScale);
        enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#38bdf8', 6.4, 11 * this.dmgScale));
      }
    } else if (this.type === 'scout') {
      // Predator Interceptor: bursts into a high-speed afterburner lunge + razor dart!
      this.lungeCooldown -= cdTick;
      if (this.lungeCooldown <= 0 && distToTarget < 310) {
        this.lungeCooldown = Math.floor(85 / this.fireScale);
        this.lunging = 18;
        enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ff0077', 7.8, 12 * this.dmgScale));
      }
      const lungeMult = this.lunging > 0 ? 1.95 : 1.0;
      if (this.lunging > 0) this.lunging--;
      this.x += Math.cos(this.angle) * this.speed * lungeMult * timeScale;
      this.y += Math.sin(this.angle) * this.speed * lungeMult * timeScale;
    } else if (this.type === 'striker') {
      // Assault Skirmisher: strafes at midrange & fires twin angled plasma bolts (3-way if Elite)
      const moveAng = distToTarget < 250 ? this.angle + Math.PI * 0.4 : this.angle;
      this.x += Math.cos(moveAng) * this.speed * timeScale;
      this.y += Math.sin(moveAng) * this.speed * timeScale;
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0) {
        this.shotCooldown = Math.floor(72 / this.fireScale);
        this.recoil = 4.5;
        enemyProjectiles.push(new Projectile(this.x, this.y, this.angle - 0.11, '#ff7b00', 7.2, 13 * this.dmgScale));
        enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + 0.11, '#ff7b00', 7.2, 13 * this.dmgScale));
        if (this.isElite) {
          enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ffe600', 7.8, 14 * this.dmgScale));
        }
      }
    } else if (this.type === 'splitter') {
      // Hydra Carrier: advances steadily while lobbing bio-plasma orbs
      this.x += Math.cos(this.angle) * this.speed * timeScale;
      this.y += Math.sin(this.angle) * this.speed * timeScale;
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0 && distToTarget < 520) {
        this.shotCooldown = Math.floor(82 / this.fireScale);
        enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#00ff88', 6.4, 13 * this.dmgScale));
      }
    } else if (this.type === 'aegis') {
      // Shielded Phalanx Guardian: steady advance + 3-bolt cyan phalanx arc
      this.x += Math.cos(this.angle) * this.speed * timeScale;
      this.y += Math.sin(this.angle) * this.speed * timeScale;
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0) {
        this.shotCooldown = Math.floor(82 / this.fireScale);
        this.recoil = 4.5;
        for (let k = -1; k <= 1; k++) {
          enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + k * 0.16, '#00f0ff', 6.8, 14 * this.dmgScale));
        }
      }
    } else if (this.type === 'sniper') {
      // Keep distance and telegraph high-velocity rail shot
      if (distToTarget > 360) {
        this.x += Math.cos(this.angle) * this.speed * timeScale;
        this.y += Math.sin(this.angle) * this.speed * timeScale;
      } else if (distToTarget < 240) {
        this.x -= Math.cos(this.angle) * this.speed * 0.85 * timeScale;
        this.y -= Math.sin(this.angle) * this.speed * 0.85 * timeScale;
      }
      this.shotCooldown -= cdTick;
      if (this.shotCooldown > 22) {
        this.aimAngle = this.angle;
      } else if (this.shotCooldown <= 0) {
        this.shotCooldown = Math.floor(92 / this.fireScale);
        this.recoil = 6;
        enemyProjectiles.push(new Projectile(this.x + Math.cos(this.aimAngle) * 20, this.y + Math.sin(this.aimAngle) * 20, this.aimAngle, '#ff0055', 16.0, 22 * this.dmgScale));
        if (this.isElite) {
          enemyProjectiles.push(new Projectile(this.x + Math.cos(this.aimAngle) * 20, this.y + Math.sin(this.aimAngle) * 20, this.aimAngle - 0.12, '#ff0055', 15.0, 18 * this.dmgScale));
          enemyProjectiles.push(new Projectile(this.x + Math.cos(this.aimAngle) * 20, this.y + Math.sin(this.aimAngle) * 20, this.aimAngle + 0.12, '#ff0055', 15.0, 18 * this.dmgScale));
        }
      }
    } else if (this.type === 'phantom') {
      // Phase-Stalker: phase-blinks toward player flank & fires 8-way shuriken ring
      this.x += Math.cos(this.angle) * this.speed * timeScale;
      this.y += Math.sin(this.angle) * this.speed * timeScale;
      this.blinkCooldown -= cdTick;
      if (this.blinkCooldown <= 0 && distToTarget > 140 && distToTarget < 600) {
        this.blinkCooldown = Math.floor(105 / this.fireScale);
        const oldX = this.x;
        const oldY = this.y;
        const blinkAng = this.angle + (Math.random() < 0.5 ? 0.52 : -0.52);
        this.x = Math.max(60, Math.min(WORLD_W - 60, this.x + Math.cos(blinkAng) * 145));
        this.y = Math.max(60, Math.min(WORLD_H - 60, this.y + Math.sin(blinkAng) * 145));
        lightningBolts.push({ x1: oldX, y1: oldY, x2: this.x, y2: this.y, color: '#a855f7', life: 10 });
        for (let k = 0; k < 8; k++) {
          enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + (k * Math.PI) / 4, '#a855f7', 7.0, 15 * this.dmgScale));
        }
      }
    } else if (this.type === 'weaver') {
      // Orbiting strafe movement + 5-way psionic crescent waves
      const strafeAngle = this.angle + (distToTarget < 270 ? Math.PI * 0.44 : Math.PI * 0.2);
      this.x += Math.cos(strafeAngle) * this.speed * timeScale;
      this.y += Math.sin(strafeAngle) * this.speed * timeScale;
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0) {
        this.shotCooldown = Math.floor(68 / this.fireScale);
        for (let k = -2; k <= 2; k++) {
          enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + k * 0.2, '#d946ef', 7.0, 16 * this.dmgScale));
        }
      }
    } else if (this.type === 'juggernaut') {
      // Colossus Siege Juggernaut: ferocious thruster charge + 12-way magma nova
      this.chargeCooldown -= cdTick;
      if (this.chargeCooldown <= 0 && distToTarget < 520) {
        this.chargeCooldown = 145;
        this.charging = 32;
      }
      const mult = this.charging > 0 ? 2.9 : 1.0;
      if (this.charging > 0) this.charging--;
      this.x += Math.cos(this.angle) * this.speed * mult * timeScale;
      this.y += Math.sin(this.angle) * this.speed * mult * timeScale;

      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0) {
        this.shotCooldown = Math.floor(84 / this.fireScale);
        this.recoil = 6;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          enemyProjectiles.push(new Projectile(this.x, this.y, a + this.hullRot, '#ff2a55', 6.4, 18 * this.dmgScale));
        }
      }
    } else if (this.type === 'nemesis') {
      // VIP Crimson Nemesis Gunship: high-speed orbit + lateral phase-dash + 5-way golden salvo
      const orbitAng = this.angle + (distToTarget < 280 ? Math.PI * 0.52 : Math.PI * 0.26);
      this.x += Math.cos(orbitAng) * this.speed * timeScale;
      this.y += Math.sin(orbitAng) * this.speed * timeScale;
      this.dashTimer -= cdTick;
      if (this.dashTimer <= 0) {
        this.dashTimer = 85;
        const sideAng = this.angle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
        this.x = Math.max(80, Math.min(WORLD_W - 80, this.x + Math.cos(sideAng) * 110));
        this.y = Math.max(80, Math.min(WORLD_H - 80, this.y + Math.sin(sideAng) * 110));
        addGridRipple(this.x, this.y, 180, 18, '#ffe600');
      }
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0) {
        this.shotCooldown = Math.floor(52 / this.fireScale);
        this.recoil = 5;
        for (let k = -2; k <= 2; k++) {
          enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + k * 0.15, k % 2 === 0 ? '#ffe600' : '#ff0055', 8.2, 16 * this.dmgScale));
        }
      }
    } else {
      this.x += Math.cos(this.angle) * this.speed * timeScale;
      this.y += Math.sin(this.angle) * this.speed * timeScale;
    }

    if (!this.isBoss && this.type !== 'boss') {
      resolveBuildingCollision(this, this.radius);
    }

    // Soft separation so enemies don't clump on the exact same pixel
    if (!this.isBoss && this.type !== 'boss') {
      for (let i = 0; i < enemies.length; i++) {
        const other = enemies[i];
        if (other === this || !other.active) continue;
        const sx = this.x - other.x;
        const sy = this.y - other.y;
        const minSep = this.radius + other.radius;
        if (Math.abs(sx) < minSep && Math.abs(sy) < minSep) {
          const dSq = sx * sx + sy * sy;
          if (dSq > 0.1 && dSq < minSep * minSep) {
            const d = Math.sqrt(dSq);
            const push = (minSep - d) * 0.08;
            this.x += (sx / d) * push;
            this.y += (sy / d) * push;
          }
        }
      }
    }

    // Multi-Apex Boss Special Abilities & Attacks
    if (this.isBoss || this.type === 'boss') {
      const enraged = this.hp < this.maxHp * 0.55;

      // 1. Titan Colossus: Seismic Shockwaves & Rocket Pods
      if (this.bossType === 'colossus') {
        if (this.shockwaveCooldown) this.shockwaveCooldown--;
        if (this.shockwaveCooldown <= 0) {
          this.shockwaveCooldown = enraged ? 120 : 180;
          sound.explosion(true);
          screenShake = Math.max(screenShake, 18);
          addGridRipple(this.x, this.y, 440, 36, '#ff2a55');
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
            enemyProjectiles.push(new Projectile(this.x, this.y, a, '#ff7b00', 7.2, 20 * this.dmgScale));
          }
          spawnFloatingText(this.x, this.y - 45, '// SEISMIC QUAKE SLAM //', '#ff2a55', 1.3);
        }
      }

      // 2. Void Leviathan: Event Horizon Singularity & Dimensional Rifts
      else if (this.bossType === 'leviathan') {
        if (this.vortexCooldown) this.vortexCooldown--;
        if (this.vortexCooldown <= 0) {
          this.vortexCooldown = enraged ? 180 : 250;
          if (typeof spatialRifts !== 'undefined') {
            spatialRifts.push(new SpatialRift(player.x, player.y, 0, 150, true, '#d946ef'));
            sound.parryDeflect();
            spawnFloatingText(this.x, this.y - 45, '// EVENT HORIZON SINGULARITY //', '#d946ef', 1.3);
          }
        }
      }

      // 3. Kairos Architect: Rotating Laser Tripwires & Nanite EMP Disruption
      else if (this.bossType === 'architect') {
        this.laserGridAngle = (this.laserGridAngle || 0) + (enraged ? 0.024 : 0.015);
        if (this.empCooldown) this.empCooldown--;
        if (this.empCooldown <= 0) {
          this.empCooldown = enraged ? 160 : 220;
          sound.dash();
          addGridRipple(this.x, this.y, 420, 38, '#00f0ff');
          screenShake = Math.max(screenShake, 14);
          spawnFloatingText(this.x, this.y - 45, '// NANITE EMP DISRUPTION //', '#00f0ff', 1.3);
          if (distToPlayer < 420) {
            player.takeDamage(24 * this.dmgScale);
            player.vx += Math.cos(this.angle) * 14;
            player.vy += Math.sin(this.angle) * 14;
          }
        }
      }

      // 4. Solar Vulcan: Magma Mortars & Thermal Inferno Overheat
      else if (this.bossType === 'ignis') {
        if (this.mortarCooldown) this.mortarCooldown--;
        if (this.mortarCooldown <= 0) {
          this.mortarCooldown = enraged ? 100 : 150;
          sound.explosion(false);
          screenShake = Math.max(screenShake, 14);
          addGridRipple(player.x, player.y, 280, 26, '#ff6600');
          spawnFloatingText(this.x, this.y - 45, '// PYROCLASTIC MORTAR BARRAGE //', '#ff6600', 1.3);
          for (let m = 0; m < 8; m++) {
            const a = (m * Math.PI) / 4;
            enemyProjectiles.push(new Projectile(player.x + (Math.random() - 0.5) * 80, player.y + (Math.random() - 0.5) * 80, a, '#ff3300', 4.5, 18 * this.dmgScale));
          }
        }
        if (this.overheatWaveCooldown) this.overheatWaveCooldown--;
        if (this.overheatWaveCooldown <= 0) {
          this.overheatWaveCooldown = enraged ? 170 : 250;
          sound.explosion(true);
          screenShake = Math.max(screenShake, 20);
          addGridRipple(this.x, this.y, 500, 42, '#ff6600');
          spawnFloatingText(this.x, this.y - 45, '// THERMAL INFERNO OVERHEAT //', '#ff7b00', 1.4);
          if (distToPlayer < 450) {
            player.takeDamage(22 * this.dmgScale);
            player.vx += Math.cos(this.angle) * 16;
            player.vy += Math.sin(this.angle) * 16;
          }
        }
      }

      // 5. Zephyr Tempest: Tesla Chain Lightning Storm & Mach-4 Ram Dash
      else if (this.bossType === 'tempest') {
        if (this.lightningStormTimer) this.lightningStormTimer--;
        if (this.lightningStormTimer <= 0) {
          this.lightningStormTimer = enraged ? 110 : 170;
          sound.ionBeam();
          screenShake = Math.max(screenShake, 16);
          spawnFloatingText(this.x, this.y - 45, '// TESLA CHAIN LIGHTNING STORM //', '#38bdf8', 1.35);
          for (let l = 0; l < 3; l++) {
            const lx = player.x + (Math.random() - 0.5) * 120;
            const ly = player.y + (Math.random() - 0.5) * 120;
            lightningBolts.push({ x1: lx, y1: ly - 500, x2: lx, y2: ly, color: '#38bdf8', life: 14 });
          }
          player.takeDamage(22 * this.dmgScale);
          addGridRipple(player.x, player.y, 240, 25, '#38bdf8');
        }
        if (this.machDashTimer) this.machDashTimer--;
        if (this.machDashTimer <= 0) {
          this.machDashTimer = enraged ? 120 : 170;
          this.isMachDashing = 20;
          sound.dash();
          screenShake = Math.max(screenShake, 15);
          spawnFloatingText(this.x, this.y - 45, '// MACH-4 IONIC RAM DASH //', '#00f0ff', 1.3);
        }
        if (this.isMachDashing > 0) {
          this.isMachDashing--;
          this.x += Math.cos(this.angle) * 14 * spdScale;
          this.y += Math.sin(this.angle) * 14 * spdScale;
          spawnParticle(this.x, this.y, 0, 0, '#38bdf8', 14, 3.5);
          if (distToPlayer < this.radius + player.radius + 15) {
            player.takeDamage(26 * this.dmgScale);
            player.vx += Math.cos(this.angle) * 18;
            player.vy += Math.sin(this.angle) * 18;
          }
        }
      }

      // 6. Ouroboros: Chrono Stasis Distortion
      else if (this.bossType === 'chronos') {
        this.gearAngle = (this.gearAngle || 0) + (enraged ? 0.035 : 0.02);
        if (this.timeDilationTimer) this.timeDilationTimer--;
        if (this.timeDilationTimer <= 0) {
          this.timeDilationTimer = enraged ? 140 : 200;
          sound.chronoField(false);
          screenShake = Math.max(screenShake, 12);
          addGridRipple(this.x, this.y, 420, -32, '#eab308');
          spawnFloatingText(this.x, this.y - 45, '// TEMPORAL STASIS DISTORTION //', '#eab308', 1.35);
          if (distToPlayer < 420) {
            player.slowTimer = 90;
            spawnFloatingText(player.x, player.y - 25, 'TIME DILATED (-38% SPD)', '#f0abfc', 1.15);
          }
        }
      }

      // 7. Thanatos: Optical Camouflage & Grim Scythe Cleaves
      else if (this.bossType === 'reaper') {
        if (this.cloakDuration > 0) {
          this.cloakDuration--;
          if (this.cloakDuration === 0) {
            this.isCloaked = false;
            sound.katanaSlash();
            spawnFloatingText(this.x, this.y - 45, '// UNCLOAK SURPRISE STRIKE //', '#10b981', 1.35);
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
              enemyProjectiles.push(new Projectile(this.x, this.y, a, '#10b981', 8.2, 17 * this.dmgScale));
            }
          }
        } else {
          if (this.stealthTimer) this.stealthTimer--;
          if (this.stealthTimer <= 0) {
            this.stealthTimer = enraged ? 140 : 190;
            this.isCloaked = true;
            this.cloakDuration = 80;
            sound.dash();
            spawnFloatingText(this.x, this.y - 45, '// OPTICAL STEALTH CLOAK //', '#10b981', 1.3);
            addGridRipple(this.x, this.y, 300, 20, '#10b981');
          }
        }
        if (this.scytheDashTimer) this.scytheDashTimer--;
        if (this.scytheDashTimer <= 0) {
          this.scytheDashTimer = enraged ? 100 : 150;
          sound.katanaSlash();
          const toP = Math.atan2(player.y - this.y, player.x - this.x);
          this.vx = Math.cos(toP) * 12;
          this.vy = Math.sin(toP) * 12;
          spawnFloatingText(this.x, this.y - 45, '// GRIM SCYTHE CLEAVE //', '#10b981', 1.25);
          for (let s = -0.5; s <= 0.5; s += 0.25) {
            enemyProjectiles.push(new Projectile(this.x, this.y, toP + s, '#10b981', 9.5, 19 * this.dmgScale));
          }
        }
      }

      // 8. Terra Gorgon: Hydra Acid Volley & Tri-Core Convergence
      else if (this.bossType === 'behemoth') {
        if (this.acidVolleyTimer) this.acidVolleyTimer--;
        if (this.acidVolleyTimer <= 0) {
          this.acidVolleyTimer = enraged ? 110 : 160;
          sound.explosion(false);
          screenShake = Math.max(screenShake, 14);
          spawnFloatingText(this.x, this.y - 45, '// HYDRA ACIDIC VOLLEY //', '#84cc16', 1.35);
          for (let h = -1; h <= 1; h++) {
            const headAng = this.angle + h * 0.45;
            const hx = this.x + Math.cos(headAng) * 45;
            const hy = this.y + Math.sin(headAng) * 45;
            const targetAng = Math.atan2(player.y - hy, player.x - hx);
            for (let b = -0.2; b <= 0.2; b += 0.2) {
              enemyProjectiles.push(new Projectile(hx, hy, targetAng + b, '#84cc16', 7.5, 18 * this.dmgScale));
            }
          }
        }
        if (this.convergeTimer) this.convergeTimer--;
        if (this.convergeTimer <= 0) {
          this.convergeTimer = enraged ? 170 : 240;
          sound.ionBeam();
          screenShake = Math.max(screenShake, 16);
          addGridRipple(this.x, this.y, 440, 34, '#84cc16');
          spawnFloatingText(this.x, this.y - 45, '// TRI-CORE BEAM CONVERGENCE //', '#84cc16', 1.4);
          for (let c = -0.3; c <= 0.3; c += 0.3) {
            enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + c, '#a3e635', 13.5, 24 * this.dmgScale));
          }
        }
      }

      // 9. Astron Pulsar: Relativistic Pole Beams & Gamma-Ray Burst
      else if (this.bossType === 'pulsar') {
        this.pulsarBeamAngle = (this.pulsarBeamAngle || 0) + (enraged ? 0.03 : 0.018);
        const pAng1 = this.pulsarBeamAngle;
        const pAng2 = this.pulsarBeamAngle + Math.PI;
        [pAng1, pAng2].forEach(pAng => {
          const toP = Math.atan2(player.y - this.y, player.x - this.x);
          const aDiff = Math.abs(Math.atan2(Math.sin(toP - pAng), Math.cos(toP - pAng)));
          if (aDiff < 0.12 && distToPlayer < 480) {
            player.takeDamage(12 * this.dmgScale);
            spawnParticle(player.x, player.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, '#f43f5e', 8, 2);
          }
        });
        if (this.gammaBurstTimer) this.gammaBurstTimer--;
        if (this.gammaBurstTimer <= 0) {
          this.gammaBurstTimer = enraged ? 180 : 260;
          sound.ionBeam();
          screenShake = Math.max(screenShake, 22);
          chromaticFlash = Math.max(chromaticFlash, 15);
          addGridRipple(this.x, this.y, 500, 48, '#f43f5e');
          spawnFloatingText(this.x, this.y - 45, '// GAMMA-RAY BURST //', '#f43f5e', 1.4);
          for (let a = -0.28; a <= 0.28; a += 0.07) {
            enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + a, '#f43f5e', 15.0, 25 * this.dmgScale));
          }
        }
      }

      // 10. Shadow Valkyrie Zero: Katana Flash Dash & Mirror Overdrive
      else if (this.bossType === 'valkyrie_zero') {
        if (this.shadowDashTimer) this.shadowDashTimer--;
        if (this.shadowDashTimer <= 0) {
          this.shadowDashTimer = enraged ? 80 : 120;
          sound.dash();
          sound.katanaSlash();
          const toP = Math.atan2(player.y - this.y, player.x - this.x);
          this.x += Math.cos(toP) * 110;
          this.y += Math.sin(toP) * 110;
          screenShake = Math.max(screenShake, 14);
          addGridRipple(this.x, this.y, 280, 28, '#e11d48');
          spawnFloatingText(this.x, this.y - 45, '// SHADOW KATANA FLASH DASH //', '#e11d48', 1.3);
          for (let a = -0.4; a <= 0.4; a += 0.2) {
            enemyProjectiles.push(new Projectile(this.x, this.y, toP + a, '#e11d48', 11.5, 20 * this.dmgScale));
          }
        }
        if (this.mirrorOverdriveTimer) this.mirrorOverdriveTimer--;
        if (this.mirrorOverdriveTimer <= 0) {
          this.mirrorOverdriveTimer = enraged ? 200 : 290;
          sound.overdrive();
          screenShake = Math.max(screenShake, 20);
          chromaticFlash = Math.max(chromaticFlash, 14);
          addGridRipple(this.x, this.y, 550, 45, '#e11d48');
          spawnFloatingText(this.x, this.y - 45, '// OVERDRIVE MIRROR PROTOCOL //', '#ffe600', 1.4);
          for (let i = 0; i < 14; i++) {
            const mAng = (i * Math.PI * 2) / 14;
            enemyProjectiles.push(new Projectile(this.x, this.y, mAng, '#e11d48', 9.0, 18 * this.dmgScale));
          }
        }
      }

      // 11. Nexus Overmind: Hex-Barrier & Swarm Drone Carrier
      else if (this.bossType === 'hivemind') {
        if (this.hexBarrierActive > 0) this.hexBarrierActive--;
        if (this.barrierTimer) this.barrierTimer--;
        if (this.barrierTimer <= 0) {
          this.barrierTimer = enraged ? 180 : 250;
          this.hexBarrierActive = 100;
          sound.parryDeflect();
          addGridRipple(this.x, this.y, 360, 32, '#14b8a6');
          spawnFloatingText(this.x, this.y - 45, '// HEX-BARRIER OVERCHARGE //', '#14b8a6', 1.35);
        }
        if (this.droneSpawnTimer) this.droneSpawnTimer--;
        if (this.droneSpawnTimer <= 0) {
          this.droneSpawnTimer = enraged ? 120 : 170;
          sound.dash();
          spawnFloatingText(this.x, this.y - 45, '// AUTONOMOUS DRONE LAUNCH //', '#14b8a6', 1.3);
          if (enemies.length < 45) {
            for (let d = 0; d < 3; d++) {
              const da = (d * Math.PI * 2) / 3;
              const drone = new Enemy('drone_bit', this.x + Math.cos(da) * 55, this.y + Math.sin(da) * 55);
              enemies.push(drone);
            }
          }
        }
      }

      // 12. Siren Banshee: Supersonic Screech Blast
      else if (this.bossType === 'banshee') {
        if (this.sonicScreechTimer) this.sonicScreechTimer--;
        if (this.sonicScreechTimer <= 0) {
          this.sonicScreechTimer = enraged ? 110 : 160;
          sound.ionBeam();
          screenShake = Math.max(screenShake, 18);
          addGridRipple(this.x, this.y, 520, 44, '#8b5cf6');
          spawnFloatingText(this.x, this.y - 45, '// SUPERSONIC SCREECH BLAST //', '#8b5cf6', 1.4);
          if (distToPlayer < 480) {
            player.takeDamage(24 * this.dmgScale);
            player.vx += Math.cos(this.angle) * 20;
            player.vy += Math.sin(this.angle) * 20;
          }
        }
      }

      // 13. Frost Jotunn: Cryo-Aegis Shards & Absolute Zero Blizzard
      else if (this.bossType === 'glacier') {
        this.cryoShardAngle = (this.cryoShardAngle || 0) + (enraged ? 0.035 : 0.022);
        if (this.shardRegenTimer) this.shardRegenTimer--;
        if (this.shardRegenTimer <= 0) {
          this.shardRegenTimer = enraged ? 180 : 260;
          if (this.cryoShards < 6) {
            this.cryoShards++;
            spawnParticle(this.x, this.y, 0, 0, '#06b6d4', 12, 3);
            spawnFloatingText(this.x, this.y - 40, '+1 CRYO MIRROR SHARD', '#06b6d4', 1.1);
          }
        }
        if (this.blizzardTimer) this.blizzardTimer--;
        if (this.blizzardTimer <= 0) {
          this.blizzardTimer = enraged ? 140 : 210;
          sound.ringPass(2);
          screenShake = Math.max(screenShake, 15);
          addGridRipple(this.x, this.y, 480, 36, '#06b6d4');
          spawnFloatingText(this.x, this.y - 45, '// ABSOLUTE ZERO BLIZZARD //', '#06b6d4', 1.4);
          if (distToPlayer < 460) {
            player.slowTimer = 110;
            player.takeDamage(20 * this.dmgScale);
            spawnFloatingText(player.x, player.y - 25, 'CRYO FREEZE SLOW (-38%)', '#06b6d4', 1.15);
          }
        }
      }

      // 14. Apex Oblivion: Quad Judgment Pillars & Cosmic Doomsday Cataclysm
      else if (this.bossType === 'oblivion') {
        this.celestialRingAngles = this.celestialRingAngles || [0, 0, 0, 0];
        const rSpd = enraged ? 0.04 : 0.02;
        this.celestialRingAngles[0] += rSpd;
        this.celestialRingAngles[1] -= rSpd * 1.3;
        this.celestialRingAngles[2] += rSpd * 1.7;
        this.celestialRingAngles[3] -= rSpd * 2.1;

        if (this.judgmentStrikeTimer) this.judgmentStrikeTimer--;
        if (this.judgmentStrikeTimer <= 0) {
          this.judgmentStrikeTimer = enraged ? 100 : 150;
          sound.overdrive();
          screenShake = Math.max(screenShake, 20);
          chromaticFlash = Math.max(chromaticFlash, 15);
          spawnFloatingText(this.x, this.y - 45, '// QUAD ORBITAL JUDGMENT PILLARS //', '#ffffff', 1.45);
          const offsets = [{dx: 0, dy: 0}, {dx: -70, dy: 0}, {dx: 70, dy: 0}, {dx: 0, dy: -70}];
          offsets.forEach(off => {
            lightningBolts.push({ x1: player.x + off.dx, y1: player.y + off.dy - 600, x2: player.x + off.dx, y2: player.y + off.dy, color: '#ffffff', life: 18 });
          });
          player.takeDamage(32 * this.dmgScale);
          addGridRipple(player.x, player.y, 300, 36, '#ffffff');
        }

        if (this.doomsdayCollapseTimer) this.doomsdayCollapseTimer--;
        if (this.doomsdayCollapseTimer <= 0) {
          this.doomsdayCollapseTimer = enraged ? 210 : 310;
          sound.explosion(true);
          screenShake = Math.max(screenShake, 35);
          chromaticFlash = Math.max(chromaticFlash, 25);
          addGridRipple(this.x, this.y, 750, 65, '#ffffff');
          spawnFloatingText(this.x, this.y - 50, '// COSMIC DOOMSDAY CATACLYSM //', '#ffe600', 1.6);
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
            enemyProjectiles.push(new Projectile(this.x, this.y, a, a % (Math.PI / 9) === 0 ? '#ffffff' : '#ffe600', 8.2, 22 * this.dmgScale));
          }
        }
      }

      // 15. Omega Seraphim: Orbital Celestial Strikes (Default)
      else {
        if (this.orbitalStrikeTimer) this.orbitalStrikeTimer--;
        if (this.orbitalStrikeTimer <= 0) {
          this.orbitalStrikeTimer = enraged ? 150 : 220;
          sound.parryDeflect();
          screenShake = Math.max(screenShake, 14);
          spawnFloatingText(this.x, this.y - 45, '// ORBITAL CELESTIAL STRIKE //', '#ffe600', 1.3);
          lightningBolts.push({ x1: player.x, y1: player.y - 500, x2: player.x, y2: player.y, color: '#ffe600', life: 16 });
          lightningBolts.push({ x1: player.x - 20, y1: player.y - 500, x2: player.x + 20, y2: player.y, color: '#ff0077', life: 14 });
          player.takeDamage(28 * this.dmgScale);
          addGridRipple(player.x, player.y, 220, 24, '#ffe600');
        }
      }
    }

    // Cruiser & Multi-Boss firing patterns
    if (this.type === 'cruiser' || this.isBoss || this.type === 'boss') {
      this.shotCooldown -= cdTick;
      if (this.shotCooldown <= 0) {
        this.recoil = 5;
        if (this.isBoss || this.type === 'boss') {
          const enraged = this.hp < this.maxHp * 0.55;
          this.patternStep++;

          if (this.bossType === 'colossus') {
            // 1. TITAN GOLIATH: Dual Heavy Rotary Gatling & Heavy Siege Shells
            this.shotCooldown = Math.floor((enraged ? 12 : 16) / this.fireScale);
            const spreadA = (Math.random() - 0.5) * 0.22;
            enemyProjectiles.push(new Projectile(this.x + Math.cos(this.angle + 0.3) * 36, this.y + Math.sin(this.angle + 0.3) * 36, this.angle + spreadA, '#ff7b00', 9.5, 14 * this.dmgScale));
            enemyProjectiles.push(new Projectile(this.x + Math.cos(this.angle - 0.3) * 36, this.y + Math.sin(this.angle - 0.3) * 36, this.angle - spreadA, '#ff7b00', 9.5, 14 * this.dmgScale));
            if (this.patternStep % 5 === 0) {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ff2a55', 13.0, 24 * this.dmgScale, 1));
            }
          } else if (this.bossType === 'leviathan') {
            // 2. VOID LEVIATHAN: 24-way Spiral Nebula & 5-way Void Bolts
            this.shotCooldown = Math.floor((enraged ? 22 : 30) / this.fireScale);
            if (this.patternStep % 3 === 0) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
                const ang = a + this.patternStep * 0.24;
                enemyProjectiles.push(new Projectile(this.x, this.y, ang, '#d946ef', 6.8, 16 * this.dmgScale));
              }
            } else {
              for (let a = -0.44; a <= 0.44; a += 0.22) {
                enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + a, '#00f0ff', 8.5, 18 * this.dmgScale));
              }
            }
          } else if (this.bossType === 'architect') {
            // 3. KAIROS HYPER-CORE: Tripwire Pulses & Focus Rail Lance
            this.shotCooldown = Math.floor((enraged ? 16 : 22) / this.fireScale);
            if (this.patternStep % 2 === 0) {
              for (let q = 0; q < 4; q++) {
                const qAng = (this.laserGridAngle || 0) + (q * Math.PI) / 2;
                enemyProjectiles.push(new Projectile(this.x, this.y, qAng, '#00f0ff', 7.6, 15 * this.dmgScale));
              }
            } else {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ffe600', 14.5, 24 * this.dmgScale));
            }
          } else if (this.bossType === 'ignis') {
            // 4. SOLAR VULCAN: Dense Conical Flame Sweeps & Magma Mortar Shells
            this.shotCooldown = Math.floor((enraged ? 11 : 15) / this.fireScale);
            if (this.patternStep % 4 === 0) {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ff3300', 11.0, 26 * this.dmgScale, 1));
            } else {
              for (let s = -0.32; s <= 0.32; s += 0.16) {
                const flameAng = this.angle + s + (Math.random() - 0.5) * 0.08;
                enemyProjectiles.push(new Projectile(this.x + Math.cos(this.angle) * 35, this.y + Math.sin(this.angle) * 35, flameAng, '#ff6600', 8.5 + Math.random() * 2, 14 * this.dmgScale));
              }
            }
          } else if (this.bossType === 'tempest') {
            // 5. ZEPHYR TEMPEST: Twin Voltaic Ball Lightning & 5-way Storm Bolts
            this.shotCooldown = Math.floor((enraged ? 18 : 25) / this.fireScale);
            if (this.patternStep % 2 === 0) {
              enemyProjectiles.push(new Projectile(this.x + Math.cos(this.angle + 0.4) * 32, this.y + Math.sin(this.angle + 0.4) * 32, this.angle, '#38bdf8', 12.0, 20 * this.dmgScale));
              enemyProjectiles.push(new Projectile(this.x + Math.cos(this.angle - 0.4) * 32, this.y + Math.sin(this.angle - 0.4) * 32, this.angle, '#38bdf8', 12.0, 20 * this.dmgScale));
            } else {
              for (let a = -0.48; a <= 0.48; a += 0.24) {
                enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + a, '#00f0ff', 9.2, 16 * this.dmgScale));
              }
            }
          } else if (this.bossType === 'chronos') {
            // 6. OUROBOROS: 12-Hour Dial Clock Needle Nova & Tachyon Darts
            this.shotCooldown = Math.floor((enraged ? 20 : 28) / this.fireScale);
            if (this.patternStep % 3 === 0) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
                const ang = a + (this.gearAngle || 0);
                enemyProjectiles.push(new Projectile(this.x, this.y, ang, '#eab308', 7.0, 16 * this.dmgScale));
              }
            } else {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ffe600', 15.0, 24 * this.dmgScale));
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + 0.15, '#eab308', 13.0, 18 * this.dmgScale));
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle - 0.15, '#eab308', 13.0, 18 * this.dmgScale));
            }
          } else if (this.bossType === 'reaper') {
            // 7. THANATOS: Piercing Emerald Scythe Crescents & Soul Wisps
            this.shotCooldown = Math.floor((enraged ? 18 : 26) / this.fireScale);
            if (this.patternStep % 2 === 0) {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle - 0.18, '#10b981', 11.0, 22 * this.dmgScale, 0, true));
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + 0.18, '#10b981', 11.0, 22 * this.dmgScale, 0, true));
            } else {
              for (let a = -0.5; a <= 0.5; a += 0.25) {
                enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + a, '#34d399', 8.0, 16 * this.dmgScale));
              }
            }
          } else if (this.bossType === 'behemoth') {
            // 8. TERRA GORGON: Tri-Head Independent Corrosive Artillery
            this.shotCooldown = Math.floor((enraged ? 14 : 19) / this.fireScale);
            const hIdx = this.patternStep % 3;
            const hOff = (hIdx - 1) * 0.45;
            const hx = this.x + Math.cos(this.angle + hOff) * 44;
            const hy = this.y + Math.sin(this.angle + hOff) * 44;
            const toP = Math.atan2(player.y - hy, player.x - hx);
            enemyProjectiles.push(new Projectile(hx, hy, toP - 0.12, '#84cc16', 8.5, 17 * this.dmgScale));
            enemyProjectiles.push(new Projectile(hx, hy, toP, '#84cc16', 9.5, 20 * this.dmgScale));
            enemyProjectiles.push(new Projectile(hx, hy, toP + 0.12, '#84cc16', 8.5, 17 * this.dmgScale));
          } else if (this.bossType === 'pulsar') {
            // 9. ASTRON PULSAR: Relativistic Magnetic Pole Pulses & 12-way Rose Photons
            this.shotCooldown = Math.floor((enraged ? 16 : 23) / this.fireScale);
            if (this.patternStep % 2 === 0) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
                enemyProjectiles.push(new Projectile(this.x, this.y, a + this.patternStep * 0.12, '#f43f5e', 7.2, 16 * this.dmgScale));
              }
            } else {
              const bA = this.pulsarBeamAngle || 0;
              enemyProjectiles.push(new Projectile(this.x, this.y, bA, '#ff0055', 14.5, 24 * this.dmgScale));
              enemyProjectiles.push(new Projectile(this.x, this.y, bA + Math.PI, '#ff0055', 14.5, 24 * this.dmgScale));
            }
          } else if (this.bossType === 'valkyrie_zero') {
            // 10. SHADOW VALKYRIE ZERO: Triple Crimson Shurikens & Player-Mirror Rail Lances
            this.shotCooldown = Math.floor((enraged ? 13 : 17) / this.fireScale);
            if (this.patternStep % 3 === 0) {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#ffffff', 16.0, 26 * this.dmgScale));
            } else {
              for (let s = -0.3; s <= 0.3; s += 0.3) {
                enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + s, '#e11d48', 10.5, 18 * this.dmgScale));
              }
            }
          } else if (this.bossType === 'hivemind') {
            // 11. NEXUS OVERMIND: Hexagonal Cluster Bullet Hell & Seeker Torpedoes
            this.shotCooldown = Math.floor((enraged ? 18 : 25) / this.fireScale);
            for (let h = 0; h < 6; h++) {
              const ha = (h * Math.PI) / 3 + this.patternStep * 0.15;
              enemyProjectiles.push(new Projectile(this.x, this.y, ha, '#14b8a6', 7.4, 16 * this.dmgScale));
            }
            if (this.patternStep % 2 === 0) {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle, '#2dd4bf', 11.0, 22 * this.dmgScale));
            }
          } else if (this.bossType === 'banshee') {
            // 12. SIREN BANSHEE: Dual Harmonic Resonator Waves & Acoustic Discs
            this.shotCooldown = Math.floor((enraged ? 15 : 21) / this.fireScale);
            for (let a = -0.45; a <= 0.45; a += 0.15) {
              const waveSpeed = 8.0 + Math.sin(this.patternStep + a) * 2;
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + a, '#8b5cf6', waveSpeed, 17 * this.dmgScale));
            }
          } else if (this.bossType === 'glacier') {
            // 13. FROST JOTUNN: Piercing Icicle Spears & 16-way Cryo Snowflake Rings
            this.shotCooldown = Math.floor((enraged ? 20 : 27) / this.fireScale);
            if (this.patternStep % 3 === 0) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
                enemyProjectiles.push(new Projectile(this.x, this.y, a + (this.cryoShardAngle || 0), '#06b6d4', 6.8, 16 * this.dmgScale));
              }
            } else {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle - 0.09, '#ffffff', 14.0, 24 * this.dmgScale, 0, true));
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + 0.09, '#ffffff', 14.0, 24 * this.dmgScale, 0, true));
            }
          } else if (this.bossType === 'oblivion') {
            // 14. APEX OBLIVION: 36-way Celestial Kaleidoscope Bullet Storm & Quad Beams
            this.shotCooldown = Math.floor((enraged ? 14 : 19) / this.fireScale);
            if (this.patternStep % 2 === 0) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
                const col = a % (Math.PI / 6) === 0 ? '#ffffff' : (a % (Math.PI / 9) === 0 ? '#ffe600' : '#ff0077');
                enemyProjectiles.push(new Projectile(this.x, this.y, a + this.patternStep * 0.08, col, 7.5, 18 * this.dmgScale));
              }
            } else {
              for (let q = 0; q < 4; q++) {
                const qAng = this.angle + (q * Math.PI) / 2;
                enemyProjectiles.push(new Projectile(this.x, this.y, qAng, '#ffffff', 15.0, 26 * this.dmgScale));
              }
            }
          } else {
            // 15. OMEGA SERAPHIM: 16-way Spiral Nova, 7-way Dreadnought Fan, Twin Rail Lances (Default)
            this.shotCooldown = Math.floor((enraged ? 22 : 32) / this.fireScale);
            if (this.patternStep % 3 === 0) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
                enemyProjectiles.push(new Projectile(this.x, this.y, a + this.patternStep * 0.18, '#ff0077', 6.6, 17 * this.dmgScale));
              }
            } else if (this.patternStep % 3 === 1) {
              for (let a = -0.54; a <= 0.54; a += 0.18) {
                enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + a, '#9d4edd', 8.0, 18 * this.dmgScale));
              }
            } else {
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle - 0.08, '#ff0055', 14.0, 22 * this.dmgScale));
              enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + 0.08, '#ff0055', 14.0, 22 * this.dmgScale));
            }
          }
        } else {
          this.shotCooldown = Math.floor(68 / this.fireScale);
          const spreadCount = this.isElite ? 2 : 1;
          for (let s = -spreadCount; s <= spreadCount; s++) {
            enemyProjectiles.push(new Projectile(this.x, this.y, this.angle + s * 0.13, '#ffe600', 7.2, 15 * this.dmgScale));
          }
        }
      }
    }

    if (this.hitFlash > 0) this.hitFlash--;

    // Collision with player
    if (distToPlayer < this.radius + player.radius) {
      const baseContact = (this.isBoss || this.type === 'boss') ? 36 : (this.type === 'juggernaut' || this.type === 'nemesis' ? 26 : 18);
      player.takeDamage(baseContact * this.dmgScale);
      if (!this.isBoss && this.type !== 'boss' && this.type !== 'juggernaut' && this.type !== 'nemesis') {
        this.takeDamage(999);
      }
    } else if (!this.isBoss && this.type !== 'boss' && this.type !== 'nemesis' && distToPlayer > 1250) {
      const pt = randomEdgePoint();
      this.x = pt.x;
      this.y = pt.y;
    }
  }

  draw() {
    const pulse = sound.beatPulse;
    const isHit = this.hitFlash > 0;
    const primary = isHit ? '#ffffff' : this.color;

    // 1. SNIPER TELEGRAPH LASER SIGHT & CONVERGING LOCK-ON CORRIDOR
    if (this.type === 'sniper' && this.shotCooldown < 55) {
      const urgent = this.shotCooldown < 18;
      const charge = 1 - this.shotCooldown / 55;
      const spread = (1 - charge) * 10;
      const cosA = Math.cos(this.aimAngle);
      const sinA = Math.sin(this.aimAngle);
      const perpX = -sinA * spread;
      const perpY = cosA * spread;
      const sx = this.x + cosA * 22;
      const sy = this.y + sinA * 22;
      const ex = this.x + cosA * 1050;
      const ey = this.y + sinA * 1050;

      ctx.save();
      if (urgent) {
        // Outer crimson lock-on glow beam + inner white-hot laser core
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.35)';
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Converging twin cyber-rails tightening toward lock-on
        ctx.beginPath();
        ctx.moveTo(sx + perpX, sy + perpY);
        ctx.lineTo(ex + perpX * 1.5, ey + perpY * 1.5);
        ctx.moveTo(sx - perpX, sy - perpY);
        ctx.lineTo(ex - perpX * 1.5, ey - perpY * 1.5);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.18 + charge * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([10, 6]);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.save();
    const pulseScale = 1 + pulse * 0.07;
    ctx.scale(pulseScale, pulseScale);

    // Hardware-accelerated pre-baked neon aura (zero Gaussian blur cost!)
    if (!isHit) {
      const gR = this.radius * 2.15;
      ctx.drawImage(getGlowSprite(this.color), -gR, -gR, gR * 2, gR * 2);
    }

    // === OVERCLOCKED ELITE GOLDEN HALO RING ===
    if (this.isElite) {
      ctx.save();
      ctx.rotate(-frameCount * 0.05);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // === CHRONO-STASIS TIME-LOCK RING (+50% VULNERABILITY INDICATOR) ===
    if (this.chronoSlowTimer > 0) {
      ctx.save();
      ctx.rotate(frameCount * 0.03);
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.strokeStyle = primary;
    ctx.lineWidth = 2.2;

    /* -------------------------------------------------------------------
       TIER 1A: DRONE_BIT -> "PULSE BIT-DRONE" (Basic Normal Enemy)
       ------------------------------------------------------------------- */
    if (this.type === 'drone_bit') {
      ctx.rotate(this.angle);

      // Spinning outer data-bit ring
      ctx.save();
      ctx.rotate(frameCount * 0.06);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-9, -9, 18, 18);
      ctx.restore();

      // Sleek diamond drone body with micro-wings
      ctx.fillStyle = isHit ? '#ffffff' : '#062033';
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(1, -10);
      ctx.lineTo(-9, -6);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-9, 6);
      ctx.lineTo(1, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing cyan optic core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 1B: SCOUT -> "VALKYRIE RAZOR-INTERCEPTOR" (Predatory Cyber-Mantis)
       ------------------------------------------------------------------- */
    else if (this.type === 'scout') {
      ctx.rotate(this.angle);

      // Twin flickering ion thrusters
      const flame = 6 + Math.random() * 6 + pulse * 4;
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-10 - flame, -3.5);
      ctx.lineTo(-10, -2);
      ctx.moveTo(-10, 2);
      ctx.lineTo(-10 - flame, 3.5);
      ctx.lineTo(-10, 5);
      ctx.fill();

      // Outer forward-swept razor mandibles & swept wings
      ctx.fillStyle = isHit ? '#ffffff' : '#1f0414';
      ctx.beginPath();
      ctx.moveTo(16, -4);      // Left forward razor tip
      ctx.lineTo(4, -6);
      ctx.lineTo(-4, -14);     // Outer wing spike
      ctx.lineTo(-13, -9);
      ctx.lineTo(-8, -3);
      ctx.lineTo(-12, 0);      // Rear center notch
      ctx.lineTo(-8, 3);
      ctx.lineTo(-13, 9);
      ctx.lineTo(-4, 14);      // Right outer wing spike
      ctx.lineTo(4, 6);
      ctx.lineTo(16, 4);       // Right forward razor tip
      ctx.lineTo(8, 2);
      ctx.lineTo(13, 0);       // Central needle nose
      ctx.lineTo(8, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Internal glowing plasma core & cockpit visor
      ctx.fillStyle = isHit ? '#fff' : '#ff66b2';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-2, -4);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-2, 4);
      ctx.closePath();
      ctx.fill();

      // White-hot optic slit
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, -1.2, 5, 2.4);
    }

    /* -------------------------------------------------------------------
       TIER 1C: MINI -> "HYDRA RAZOR-SWARMER" (Spinning 3-Bladed Cyber-Shuriken)
       ------------------------------------------------------------------- */
    else if (this.type === 'mini') {
      ctx.rotate(frameCount * 0.22 + this.id);
      ctx.fillStyle = isHit ? '#fff' : '#032215';

      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const aMid = a + 0.55;
        const aInner = a + (Math.PI * 2) / 6;
        const rOut = 12;
        const rIn = 4.2;
        if (i === 0) ctx.moveTo(Math.cos(a) * rOut, Math.sin(a) * rOut);
        else ctx.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut);
        ctx.lineTo(Math.cos(aMid) * (rOut * 0.65), Math.sin(aMid) * (rOut * 0.65));
        ctx.lineTo(Math.cos(aInner) * rIn, Math.sin(aInner) * rIn);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central glowing cyber-eye
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 2A: STRIKER -> "VIPER TWIN-BLASTER" (Light Ranged Skirmisher)
       ------------------------------------------------------------------- */
    else if (this.type === 'striker') {
      ctx.rotate(this.angle);
      const rec = this.recoil;

      // Forward-swept twin-boom gunship hull
      ctx.fillStyle = isHit ? '#ffffff' : '#261002';
      ctx.beginPath();
      ctx.moveTo(16 - rec, 0);
      ctx.lineTo(6 - rec, -5);
      ctx.lineTo(14 - rec, -13);
      ctx.lineTo(-10 - rec, -14);
      ctx.lineTo(-14 - rec, -5);
      ctx.lineTo(-9 - rec, 0);
      ctx.lineTo(-14 - rec, 5);
      ctx.lineTo(-10 - rec, 14);
      ctx.lineTo(14 - rec, 13);
      ctx.lineTo(6 - rec, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing orange wingtip blaster pods & core
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(10 - rec, -13, 6, 3);
      ctx.fillRect(10 - rec, 10, 6, 3);
      ctx.beginPath();
      ctx.arc(2 - rec, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 2B: SPLITTER -> "HYDRA BIO-SWARM CARRIER" (3 Docked Mini-Drones!)
       ------------------------------------------------------------------- */
    else if (this.type === 'splitter') {
      // Outer counter-rotating containment shield ring
      ctx.save();
      ctx.rotate(-this.hullRot * 1.2);
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Tri-lobed Carrier Frame + 3 visibly docked parasite drones
      ctx.save();
      ctx.rotate(this.hullRot);

      for (let i = 0; i < 3; i++) {
        const podAngle = (i * Math.PI * 2) / 3;
        const px = Math.cos(podAngle) * 12;
        const py = Math.sin(podAngle) * 12;

        // Bio-electric tether from nucleus to pod
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Armored Containment Bay Clamp
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(podAngle);
        ctx.fillStyle = isHit ? '#ffffff' : '#042416';
        ctx.strokeStyle = primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-5, -8);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-5, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Docked mini-drone glowing eye inside bay
        ctx.beginPath();
        ctx.arc(2, 0, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // Central unstable mitosis core
      ctx.beginPath();
      ctx.arc(0, 0, 6.5 + Math.sin(frameCount * 0.2) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    /* -------------------------------------------------------------------
       TIER 3A: CRUISER -> "BASTION HEAVY GUNSHIP" (Armored Octagon + Turret)
       ------------------------------------------------------------------- */
    else if (this.type === 'cruiser') {
      // 1) Rotating Heavy Octagonal Dreadnought Chassis
      ctx.save();
      ctx.rotate(this.hullRot * 0.6);

      // 4 Corner thruster pods
      ctx.fillStyle = '#ff5500';
      for (let c = 0; c < 4; c++) {
        ctx.save();
        ctx.rotate((c * Math.PI) / 2 + Math.PI / 4);
        ctx.fillRect(18, -4, 5 + pulse * 3, 8);
        ctx.restore();
      }

      // Beveled Octagonal Armor Hull
      const r = 22;
      const bev = 9;
      ctx.fillStyle = isHit ? '#ffffff' : '#1f1804';
      ctx.beginPath();
      ctx.moveTo(r, -bev);
      ctx.lineTo(r, bev);
      ctx.lineTo(bev, r);
      ctx.lineTo(-bev, r);
      ctx.lineTo(-r, bev);
      ctx.lineTo(-r, -bev);
      ctx.lineTo(-bev, -r);
      ctx.lineTo(bev, -r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner recessed armor plate & X-struts
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, -14); ctx.lineTo(14, 14);
      ctx.moveTo(14, -14); ctx.lineTo(-14, 14);
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.stroke();
      ctx.restore();

      // 2) Independent Player-Tracking Twin Plasma Turret on Top
      ctx.save();
      ctx.rotate(this.angle);
      const rec = this.recoil;

      // Twin cannon barrels
      ctx.fillStyle = '#0c0a04';
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.fillRect(4 - rec, -7, 17, 4);
      ctx.strokeRect(4 - rec, -7, 17, 4);
      ctx.fillRect(4 - rec, 3, 17, 4);
      ctx.strokeRect(4 - rec, 3, 17, 4);

      // Muzzle charge glow before firing
      if (this.shotCooldown < 25) {
        const chargeAlpha = 1 - this.shotCooldown / 25;
        ctx.fillStyle = `rgba(255, 100, 0, ${chargeAlpha})`;
        ctx.beginPath();
        ctx.arc(22, -5, 3.5 * chargeAlpha, 0, Math.PI * 2);
        ctx.arc(22, 5, 3.5 * chargeAlpha, 0, Math.PI * 2);
        ctx.fill();
      }

      // Turret dome & molten core
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#291d00';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 4 + pulse * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6600';
      ctx.fill();
      ctx.restore();
    }

    /* -------------------------------------------------------------------
       TIER 3B: AEGIS -> "AEGIS PHALANX GUARDIAN" (Directional Energy Shield)
       ------------------------------------------------------------------- */
    else if (this.type === 'aegis') {
      ctx.rotate(this.angle);

      // Hexagonal sentinel armor hull
      ctx.fillStyle = isHit ? '#ffffff' : '#041e2e';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const r = 19;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Projected directional front energy barrier arc!
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + pulse * 2, -1.05, 1.05);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 29 + pulse * 2, -0.75, 0.75);
      ctx.stroke();

      // Shield emitter pylons & reactor core
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 4A: SNIPER -> "WRAITH RAIL-STALKER" (Twin Accelerator Railgun)
       ------------------------------------------------------------------- */
    else if (this.type === 'sniper') {
      ctx.rotate(this.aimAngle || this.angle);
      const rec = this.recoil;

      // Swept-back stealth delta wings
      ctx.fillStyle = isHit ? '#ffffff' : '#041824';
      ctx.beginPath();
      ctx.moveTo(6 - rec, -4);
      ctx.lineTo(-14 - rec, -17);
      ctx.lineTo(-10 - rec, -6);
      ctx.lineTo(-16 - rec, 0);
      ctx.lineTo(-10 - rec, 6);
      ctx.lineTo(-14 - rec, 17);
      ctx.lineTo(6 - rec, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Twin elongated magnetic railgun barrels
      ctx.fillStyle = '#072536';
      ctx.beginPath();
      ctx.rect(-2 - rec, -5.5, 25, 3);
      ctx.rect(-2 - rec, 2.5, 25, 3);
      ctx.fill();
      ctx.stroke();

      // Charging plasma arc between the twin rails
      if (this.shotCooldown < 55) {
        const charge = 1 - this.shotCooldown / 55;
        ctx.strokeStyle = this.shotCooldown < 18 ? '#ff0055' : '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(4 + charge * 18, (Math.random() - 0.5) * 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(6 + charge * 16, 0, 2 + charge * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.fill();
      }

      // Sniper optic core
      ctx.beginPath();
      ctx.arc(-5 - rec, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0055';
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 4B: PHANTOM -> "WRAITH PHASE-STALKER" (Teleporting Stealth Wing)
       ------------------------------------------------------------------- */
    else if (this.type === 'phantom') {
      ctx.rotate(this.angle);

      // Flickering phase-shift holographic ghost outline
      if (this.blinkCooldown < 35) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-14, -14, 28, 28);
      }

      // Swept Wraith Stealth Bat-Blades
      ctx.fillStyle = isHit ? '#ffffff' : '#1b0730';
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(19, 0);
      ctx.lineTo(4, -7);
      ctx.lineTo(-6, -18);
      ctx.lineTo(-16, -12);
      ctx.lineTo(-8, -3);
      ctx.lineTo(-15, 0);
      ctx.lineTo(-8, 3);
      ctx.lineTo(-16, 12);
      ctx.lineTo(-6, 18);
      ctx.lineTo(4, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner phase crystal core
      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(0, -5);
      ctx.lineTo(-7, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 5A: WEAVER -> "CHRONO-SERAPH GYRO-SENTINEL" (3D Gimbal Rings)
       ------------------------------------------------------------------- */
    else if (this.type === 'weaver') {
      // 4 Orbiting Crystal Pylons
      for (let k = 0; k < 4; k++) {
        const pa = this.hullRot * 1.4 + (k * Math.PI) / 2;
        const px = Math.cos(pa) * 22;
        const py = Math.sin(pa) * 22;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(pa);
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(0, -3);
        ctx.lineTo(-4, 0);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Gimbal Ring 1 (3D Pitch)
      ctx.save();
      ctx.rotate(this.hullRot);
      ctx.scale(1, Math.max(0.25, Math.abs(Math.sin(frameCount * 0.04 + this.id))));
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.restore();

      // Gimbal Ring 2 (3D Roll)
      ctx.save();
      ctx.rotate(-this.hullRot * 1.3);
      ctx.scale(Math.max(0.25, Math.abs(Math.cos(frameCount * 0.05 + this.id))), 1);
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Central Seraph Singularity Eye
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1f0326';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(Math.cos(this.angle) * 2, Math.sin(this.angle) * 2, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe600';
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 5B: JUGGERNAUT -> "COLOSSUS SIEGE JUGGERNAUT" (Heavy Mini-Boss)
       ------------------------------------------------------------------- */
    else if (this.type === 'juggernaut') {
      // Outer spiked siege ring
      ctx.save();
      ctx.rotate(this.hullRot * 0.8);
      ctx.fillStyle = isHit ? '#ffffff' : '#2a040d';
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 === 0 ? 31 : 24;
        const a = (i * Math.PI) / 8;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner reinforced cross-armor & molten magma core
      ctx.save();
      ctx.rotate(this.angle);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -15, 30, 30);

      // Twin forward siege rams
      ctx.fillStyle = '#ff2a55';
      ctx.fillRect(15, -12, 11, 6);
      ctx.fillRect(15, 6, 11, 6);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 9 + pulse * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.charging > 0 ? '#ffe600' : '#ff2a55';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 5C: NEMESIS -> "CRIMSON NEMESIS VIP BOUNTY" (Golden High-Speed Ace)
       ------------------------------------------------------------------- */
    else if (this.type === 'nemesis') {
      ctx.rotate(this.angle);
      ctx.fillStyle = isHit ? '#ffffff' : '#2b0518';
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.lineTo(6, -9);
      ctx.lineTo(-10, -24);
      ctx.lineTo(-22, -16);
      ctx.lineTo(-12, -5);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-12, 5);
      ctx.lineTo(-22, 16);
      ctx.lineTo(-10, 24);
      ctx.lineTo(6, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(2, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    /* -------------------------------------------------------------------
       TIER 6: MULTI-APEX MEGA-BOSSES (Hardware-Accelerated Vector Renders)
       ------------------------------------------------------------------- */
    else if (this.isBoss || this.type === 'boss') {
      const enraged = this.hp < this.maxHp * 0.5;

      // 1. TITAN GOLIATH SIEGE BATTLESHIP (Colossus)
      if (this.bossType === 'colossus') {
        ctx.save();
        ctx.rotate(this.angle);

        // Heavy Dual Tank Tread Assemblies
        ctx.fillStyle = isHit ? '#ffffff' : '#1a050d';
        ctx.strokeStyle = '#ff2a55';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(-55, -42, 110, 16);
        ctx.fillRect(-55, -42, 110, 16);
        ctx.strokeRect(-55, 26, 110, 16);
        ctx.fillRect(-55, 26, 110, 16);

        // Rolling tread links
        ctx.strokeStyle = 'rgba(255, 123, 0, 0.4)';
        ctx.lineWidth = 1.2;
        for (let tr = -45; tr <= 45; tr += 15) {
          ctx.beginPath();
          ctx.moveTo(tr, -42); ctx.lineTo(tr, -26);
          ctx.moveTo(tr, 26); ctx.lineTo(tr, 42);
          ctx.stroke();
        }

        // Main Hexagonal Iron Armor Glacis Plate
        ctx.fillStyle = isHit ? '#ffffff' : '#0d0206';
        ctx.strokeStyle = enraged ? '#ffe600' : '#ff2a55';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(48, 0);
        ctx.lineTo(24, -32);
        ctx.lineTo(-44, -32);
        ctx.lineTo(-52, 0);
        ctx.lineTo(-44, 32);
        ctx.lineTo(24, 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Hazard Warning Stripes on front bumper
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(14, -18); ctx.lineTo(32, -6);
        ctx.moveTo(14, 18); ctx.lineTo(32, 6);
        ctx.stroke();

        // Twin Heavy Rotary Vulcan Cannon Barrels
        ctx.fillStyle = '#ff7b00';
        ctx.fillRect(20, -12, 38, 6);
        ctx.fillRect(20, 6, 38, 6);

        // Central Kinetic Core / Red Reactor Eye
        ctx.beginPath();
        ctx.arc(0, 0, 16 + pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#ff0055';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 2. VOID LEVIATHAN APEX SINGULARITY (Leviathan)
      else if (this.bossType === 'leviathan') {
        // 8 Undulating Dark Matter Tentacles
        ctx.save();
        for (let t = 0; t < 8; t++) {
          const baseA = (t * Math.PI) / 4 + frameCount * 0.01;
          const flex = Math.sin(frameCount * 0.08 + t * 1.2) * 22;
          const tipX = Math.cos(baseA) * (65 + flex) - Math.sin(baseA) * flex;
          const tipY = Math.sin(baseA) * (65 + flex) + Math.cos(baseA) * flex;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(Math.cos(baseA) * 35, Math.sin(baseA) * 35, tipX, tipY);
          ctx.strokeStyle = t % 2 === 0 ? '#d946ef' : '#00f0ff';
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }

        // Counter-Rotating Singularity Accretion Rings
        ctx.rotate(-frameCount * 0.025);
        ctx.strokeStyle = 'rgba(217, 70, 239, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 48 + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(frameCount * 0.05);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-26, -26, 52, 52);

        // Central Event Horizon Black Hole Core
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#020008';
        ctx.fill();
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 6 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      }

      // 3. KAIROS HYPER-CORE AI CONSTRUCT (Architect)
      else if (this.bossType === 'architect') {
        ctx.save();
        const rotA = this.laserGridAngle || (frameCount * 0.02);

        // 4 Rotating Laser Grid Tripwire Emitters
        ctx.save();
        ctx.rotate(rotA);
        for (let q = 0; q < 4; q++) {
          ctx.save();
          ctx.rotate((q * Math.PI) / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(120, 0);
          ctx.strokeStyle = enraged ? 'rgba(255, 0, 119, 0.45)' : 'rgba(0, 240, 255, 0.35)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();

        // Nested 3D-Effect Hyper-Cube Wireframes
        ctx.rotate(frameCount * 0.02);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(-32, -32, 64, 64);

        ctx.rotate(-frameCount * 0.04);
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(-22, -22, 44, 44);

        // 4 Orbiting Satellite Prism Mirrors
        for (let s = 0; s < 4; s++) {
          const sa = rotA * 1.5 + (s * Math.PI) / 2;
          const sx = Math.cos(sa) * 54;
          const sy = Math.sin(sa) * 54;
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(sx - 5, sy - 5, 10, 10);
          ctx.strokeStyle = '#ffffff';
          ctx.strokeRect(sx - 5, sy - 5, 10, 10);
        }

        // Inner Quantum Matrix AI Core
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#020e18';
        ctx.fill();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = enraged ? '#ff0055' : '#00ff88';
        ctx.beginPath();
        ctx.arc(0, 0, 5 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. SOLAR VULCAN PYROCLASTIC MEGATANK (Ignis)
      else if (this.bossType === 'ignis') {
        ctx.save();
        ctx.rotate(this.angle);

        // Heavy Dual Magma Crawler Treads
        ctx.fillStyle = isHit ? '#ffffff' : '#140500';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(-58, -44, 116, 17);
        ctx.fillRect(-58, -44, 116, 17);
        ctx.strokeRect(-58, 27, 116, 17);
        ctx.fillRect(-58, 27, 116, 17);

        // Glowing heat track teeth
        ctx.strokeStyle = '#ff3300';
        ctx.lineWidth = 1.2;
        for (let tr = -50; tr <= 50; tr += 15) {
          ctx.beginPath();
          ctx.moveTo(tr, -44); ctx.lineTo(tr, -27);
          ctx.moveTo(tr, 27); ctx.lineTo(tr, 44);
          ctx.stroke();
        }

        // Heavy Sloped Magma Glacis Plate
        ctx.fillStyle = isHit ? '#ffffff' : '#1f0902';
        ctx.strokeStyle = enraged ? '#ffe600' : '#ff6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(52, 0);
        ctx.lineTo(26, -34);
        ctx.lineTo(-46, -34);
        ctx.lineTo(-54, 0);
        ctx.lineTo(-46, 34);
        ctx.lineTo(26, 34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Radiator Heat Grill Vents
        ctx.strokeStyle = '#ff7b00';
        ctx.lineWidth = 2.0;
        for (let g = -24; g <= 8; g += 8) {
          ctx.beginPath();
          ctx.moveTo(g, -18); ctx.lineTo(g + 10, -6);
          ctx.moveTo(g, 18); ctx.lineTo(g + 10, 6);
          ctx.stroke();
        }

        // Dual Heavy Incinerator Vulcan Cannon Barrels
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(22, -14, 42, 7);
        ctx.fillRect(22, 7, 42, 7);
        ctx.fillStyle = '#ffe600';
        ctx.fillRect(60, -13, 6, 5);
        ctx.fillRect(60, 8, 6, 5);

        // Molten Geothermal Reactor Core
        ctx.beginPath();
        ctx.arc(0, 0, 17 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#ff6600';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.restore();
      }

      // 5. ZEPHYR TEMPEST THUNDERBIRD CARRIER (Tempest)
      else if (this.bossType === 'tempest') {
        ctx.save();
        ctx.rotate(this.angle);

        // Mach-4 Swept Delta Wings with stepped control surfaces
        ctx.fillStyle = isHit ? '#ffffff' : '#031424';
        ctx.strokeStyle = enraged ? '#00f0ff' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(58, 0);
        ctx.lineTo(-12, -54);
        ctx.lineTo(-44, -48);
        ctx.lineTo(-30, -22);
        ctx.lineTo(-50, 0);
        ctx.lineTo(-30, 22);
        ctx.lineTo(-44, 48);
        ctx.lineTo(-12, 54);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Twin Ionic Turbofan Engine Nozzles
        ctx.fillStyle = '#082f49';
        ctx.fillRect(-48, -20, 22, 10);
        ctx.fillRect(-48, 10, 22, 10);

        // Pulsing Cyan Ionic Jet Exhaust Flames
        const jetLen = 18 + Math.sin(frameCount * 0.4) * 8;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-48, -19); ctx.lineTo(-48 - jetLen, -15); ctx.lineTo(-48, -11);
        ctx.moveTo(-48, 11); ctx.lineTo(-48 - jetLen, 15); ctx.lineTo(-48, 19);
        ctx.fill();

        // Wingtip Tesla Arcs
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, -54); ctx.lineTo(-8, -62);
        ctx.moveTo(-12, 54); ctx.lineTo(-8, 62);
        ctx.stroke();

        // Forward Cockpit Radome & Voltaic Eye
        ctx.beginPath();
        ctx.arc(14, 0, 11 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#00f0ff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 6. OUROBOROS CHRONO-LORD WEAVER (Chronos)
      else if (this.bossType === 'chronos') {
        ctx.save();
        const gAng = this.gearAngle || 0;

        // Outer Counter-Rotating Gear Ring with 12 teeth
        ctx.save();
        ctx.rotate(gAng);
        ctx.strokeStyle = isHit ? '#ffffff' : '#eab308';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI * 2);
        ctx.stroke();
        for (let t = 0; t < 12; t++) {
          ctx.save();
          ctx.rotate((t * Math.PI) / 6);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(48, -3, 9, 6);
          ctx.restore();
        }
        ctx.restore();

        // Inner Reverse-Spinning Dial with Roman Numeral Pips
        ctx.save();
        ctx.rotate(-gAng * 1.5);
        ctx.strokeStyle = enraged ? '#ff0077' : '#facc15';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.stroke();
        for (let p = 0; p < 8; p++) {
          ctx.save();
          ctx.rotate((p * Math.PI) / 4);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(36, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Rotating Clockwork Needles
        ctx.save();
        ctx.rotate(this.angle);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(32, 0);
        ctx.stroke();
        ctx.rotate(gAng * 3);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-24, 0);
        ctx.stroke();
        ctx.restore();

        // Central Tachyon Singularity Core
        ctx.beginPath();
        ctx.arc(0, 0, 14 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#201602';
        ctx.fill();
        ctx.strokeStyle = enraged ? '#ffe600' : '#eab308';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      }

      // 7. THANATOS PHANTOM DREAD-STALKER (Reaper)
      else if (this.bossType === 'reaper') {
        ctx.save();
        if (this.isCloaked) {
          ctx.globalAlpha = 0.28;
        }
        ctx.rotate(this.angle);

        // Stealth Faceted Diamond Obsidian Hull
        ctx.fillStyle = isHit ? '#ffffff' : '#021810';
        ctx.strokeStyle = enraged ? '#34d399' : '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(56, 0);
        ctx.lineTo(16, -38);
        ctx.lineTo(-44, -30);
        ctx.lineTo(-32, 0);
        ctx.lineTo(-44, 30);
        ctx.lineTo(16, 38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Twin Curved Emerald Energy Scythe Wings
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(12, -36);
        ctx.quadraticCurveTo(42, -58, 28, -74);
        ctx.moveTo(12, 36);
        ctx.quadraticCurveTo(42, 58, 28, 74);
        ctx.stroke();

        // Predatory Horizontal Visor Slits
        ctx.strokeStyle = enraged ? '#ffe600' : '#34d399';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(18, -12); ctx.lineTo(34, -4);
        ctx.moveTo(18, 12); ctx.lineTo(34, 4);
        ctx.stroke();

        // Phantom Soul Core
        ctx.beginPath();
        ctx.arc(0, 0, 12 + pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 8. TERRA GORGON CYBER-HYDRA DREDGER (Behemoth)
      else if (this.bossType === 'behemoth') {
        ctx.save();
        ctx.rotate(this.angle);

        // Heavy Titanium Dredger Base Chassis
        ctx.fillStyle = isHit ? '#ffffff' : '#0c1a05';
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-48, -36, 96, 72);
        ctx.fillRect(-48, -36, 96, 72);

        // 3 Articulated Hydraulic Serpent Heads (Left, Center, Right)
        for (let h = -1; h <= 1; h++) {
          const headOffset = h * 30;
          const neckFlex = Math.sin(frameCount * 0.08 + h * 1.5) * 8;
          const tipX = 46 + Math.cos(h * 0.5) * 20;
          const tipY = headOffset + neckFlex;

          // Hydraulic neck conduits
          ctx.strokeStyle = '#65a30d';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(10, headOffset * 0.5);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          // Serpent/Hydra Head Armor
          ctx.fillStyle = isHit ? '#ffffff' : '#1a2e05';
          ctx.strokeStyle = enraged ? '#ffe600' : '#84cc16';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tipX + 16, tipY);
          ctx.lineTo(tipX, tipY - 11);
          ctx.lineTo(tipX - 10, tipY);
          ctx.lineTo(tipX, tipY + 11);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Corrosive optic eye
          ctx.fillStyle = '#a3e635';
          ctx.beginPath();
          ctx.arc(tipX + 4, tipY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chemical Reactor Core
        ctx.beginPath();
        ctx.arc(-10, 0, 16 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#4d7c0f';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 9. ASTRON PULSAR NEUTRON STAR CORE (Pulsar)
      else if (this.bossType === 'pulsar') {
        ctx.save();
        const bAng = this.pulsarBeamAngle || 0;

        // Relativistic Continuous Laser Plumes from North & South Magnetic Poles
        ctx.save();
        ctx.rotate(bAng);
        ctx.strokeStyle = enraged ? 'rgba(255, 0, 85, 0.65)' : 'rgba(244, 63, 94, 0.45)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(190, 0);
        ctx.moveTo(0, 0); ctx.lineTo(-190, 0);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(190, 0);
        ctx.moveTo(0, 0); ctx.lineTo(-190, 0);
        ctx.stroke();
        ctx.restore();

        // Nested Magnetic Flux Containment Rings
        ctx.rotate(frameCount * 0.03);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, 48 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(-frameCount * 0.05);
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-30, -30, 60, 60);

        // Radiant Neutron Star Core
        ctx.beginPath();
        ctx.arc(0, 0, 20 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.restore();
      }

      // 10. SHADOW VALKYRIE ZERO ROGUE PROTOTYPE (Valkyrie Zero)
      else if (this.bossType === 'valkyrie_zero') {
        ctx.save();
        ctx.rotate(this.angle);

        // Dark Corrupted Interceptor Hull
        ctx.fillStyle = isHit ? '#ffffff' : '#170308';
        ctx.strokeStyle = enraged ? '#ffe600' : '#e11d48';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(52, 0);
        ctx.lineTo(6, -42);
        ctx.lineTo(-32, -32);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-32, 32);
        ctx.lineTo(6, 42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Dual Wing-Mounted Plasma Katana Hardpoints
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(6, -42); ctx.lineTo(34, -30);
        ctx.moveTo(6, 42); ctx.lineTo(34, 30);
        ctx.stroke();

        // Red Chromatic Afterimage Hazard Wings
        ctx.fillStyle = 'rgba(225, 29, 72, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, -30); ctx.lineTo(-24, -46); ctx.lineTo(-20, -18);
        ctx.moveTo(0, 30); ctx.lineTo(-24, 46); ctx.lineTo(-20, 18);
        ctx.fill();

        // Crimson Synapse Cockpit Core
        ctx.beginPath();
        ctx.arc(10, 0, 11 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#e11d48';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 11. NEXUS OVERMIND CARRIER MATRIX (Hivemind)
      else if (this.bossType === 'hivemind') {
        ctx.save();
        ctx.rotate(frameCount * 0.015);

        // Hex Barrier Forcefield (when active)
        if (this.hexBarrierActive > 0) {
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let h = 0; h < 6; h++) {
            const ha = (h * Math.PI) / 3;
            const hx = Math.cos(ha) * 72;
            const hy = Math.sin(ha) * 72;
            if (h === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Regular Hexagonal Carrier Hull
        ctx.fillStyle = isHit ? '#ffffff' : '#031a17';
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        for (let h = 0; h < 6; h++) {
          const ha = (h * Math.PI) / 3;
          const hx = Math.cos(ha) * 56;
          const hy = Math.sin(ha) * 56;
          if (h === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 6 Perimeter Drone Launch Bays
        for (let h = 0; h < 6; h++) {
          ctx.save();
          ctx.rotate((h * Math.PI) / 3);
          ctx.fillStyle = '#0d9488';
          ctx.fillRect(44, -5, 12, 10);
          ctx.fillStyle = '#2dd4bf';
          ctx.beginPath();
          ctx.arc(50, 0, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Central Quantum Overmind Nexus
        ctx.beginPath();
        ctx.arc(0, 0, 18 + pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#14b8a6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.restore();
      }

      // 12. SIREN BANSHEE ACOUSTIC WARCRUISER (Banshee)
      else if (this.bossType === 'banshee') {
        ctx.save();
        ctx.rotate(this.angle);

        // Supersonic Needle Hull with Forward-Raked Tuning Fork Prongs
        ctx.fillStyle = isHit ? '#ffffff' : '#110724';
        ctx.strokeStyle = enraged ? '#c4b5fd' : '#8b5cf6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(64, -18);
        ctx.lineTo(24, -18);
        ctx.lineTo(12, -40);
        ctx.lineTo(-44, -30);
        ctx.lineTo(-32, 0);
        ctx.lineTo(-44, 30);
        ctx.lineTo(12, 40);
        ctx.lineTo(24, 18);
        ctx.lineTo(64, 18);
        ctx.lineTo(54, 8);
        ctx.lineTo(16, 8);
        ctx.lineTo(16, -8);
        ctx.lineTo(54, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Acoustic Soundwave Ring Arcs
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.55)';
        ctx.lineWidth = 1.8;
        for (let sw = 1; sw <= 3; sw++) {
          const swR = 24 + sw * 14 + pulse * 4;
          ctx.beginPath();
          ctx.arc(20, 0, swR, -0.6, 0.6);
          ctx.stroke();
        }

        // Central Discord Acoustic Reactor
        ctx.beginPath();
        ctx.arc(-2, 0, 15 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ffe600' : '#8b5cf6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 13. FROST JOTUNN CRYO-AEGIS MONOLITH (Glacier)
      else if (this.bossType === 'glacier') {
        ctx.save();
        const sAng = this.cryoShardAngle || 0;

        // 6 Orbiting Cryo-Mirror Shield Shards
        for (let s = 0; s < (this.cryoShards || 6); s++) {
          const sa = sAng + (s * Math.PI) / 3;
          const sx = Math.cos(sa) * 58;
          const sy = Math.sin(sa) * 58;

          // Frost tether
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(sx, sy);
          ctx.stroke();

          // Hexagonal cryo shield shard
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(sa);
          ctx.fillStyle = '#06b6d4';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.fillRect(-7, -7, 14, 14);
          ctx.strokeRect(-7, -7, 14, 14);
          ctx.restore();
        }

        // Faceted Crystalline Ice Monolith Hull
        ctx.rotate(this.angle);
        ctx.fillStyle = isHit ? '#ffffff' : '#021820';
        ctx.strokeStyle = enraged ? '#cffafe' : '#06b6d4';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(54, 0);
        ctx.lineTo(24, -38);
        ctx.lineTo(-32, -38);
        ctx.lineTo(-54, 0);
        ctx.lineTo(-32, 38);
        ctx.lineTo(24, 38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Diamond Ice Facet Lines
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -38); ctx.lineTo(20, 0); ctx.lineTo(0, 38);
        ctx.moveTo(0, -38); ctx.lineTo(-20, 0); ctx.lineTo(0, 38);
        ctx.stroke();

        // Sub-Zero Absolute Zero Core
        ctx.beginPath();
        ctx.arc(0, 0, 16 + pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }

      // 14. APEX OBLIVION COSMIC DOOMSDAY SYSTEM (Oblivion)
      else if (this.bossType === 'oblivion') {
        ctx.save();
        const rAngles = this.celestialRingAngles || [0, 0, 0, 0];

        // 4 Celestial Rings rotating on independent mathematical axes
        for (let r = 0; r < 4; r++) {
          ctx.save();
          ctx.rotate(rAngles[r]);
          ctx.strokeStyle = r % 2 === 0 ? '#ffffff' : (enraged ? '#ff0077' : '#ffe600');
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, 42 + r * 11 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
          // Celestial glyph pips
          for (let g = 0; g < 4; g++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(40 + r * 11 + pulse * 3, -3, 6, 6);
          }
          ctx.restore();
        }

        // 8 Floating Orbital Judgment Nodes
        for (let o = 0; o < 8; o++) {
          const oa = frameCount * 0.02 + (o * Math.PI) / 4;
          const ox = Math.cos(oa) * 78;
          const oy = Math.sin(oa) * 78;
          ctx.fillStyle = '#ffe600';
          ctx.fillRect(ox - 4, oy - 4, 8, 8);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ox - 4, oy - 4, 8, 8);
        }

        // Central Cataclysmic Doomsday Core (White Singularity)
        ctx.beginPath();
        ctx.arc(0, 0, 22 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = enraged ? '#ff0077' : '#ffe600';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Inner Obsidian Singularity Eye
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.restore();
      }

      // 15. OMEGA SERAPHIM DREADNOUGHT (Seraphim / Default)
      else {
        const bossAccent = enraged ? '#ff0055' : '#00f0ff';

        // Layer 1: Outer Rotating Halo & 4 Heavy Weapon Wing-Pylons
        ctx.save();
        ctx.rotate(frameCount * 0.015);
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 2);
          ctx.fillStyle = isHit ? '#ffffff' : '#180726';
          ctx.strokeStyle = primary;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(38, -14);
          ctx.lineTo(66 + pulse * 6, -22);
          ctx.lineTo(58 + pulse * 6, 0);
          ctx.lineTo(66 + pulse * 6, 22);
          ctx.lineTo(38, 14);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(54, 0, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = bossAccent;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Layer 2: 6 Segmented Armor Plates
        ctx.save();
        ctx.rotate(-frameCount * 0.022);
        const flare = (enraged ? 6 : 0) + pulse * 4;
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 3);
          ctx.translate(flare, 0);
          ctx.beginPath();
          ctx.arc(0, 0, 44, -0.42, 0.42);
          ctx.arc(0, 0, 30, 0.42, -0.42, true);
          ctx.closePath();
          ctx.fillStyle = isHit ? '#fff' : 'rgba(157, 78, 221, 0.32)';
          ctx.strokeStyle = enraged ? '#ff0077' : primary;
          ctx.lineWidth = 2.5;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();

        // Layer 3: Inner Sacred-Geometry Octagram Reactor Ring
        ctx.save();
        ctx.rotate(frameCount * 0.04);
        ctx.strokeStyle = bossAccent;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-20, -20, 40, 40);
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-20, -20, 40, 40);
        ctx.restore();

        // Layer 4: Central Singularity Core & Eye
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#090214';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffe600';
        ctx.stroke();

        const eyeX = Math.cos(this.angle) * 5;
        const eyeY = Math.sin(this.angle) * 5;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 6 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = enraged ? '#ff0055' : '#ffe600';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    ctx.restore();

    // HP bar & Elite Badge above regular enemies (drawn in unrotated camera-world space)
    if (!this.isBoss && this.type !== 'boss' && (this.hp < this.maxHp || this.isElite || this.type === 'juggernaut' || this.type === 'nemesis')) {
      const w = this.radius * 2.1;
      ctx.fillStyle = 'rgba(10, 15, 30, 0.8)';
      ctx.fillRect(-w / 2, -this.radius - 14, w, 4.5);
      ctx.fillStyle = this.type === 'nemesis' ? '#ff0055' : (this.isElite ? '#ffe600' : this.color);
      ctx.fillRect(-w / 2, -this.radius - 14, Math.max(0, (this.hp / this.maxHp) * w), 4.5);
      if (this.type === 'nemesis') {
        ctx.font = "900 10px 'Segoe UI', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.fillText('[VIP] NEMESIS BOUNTY', 0, -this.radius - 18);
        // Vector target diamond
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius - 34);
        ctx.lineTo(5, -this.radius - 29);
        ctx.lineTo(0, -this.radius - 24);
        ctx.lineTo(-5, -this.radius - 29);
        ctx.closePath();
        ctx.stroke();
      } else if (this.isElite) {
        ctx.font = "900 9px 'Segoe UI', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.fillText('[ELITE]', 0, -this.radius - 18);
      }
    }

    ctx.restore();
  }
}

