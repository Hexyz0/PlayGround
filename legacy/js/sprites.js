/* ============================================================
   THE HOLLOW CROWN — 16-bit pixel sprites
   All art is drawn at runtime from tiny pixel maps.
   ============================================================ */
import { JOBS } from './data.js';

const BODY = {
  armor: [
    '    oo',
    '   oggo',
    '  oaaaaao',
    '  oseeso',
    '  oaaaaao',
    ' oaaaaaaao',
    'oaaaaaaaaao',
    'oaadaadaaao',
    'oaadaadaaao',
    'oaaaaaaaaao',
    ' oaaaaaaao',
    '  oaaaaao',
    '  o d d o',
    '  o d d o',
    ' oo oo oo',
  ],
  blade: [
    '    oo',
    '   oaao',
    '  oaaaao',
    '  oseeso',
    '  oaaaao',
    ' oaaaaaao',
    ' oaadaaao',
    'oaadaadaao',
    'oaadaadaao',
    ' oaaaaaao',
    '  oaaaao',
    '  o d d o',
    '  o d d o',
    '  o d d o',
    ' oo oo oo',
  ],
  hood: [
    '   oooo',
    '  oaaaao',
    '  oseeso',
    '  oaaaao',
    ' oaaaaaao',
    ' oaadaaao',
    'oaadaadaao',
    'oaadaadaao',
    ' oaaaaaao',
    '  oaaaao',
    '  o d d o',
    '  o d d o',
    '  o d d o',
    '  o d d o',
    ' oo oo oo',
  ],
  mage: [
    '     o',
    '    oao',
    '   oaaao',
    '  oaaaaao',
    '  oseeso',
    '  oaaaaao',
    ' oaaaaaaao',
    'oaadaadaaao',
    'oaadaadaaao',
    ' oaaaaaaao',
    ' oaaaaaaao',
    '  oaaaaao',
    '  oaaaaao',
    '  o d d o',
    ' oo oo oo',
  ],
  lance: [
    '    oo',
    '   oaao',
    '  oaaaao',
    '  oseeso',
    '  oaaaao',
    ' oaaaaaao',
    'oaadaadaao',
    'oaadaadaao',
    ' oaaaaaao',
    '  oaaaao',
    '  o d d o',
    '  o d d o',
    '  o d d o',
    '  o d d o',
    ' oo oo oo',
  ],
};

const JOB_BODY = {
  squire: 'armor', banneret: 'armor', knight: 'armor', paladin: 'armor',
  darkknight: 'armor', reaver: 'armor', firstking: 'armor',
  duelist: 'blade', swordmaster: 'blade', runefencer: 'blade', runelord: 'blade',
  inquisitor: 'blade', grandinquisitor: 'blade',
  archer: 'hood', sniper: 'hood', thief: 'hood', shadowlord: 'hood',
  blackmage: 'mage', archmage: 'mage', whitemage: 'mage', bishop: 'mage',
  necromancer: 'mage', lich: 'mage',
  dragoon: 'lance', dragonlord: 'lance',
};

export function jobBody(jobId) { return JOB_BODY[jobId] || 'armor'; }

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgb(r, g, b) { return `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`; }
function shade(hex, amt) {
  const c = hexToRgb(hex);
  if (amt >= 0) return rgb(c.r + (255 - c.r) * amt, c.g + (255 - c.g) * amt, c.b + (255 - c.b) * amt);
  return rgb(c.r * (1 + amt), c.g * (1 + amt), c.b * (1 + amt));
}

export function paletteFor(jobId, team = 'player') {
  const job = JOBS[jobId] || JOBS.squire;
  const base = team === 'enemy' ? '#a3444a' : (job.color || '#b9a273');
  return {
    o: '#0a0810',
    d: shade(base, -0.48),
    m: base,
    a: base,
    l: shade(base, 0.32),
    g: team === 'enemy' ? '#9c7a46' : '#d6b56a',
    s: team === 'enemy' ? '#9b8e84' : '#d9b48c',
    e: team === 'enemy' ? '#ff6b5e' : '#f6ecd2',
    w: team === 'enemy' ? '#a7a0a0' : '#c2ccd4',
  };
}

