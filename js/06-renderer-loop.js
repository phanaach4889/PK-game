// ============================================================================
// MODULE 06: WORLD RENDERER, RADAR, A.R.E.S. RETICLE, 3D HOLOGRAM & MAIN LOOP
// ============================================================================
// Draw Beat-Reactive Warping Cyber-Grid (Camera-Culled Single-Path Open-World Renderer)
function drawCyberGrid() {
  const spacing = 64;
  const pulse = sound.beatPulse;
  const activeBiome = getActiveBiome(player.x, player.y);
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = player.overdriveActive > 0
    ? `rgba(255, 0, 119, ${0.16 + pulse * 0.18})`
    : `rgba(${activeBiome.rgb}, ${0.09 + pulse * 0.14})`;

  const startCol = Math.max(0, Math.floor(camX / spacing));
  const endCol = Math.min(Math.ceil(WORLD_W / spacing), Math.ceil((camX + canvas.width) / spacing));
  const startRow = Math.max(0, Math.floor(camY / spacing));
  const endRow = Math.min(Math.ceil(WORLD_H / spacing), Math.ceil((camY + canvas.height) / spacing));
  const minX = startCol * spacing;
  const maxX = endCol * spacing;
  const minY = startRow * spacing;
  const maxY = endRow * spacing;

  // Fast single path & 1 stroke call for only the visible viewport (0 heap allocations!)
  ctx.beginPath();
  for (let c = startCol; c <= endCol; c++) {
    const x = c * spacing;
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
  }
  for (let r = startRow; r <= endRow; r++) {
    const y = r * spacing;
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
  }
  ctx.stroke();

  // Draw expanding shockwave rings (capped and zero allocations)
  if (gridRipples.length > 0) {
    for (let i = gridRipples.length - 1; i >= 0; i--) {
      const rp = gridRipples[i];
      rp.r += (rp.maxR - rp.r) * 0.14;
      rp.life -= 0.04;
      if (rp.life <= 0) {
        gridRipples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color;
      ctx.globalAlpha = rp.life * 0.35;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }

  // Draw Biome Territory Perimeter Rings & Sector Landmarks
  ctx.setLineDash([18, 12]);
  ctx.lineWidth = 2;
  for (let i = 0; i < BIOME_ZONES.length; i++) {
    const bz = BIOME_ZONES[i];
    ctx.strokeStyle = `rgba(${bz.rgb}, 0.26)`;
    ctx.beginPath();
    ctx.arc(bz.x, bz.y, bz.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Draw Outer World Forcefield Barrier
  ctx.strokeStyle = 'rgba(255, 0, 119, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, WORLD_W - 48, WORLD_H - 48);

  ctx.restore();
}

// Draw Off-Screen Tactical Waypoint Indicators (HUD-Safe Compass Ring + Angular De-Collision)
function drawOffscreenWaypoints() {
  const targets = [];

  // Add active Bosses & VIP Nemesis Bounties
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.active) continue;
    if (e.isBoss || e.type === 'boss' || e.type.startsWith('boss')) {
      targets.push({ x: e.x, y: e.y, color: e.color || '#ff0055', label: 'BOSS' });
    } else if (e.type === 'nemesis') {
      targets.push({ x: e.x, y: e.y, color: '#ffe600', label: 'VIP' });
    }
  }

  // Add active Cyber-Contract Waypoints (Slalom Gate or Orbital Heist Core)
  if (activeContract) {
    if (activeContract.type === 'slalom') {
      const g = activeContract.gates[activeContract.progress];
      if (g && !g.cleared) {
        targets.push({ x: g.x, y: g.y, color: '#ffe600', label: `GATE ${activeContract.progress + 1}` });
      }
    } else if (activeContract.type === 'heist') {
      targets.push({ x: activeContract.x, y: activeContract.y, color: '#00f0ff', label: 'HEIST' });
    }
  }

  // Add nearest Shrine, Warp Gate, Jackpot Obelisk, and Data Vault
  let nearestShrine = null;
  let nearestShrineDist = 3200;
  let nearestGate = null;
  let nearestGateDist = 3200;
  let nearestCache = null;
  let nearestCacheDist = 2400;
  let nearestSlot = null;
  let nearestSlotDist = 2400;

  for (let i = 0; i < worldProps.length; i++) {
    const wp = worldProps[i];
    if (!wp.active) continue;
    const d = Math.hypot(wp.x - player.x, wp.y - player.y);
    if (wp.type === 'shrine' && d < nearestShrineDist) {
      nearestShrineDist = d;
      nearestShrine = wp;
    } else if (wp.type === 'warp_gate' && d < nearestGateDist) {
      nearestGateDist = d;
      nearestGate = wp;
    } else if (wp.type === 'cache' && d < nearestCacheDist) {
      nearestCacheDist = d;
      nearestCache = wp;
    } else if (wp.type === 'slot_obelisk' && wp.cooldown <= 0 && d < nearestSlotDist) {
      nearestSlotDist = d;
      nearestSlot = wp;
    }
  }

  if (nearestShrine) targets.push({ x: nearestShrine.x, y: nearestShrine.y, color: '#ffe600', label: 'SHRINE' });
  if (nearestGate) targets.push({ x: nearestGate.x, y: nearestGate.y, color: '#d946ef', label: 'WARP' });
  if (nearestSlot) targets.push({ x: nearestSlot.x, y: nearestSlot.y, color: '#ff0077', label: '777' });
  if (nearestCache) targets.push({ x: nearestCache.x, y: nearestCache.y, color: '#00f0ff', label: 'VAULT' });

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  // HUD-safe compass ellipse around screen center (never enters top/side/bottom HUD zones)
  const rx = Math.min(235, canvas.width * 0.24);
  const ry = Math.min(150, canvas.height * 0.22);

  const visibleWaypoints = [];
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const sx = t.x - camX;
    const sy = t.y - camY;
    // Skip if already visible on screen
    if (sx >= 50 && sx <= canvas.width - 50 && sy >= 50 && sy <= canvas.height - 50) continue;
    const ang = Math.atan2(sy - cy, sx - cx);
    const distMeters = Math.round(Math.hypot(t.x - player.x, t.y - player.y) / 10);
    visibleWaypoints.push({ ...t, ang, drawAng: ang, distMeters });
  }

  if (visibleWaypoints.length === 0) return;

  // Angular de-collision so two nearby waypoints never overlap each other
  visibleWaypoints.sort((a, b) => a.drawAng - b.drawAng);
  const minSep = 0.34;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < visibleWaypoints.length; i++) {
      const prev = visibleWaypoints[i - 1];
      const cur = visibleWaypoints[i];
      const diff = cur.drawAng - prev.drawAng;
      if (diff < minSep) {
        const push = (minSep - diff) * 0.5;
        prev.drawAng -= push;
        cur.drawAng += push;
      }
    }
  }

  ctx.save();
  ctx.font = "800 9px 'Segoe UI', sans-serif";
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.62;

  for (let i = 0; i < visibleWaypoints.length; i++) {
    const w = visibleWaypoints[i];
    const ix = cx + Math.cos(w.drawAng) * rx;
    const iy = cy + Math.sin(w.drawAng) * ry;

    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(w.ang);
    ctx.fillStyle = w.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = w.color;
    ctx.fillText(`${w.label} ${w.distMeters}m`, ix, iy + (Math.sin(w.drawAng) > 0 ? 13 : -8));
  }
  ctx.restore();
}

