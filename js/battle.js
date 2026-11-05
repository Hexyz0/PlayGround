/* ============================================================
   THE HOLLOW CROWN — tactical battle engine
   CT turn order, height/facing, arts, statuses, drops, pixel board.
   ============================================================ */
import { JOBS, ITEM_MAP, TERRAIN, getArt } from './data.js';
import { buildEnemy, rollLoot } from './chapters.js';
import {
  deriveStats, learnedArts, owned, addItem, grantExp, grantJp, deployedUnits,
} from './state.js';
import { drawUnitSprite, drawPortrait } from './sprites.js';
import { $, esc, toast, statusLabel, statusKind, openModal } from './ui.js';
import { sfx } from './audio.js';

const DIRS = [{ x: 0, y: -1, f: 'n' }, { x: 1, y: 0, f: 'e' }, { x: 0, y: 1, f: 's' }, { x: -1, y: 0, f: 'w' }];
const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e' };
const BAD = ['poison', 'burn', 'slow', 'silence', 'defDown', 'stun'];
const KEY = (x, y) => `${x},${y}`;
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wait = (ms) => new Promise(r => setTimeout(r, ms));

let UID = 1;

export function startBattle({ state, encounter, onEnd }) {
  const canvas = $('#board');
  const wrap = $('#board-wrap');
  if (!canvas || !wrap) return { destroy() {} };
  const ctx = canvas.getContext('2d');

  const B = {
    state, encounter, chapterIndex: state.encounterIndex, onEnd,
    units: [], tiles: [], w: 12, h: 10,
    active: null, mode: 'idle', busy: false, over: false, destroyed: false,
    moveSet: null, movePaths: null, attackSet: null, aoeSet: null, pathSet: null,
    selectedArt: null, selectedItem: null, targeting: null,
    hover: null, pointerTile: null, mouse: { x: 0, y: 0 },
    threat: false, threatSet: null,
    time: 0, view: { scale: 1, ox: 0, oy: 0 }, dpr: 1, shake: 0,
    floaters: [], particles: [],
    log: [], loot: [], stolenGold: 0, kills: 0, usedItems: {},
    turnCount: 0, round: 1,
    levelUps: [], xpAwards: [],
    raf: 0, timers: new Set(),
    canvas, ctx, wrap,
  };

  /* ---------------- map ---------------- */
  const rows = encounter.map;
  B.h = rows.length;
  B.w = rows[0].length;
  for (let y = 0; y < B.h; y++) {
    for (let x = 0; x < B.w; x++) {
      const ch = rows[y][x] || '#';
      const t = TERRAIN[ch] || TERRAIN['.'];
      B.tiles.push({ x, y, ch, terrain: t, elev: t.elev, block: !!t.block });
    }
  }
  const tileAt = (x, y) => B.tiles.find(t => t.x === x && t.y === y) || null;
  const unitAt = (x, y) => B.units.find(u => !u.dead && u.x === x && u.y === y) || null;
  const living = (side) => B.units.filter(u => !u.dead && (!side || u.side === side));

  /* ---------------- units ---------------- */
  const avg = (() => {
    const dep = deployedUnits(state);
    return dep.length ? Math.round(dep.reduce((s, u) => s + u.level, 0) / dep.length) : 1;
  })();

  function makePlayerUnit(rosterUnit, pos) {
    const st = deriveStats(rosterUnit);
    return {
      uid: `p${UID++}`, side: 'player', name: rosterUnit.name, job: rosterUnit.job,
      level: rosterUnit.level, stats: st, hp: st.maxHp, mp: st.maxMp,
      x: pos[0], y: pos[1], ct: 20 + st.spd * 2 + Math.random() * 18,
      facing: 'n', statuses: [], dead: false, hasMoved: false, hasActed: false,
      arts: learnedArts(rosterUnit), source: rosterUnit, boss: false, dropId: null,
      xp: 0, isSummon: false,
    };
  }

  function makeEnemyUnit(spec) {
    const e = buildEnemy(spec, B.chapterIndex, avg);
    const stats = { ...e.stats, weapon: e.weapon, luck: 5 };
    return {
      uid: `e${UID++}`, side: 'enemy', name: e.name, job: e.job, level: e.level,
      stats, hp: stats.maxHp, mp: stats.maxMp,
      x: e.pos[0], y: e.pos[1], ct: 10 + stats.spd * 2 + Math.random() * 22,
      facing: 's', statuses: [], dead: false, hasMoved: false, hasActed: false,
      arts: e.abilities.map(getArt).filter(Boolean), source: spec,
      boss: e.boss, dropId: e.dropId, dropChance: e.dropChance, xp: e.xp,
      isSummon: false, color: e.color,
    };
  }

  const deployed = deployedUnits(state).slice(0, 5);
  deployed.forEach((ru, i) => {
    const spawn = encounter.playerSpawns[i] || encounter.playerSpawns[0];
    B.units.push(makePlayerUnit(ru, spawn));
  });
  for (const spec of encounter.enemySpecs) B.units.push(makeEnemyUnit(spec));

  /* ---------------- stats & status ---------------- */
  const has = (u, id) => u.statuses.some(s => s.id === id);
  const statusVal = (u, id) => {
    const s = u.statuses.find(x => x.id === id);
    return s ? (s.value || 0) : 0;
  };
  function eff(u, key) {
    let v = u.stats[key] || 0;
    if (key === 'pa' && has(u, 'atkUp')) v *= 1 + statusVal(u, 'atkUp');
    if (key === 'ma' && has(u, 'atkUp')) v *= 1 + statusVal(u, 'atkUp');
    if (key === 'def' && has(u, 'defUp')) v *= 1 + statusVal(u, 'defUp');
    if (key === 'def' && has(u, 'defDown')) v *= 1 - statusVal(u, 'defDown');
    if (key === 'res' && has(u, 'ward')) v *= 1 + statusVal(u, 'ward');
    if (key === 'spd' && has(u, 'haste')) v *= 1 + statusVal(u, 'haste');
    if (key === 'spd' && has(u, 'slow')) v *= 1 - statusVal(u, 'slow');
    return Math.max(1, Math.round(v));
  }
  function addStatus(u, s) {
    if (!s || !s.id) return;
    const cur = u.statuses.find(x => x.id === s.id);
    if (cur) {
      cur.turns = Math.max(cur.turns, s.turns || 1);
      if (s.value !== undefined) cur.value = Math.max(cur.value || 0, s.value);
    } else {
      u.statuses.push({ id: s.id, turns: s.turns || 1, value: s.value });
    }
  }
  function cleanse(u) { u.statuses = u.statuses.filter(s => !BAD.includes(s.id)); }
  function tickStatuses(u) {
    u.statuses = u.statuses.filter(s => {
      if (s.id === 'shield') return s.value > 0;
      s.turns -= 1;
      return s.turns > 0;
    });
  }
  const ctGain = (u) => {
    let g = 16 + eff(u, 'spd') * 1.25;
    if (has(u, 'haste')) g *= 1.3;
    if (has(u, 'slow')) g *= 0.7;
    return g;
  };
  const tileElev = (u) => (tileAt(u.x, u.y)?.elev || 0);

  /* ---------------- log & fx ---------------- */
  function log(text, cls = '') {
    B.log.push({ text, cls });
    if (B.log.length > 120) B.log.shift();
    const list = $('#log-list');
    if (list) {
      const p = document.createElement('p');
      p.className = `log-line ${cls}`;
      p.innerHTML = text;
      list.appendChild(p);
      list.scrollTop = list.scrollHeight;
    }
  }
  function floater(x, y, text, color = '#f0d795') {
    B.floaters.push({ x, y, text, color, life: 1.15, max: 1.15 });
  }
  function burst(x, y, color = '#d6b56a', n = 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 20 + Math.random() * 90;
      B.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30,
        life: 0.45 + Math.random() * 0.45, max: 0.9, color, size: 1 + Math.random() * 2.4,
      });
    }
  }
  function shake(v = 4) { B.shake = Math.max(B.shake, v); }

  /* ---------------- view / sizing ---------------- */
  const TW = 64, TH = 32, EH = 13;
  function resize() {
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    B.dpr = dpr;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const worldW = (B.w + B.h) * (TW / 2) + 90;
    const worldH = (B.w + B.h) * (TH / 2) + 170;
    const scale = Math.min((rect.width - 8) / worldW, (rect.height - 8) / worldH, 1.35);
    B.view.scale = Math.max(0.34, scale);
    B.view.ox = rect.width / 2;
    B.view.oy = (rect.height - worldH * B.view.scale) / 2 + 62 * B.view.scale;
  }
  const iso = (x, y, elev = 0) => ({
    x: (x - y) * (TW / 2),
    y: (x + y) * (TH / 2) - elev * EH,
  });
  function pointerTile(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = (clientX - rect.left - B.view.ox) / B.view.scale;
    const py = (clientY - rect.top - B.view.oy) / B.view.scale;
    const a = px / (TW / 2);
    const b = py / (TH / 2);
    const x = Math.round((a + b) / 2);
    const y = Math.round((b - a) / 2);
    return tileAt(x, y) ? { x, y } : null;
  }

  /* ---------------- rendering ---------------- */
  function tileHash(t) {
    const n = Math.sin(t.x * 127.1 + t.y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function drawTile(t) {
    const p = iso(t.x, t.y, t.elev);
    const halfW = TW / 2, halfH = TH / 2;
    const baseY = (t.x + t.y) * halfH;
    const h = tileHash(t);

    // elevation side walls
    if (t.elev > 0) {
      ctx.fillStyle = '#17141b';
      ctx.beginPath();
      ctx.moveTo(p.x - halfW, p.y);
      ctx.lineTo(p.x, p.y + halfH);
      ctx.lineTo(p.x, p.y + halfH + t.elev * EH);
      ctx.lineTo(p.x - halfW, p.y + t.elev * EH);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#211c26';
      ctx.beginPath();
      ctx.moveTo(p.x + halfW, p.y);
      ctx.lineTo(p.x, p.y + halfH);
      ctx.lineTo(p.x, p.y + halfH + t.elev * EH);
      ctx.lineTo(p.x + halfW, p.y + t.elev * EH);
      ctx.closePath(); ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(p.x, p.y - halfH);
    ctx.lineTo(p.x + halfW, p.y);
    ctx.lineTo(p.x, p.y + halfH);
    ctx.lineTo(p.x - halfW, p.y);
    ctx.closePath();

    let fill = t.terrain.color;
    if (t.ch === ',') fill = h > 0.5 ? '#263128' : '#232d25';
    if (t.ch === '=') fill = h > 0.5 ? '#3b3024' : '#372c21';
    if (t.ch === '^') fill = h > 0.5 ? '#3d3628' : '#383124';
    if (t.ch === '~') fill = h > 0.5 ? '#152d39' : '#132933';
    if (t.ch === '#') fill = '#151218';
    if (t.ch === 'x') fill = '#050407';
    ctx.fillStyle = fill;
    ctx.fill();

    // top edge light
    ctx.strokeStyle = t.ch === '~' ? 'rgba(80,150,170,0.18)' : 'rgba(255,240,200,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - halfW, p.y);
    ctx.lineTo(p.x, p.y - halfH);
    ctx.lineTo(p.x + halfW, p.y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.moveTo(p.x - halfW, p.y);
    ctx.lineTo(p.x, p.y + halfH);
    ctx.lineTo(p.x + halfW, p.y);
    ctx.stroke();

    // decorations
    if (t.ch === ',') {
      ctx.fillStyle = 'rgba(110,150,105,0.32)';
      for (let i = 0; i < 3; i++) {
        const dx = (h * 37 + i * 19) % 36 - 18;
        const dy = (h * 71 + i * 13) % 14 - 7;
        ctx.fillRect(Math.round(p.x + dx), Math.round(p.y + dy), 2, 2);
      }
    }
    if (t.ch === '~') {
      const glint = Math.sin(B.time * 1.6 + t.x * 0.8 + t.y) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(120,200,210,${0.08 + glint * 0.14})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y + 2);
      ctx.lineTo(p.x + 4, p.y + 2);
      ctx.stroke();
    }
    if (t.ch === '^') {
      ctx.fillStyle = 'rgba(214,181,106,0.16)';
      ctx.fillRect(p.x - 2, p.y - 3, 4, 2);
    }
    if (t.ch === '#') {
      ctx.fillStyle = '#2a2430';
      ctx.fillRect(p.x - 9, p.y - 22, 18, 20);
      ctx.fillStyle = '#1a161f';
      ctx.fillRect(p.x - 7, p.y - 20, 5, 5);
      ctx.fillRect(p.x + 2, p.y - 16, 5, 5);
      ctx.fillStyle = '#332b3a';
      ctx.fillRect(p.x - 9, p.y - 24, 18, 3);
    }
  }

  function drawOverlay(keys, fill, stroke) {
    if (!keys || !keys.size) return;
    for (const k of keys) {
      const [x, y] = k.split(',').map(Number);
      const t = tileAt(x, y);
      if (!t) continue;
      const p = iso(x, y, t.elev);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - TH / 2);
      ctx.lineTo(p.x + TW / 2, p.y);
      ctx.lineTo(p.x, p.y + TH / 2);
      ctx.lineTo(p.x - TW / 2, p.y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    }
  }

  function unitPoint(u) {
    const p = iso(u.x, u.y, tileElev(u));
    return { x: p.x, y: p.y + TH / 2 - 4 };
  }

  function drawUnit(u) {
    const p = unitPoint(u);
    const isActive = B.active && B.active.uid === u.uid && !u.dead;
    drawUnitSprite(ctx, {
      jobId: u.job, x: p.x, y: p.y, team: u.side,
      time: B.time, seed: (u.uid.charCodeAt(1) || 1) * 1.7,
      dead: u.dead, active: isActive,
      hover: B.hover && B.hover.uid === u.uid,
      px: 2.05, facing: u.facing,
    });
    if (u.dead) return;
    const w = 28;
    const hp = clamp(u.hp / u.stats.maxHp, 0, 1);
    const barY = p.y - 37;
    ctx.fillStyle = 'rgba(4,3,6,0.85)';
    ctx.fillRect(p.x - w / 2 - 1, barY - 1, w + 2, 5);
    ctx.fillStyle = u.side === 'player' ? '#6fae7c' : '#b05257';
    ctx.fillRect(p.x - w / 2, barY, w * hp, 3);
    if (u.boss) {
      ctx.fillStyle = '#d6b56a';
      ctx.fillRect(p.x - 3, barY - 6, 6, 3);
    }
    if (u.statuses.length) {
      ctx.fillStyle = 'rgba(8,7,10,0.7)';
      ctx.fillRect(p.x - 3, barY + 5, 6, 3);
      ctx.fillStyle = u.statuses.some(s => BAD.includes(s.id)) ? '#c06064' : '#79c0b4';
      ctx.fillRect(p.x - 2, barY + 6, 4, 1);
    }
  }

  function draw() {
    if (B.destroyed) return;
    const w = canvas.width / B.dpr;
    const h = canvas.height / B.dpr;
    ctx.setTransform(B.dpr, 0, 0, B.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0e0c13');
    bg.addColorStop(0.55, '#09080c');
    bg.addColorStop(1, '#050407');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const shakeX = B.shake > 0 ? (Math.random() - 0.5) * B.shake : 0;
    const shakeY = B.shake > 0 ? (Math.random() - 0.5) * B.shake : 0;
    ctx.save();
    ctx.translate(B.view.ox + shakeX, B.view.oy + shakeY);
    ctx.scale(B.view.scale, B.view.scale);

    // subtle ground glow
    const glow = ctx.createRadialGradient(0, 150, 30, 0, 150, 420);
    glow.addColorStop(0, 'rgba(110,90,58,0.14)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-500, -200, 1000, 800);

    const sortedTiles = [...B.tiles].sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.x - b.x);
    for (const t of sortedTiles) drawTile(t);

    drawOverlay(B.moveSet, 'rgba(121,192,180,0.16)', 'rgba(121,192,180,0.35)');
    drawOverlay(B.threatSet, 'rgba(163,68,74,0.12)', 'rgba(163,68,74,0.22)');
    drawOverlay(B.attackSet, 'rgba(214,181,106,0.18)', 'rgba(214,181,106,0.45)');
    drawOverlay(B.aoeSet, 'rgba(214,120,70,0.28)', 'rgba(240,150,90,0.7)');

    // path preview
    if (B.pathSet && B.pathSet.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(240,215,149,0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      B.pathSet.forEach((k, i) => {
        const [x, y] = k.split(',').map(Number);
        const p = iso(x, y, tileAt(x, y)?.elev || 0);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // hover outline
    if (B.pointerTile) {
      const t = tileAt(B.pointerTile.x, B.pointerTile.y);
      if (t) {
        const p = iso(t.x, t.y, t.elev);
        ctx.strokeStyle = 'rgba(240,231,206,0.55)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - TH / 2);
        ctx.lineTo(p.x + TW / 2, p.y);
        ctx.lineTo(p.x, p.y + TH / 2);
        ctx.lineTo(p.x - TW / 2, p.y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    const sortedUnits = [...B.units].sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.x - b.x);
    for (const u of sortedUnits) drawUnit(u);

    // particles
    for (const p of B.particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // floaters
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Courier New", monospace';
    for (const f of B.floaters) {
      const a = clamp(f.life / f.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#050407';
      ctx.fillText(f.text, f.x + 1, f.y - (1 - a) * 26 + 1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - (1 - a) * 26);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.28, w / 2, h / 2, Math.max(w, h) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(ts) {
    if (B.destroyed) return;
    const dt = Math.min(0.05, (ts - (B._last || ts)) / 1000);
    B._last = ts;
    B.time = ts / 1000;
    B.shake = Math.max(0, B.shake - dt * 34);
    for (const f of B.floaters) { f.life -= dt; f.y -= dt * 18; }
    B.floaters = B.floaters.filter(f => f.life > 0);
    for (const p of B.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 150 * dt;
    }
    B.particles = B.particles.filter(p => p.life > 0);
    draw();
    B.raf = requestAnimationFrame(frame);
  }

  /* ---------------- UI refresh ---------------- */
  function forecastOrder(n = 9) {
    const sim = living().map(u => ({ u, ct: u.ct, gain: ctGain(u) }));
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < 400) {
      for (const s of sim) s.ct += s.gain;
      const ready = sim.filter(s => s.ct >= 100).sort((a, b) => b.ct - a.ct);
      for (const s of ready) {
        if (out.length >= n) break;
        out.push(s.u);
        s.ct -= 100;
      }
    }
    return out;
  }

  function renderHeader() {
    const enc = B.encounter;
    const chapter = $('#battle-chapter');
    const name = $('#battle-name');
    const obj = $('#battle-objective');
    const turn = $('#battle-turn');
    if (chapter) chapter.textContent = `CH ${enc.chapter}`;
    if (name) name.textContent = enc.title;
    if (obj) obj.textContent = enc.objective;
    if (turn) turn.textContent = `Turn ${B.turnCount}`;
  }

  function renderTurnOrder() {
    const el = $('#turn-order');
    if (!el) return;
    const order = forecastOrder(9);
    el.innerHTML = order.map((u, i) => `
      <div class="turn-chip ${u.side === 'enemy' ? 'enemy' : ''} ${B.active && u.uid === B.active.uid && i === 0 ? 'active' : ''}">
        <span class="tc-dot"></span>
        <span>${esc(u.name.split(' ')[0])}</span>
        <small>L${u.level}</small>
      </div>`).join('');
  }

  function renderSideInfo() {
    const el = $('#side-info');
    if (!el) return;
    const u = B.hover || B.active;
    if (!u) {
      el.innerHTML = `<div class="si-note">Hover a unit to inspect it. Select a companion to issue orders.</div>`;
      B._sideUid = null;
      return;
    }
    if (B._sideUid === u.uid) return;
    B._sideUid = u.uid;
    const s = u.stats;
    const job = JOBS[u.job] || JOBS.squire;
    const hpPct = clamp((u.hp / s.maxHp) * 100, 0, 100);
    const mpPct = s.maxMp ? clamp((u.mp / s.maxMp) * 100, 0, 100) : 0;
    el.innerHTML = `
      <canvas class="si-portrait" id="si-portrait"></canvas>
      <div class="si-name">${esc(u.name)}</div>
      <div class="si-job">${esc(job.name)} · Lv ${u.level} ${u.side === 'enemy' ? '· HOSTILE' : ''}</div>
      <div class="si-bars">
        <div class="si-bar hp"><div class="fill" style="width:${hpPct}%"></div><div class="txt">${u.hp} / ${s.maxHp}</div></div>
        <div class="si-bar mp"><div class="fill" style="width:${mpPct}%"></div><div class="txt">${u.mp} / ${s.maxMp}</div></div>
      </div>
      <div class="si-stats">
        <div class="si-stat"><span>PA</span><strong>${eff(u, 'pa')}</strong></div>
        <div class="si-stat"><span>MA</span><strong>${eff(u, 'ma')}</strong></div>
        <div class="si-stat"><span>DEF</span><strong>${eff(u, 'def')}</strong></div>
        <div class="si-stat"><span>RES</span><strong>${eff(u, 'res')}</strong></div>
        <div class="si-stat"><span>SPD</span><strong>${eff(u, 'spd')}</strong></div>
        <div class="si-stat"><span>MOV</span><strong>${s.move}</strong></div>
        <div class="si-stat"><span>RNG</span><strong>${s.weapon.range}</strong></div>
        <div class="si-stat"><span>LV</span><strong>${u.level}</strong></div>
      </div>
      <div class="si-status">
        ${u.statuses.length ? u.statuses.map(st => `<span class="status-pip ${statusKind(st.id)}">${esc(statusLabel(st.id))}${st.turns ? ` ${st.turns}` : ''}</span>`).join('') : '<span class="si-note" style="border:0;padding:0;margin:0">No active conditions</span>'}
      </div>
      ${u.boss ? '<div class="si-note" style="color:#d2666a">Boss · drops rare equipment</div>' : ''}
      ${u.side === 'enemy' ? `<div class="si-note">${esc(job.blurb || '')}</div>` : ''}
    `;
    const c = el.querySelector('#si-portrait');
    if (c) drawPortrait(c, u.job, u.side);
  }

  const dockBtn = (act, label, sub = '', cls = '') =>
    `<button class="dock-btn ${cls}" data-act="${act}">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</button>`;

  function renderDock() {
    const el = $('#action-dock');
    if (!el) return;
    const u = B.active;
    if (B.over) { el.innerHTML = '<div class="dock-info">The field is silent.</div>'; return; }
    if (B.busy || B.mode === 'enemy' || B.mode === 'anim') {
      el.innerHTML = `<div class="dock-info">${B.mode === 'enemy' ? 'The enemy is moving…' : 'Resolving…'}</div>`;
      return;
    }
    if (!u) { el.innerHTML = '<div class="dock-info">Select a companion.</div>'; return; }
    const arts = u.arts.filter(a => !a.mp || u.mp >= a.mp);
    const items = Object.keys(B.state.inventory || {}).filter(id => {
      const it = ITEM_MAP[id];
      return it && it.use && (owned(B.state, id) - (B.usedItems[id] || 0)) > 0;
    });
    const head = `<div class="dock-unit"><div class="du-name">${esc(u.name)}</div><div class="du-sub">${esc((JOBS[u.job] || {}).name || '')} · HP ${u.hp}/${u.stats.maxHp}</div></div>`;

    if (B.mode === 'select') {
      el.innerHTML = `${head}<div class="dock-actions">
        ${!u.hasMoved ? dockBtn('move', 'Move', `${u.stats.move} tiles`) : ''}
        ${dockBtn('openAction', 'Act', u.hasMoved ? 'attack / arts' : 'stay put', 'primary')}
        ${dockBtn('wait', 'Wait', 'end turn')}
        ${dockBtn('info', 'Info', 'details')}
      </div><div class="dock-info">Click a teal tile to move, or choose Act.</div>`;
      return;
    }
    if (B.mode === 'action') {
      el.innerHTML = `${head}<div class="dock-actions">
        ${dockBtn('attack', 'Attack', `${u.stats.weapon.range} range`, 'primary')}
        ${arts.length ? dockBtn('arts', 'Arts', `${arts.length} ready`) : ''}
        ${items.length ? dockBtn('items', 'Items', `${items.length} types`) : ''}
        ${dockBtn('wait', 'Wait', 'end turn')}
        ${dockBtn('back', 'Back', 'cancel')}
      </div>`;
      return;
    }
    if (B.mode === 'arts') {
      el.innerHTML = `${head}<div class="dock-sub">
        ${arts.map(a => dockBtn(`art:${a.id}`, a.name, `MP ${a.mp} · ${a.kind}`, '')).join('')}
      </div><div class="dock-actions">${dockBtn('back', 'Back', '', 'cancel')}</div>`;
      return;
    }
    if (B.mode === 'items') {
      el.innerHTML = `${head}<div class="dock-sub">
        ${items.map(id => {
          const it = ITEM_MAP[id];
          const n = owned(B.state, id) - (B.usedItems[id] || 0);
          return dockBtn(`item:${id}`, `${it.name} ×${n}`, it.desc || '', '');
        }).join('')}
      </div><div class="dock-actions">${dockBtn('back', 'Back', '', 'cancel')}</div>`;
      return;
    }
    if (B.mode === 'move') {
      el.innerHTML = `${head}<div class="dock-actions">${dockBtn('back', 'Cancel', 'stay here', 'cancel')}</div><div class="dock-info">Choose a highlighted tile. Terrain height costs extra movement.</div>`;
      return;
    }
    if (B.mode === 'target') {
      const label = B.targeting?.label || 'Choose a target';
      el.innerHTML = `${head}<div class="dock-actions">${dockBtn('back', 'Cancel', 'go back', 'cancel')}</div><div class="dock-info">${esc(label)}</div>`;
      return;
    }
    el.innerHTML = `${head}<div class="dock-actions">${dockBtn('info', 'Info', 'details')}</div>`;
  }

  function renderHint() {
    const el = $('#battle-hint');
    if (!el) return;
    const hints = {
      idle: 'Click a companion. Move, then Act. The turn order is CT — speed decides who moves.',
      select: 'Teal tiles are movement. Click one, or press Act to attack or use an Art.',
      move: 'Pick a teal tile. Higher ground grants damage; attacking from behind is stronger.',
      action: 'Attack with your weapon, spend MP on Arts, or use a consumable.',
      arts: 'Choose an Art. Red tiles show its range; orange shows the blast.',
      items: 'Choose a supply. Items are consumed only if you win the battle.',
      target: 'Hover a foe to see the forecast. Click to commit.',
      enemy: 'The enemy is taking its turn.',
      anim: 'Resolving…',
      over: 'The battle is decided.',
    };
    el.textContent = hints[B.mode] || '';
    const mi = $('#mobile-info');
    if (mi && B.active) {
      const u = B.active;
      mi.textContent = `${u.name} · ${(JOBS[u.job] || {}).name || ''} · HP ${u.hp}/${u.stats.maxHp} · MP ${u.mp}/${u.stats.maxMp}`;
    }
  }

  function refresh() {
    renderHeader();
    renderTurnOrder();
    renderSideInfo();
    renderDock();
    renderHint();
  }

  function banner(text, enemy = false) {
    const el = $('#turn-banner');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('enemy', enemy);
    el.classList.add('show');
    clearTimeout(B._bannerTimer);
    B._bannerTimer = setTimeout(() => el.classList.remove('show'), 1000);
  }

  function showForecast(attacker, defender, art) {
    const el = $('#forecast');
    if (!el) return;
    if (!attacker || !defender || defender.dead) { el.classList.add('hidden'); return; }
    const hit = hitChance(attacker, defender);
    const raw = estimateDamage(attacker, defender, art);
    const crit = critChance(attacker, art);
    const dmg = Math.max(1, Math.round(raw));
    const lethal = dmg >= defender.hp;
    const back = facingBonus(attacker, defender) > 1;
    const height = tileElev(attacker) - tileElev(defender);
    el.innerHTML = `
      <div class="fc-head">${esc(art?.name || 'Attack')}</div>
      <div class="fc-row"><span>Hit</span><strong class="${hit > 80 ? 'good' : hit < 65 ? 'bad' : ''}">${Math.round(hit)}%</strong></div>
      <div class="fc-row"><span>Damage</span><strong class="${lethal ? 'good' : ''}">${dmg}${lethal ? ' · DOWN' : ''}</strong></div>
      <div class="fc-row"><span>Crit</span><strong>${Math.round(crit)}%</strong></div>
      <div class="fc-row"><span>Facing</span><strong>${back ? 'Behind +20%' : height > 0 ? 'High ground' : height < 0 ? 'Low ground' : 'Neutral'}</strong></div>
      <div class="fc-row"><span>Target HP</span><strong>${defender.hp} / ${defender.stats.maxHp}</strong></div>`;
    el.classList.remove('hidden');
    const wrapRect = wrap.getBoundingClientRect();
    const x = clamp(B.mouse.x - wrapRect.left + 14, 8, wrapRect.width - 190);
    const y = clamp(B.mouse.y - wrapRect.top + 12, 8, wrapRect.height - 130);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }
  function hideForecast() {
    const el = $('#forecast');
    if (el) el.classList.add('hidden');
  }

  /* ---------------- combat math ---------------- */
  function basicAttack(u) {
    const w = u.stats.weapon;
    const magical = (w.mag || 0) > (w.atk || 0);
    return {
      id: 'weapon', name: 'Attack', desc: '', mp: 0,
      range: w.range || 1, aoe: 0, power: 100,
      kind: magical ? 'mag' : 'phys', target: 'enemy', affect: 'enemies',
    };
  }
  function artRange(art, u) { return art.range ?? u.stats.weapon.range; }
  function facingDir(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'e' : 'w';
    return dy > 0 ? 's' : 'n';
  }
  function facingBonus(a, d) {
    const dir = facingDir(d, a);
    if (dir === OPPOSITE[d.facing]) return 1.2;
    if (dir === d.facing) return 0.9;
    return 1;
  }
  function hitChance(a, d) {
    let hit = 91 + (eff(a, 'spd') - eff(d, 'spd')) * 0.8;
    const t = tileAt(d.x, d.y);
    if (t) hit -= t.terrain.evade || 0;
    if (has(d, 'evade')) hit -= statusVal(d, 'evade');
    if (tileElev(a) > tileElev(d)) hit += 4;
    return clamp(hit, 55, 99);
  }
  function critChance(a, art) {
    let c = 6 + (a.stats.luck || 0) * 0.4 + (art?.critBonus || 0) * 100;
    if (has(a, 'focus')) c += statusVal(a, 'focus');
    return clamp(c, 2, 60);
  }
  function estimateDamage(a, d, art) {
    const kind = art?.kind || 'phys';
    const w = a.stats.weapon;
    let atk, mit;
    if (kind === 'mag') {
      atk = eff(a, 'ma') + (w.mag || 0);
      mit = eff(d, 'res');
    } else if (kind === 'hybrid') {
      atk = ((eff(a, 'pa') + (w.atk || 0)) + (eff(a, 'ma') + (w.mag || 0))) / 2;
      mit = (eff(d, 'def') + eff(d, 'res')) / 2;
    } else {
      atk = eff(a, 'pa') + (w.atk || 0);
      mit = eff(d, 'def');
    }
    if (art?.pierce) mit *= 1 - art.pierce;
    let dmg = atk * ((art?.power || 100) / 100) - mit * 0.62;
    const hd = tileElev(a) - tileElev(d);
    dmg *= 1 + clamp(hd, -1, 1) * 0.1;
    dmg *= facingBonus(a, d);
    if (art?.execute && d.hp < d.stats.maxHp * 0.5) dmg *= 1.6;
    return Math.max(1, dmg);
  }
  function healPower(caster, art) {
    return Math.max(1, Math.round((art.power || 100) / 100 * eff(caster, 'ma') * 1.15 + 16));
  }

  function damageUnit(source, target, amount, art, opts = {}) {
    if (target.dead) return 0;
    let dmg = Math.max(1, Math.round(amount));
    const shield = target.statuses.find(s => s.id === 'shield');
    if (shield && shield.value > 0) {
      const absorbed = Math.min(shield.value, dmg);
      shield.value -= absorbed;
      dmg -= absorbed;
      if (absorbed > 0) floater(...Object.values(unitPoint(target)), `-${absorbed} shield`, '#79c0b4');
      if (shield.value <= 0) target.statuses = target.statuses.filter(s => s !== shield);
    }
    if (dmg <= 0) return 0;
    target.hp = Math.max(0, target.hp - dmg);
    const p = unitPoint(target);
    floater(p.x, p.y - 30, `-${dmg}`, opts.crit ? '#ffb066' : '#f0d795');
    burst(p.x, p.y - 16, opts.crit ? '#ffb066' : '#c9a96a', opts.crit ? 20 : 10);
    if (opts.crit) { shake(7); sfx('crit'); } else { shake(2.4); sfx('hit'); }
    if (target.hp <= 0) killUnit(target, source);
    return dmg;
  }
  function healUnit(target, amount) {
    if (target.dead) return 0;
    const before = target.hp;
    target.hp = Math.min(target.stats.maxHp, target.hp + Math.max(1, Math.round(amount)));
    const healed = target.hp - before;
    if (healed > 0) {
      const p = unitPoint(target);
      floater(p.x, p.y - 30, `+${healed}`, '#8fc09a');
      burst(p.x, p.y - 14, '#79c0b4', 8);
      sfx('heal');
    }
    return healed;
  }
  function killUnit(u, source) {
    if (u.dead) return;
    u.dead = true;
    u.hp = 0;
    u.ct = -999;
    u.statuses = [];
    const p = unitPoint(u);
    burst(p.x, p.y - 12, u.side === 'player' ? '#79c0b4' : '#b05257', 22);
    log(`<strong>${esc(u.name)}</strong> falls.`, u.side === 'player' ? 'enemy' : 'player');
    if (u.side === 'enemy') {
      B.kills += 1;
      if (u.dropId && (u.boss || Math.random() < (u.dropChance || 0.34))) {
        B.loot.push({ id: u.dropId, qty: 1, source: u.name });
        log(`${esc(u.name)} drops <strong>${esc(ITEM_MAP[u.dropId]?.name || u.dropId)}</strong>.`, 'gold');
      } else if (Math.random() < 0.2) {
        const id = rollLoot(B.chapterIndex);
        B.loot.push({ id, qty: 1, source: u.name });
        log(`${esc(u.name)} drops <strong>${esc(ITEM_MAP[id]?.name || id)}</strong>.`, 'gold');
      }
      if (u.boss) { shake(9); sfx('crit'); }
    }
    if (u.uid === B.active?.uid) {
      B.active = null;
      B.mode = 'idle';
      clearTargets();
      setTimeout(() => { if (!B.over && !B.destroyed) endTurn(); }, 420);
    }
  }

  /* ---------------- movement ---------------- */
  function computeReachable(u) {
    const start = KEY(u.x, u.y);
    const best = { [start]: 0 };
    const prev = {};
    const startElev = tileElev(u);
    const queue = [{ x: u.x, y: u.y, cost: 0 }];
    while (queue.length) {
      queue.sort((a, b) => a.cost - b.cost);
      const cur = queue.shift();
      const curKey = KEY(cur.x, cur.y);
      if (cur.cost > (best[curKey] ?? Infinity)) continue;
      const curElev = tileAt(cur.x, cur.y)?.elev || 0;
      for (const d of DIRS) {
        const nx = cur.x + d.x, ny = cur.y + d.y;
        const nt = tileAt(nx, ny);
        if (!nt || nt.block) continue;
        const occ = unitAt(nx, ny);
        if (occ && occ.side !== u.side) continue;
        const dz = nt.elev - curElev;
        if (dz > u.stats.jump) continue;
        const nc = cur.cost + (nt.terrain.cost || 1) + Math.max(0, dz) * 2;
        if (nc > u.stats.move) continue;
        const k = KEY(nx, ny);
        if (best[k] === undefined || nc < best[k]) {
          best[k] = nc;
          prev[k] = curKey;
          queue.push({ x: nx, y: ny, cost: nc });
        }
      }
    }
    const paths = {};
    for (const k of Object.keys(best)) {
      const path = [];
      let cur = k;
      let guard = 0;
      while (cur && guard++ < 100) {
        path.unshift(cur);
        cur = prev[cur];
      }
      if (path[0] === start) paths[k] = path;
    }
    const set = new Set(Object.keys(paths).filter(k => {
      const [x, y] = k.split(',').map(Number);
      const occ = unitAt(x, y);
      return !occ || (occ.x === u.x && occ.y === u.y);
    }));
    return { set, paths };
  }

  async function moveAlong(u, path) {
    B.busy = true;
    B.mode = 'anim';
    B.moveSet = null; B.pathSet = null;
    refresh();
    for (let i = 1; i < path.length; i++) {
      const [x, y] = path[i].split(',').map(Number);
      const prev = { x: u.x, y: u.y };
      u.facing = facingDir(prev, { x, y });
      u.x = x; u.y = y;
      sfx('move');
      await wait(88);
      if (B.destroyed) return;
    }
    B.busy = false;
  }

  function startMove(t) {
    const u = B.active;
    if (!u || u.hasMoved) return;
    const k = KEY(t.x, t.y);
    const path = B.movePaths?.[k];
    if (!path || path.length < 2) return;
    (async () => {
      await moveAlong(u, path);
      if (B.destroyed) return;
      u.hasMoved = true;
      B.mode = 'action';
      clearTargets();
      refresh();
    })();
  }

  /* ---------------- targeting ---------------- */
  function clearTargets() {
    B.moveSet = null; B.movePaths = null; B.attackSet = null; B.aoeSet = null; B.pathSet = null;
    B.selectedArt = null; B.selectedItem = null; B.targeting = null;
    hideForecast();
  }
  function canTarget(caster, art, u) {
    if (!u) return false;
    if (art.target === 'deadAlly') return u.dead && u.side === caster.side;
    if (u.dead) return false;
    if (art.target === 'self') return u.uid === caster.uid;
    if (art.target === 'ally') return u.side === caster.side;
    if (art.target === 'enemy') return u.side !== caster.side;
    return true;
  }
  function rangeTiles(u, range, includeBlocked = false) {
    const set = new Set();
    for (const t of B.tiles) {
      if (t.block && !includeBlocked) continue;
      if (dist(u, t) <= range) set.add(KEY(t.x, t.y));
    }
    return set;
  }
  function aoeSet(center, radius) {
    const set = new Set();
    for (const t of B.tiles) {
      if (dist(center, t) <= radius) set.add(KEY(t.x, t.y));
    }
    return set;
  }
  function beginTargeting(kind, payload) {
    const u = B.active;
    if (!u) return;
    let art;
    if (kind === 'attack') art = basicAttack(u);
    else if (kind === 'art') art = payload;
    else if (kind === 'item') art = payload.use;
    B.selectedArt = kind === 'art' ? payload : null;
    B.selectedItem = kind === 'item' ? payload : null;
    B.targeting = { kind, art, label: kind === 'item' ? payload.name : art.name };
    B.mode = 'target';
    B.attackSet = rangeTiles(u, artRange(art, u), art.target === 'tile');
    B.aoeSet = null;
    refresh();
  }
  function confirmTarget(t, u) {
    const T = B.targeting;
    if (!T) return;
    const caster = B.active;
    if (!caster) return;
    const art = T.art;
    if (art.target === 'tile') {
      if (!B.attackSet?.has(KEY(t.x, t.y))) { toast('Out of range'); sfx('cancel'); return; }
      if (t.block) { toast('Cannot target that tile'); return; }
      const target = { x: t.x, y: t.y };
      B.busy = true;
      B.mode = 'anim';
      clearTargets();
      refresh();
      (async () => {
        await executeArt(caster, art, target, T.kind === 'item' ? T : null);
        afterPlayerAction(caster);
      })();
      return;
    }
    if (!u || !canTarget(caster, art, u)) { toast('Invalid target'); sfx('cancel'); return; }
    if (dist(caster, u) > artRange(art, caster)) { toast('Out of range'); sfx('cancel'); return; }
    B.busy = true;
    B.mode = 'anim';
    clearTargets();
    refresh();
    (async () => {
      await executeArt(caster, art, u, T.kind === 'item' ? T : null);
      afterPlayerAction(caster);
    })();
  }
  function afterPlayerAction(caster) {
    if (B.destroyed) return;
    B.busy = false;
    if (B.over) { refresh(); return; }
    if (caster.dead) { endTurn(); return; }
    caster.hasActed = true;
    endTurn();
  }