const PX = 2; // board units per pixel
const SPRITE_H = 15;

function drawPixels(ctx, rows, x, y, palette, px = PX, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const h = rows.length;
  for (let r = 0; r < h; r++) {
    const row = rows[r];
    const startX = x - (row.length * px) / 2;
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === ' ' || ch === '.') continue;
      const col = palette[ch] || palette.a;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(startX + c * px), Math.round(y - h * px + r * px), Math.ceil(px), Math.ceil(px));
    }
  }
  ctx.restore();
}

function drawWeapon(ctx, jobId, x, y, palette, px, team, attacking = 0) {
  const job = JOBS[jobId] || JOBS.squire;
  const type = job.weapons[0] || 'sword';
  const bob = attacking ? -2 : 0;
  const cx = x + 8 * px;
  const top = y - SPRITE_H * px + 3 * px + bob;
  ctx.save();
  if (type === 'sword' || type === 'dagger') {
    const len = type === 'dagger' ? 4 : 7;
    ctx.fillStyle = palette.w;
    ctx.fillRect(cx, top + 2, px, len * px);
    ctx.fillStyle = palette.g;
    ctx.fillRect(cx - px, top + 1, px * 3, px);
    ctx.fillStyle = palette.l;
    ctx.fillRect(cx, top + 2, px * 0.6, px * 2);
  } else if (type === 'spear') {
    ctx.fillStyle = '#6a5034';
    ctx.fillRect(cx, top - 3 * px, px, 12 * px);
    ctx.fillStyle = palette.w;
    ctx.fillRect(cx - px, top - 5 * px, px * 3, px * 2);
    ctx.fillStyle = palette.l;
    ctx.fillRect(cx, top - 5 * px, px, px);
  } else if (type === 'bow') {
    ctx.strokeStyle = '#8c6a3f';
    ctx.lineWidth = px;
    ctx.beginPath();
    ctx.arc(cx + px, top + 5 * px, 4.5 * px, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = '#d8d0b0';
    ctx.lineWidth = Math.max(0.7, px * 0.35);
    ctx.beginPath();
    ctx.moveTo(cx + px, top + 0.5 * px);
    ctx.lineTo(cx + px, top + 9.5 * px);
    ctx.stroke();
  } else if (type === 'staff') {
    ctx.fillStyle = '#6d5538';
    ctx.fillRect(cx, top - 2 * px, px, 11 * px);
    const glow = team === 'enemy' ? '#d85a5a' : '#8fd8d2';
    ctx.fillStyle = glow;
    ctx.fillRect(cx - px, top - 4 * px, px * 3, px * 3);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(cx - 2 * px, top - 5 * px, px * 5, px * 5);
  } else if (type === 'grimoire') {
    ctx.fillStyle = palette.d;
    ctx.fillRect(cx - px, top + 2 * px, 4 * px, 5 * px);
    ctx.fillStyle = palette.g;
    ctx.fillRect(cx, top + 3 * px, 2 * px, px);
    ctx.fillRect(cx + px, top + 5 * px, px, px);
  }
  ctx.restore();
}

export function drawUnitSprite(ctx, opts) {
  const {
    jobId, x, y, team = 'player', time = 0, seed = 0, dead = false,
    active = false, hover = false, attack = 0, px = PX, facing = 's',
  } = opts;
  const job = JOBS[jobId] || JOBS.squire;
  const pal = paletteFor(jobId, team);
  const bob = dead ? 0 : Math.sin(time * 2.2 + seed) * 0.8;

  // shadow
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 11, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // team ring
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = team === 'enemy' ? 'rgba(190,70,70,0.7)' : 'rgba(120,200,180,0.7)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (active) {
    ctx.strokeStyle = 'rgba(240,204,120,0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 16 + Math.sin(time * 4) * 2, 6 + Math.sin(time * 4), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  if (dead) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.translate(x, y - 8);
    ctx.rotate(Math.PI / 2);
    drawPixels(ctx, BODY[jobBody(jobId)], 0, 8, pal, px, 1);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#8b8272';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 2); ctx.lineTo(x + 4, y + 2);
    ctx.moveTo(x + 4, y - 2); ctx.lineTo(x - 4, y + 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const body = BODY[jobBody(jobId)];
  const attackLunge = attack ? Math.sin(attack * Math.PI) * 5 : 0;
  const dir = facing === 'e' ? 1 : facing === 'w' ? -1 : 0;
  const sx = x + dir * attackLunge;
  const sy = y + bob;

  if (attack) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath();
    ctx.ellipse(sx, sy - 18, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawWeapon(ctx, jobId, sx, sy, pal, px, team, attack);
  drawPixels(ctx, body, sx, sy, pal, px, 1);

  // advanced class crown / plume
  if (job.tier === 2) {
    ctx.fillStyle = pal.g;
    const cy = sy - SPRITE_H * px - 2;
    ctx.fillRect(sx - 3 * px, cy, px, px);
    ctx.fillRect(sx - px, cy - px, px, px * 2);
    ctx.fillRect(sx + px, cy - px, px, px * 2);
    ctx.fillRect(sx + 3 * px, cy, px, px);
  }
  if (jobBody(jobId) === 'lance') {
    ctx.fillStyle = pal.l;
    ctx.fillRect(sx - px, sy - SPRITE_H * px - 3, px, 3 * px);
  }

  // facing eye glint
  ctx.fillStyle = pal.e;
  const eyeDir = facing === 'e' ? 1 : facing === 'w' ? -1 : 0;
  ctx.fillRect(sx + eyeDir * px, sy - SPRITE_H * px + 4 * px, px, px);

  if (hover) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#e8c98a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 15, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawPortrait(canvas, jobId, team = 'player') {
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 120;
  const h = canvas.clientHeight || 140;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const job = JOBS[jobId] || JOBS.squire;
  const pal = paletteFor(jobId, team);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1a1620');
  bg.addColorStop(1, '#0a0810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = team === 'enemy' ? 'rgba(120,35,40,0.28)' : 'rgba(60,120,110,0.2)';
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  const px = Math.max(2, Math.floor(Math.min(w / 18, h / 20)));
  const body = BODY[jobBody(jobId)];
  drawWeapon(ctx, jobId, w / 2, h - 14, pal, px, team, 0);
  drawPixels(ctx, body, w / 2, h - 14, pal, px, 1);
  if (job.tier === 2) {
    ctx.fillStyle = pal.g;
    const sx = w / 2;
    const cy = h - 14 - body.length * px - 2;
    ctx.fillRect(sx - 3 * px, cy, px, px);
    ctx.fillRect(sx - px, cy - px, px, px * 2);
    ctx.fillRect(sx + px, cy - px, px, px * 2);
    ctx.fillRect(sx + 3 * px, cy, px, px);
  }
  // pixel frame corners
  ctx.strokeStyle = 'rgba(214,181,106,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = 'rgba(214,181,106,0.16)';
  ctx.fillRect(0, 0, 6, 6);
  ctx.fillRect(w - 6, 0, 6, 6);
  ctx.fillRect(0, h - 6, 6, 6);
  ctx.fillRect(w - 6, h - 6, 6, 6);
}

export function drawCrown(ctx, x, y, px = 3) {
  const rows = [
    'o..o..o..o',
    'oo.oo.oo.o',
    'ogogogogo',
    'ogggggggo',
    'og.ggg.go',
    'ooooooooo',
  ];
  const pal = { o: '#0a0810', g: '#d6b56a' };
  const w = rows[0].length * px;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === '.') continue;
      ctx.fillStyle = pal[rows[r][c]] || pal.g;
      ctx.fillRect(x - w / 2 + c * px, y + r * px, px, px);
    }
  }
}

export function drawEmber(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), size, size);
}

export { SPRITE_H };