// Render Live Holographic Sector Radar Minimap
const radarCanvas = document.getElementById('radarCanvas');
const rCtx = radarCanvas ? radarCanvas.getContext('2d') : null;
function drawRadar() {
  if (!rCtx || frameCount % 2 !== 0) return;
  const rw = radarCanvas.width;
  const rh = radarCanvas.height;
  const scaleX = rw / WORLD_W;
  const scaleY = rh / WORLD_H;

  rCtx.clearRect(0, 0, rw, rh);

  // Subtle radar grid
  rCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
  rCtx.lineWidth = 1;
  rCtx.beginPath();
  for (let g = 1; g < 4; g++) {
    rCtx.moveTo((rw * g) / 4, 0); rCtx.lineTo((rw * g) / 4, rh);
    rCtx.moveTo(0, (rh * g) / 4); rCtx.lineTo(rw, (rh * g) / 4);
  }
  rCtx.stroke();

  // Biome circles
  for (let i = 0; i < BIOME_ZONES.length; i++) {
    const bz = BIOME_ZONES[i];
    rCtx.strokeStyle = `rgba(${bz.rgb}, 0.32)`;
    rCtx.beginPath();
    rCtx.arc(bz.x * scaleX, bz.y * scaleY, bz.r * scaleX, 0, Math.PI * 2);
    rCtx.stroke();
  }

  // World Props (Shrines, Vaults, Turrets, Warp Gates, Jackpot Obelisks)
  for (let i = 0; i < worldProps.length; i++) {
    const wp = worldProps[i];
    if (!wp.active || wp.type === 'boost_ring' || wp.type === 'emp_pylon') continue;
    rCtx.fillStyle = wp.color;
    const px = wp.x * scaleX;
    const py = wp.y * scaleY;
    if (wp.type === 'shrine' || wp.type === 'warp_gate' || wp.type === 'slot_obelisk') {
      rCtx.fillRect(px - 2.5, py - 2.5, 5, 5);
    } else {
      rCtx.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
  }

  // Active Cyber-Contract Radar Blip
  if (activeContract) {
    if (activeContract.type === 'slalom') {
      const g = activeContract.gates[activeContract.progress];
      if (g) {
        rCtx.fillStyle = '#ffe600';
        rCtx.fillRect(g.x * scaleX - 3, g.y * scaleY - 3, 6, 6);
      }
    } else if (activeContract.type === 'heist') {
      rCtx.strokeStyle = '#00f0ff';
      rCtx.beginPath();
      rCtx.arc(activeContract.x * scaleX, activeContract.y * scaleY, 5, 0, Math.PI * 2);
      rCtx.stroke();
    }
  }

  // Cyber-Buildings on Radar Minimap
  if (buildings && buildings.length > 0) {
    rCtx.fillStyle = 'rgba(0, 240, 255, 0.22)';
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      rCtx.fillRect((b.x - b.w / 2) * scaleX, (b.y - b.h / 2) * scaleY, b.w * scaleX, b.h * scaleY);
    }
  }

  // Enemies & Apex Mega-Bosses
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.active) continue;
    const isB = e.isBoss || e.type === 'boss' || e.type.startsWith('boss');
    rCtx.fillStyle = isB ? (e.color || '#ffe600') : (e.type === 'nemesis' ? '#ffe600' : '#ff0055');
    const s = isB ? 6 : (e.type === 'nemesis' ? 4 : 2.2);
    rCtx.fillRect(e.x * scaleX - s / 2, e.y * scaleY - s / 2, s, s);
  }

  // Camera Viewport Box
  rCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  rCtx.lineWidth = 1;
  rCtx.strokeRect(camX * scaleX, camY * scaleY, canvas.width * scaleX, canvas.height * scaleY);

  // Player Dot
  rCtx.fillStyle = '#00f0ff';
  rCtx.beginPath();
  rCtx.arc(player.x * scaleX, player.y * scaleY, 3, 0, Math.PI * 2);
  rCtx.fill();
}

// Draw A.R.E.S. Cyber-Tactical Smart-Optics Reticle & World-Space Lock-On HUD (Zero shadowBlur)
function drawReticle() {
  const mx = mouse.screenX || canvas.width / 2;
  const my = mouse.screenY || canvas.height / 2;
  const psx = player.x - camX;
  const psy = player.y - camY;
  const isOver = player.overdriveActive > 0;
  const locked = (player.lockedTarget && player.lockedTarget.active) ? player.lockedTarget : null;
  const bloom = player.reticleBloom || 0;
  const hitTimer = player.reticleHitTimer || 0;
  const killTimer = player.reticleKillTimer || 0;

  const primaryCol = isOver ? '#ffe600' : (locked ? '#ff0077' : '#00f0ff');
  const secondaryCol = isOver ? '#ff0077' : (locked ? '#ffe600' : '#00ff88');

  ctx.save();

  // =========================================================================
  // 1. HOLOGRAPHIC LASER SIGHT & TARGET LOCK-ON BRACKETS (SCREEN-SPACE)
  // =========================================================================
  const aimDist = Math.min(560, Math.hypot(mx - psx, my - psy));
  if (aimDist > 42) {
    const ax = Math.cos(player.angle);
    const ay = Math.sin(player.angle);
    const startD = 26;
    const endD = Math.min(aimDist - 24, 380);

    if (endD > startD) {
      // Subtle segmented ballistic vector line from ship nose
      ctx.beginPath();
      ctx.setLineDash([8, 10]);
      ctx.lineDashOffset = -(frameCount * 1.8);
      ctx.moveTo(psx + ax * startD, psy + ay * startD);
      ctx.lineTo(psx + ax * endD, psy + ay * endD);
      ctx.strokeStyle = locked ? 'rgba(255, 0, 119, 0.34)' : (isOver ? 'rgba(255, 230, 0, 0.34)' : 'rgba(0, 240, 255, 0.24)');
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.setLineDash([]);

      // Rangefinder perpendicular micro-ticks along aim vector
      const px = -ay;
      const py = ax;
      ctx.beginPath();
      for (let d = 90; d < endD; d += 85) {
        const tx = psx + ax * d;
        const ty = psy + ay * d;
        ctx.moveTo(tx - px * 3.5, ty - py * 3.5);
        ctx.lineTo(tx + px * 3.5, ty + py * 3.5);
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.32)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
  }

  // Active Target Lock-On Overlay on Locked Enemy + Predictive Lead Pip
  if (locked) {
    const tsx = locked.x - camX;
    const tsy = locked.y - camY;
    const lsx = (player.lockedLeadX || locked.x) - camX;
    const lsy = (player.lockedLeadY || locked.y) - camY;
    const tr = locked.radius + 12 + Math.sin(frameCount * 0.2) * 2.5;

    // Magnetic tether from cursor to predictive lead point
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(mx, my);
    ctx.lineTo(lsx, lsy);
    ctx.lineTo(tsx, tsy);
    ctx.strokeStyle = 'rgba(255, 0, 119, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);

    // Predictive ballistic lead pip (small diamond ahead of moving enemy)
    if (Math.hypot(lsx - tsx, lsy - tsy) > 6) {
      ctx.save();
      ctx.translate(lsx, lsy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-4, -4, 8, 8);
      ctx.restore();
    }

    // Locked Enemy Corner Sniper Brackets & HP Arc
    ctx.save();
    ctx.translate(tsx, tsy);

    // Enemy HP ring arc
    const hpRatio = Math.max(0, Math.min(1, locked.hp / (locked.maxHp || 1)));
    ctx.beginPath();
    ctx.arc(0, 0, tr + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
    ctx.strokeStyle = hpRatio > 0.5 ? '#00ff88' : (hpRatio > 0.25 ? '#ffe600' : '#ff0055');
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Rotating 4 Corner Lock-On Brackets
    ctx.rotate(frameCount * 0.03);
    ctx.strokeStyle = '#ff0077';
    ctx.lineWidth = 2.2;
    const bLen = Math.max(7, Math.min(14, tr * 0.38));
    ctx.beginPath();
    // Top-left
    ctx.moveTo(-tr, -tr + bLen); ctx.lineTo(-tr, -tr); ctx.lineTo(-tr + bLen, -tr);
    // Top-right
    ctx.moveTo(tr - bLen, -tr); ctx.lineTo(tr, -tr); ctx.lineTo(tr, -tr + bLen);
    // Bottom-right
    ctx.moveTo(tr, tr - bLen); ctx.lineTo(tr, tr); ctx.lineTo(tr - bLen, tr);
    // Bottom-left
    ctx.moveTo(-tr + bLen, tr); ctx.lineTo(-tr, tr); ctx.lineTo(-tr, tr - bLen);
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 2. MULTI-LAYER CYBER-TACTICAL CURSOR OPTICS AT (mx, my)
  // =========================================================================
  ctx.translate(mx, my);

  const baseR = (locked ? 11.5 : 13.5) + sound.beatPulse * 2.5 + bloom * 0.65;
  const outerR = 22 + bloom * 0.35;

  // High-contrast dark backdrop ring so cursor NEVER disappears in bright explosions
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(2, 4, 14, 0.85)';
  ctx.lineWidth = 5.2;
  ctx.stroke();

  // 3 Built-In Micro Cooldown Arcs around the Cursor (Dash [Left], Katana [Right], Nova [Bottom])
  const arcR = outerR + 5.5;
  // Left Arc: Phase-Dash [SPACE / RMB]
  const dashPct = Math.max(0, Math.min(1, 1 - (player.dashCooldown / (player.dashMaxCooldown || 64))));
  ctx.beginPath();
  ctx.arc(0, 0, arcR, Math.PI * 0.68, Math.PI * 1.32);
  ctx.strokeStyle = 'rgba(2, 6, 18, 0.75)';
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, arcR, Math.PI * 0.68, Math.PI * (0.68 + 0.64 * dashPct));
  ctx.strokeStyle = dashPct >= 0.99 ? '#00f0ff' : 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Right Arc: Judgement Cut Katana [Q]
  const katPct = Math.max(0, Math.min(1, 1 - (player.katanaCooldown / (player.katanaMaxCooldown || 48))));
  ctx.beginPath();
  ctx.arc(0, 0, arcR, -Math.PI * 0.32, Math.PI * 0.32);
  ctx.strokeStyle = 'rgba(2, 6, 18, 0.75)';
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, arcR, -Math.PI * 0.32, -Math.PI * 0.32 + Math.PI * 0.64 * katPct);
  ctx.strokeStyle = katPct >= 0.99 ? (player.katanaInRange ? '#ffe600' : '#00ff88') : 'rgba(0, 255, 136, 0.45)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Bottom Arc: Seraphim Supernova [E] / Active Beam [R]
  const odPct = isOver
    ? Math.max(0.05, Math.min(1, player.overdriveActive / (player.overdriveMaxActive || 2400)))
    : 1.0;
  ctx.beginPath();
  ctx.arc(0, 0, arcR, Math.PI * 0.38, Math.PI * 0.62);
  ctx.strokeStyle = isOver ? '#ffe600' : '#ff0077';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Counter-Rotating Outer Cyber Compass Ring (8 degree ticks)
  ctx.save();
  ctx.rotate(-frameCount * 0.025);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a0 = (i * Math.PI) / 2 + 0.18;
    const a1 = a0 + 0.55;
    ctx.arc(0, 0, outerR, a0, a1);
  }
  ctx.strokeStyle = locked ? 'rgba(255, 230, 0, 0.75)' : 'rgba(0, 240, 255, 0.52)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r1 = outerR - 2.5;
    const r2 = outerR + (i % 2 === 0 ? 3.5 : 1.8);
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
  }
  ctx.strokeStyle = secondaryCol;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  // Inner Rotating Segmented Optic Ring + Cardinal Crosshair Blades
  ctx.save();
  ctx.rotate(frameCount * (locked ? 0.065 : 0.035));
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.moveTo(Math.cos(a + 0.18) * baseR, Math.sin(a + 0.18) * baseR);
    ctx.arc(0, 0, baseR, a + 0.18, a + Math.PI / 2 - 0.18);
  }
  ctx.strokeStyle = primaryCol;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // 4 Crisp Cardinal Crosshair Blades with Dark Contrast Outline
  const bladeIn = Math.max(4.5, baseR - 4);
  const bladeOut = baseR + 6.5 + bloom * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.moveTo(Math.cos(a) * bladeIn, Math.sin(a) * bladeIn);
    ctx.lineTo(Math.cos(a) * bladeOut, Math.sin(a) * bladeOut);
  }
  ctx.strokeStyle = '#02040e';
  ctx.lineWidth = 4.2;
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.stroke();
  ctx.restore();

  // 4 Non-Rotating Diagonal Recoil / Lock-On Corner Chevrons (45 deg)
  const chevDist = (locked ? 13 : 16.5) + bloom * 0.9;
  const chevWing = 4.5;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const cx = Math.cos(a) * chevDist;
    const cy = Math.sin(a) * chevDist;
    const p1x = cx + Math.cos(a + 2.35) * chevWing;
    const p1y = cy + Math.sin(a + 2.35) * chevWing;
    const p2x = cx + Math.cos(a - 2.35) * chevWing;
    const p2y = cy + Math.sin(a - 2.35) * chevWing;
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(cx, cy);
    ctx.lineTo(p2x, p2y);
  }
  ctx.strokeStyle = '#02040e';
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.strokeStyle = locked ? '#ffe600' : secondaryCol;
  ctx.lineWidth = 1.9;
  ctx.stroke();

  // Horizontal Sniper Stabilizer Wings
  ctx.beginPath();
  ctx.moveTo(-outerR - 14, 0); ctx.lineTo(-outerR - 7, 0);
  ctx.moveTo(outerR + 7, 0); ctx.lineTo(outerR + 14, 0);
  ctx.strokeStyle = primaryCol;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Live Hit-Marker & Kill-Confirm Diagonal X-Blades!
  if (hitTimer > 0 || killTimer > 0) {
    const isKill = killTimer > 0;
    const hCol = isKill ? '#ff0055' : (player.reticleHitCrit ? '#ffe600' : '#00f0ff');
    const hIn = 5;
    const hOut = isKill ? 19 : (player.reticleHitCrit ? 15 : 12);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      ctx.moveTo(Math.cos(a) * hIn, Math.sin(a) * hIn);
      ctx.lineTo(Math.cos(a) * hOut, Math.sin(a) * hOut);
    }
    ctx.strokeStyle = '#02040e';
    ctx.lineWidth = 4.4;
    ctx.stroke();
    ctx.strokeStyle = hCol;
    ctx.lineWidth = isKill ? 2.8 : 2.2;
    ctx.stroke();
  }

  // Exact Center Pinpoint Diamond Core (High-Contrast Dark Halo + Pure White Center)
  ctx.save();
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#02040e';
  ctx.fillRect(-3.6, -3.6, 7.2, 7.2);
  ctx.fillStyle = locked ? '#ffe600' : '#ffffff';
  ctx.fillRect(-2.2, -2.2, 4.4, 4.4);
  ctx.restore();

  // Tactical Micro-Telemetry Tag Below Reticle
  let tagText = '';
  let tagCol = '#00f0ff';
  if (locked) {
    const hpPct = Math.max(1, Math.ceil((locked.hp / (locked.maxHp || 1)) * 100));
    const tName = locked.isBoss ? (locked.bossType ? locked.bossType.toUpperCase() : 'BOSS') : (locked.type || 'HOSTILE').toUpperCase();
    tagText = `LOCK // ${tName} ${hpPct}%`;
    tagCol = '#ff0077';
  } else if (player.katanaInRange && player.katanaCooldown <= 0) {
    tagText = '[Q] CLEAVE / PARRY';
    tagCol = '#00ff88';
  } else if (isOver) {
    tagText = `NOVA ${Math.ceil(player.overdriveActive / 60)}s [E+]`;
    tagCol = '#ffe600';
  }

  if (tagText) {
    ctx.font = "900 9px 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(2, 4, 14, 0.88)';
    ctx.fillText(tagText, 1, outerR + 17);
    ctx.fillStyle = tagCol;
    ctx.fillText(tagText, 0, outerR + 16);
  }

  ctx.restore();
}

// Update Audio Visualizer Bars in HUD (Throttled to 30fps for zero DOM layout overhead)
const vBars = document.querySelectorAll('.v-bar');
function updateVisualizer() {
  sound.beatPulse *= 0.88;
  if (frameCount % 2 !== 0) return;
  if (sound.analyser && sound.enabled && sound.isPlaying) {
    sound.analyser.getByteFrequencyData(sound.freqData);
    for (let i = 0; i < vBars.length; i++) {
      const val = sound.freqData[i % sound.freqData.length] || 15;
      const pct = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
      vBars[i].style.height = `${pct}%`;
    }
  } else {
    for (let i = 0; i < vBars.length; i++) {
      vBars[i].style.height = '18%';
    }
  }
}

// Cached HUD DOM References & State (Prevents 60fps backdrop-filter re-rasterization!)
const hudEls = {
  leftPanel: document.getElementById('leftHudPanel'),
  centerPanel: document.getElementById('centerHudPanel'),
  rightPanel: document.getElementById('rightHudPanel'),
  hpText: document.getElementById('hpText'),
  hpBar: document.getElementById('hpBar'),
  dashText: document.getElementById('dashText'),
  dashBar: document.getElementById('dashBar'),
  katanaText: document.getElementById('katanaText'),
  katanaBar: document.getElementById('katanaBar'),
  odText: document.getElementById('overdriveText'),
  odBar: document.getElementById('overdriveBar'),
  xpText: document.getElementById('xpText'),
  xpBar: document.getElementById('xpBar'),
  lvlText: document.getElementById('lvlText'),
  score: document.getElementById('scoreDisplay'),
  bossHud: document.getElementById('bossHud'),
  bossName: document.getElementById('bossName'),
  bossBar: document.getElementById('bossHpBar'),
  bossText: document.getElementById('bossHpText'),
  contractTracker: document.getElementById('contractTracker'),
  contractTitle: document.getElementById('contractTitle'),
  contractTimer: document.getElementById('contractTimer'),
  contractDesc: document.getElementById('contractDesc'),
  contractProgText: document.getElementById('contractProgText'),
  contractBar: document.getElementById('contractBar'),
  combo: document.getElementById('comboDisplay'),
  zoneDisplay: document.getElementById('zoneDisplay'),
  radarCoords: document.getElementById('radarCoords'),
  skillSlotQ: document.getElementById('skillSlotQ'),
  skillTextQ: document.getElementById('skillTextQ'),
  skillBarQ: document.getElementById('skillBarQ'),
  skillTierQ: document.getElementById('skillTierQ'),
  skillSlotR: document.getElementById('skillSlotR'),
  skillTextR: document.getElementById('skillTextR'),
  skillBarR: document.getElementById('skillBarR'),
  skillTierR: document.getElementById('skillTierR'),
  skillSlotF: document.getElementById('skillSlotF'),
  skillTextF: document.getElementById('skillTextF'),
  skillBarF: document.getElementById('skillBarF'),
  skillTierF: document.getElementById('skillTierF'),
  skillSlotX: document.getElementById('skillSlotX'),
  skillTextX: document.getElementById('skillTextX'),
  skillBarX: document.getElementById('skillBarX'),
  skillTierX: document.getElementById('skillTierX'),
  skillSlotE: document.getElementById('skillSlotE'),
  skillTextE: document.getElementById('skillTextE'),
  skillBarE: document.getElementById('skillBarE'),
  skillTierE: document.getElementById('skillTierE')
};
const hudCache = {};
function setHudText(key, text) {
  if (hudEls[key] && hudCache[key] !== text) {
    hudCache[key] = text;
    hudEls[key].textContent = text;
  }
}
function setHudWidth(key, pct) {
  const rounded = Math.round(pct * 2) / 2;
  if (hudEls[key] && hudCache[key] !== rounded) {
    hudCache[key] = rounded;
    hudEls[key].style.width = `${rounded}%`;
  }
}
function setSlotState(slotKey, isReady, isActive) {
  const el = hudEls[slotKey];
  if (!el) return;
  const rKey = slotKey + '_r';
  const aKey = slotKey + '_a';
  if (hudCache[rKey] !== isReady) {
    hudCache[rKey] = isReady;
    el.classList.toggle('skill-ready', isReady);
  }
  if (hudCache[aKey] !== isActive) {
    hudCache[aKey] = isActive;
    el.classList.toggle('skill-active', isActive);
  }
}

// 3D Perspective Wireframe Projection & Hologram System
function project3D(x, y, z, yaw, pitch, roll, cx, cy, fov = 420) {
  const cyw = Math.cos(yaw), syw = Math.sin(yaw);
  const x1 = x * cyw - z * syw;
  const z1 = x * syw + z * cyw;
  const y1 = y;

  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const y2 = y1 * cp - z1 * sp;
  const z2 = y1 * sp + z1 * cp;
  const x2 = x1;

  const cr = Math.cos(roll), sr = Math.sin(roll);
  const x3 = x2 * cr - y2 * sr;
  const y3 = x2 * sr + y2 * cr;
  const z3 = z2;

  const scale = fov / (fov + z3 + 120);
  return {
    x: cx + x3 * scale,
    y: cy + y3 * scale,
    z: z3,
    scale
  };
}

const startHoloParticles = [];

function drawHologramFighter(cx, cy) {
  const mouseOffsetX = ((mouse.screenX || canvas.width / 2) - canvas.width / 2) * 0.0008;
  const mouseOffsetY = ((mouse.screenY || canvas.height / 2) - canvas.height / 2) * 0.0008;
  const yaw = frameCount * 0.02 + mouseOffsetX;
  const pitch = -0.32 + Math.sin(frameCount * 0.02) * 0.08 + mouseOffsetY;
  const roll = Math.sin(frameCount * 0.016) * 0.12;

  let model;
  let themeCol = '#00f0ff';
  let secCol = '#ff0077';
  let label = 'VALKYRIE MK-IV // INTERCEPTOR';

  if (selectedChassis === 'titan') {
    themeCol = '#ff2a55';
    secCol = '#ffe600';
    label = 'AEGIS GOLIATH // DREADNOUGHT';
    model = {
      verts: [
        [0, 4, 48], [-26, 2, 28], [26, 2, 28], [0, -18, 4],
        [-68, 2, -14], [68, 2, -14], [-42, 6, -30], [42, 6, -30],
        [0, 4, -44], [-20, 4, -40], [20, 4, -40], [0, -26, -10]
      ],
      edges: [
        [0,1],[0,2],[1,3],[2,3],[1,4],[2,5],[4,6],[5,7],
        [6,9],[7,10],[9,8],[8,10],[3,11],[11,8],[1,6],[2,7],[0,3]
      ],
      thrusters: [[-20, 4, -40], [0, 4, -44], [20, 4, -40]]
    };
  } else if (selectedChassis === 'phantom') {
    themeCol = '#d946ef';
    secCol = '#00f0ff';
    label = 'VOID REAPER // INFILTRATOR';
    model = {
      verts: [
        [0, -2, 64], [0, -14, 20], [0, 0, 0], [-28, -4, 28],
        [28, -4, 28], [-64, 4, -26], [64, 4, -26], [-40, 2, -44],
        [40, 2, -44], [0, 2, -48], [-16, -2, 42], [16, -2, 42]
      ],
      edges: [
        [0,1],[1,2],[0,3],[0,4],[3,5],[4,6],[5,7],[6,8],
        [7,9],[8,9],[2,9],[3,10],[4,11],[0,10],[0,11],[1,5],[1,6]
      ],
      thrusters: [[0, 2, -48]]
    };
  } else {
    themeCol = '#00f0ff';
    secCol = '#ff0077';
    label = 'VALKYRIE MK-IV // INTERCEPTOR';
    model = {
      verts: [
        [0, 3, 58], [0, -11, 16], [0, -7, -14], [0, 11, -2],
        [-14, 2, 8], [14, 2, 8], [-58, 2, -18], [58, 2, -18],
        [-24, 4, -28], [24, 4, -28], [-10, 3, -38], [10, 3, -38],
        [-16, -24, -30], [16, -24, -30]
      ],
      edges: [
        [0,1],[1,2],[0,3],[3,2],[0,4],[0,5],[4,6],[5,7],
        [6,8],[7,9],[8,10],[9,11],[10,11],[2,12],[2,13],
        [12,10],[13,11],[1,4],[1,5]
      ],
      thrusters: [[-10, 3, -38], [10, 3, -38]]
    };
  }

  // Spawn ion particles from thrusters
  if (model.thrusters && Math.random() < 0.65) {
    const th = model.thrusters[Math.floor(Math.random() * model.thrusters.length)];
    const pt = project3D(th[0], th[1], th[2], yaw, pitch, roll, cx, cy);
    startHoloParticles.push({
      x: pt.x,
      y: pt.y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 2 + 1.2,
      life: 25,
      maxLife: 25,
      color: themeCol
    });
  }

  // Update & draw ion particles
  for (let i = startHoloParticles.length - 1; i >= 0; i--) {
    const p = startHoloParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      startHoloParticles.splice(i, 1);
      continue;
    }
    ctx.fillStyle = p.color;
    ctx.globalAlpha = (p.life / p.maxLife) * 0.75;
    ctx.fillRect(p.x - 1, p.y - 1, 2.5, 2.5);
  }
  ctx.globalAlpha = 1.0;

  // Draw Orbiting Holographic Rings
  ctx.save();
  ctx.translate(cx, cy);

  // Outer targeting degree scale
  ctx.save();
  ctx.rotate(-frameCount * 0.008);
  ctx.strokeStyle = `rgba(0, 240, 255, 0.22)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 115, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 110, Math.sin(a) * 110);
    ctx.lineTo(Math.cos(a) * 118, Math.sin(a) * 118);
    ctx.stroke();
  }
  ctx.restore();

  // Middle dashed ring
  ctx.save();
  ctx.rotate(frameCount * 0.016);
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = themeCol;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Inner bracket reticle
  ctx.strokeStyle = secCol;
  ctx.lineWidth = 1.5;
  const bSz = 85;
  ctx.strokeRect(-bSz, -bSz, 14, 14);
  ctx.strokeRect(bSz - 14, -bSz, 14, 14);
  ctx.strokeRect(-bSz, bSz - 14, 14, 14);
  ctx.strokeRect(bSz - 14, bSz - 14, 14, 14);
  ctx.restore();

  // Project vertices
  const proj = model.verts.map(v => project3D(v[0], v[1], v[2], yaw, pitch, roll, cx, cy));

  // Draw wireframe edges
  ctx.save();
  ctx.strokeStyle = themeCol;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < model.edges.length; i++) {
    const e = model.edges[i];
    const p1 = proj[e[0]];
    const p2 = proj[e[1]];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();

  // Glowing vertex nodes
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < proj.length; i++) {
    const p = proj[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizontal laser holographic scanline
  const scanY = cy - 65 + ((frameCount * 2.5) % 130);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 85, scanY);
  ctx.lineTo(cx + 85, scanY);
  ctx.stroke();

  // Holographic Telemetry Text Overlay
  ctx.font = "700 9px 'Courier New', monospace";
  ctx.textAlign = 'center';
  ctx.fillStyle = themeCol;
  ctx.fillText(`CHASSIS: [${label}]`, cx, cy + 132);
  ctx.fillStyle = '#94a3b8';
  const deg = Math.round(((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * (180 / Math.PI));
  ctx.fillText(`BEARING: ${deg.toString().padStart(3, '0')}° // STATUS: ARMED // 60 FPS`, cx, cy + 146);
  ctx.restore();
}

function drawStartScreenBackdrop() {
  ctx.fillStyle = '#03030a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const horizonY = canvas.height * 0.62;

  // 1. Moving space stars
  ctx.fillStyle = '#ffffff';
  const starSpeed = 0.8 + sound.beatPulse * 1.2;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.y = (s.y + s.z * starSpeed * 0.4) % canvas.height;
    ctx.globalAlpha = (s.z / 3.2) * 0.8;
    ctx.fillRect(s.x, s.y, s.z, s.z);
  }
  ctx.globalAlpha = 1.0;

  // 2. Synthwave Sunset / Singularity Core on Horizon
  const sunR = Math.min(180, canvas.width * 0.16);
  const sunGrad = ctx.createLinearGradient(cx, horizonY - sunR, cx, horizonY);
  sunGrad.addColorStop(0, '#ffe600');
  sunGrad.addColorStop(0.5, '#ff0077');
  sunGrad.addColorStop(1, '#9d4edd');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, horizonY, sunR, Math.PI, 0, false);
  ctx.fillStyle = sunGrad;
  ctx.globalAlpha = 0.55 + sound.beatPulse * 0.25;
  ctx.fill();

  // Slices through sun
  ctx.fillStyle = '#03030a';
  const sliceCount = 8;
  for (let sl = 1; sl <= sliceCount; sl++) {
    const slY = horizonY - (sunR * (sl / (sliceCount + 1)));
    const slH = 2 + sl * 1.2;
    ctx.fillRect(cx - sunR - 10, slY, (sunR + 10) * 2, slH);
  }
  ctx.restore();

  // 3. Undulating 3D Synthwave Horizon Grid
  ctx.save();
  const gridScroll = (frameCount * (1.6 + sound.beatPulse * 2.2)) % 40;
  ctx.lineWidth = 1.2;

  const linesCount = 28;
  for (let i = -linesCount; i <= linesCount; i++) {
    const spread = (i / linesCount);
    const bottomX = cx + spread * (canvas.width * 0.95);
    ctx.strokeStyle = Math.abs(i) % 2 === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 0, 119, 0.28)';
    ctx.beginPath();
    ctx.moveTo(cx, horizonY);
    ctx.lineTo(bottomX, canvas.height);
    ctx.stroke();
  }

  for (let z = 1; z < 18; z++) {
    const pz = z * 40 - gridScroll;
    if (pz <= 0) continue;
    const norm = pz / 720;
    const lineY = horizonY + Math.pow(norm, 1.8) * (canvas.height - horizonY);
    if (lineY > canvas.height) break;
    const alpha = Math.min(0.65, norm * 0.9);
    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvas.width, lineY);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Interactive 3D Holographic Wireframe Fighter
  drawHologramFighter(cx, horizonY - 45);
}

// Main Loop
function loop() {
  requestAnimationFrame(loop);
  frameCount++;
  updateVisualizer();

  if (hitStopFrames > 0) {
    hitStopFrames--;
    return;
  }

  if (gameState === 'START') {
    drawStartScreenBackdrop();
    return;
  }

  if (gameState === 'PLAYING') {
    runPlayFrames++;
    player.update();

    // Update Autonomous Allied Valkyrie Wingmen
    for (let i = 0; i < wingmen.length; i++) {
      wingmen[i].update();
    }
    wingmen = wingmen.filter(w => w.active);

    // Update Spatial Rifts, Chrono-Stasis Singularity Domes [F] & Phantom Holo-Decoy Clones [X]
    for (let i = 0; i < spatialRifts.length; i++) {
      spatialRifts[i].update();
    }
    spatialRifts = spatialRifts.filter(sr => sr.active);

    for (let i = 0; i < chronoFields.length; i++) {
      chronoFields[i].update();
    }
    chronoFields = chronoFields.filter(cf => cf.active);

    for (let i = 0; i < phantomDecoys.length; i++) {
      phantomDecoys[i].update();
    }
    phantomDecoys = phantomDecoys.filter(pd => pd.active);

    // Update Live Cyber-Contracts ([C] or auto-triggered)
    updateLiveContract();

    // Update Interactive Open-World Structures
    for (let i = 0; i < worldProps.length; i++) {
      worldProps[i].update();
    }
    worldProps = worldProps.filter(wp => wp.active);

    // Projectiles & Chain Lightning (capped at 160 active for locked 60 FPS during maximum chaos)
    if (projectiles.length > 160) projectiles.splice(0, projectiles.length - 160);
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      p.update();
      if (!p.active) continue;
      if (checkBuildingProjectileCollision(p)) continue;

      // Check collision with destructible World Props (Quantum Vaults & EMP Pylons)
      for (let w = 0; w < worldProps.length; w++) {
        const wp = worldProps[w];
        if (!wp.active || (wp.type !== 'cache' && wp.type !== 'emp_pylon') || p.hitIds.has(wp.id)) continue;
        const wdx = p.x - wp.x;
        const wdy = p.y - wp.y;
        const wHitR = p.radius + wp.radius;
        if (wdx * wdx + wdy * wdy < wHitR * wHitR) {
          wp.takeDamage(p.damage);
          p.hitIds.add(wp.id);
          if (!p.pierce) {
            p.active = false;
            break;
          }
        }
      }
      if (!p.active) continue;

      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        if (!e.active || p.hitIds.has(e.id)) continue;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const hitR = p.radius + e.radius;
        if (dx * dx + dy * dy < hitR * hitR) {
          e.takeDamage(p.damage);
          p.hitIds.add(e.id);

          // Chain Lightning Perk
          if (player.lightningLevel > 0) {
            let jumps = player.lightningLevel;
            let source = e;
            for (let k = 0; k < enemies.length && jumps > 0; k++) {
              const other = enemies[k];
              if (other.active && other.id !== source.id) {
                const ldx = other.x - source.x;
                const ldy = other.y - source.y;
                if (ldx * ldx + ldy * ldy < 170 * 170) {
                  other.takeDamage(p.damage * 0.55);
                  lightningBolts.push({ x1: source.x, y1: source.y, x2: other.x, y2: other.y, color: '#00f0ff', life: 7 });
                  source = other;
                  jumps--;
                }
              }
            }
          }

          if (!p.pierce) {
            if (p.bounces > 0) {
              p.bounces--;
              const nextTarget = enemies.find(other => other.active && other.id !== e.id);
              if (nextTarget) {
                const ang = Math.atan2(nextTarget.y - p.y, nextTarget.x - p.x);
                const sp = Math.hypot(p.vx, p.vy);
                p.vx = Math.cos(ang) * sp;
                p.vy = Math.sin(ang) * sp;
                p.angle = ang;
              } else {
                p.vx *= -1;
                p.angle = Math.atan2(p.vy, p.vx);
              }
            } else {
              p.active = false;
              break;
            }
          }
        }
      }
    }
    projectiles = projectiles.filter(p => p.active);

    // Homing missiles (capped at 56 active for locked 60 FPS)
    if (missiles.length > 56) missiles.splice(0, missiles.length - 56);
    for (let i = 0; i < missiles.length; i++) {
      const m = missiles[i];
      m.update();
      if (!m.active) continue;
      if (checkBuildingProjectileCollision(m)) continue;
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        if (e.active && Math.hypot(m.x - e.x, m.y - e.y) < 14 + e.radius) {
          e.takeDamage(m.damage, true);
          m.active = false;
          break;
        }
      }
    }
    missiles = missiles.filter(m => m.active);

    // Black Holes
    for (let i = 0; i < blackHoles.length; i++) blackHoles[i].update();
    blackHoles = blackHoles.filter(bh => bh.active);

    // Collectible Shards
    for (let i = 0; i < shards.length; i++) shards[i].update();
    shards = shards.filter(s => s.active);

    // Enemy projectiles
    for (let i = 0; i < enemyProjectiles.length; i++) {
      const ep = enemyProjectiles[i];
      ep.update();
      if (!ep.active) continue;
      if (checkBuildingProjectileCollision(ep)) continue;
      const dx = ep.x - player.x;
      const dy = ep.y - player.y;
      const rSum = ep.radius + player.radius;
      if (dx * dx + dy * dy < rSum * rSum) {
        player.takeDamage(ep.damage);
        ep.active = false;
      }
    }
    enemyProjectiles = enemyProjectiles.filter(ep => ep.active);

    // Enemies
    for (let i = 0; i < enemies.length; i++) enemies[i].update();
    enemies = enemies.filter(e => e.active);

    // Stream in queued wave reinforcements smoothly so active count stays capped
    if (waveSpawnQueue.length > 0) {
      flushSpawnQueue();
    }

    // Combo decay
    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer === 0) {
        combo = 1;
        comboCounter = 0;
      }
    }

    // Check wave cleared (all active enemies & queued reinforcements defeated)
    if (enemies.length === 0 && waveSpawnQueue.length === 0) {
      wave++;
      spawnWave();
    }
  }

  ctx.save();
  if (screenShake > 0) {
    const sx = (Math.random() - 0.5) * screenShake;
    const sy = (Math.random() - 0.5) * screenShake;
    ctx.translate(sx, sy);
    screenShake *= 0.86;
    if (screenShake < 0.4) screenShake = 0;
  }

  ctx.fillStyle = '#04040a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Starfield parallax (screen-space with camera parallax offset)
  ctx.fillStyle = '#ffffff';
  const starSpeed = 0.8 + sound.beatPulse * 1.2;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.y += s.z * starSpeed;
    const px = ((s.x - camX * (s.z * 0.18)) % canvas.width + canvas.width) % canvas.width;
    const py = ((s.y - camY * (s.z * 0.18)) % canvas.height + canvas.height) % canvas.height;
    ctx.globalAlpha = (s.z / 3.2);
    ctx.fillRect(px, py, s.z, s.z);
  }
  ctx.globalAlpha = 1.0;

  // =========================================================
  // CAMERA WORLD-SPACE RENDERING PASS
  // =========================================================
  ctx.save();
  ctx.translate(-camX, -camY);

  // Warping Cyber-Grid & Biome Borders
  drawCyberGrid();

  // Cyber-Skyscrapers & Megastructure Architecture (Solid tactical cover, rooftop helipads, beacons)
  drawBuildings();

  // Render Interactive Open-World Structures (Shrines, Vaults, Turrets, Boost Gates, Warp Gates, Jackpot Obelisks)
  for (let i = 0; i < worldProps.length; i++) worldProps[i].draw();

  // Render Live Cyber-Contract Objectives (Slalom Gates, Orbital Payload Core & Neural Tether)
  drawLiveContract();

  // Render Spatial Rifts, Chrono-Stasis Singularity Domes [F] & Black Holes & Shards
  for (let i = 0; i < spatialRifts.length; i++) spatialRifts[i].draw();
  for (let i = 0; i < chronoFields.length; i++) chronoFields[i].draw();
  for (let i = 0; i < blackHoles.length; i++) blackHoles[i].draw();
  for (let i = 0; i < shards.length; i++) shards[i].draw();
  for (let i = 0; i < phantomDecoys.length; i++) phantomDecoys[i].draw();

  // Render Dash Afterimages (capped)
  if (afterimages.length > 10) afterimages.splice(0, afterimages.length - 10);
  for (let i = afterimages.length - 1; i >= 0; i--) {
    const ai = afterimages[i];
    ai.life--;
    if (ai.life <= 0) {
      afterimages.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.translate(ai.x, ai.y);
    ctx.rotate(ai.angle);
    ctx.globalAlpha = (ai.life / ai.maxLife) * 0.45;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-14, -15);
    ctx.lineTo(-14, 15);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Render Particles (Zero shadowBlur, single state restore)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    if (p.life <= 0) {
      particles.splice(i, 1);
    } else {
      p.draw();
    }
  }
  ctx.globalAlpha = 1.0;

  // Render Chain Lightning Bolts (capped at 28, dual-stroke glow without shadowBlur)
  if (lightningBolts.length > 28) lightningBolts.splice(0, lightningBolts.length - 28);
  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const b = lightningBolts[i];
    b.life--;
    if (b.life <= 0) {
      lightningBolts.splice(i, 1);
      continue;
    }
    const midX = (b.x1 + b.x2) / 2 + (Math.random() - 0.5) * 24;
    const midY = (b.y1 + b.y2) / 2 + (Math.random() - 0.5) * 24;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(midX, midY);
    ctx.lineTo(b.x2, b.y2);
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  for (let i = 0; i < projectiles.length; i++) projectiles[i].draw();
  for (let i = 0; i < missiles.length; i++) missiles[i].draw();
  for (let i = 0; i < enemyProjectiles.length; i++) enemyProjectiles[i].draw();
  for (let i = 0; i < enemies.length; i++) enemies[i].draw();
  for (let i = 0; i < wingmen.length; i++) wingmen[i].draw();

  if (gameState === 'PLAYING' || gameState === 'UPGRADE') {
    player.draw();
  }

  // Floating Damage Numbers (Fast crisp drop-shadow, no font-reparsing thrash)
  ctx.font = "900 13px 'Segoe UI', sans-serif";
  let currentFontScale = 1.0;
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.life--;
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = ft.life / ft.maxLife;
    if (ft.scale !== currentFontScale) {
      ctx.font = `900 ${Math.round(14 * ft.scale)}px 'Segoe UI', sans-serif`;
      currentFontScale = ft.scale;
    }
    ctx.fillStyle = '#02040a';
    ctx.fillText(ft.text, ft.x + 1.5, ft.y + 1.5);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1.0;

  ctx.restore();
  // =========================================================
  // END CAMERA WORLD-SPACE PASS
  // =========================================================

  if (gameState === 'PLAYING') {
    drawOffscreenWaypoints();
  }

  // Chromatic / Glitch Flash on heavy impact
  if (chromaticFlash > 0) {
    ctx.fillStyle = `rgba(255, 0, 119, ${chromaticFlash * 0.012})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    chromaticFlash--;
  }

  if (gameState === 'PLAYING') {
    drawReticle();
  }
  ctx.restore();

  // Update Biome Badge, Coordinates & Radar Minimap
  const curBiome = getActiveBiome(player.x, player.y);
  setHudText('zoneDisplay', curBiome.shortName || curBiome.name);
  if (hudCache.biomeColor !== curBiome.color && hudEls.zoneDisplay) {
    hudCache.biomeColor = curBiome.color;
    hudEls.zoneDisplay.style.color = curBiome.color;
    hudEls.zoneDisplay.style.borderColor = curBiome.color;
  }
  setHudText('radarCoords', `${Math.round(player.x)},${Math.round(player.y)}`);
  drawRadar();

  // Dynamic HUD Proximity Auto-Dimming (fades HUD panels to 24% opacity when combat/cursor is underneath)
  if (frameCount % 4 === 0) {
    const psx = player.x - camX;
    const psy = player.y - camY;
    const msx = mouse.screenX;
    const msy = mouse.screenY;
    const cw = canvas.width;

    let dimLeft = (psx < 245 && psy < 210) || (msx < 245 && msy < 210);
    let dimCenter = (Math.abs(psx - cw * 0.5) < 230 && psy < 110) || (Math.abs(msx - cw * 0.5) < 230 && msy < 110);
    let dimRight = (psx > cw - 205 && psy < 310);

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.active) continue;
      const esx = e.x - camX;
      const esy = e.y - camY;
      if (esy < 310) {
        if (esx < 245 && esy < 210) dimLeft = true;
        if (Math.abs(esx - cw * 0.5) < 230 && esy < 110) dimCenter = true;
        if (esx > cw - 205) dimRight = true;
      }
    }

    if (hudCache.dimLeft !== dimLeft && hudEls.leftPanel) {
      hudCache.dimLeft = dimLeft;
      hudEls.leftPanel.classList.toggle('hud-dimmed', dimLeft);
    }
    if (hudCache.dimCenter !== dimCenter && hudEls.centerPanel) {
      hudCache.dimCenter = dimCenter;
      hudEls.centerPanel.classList.toggle('hud-dimmed', dimCenter);
    }
    if (hudCache.dimRight !== dimRight && hudEls.rightPanel) {
      hudCache.dimRight = dimRight;
      hudEls.rightPanel.classList.toggle('hud-dimmed', dimRight);
    }
  }

  // Update HUD elements via diff cache (zero unnecessary DOM layout/backdrop-filter invalidations)
  setHudText('hpText', `${Math.ceil(player.hp)}/${player.maxHp}${player.shieldCharges > 0 ? ` +${player.shieldCharges}S` : ''}`);
  setHudWidth('hpBar', (player.hp / player.maxHp) * 100);

  const dashPct = Math.max(0, 1 - (player.dashCooldown / player.dashMaxCooldown)) * 100;
  setHudWidth('dashBar', dashPct);
  const isDashReady = player.dashCooldown <= 0;
  setHudText('dashText', isDashReady ? 'READY' : `${Math.floor(dashPct)}%`);
  if (hudCache.dashReady !== isDashReady) {
    hudCache.dashReady = isDashReady;
    hudEls.dashText.style.color = isDashReady ? '#00f0ff' : '#94a3b8';
  }

  const katanaPct = Math.max(0, 1 - (player.katanaCooldown / player.katanaMaxCooldown)) * 100;
  setHudWidth('katanaBar', katanaPct);
  const isKatanaReady = player.katanaCooldown <= 0;
  setHudText('katanaText', isKatanaReady ? 'READY [Q]' : `${Math.floor(katanaPct)}%`);
  if (hudCache.katanaReady !== isKatanaReady && hudEls.katanaText) {
    hudCache.katanaReady = isKatanaReady;
    hudEls.katanaText.style.color = isKatanaReady ? '#00ff88' : '#94a3b8';
  }

  const odMax = player.overdriveMaxActive || 2400;
  const odPct = player.overdriveActive > 0 ? Math.min(100, (player.overdriveActive / odMax) * 100) : 100;
  const odSecs = Math.ceil(player.overdriveActive / 60);
  setHudWidth('odBar', odPct);
  const odReady = true;
  setHudText('odText', player.overdriveActive > 0
    ? `NOVA ${odSecs}s [E+]`
    : 'READY [E / V]');
  if (hudCache.odReady !== odReady) {
    hudCache.odReady = odReady;
    hudEls.odText.classList.toggle('ready-glow', odReady);
  }

  // === UPDATE 5-SLOT TACTICAL SKILL HOTBAR (#skillHotbar) ===
  // 1. [Q] Dimension Rift Katana
  setHudWidth('skillBarQ', katanaPct);
  setHudText('skillTextQ', isKatanaReady ? (player.katanaCombo === 2 ? 'JUDGEMENT!' : 'READY') : `${(player.katanaCooldown / 60).toFixed(1)}s`);
  setHudText('skillTierQ', player.katanaCombo === 2 ? 'X-RIFT' : `MK-${1 + player.katanaLevel}`);
  setSlotState('skillSlotQ', isKatanaReady, player.katanaSlashTimer > 0);

  // 2. [R] Triple Omega Ion Laser Beam + 6 Fin-Funnel Bits
  const ionActive = player.ionBeamTimer > 0;
  const ionMaxCd = Math.max(110, player.ionBeamMaxCooldown - player.ionBeamLevel * 35);
  const ionPct = ionActive
    ? (player.ionBeamTimer / player.ionBeamMaxTimer) * 100
    : Math.max(0, 1 - (player.ionBeamCooldown / ionMaxCd)) * 100;
  const ionReady = player.ionBeamCooldown <= 0 && !ionActive;
  setHudWidth('skillBarR', ionPct);
  setHudText('skillTextR', ionActive ? 'OVERCHARGE [R]' : (ionReady ? 'READY' : `${(player.ionBeamCooldown / 60).toFixed(1)}s`));
  setHudText('skillTierR', `MK-${1 + player.ionBeamLevel}`);
  setSlotState('skillSlotR', ionReady, ionActive);

  // 3. [F] Abyssal Chrono-Stasis Singularity Dome
  const activeDome = chronoFields.length > 0 ? chronoFields[0] : null;
  const chronoMaxCd = Math.max(110, player.chronoMaxCooldown - player.chronoLevel * 35);
  const chronoPct = activeDome
    ? (activeDome.life / activeDome.maxLife) * 100
    : Math.max(0, 1 - (player.chronoCooldown / chronoMaxCd)) * 100;
  const chronoReady = player.chronoCooldown <= 0 && !activeDome;
  setHudWidth('skillBarF', chronoPct);
  setHudText('skillTextF', activeDome ? 'SHATTER [F]' : (chronoReady ? 'READY' : `${(player.chronoCooldown / 60).toFixed(1)}s`));
  setHudText('skillTierF', `MK-${1 + player.chronoLevel}`);
  setSlotState('skillSlotF', chronoReady, !!activeDome);

  // 4. [X] Phantom Squadron & Quantum Phase-Storm Swap
  const activeDecoy = phantomDecoys.length > 0 ? phantomDecoys[0] : null;
  const phantomMaxCd = Math.max(110, player.phantomMaxCooldown - player.phantomLevel * 35);
  const phantomPct = activeDecoy
    ? (activeDecoy.life / activeDecoy.maxLife) * 100
    : Math.max(0, 1 - (player.phantomCooldown / phantomMaxCd)) * 100;
  const phantomReady = player.phantomCooldown <= 0 && !activeDecoy;
  setHudWidth('skillBarX', phantomPct);
  setHudText('skillTextX', activeDecoy ? 'PHASE SWAP' : (phantomReady ? 'READY' : `${(player.phantomCooldown / 60).toFixed(1)}s`));
  setHudText('skillTierX', activeDecoy ? 'SWAP [X]' : `MK-${1 + player.phantomLevel}`);
  setSlotState('skillSlotX', phantomReady, !!activeDecoy);

  // 5. [E] Seraphim Supernova (40s Instant Shortcut + [V] 90s All-Skill Chaos!)
  setHudWidth('skillBarE', odPct);
  setHudText('skillTextE', player.overdriveActive > 0 ? `${odSecs}s [+E/V]` : 'READY [E/V]');
  setHudText('skillTierE', player.overdriveActive > 0 ? '12-WING' : '40s ULT');
  setSlotState('skillSlotE', player.overdriveActive <= 0, player.overdriveActive > 0);

  const xpPct = (player.xp / player.xpNext) * 100;
  setHudWidth('xpBar', xpPct);
  setHudText('xpText', `${Math.floor(player.xp)}/${player.xpNext}`);
  setHudText('lvlText', `LVL ${player.level}`);
  setHudText('score', score.toLocaleString());

  // Boss HUD
  const activeBoss = enemies.find(e => (e.isBoss || e.type === 'boss' || (e.type && e.type.startsWith('boss'))) && e.active);
  const hasBoss = !!activeBoss;
  if (hudCache.hasBoss !== hasBoss) {
    hudCache.hasBoss = hasBoss;
    hudEls.bossHud.classList.toggle('hidden', !hasBoss);
  }
  if (activeBoss) {
    const bPct = Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100);
    setHudWidth('bossBar', bPct);
    setHudText('bossText', `${Math.ceil(bPct)}%`);
    const enraged = activeBoss.phase >= 2 || (activeBoss.hp / activeBoss.maxHp < 0.4);
    const nameText = `${activeBoss.bossName || activeBoss.name || 'APEX OVERLORD'}${enraged ? ' // ENRAGED //' : ''}`;
    if (hudEls.bossName && hudCache.bossNameText !== nameText) {
      hudCache.bossNameText = nameText;
      const bColor = activeBoss.color || '#ff0055';
      hudEls.bossName.innerHTML = `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none" stroke="${bColor}" stroke-width="1.8"><polygon points="8,1.5 15,14 1,14"/><line x1="8" y1="6" x2="8" y2="10" stroke="#ffe600"/><circle cx="8" cy="12" r="0.8" fill="#ffe600"/></svg> <span style="color:${bColor}">${nameText}</span>`;
      if (hudEls.bossBar) {
        hudEls.bossBar.style.background = `linear-gradient(90deg, ${bColor}, #ff0077)`;
      }
    }
  }

  // Live Cyber-Contract Tracker HUD
  const hasContract = !!activeContract;
  if (hudCache.hasContract !== hasContract && hudEls.contractTracker) {
    hudCache.hasContract = hasContract;
    hudEls.contractTracker.classList.toggle('hidden', !hasContract);
  }
  if (activeContract) {
    if (hudEls.contractTitle && hudCache.contractTitle !== activeContract.title) {
      hudCache.contractTitle = activeContract.title;
      hudEls.contractTitle.innerHTML = `${activeContract.svg || ''}<span>${activeContract.title}</span>`;
    }
    setHudText('contractDesc', activeContract.desc);
    setHudText('contractTimer', `${Math.ceil(activeContract.timer / 60)}s`);
    const cPct = Math.max(0, Math.min(100, (activeContract.progress / activeContract.target) * 100));
    setHudWidth('contractBar', cPct);
    if (activeContract.type === 'slalom') {
      setHudText('contractProgText', `${activeContract.progress}/${activeContract.target} GATES`);
    } else if (activeContract.type === 'parry_blitz') {
      setHudText('contractProgText', `${Math.floor(activeContract.progress)}/${activeContract.target} HITS`);
    } else {
      setHudText('contractProgText', `${Math.floor(cPct)}%`);
    }
  }

  const showCombo = combo > 1;
  if (hudCache.showCombo !== showCombo) {
    hudCache.showCombo = showCombo;
    hudEls.combo.classList.toggle('active', showCombo);
  }
  if (showCombo) {
    setHudText('combo', `x${combo} OVERCLOCK (${comboCounter})`);
  }
}

// Event Listeners
const startBtnEl = document.getElementById('startBtn');
if (startBtnEl) {
  startBtnEl.onclick = () => {
    sound.init();
    sound.warpLaunch();
    screenShake = 18;
    chromaticFlash = 15;
    startNewGame();
  };
}

document.querySelectorAll('.chassis-btn').forEach(btn => {
  btn.onclick = () => {
    sound.init();
    sound.uiSelect();
    selectedChassis = btn.dataset.chassis || 'interceptor';
    document.querySelectorAll('.chassis-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const names = {
      interceptor: 'VALKYRIE MK-IV',
      titan: 'AEGIS GOLIATH',
      phantom: 'VOID REAPER'
    };
    const el = document.getElementById('telemetryChassis');
    if (el) el.textContent = names[selectedChassis] || selectedChassis.toUpperCase();
  };
  btn.onmouseenter = () => {
    sound.uiHover();
  };
});

const prevOstEl = document.getElementById('previewOstBtn');
if (prevOstEl) {
  prevOstEl.onclick = () => {
    sound.init();
    sound.uiSelect();
    const active = sound.toggle();
    prevOstEl.classList.toggle('selected', active);
    prevOstEl.innerHTML = active
      ? '<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="4" height="10"/><rect x="9" y="3" width="4" height="10"/></svg>STOP OST'
      : '<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="2.5,3 13.5,8 2.5,13" fill="currentColor" fill-opacity="0.3"/></svg>PREVIEW OST';
  };
  prevOstEl.onmouseenter = () => {
    sound.uiHover();
  };
}

document.querySelectorAll('.control-card, .threat-mode-btn, .btn-main').forEach(el => {
  el.addEventListener('mouseenter', () => {
    sound.uiHover();
  });
});

document.getElementById('restartBtn').onclick = () => {
  sound.init();
  startNewGame();
};

const homeBtnEl = document.getElementById('homeBtn');
if (homeBtnEl) {
  homeBtnEl.onclick = () => {
    sound.dash();
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    gameState = 'START';
  };
}

document.querySelectorAll('.threat-mode-btn').forEach(btn => {
  btn.onclick = () => {
    setThreatMode(Number(btn.dataset.threat || 0), true);
  };
});

const threatBadgeEl = document.getElementById('threatBadge');
if (threatBadgeEl) {
  threatBadgeEl.onclick = () => {
    setThreatMode(threatModeIdx + 1, true);
  };
}

const contractTrackerEl = document.getElementById('contractTracker');
if (contractTrackerEl) {
  contractTrackerEl.onclick = () => {
    triggerLiveContract(true);
  };
}

// Clickable Tactical Skill Hotbar Slots
if (hudEls.skillSlotQ) hudEls.skillSlotQ.onclick = () => { if (gameState === 'PLAYING') player.tryKatana(); };
if (hudEls.skillSlotR) hudEls.skillSlotR.onclick = () => { if (gameState === 'PLAYING') player.tryIonBeam(); };
if (hudEls.skillSlotF) hudEls.skillSlotF.onclick = () => { if (gameState === 'PLAYING') player.tryChronoField(); };
if (hudEls.skillSlotX) hudEls.skillSlotX.onclick = () => { if (gameState === 'PLAYING') player.tryPhantomBarrage(); };
if (hudEls.skillSlotE) {
  hudEls.skillSlotE.onclick = () => { if (gameState === 'PLAYING') player.tryOverdrive(); };
  hudEls.skillSlotE.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); if (gameState === 'PLAYING') player.tryChaosOverload(); };
}
if (hudEls.odBox) {
  hudEls.odBox.style.cursor = 'pointer';
  hudEls.odBox.title = 'Click: [E] 40s Seraphim Supernova (+30s Stack) | Right-Click: [V] 90s ALL-SKILL CHAOS OVERLOAD!';
  hudEls.odBox.onclick = () => { if (gameState === 'PLAYING') player.tryOverdrive(); };
  hudEls.odBox.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); if (gameState === 'PLAYING') player.tryChaosOverload(); };
}

document.getElementById('audioBtn').onclick = () => {
  const active = sound.toggle();
  const txt = document.getElementById('audioBtnText');
  if (txt) txt.textContent = active ? 'ON' : 'MUTE';
  document.getElementById('audioBtn').classList.toggle('active-mode', !active);
};

document.getElementById('nextTrackBtn').onclick = () => {
  const track = sound.nextTrack();
  document.getElementById('trackNameDisplay').textContent = track.name;
  const bpmEl = document.getElementById('bpmDisplay');
  if (bpmEl) bpmEl.textContent = `${track.bpm} BPM`;
  announce(`NOW PLAYING: ${track.name} (${track.bpm} BPM)`, '#00f0ff');
};

document.getElementById('volumeSlider').oninput = (e) => {
  const val = Number(e.target.value);
  sound.setVolume(val / 100);
  const lbl = document.getElementById('volLabel');
  if (lbl) lbl.textContent = `VOL ${val}%`;
};

const initAfBtn = document.getElementById('autoFireBtn');
const initAfTxt = document.getElementById('autoFireBtnText');
if (initAfTxt) initAfTxt.textContent = autoFire ? 'AUTO' : 'MAN';
if (initAfBtn) initAfBtn.classList.toggle('active-mode', autoFire);

document.getElementById('autoFireBtn').onclick = () => {
  toggleAutoFire();
};

document.getElementById('rerollBtn').onclick = () => {
  rerollUpgrades();
};

document.getElementById('healSkipBtn').onclick = () => {
  healSkipUpgrade();
};

loop();
