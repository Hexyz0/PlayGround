/* ============================================================
   HOLLOW CROWN — SKIRMISH
   A tiny turn-based tactics game built for phones.

   Rules:
   - Tap a hero, then a teal tile to move (once per turn).
   - Tap a red-ringed foe to attack (once per turn).
   - Clear every foe to win. If every hero falls, the run ends.
   ============================================================ */

const BOARD = 6;
const SAVE_KEY = 'hollow-crown-skirmish-v1';
const MUTE_KEY = 'hollow-crown-skirmish-muted';

/* ============================================================
   DATA
   ============================================================ */

const HERO_TYPES = {
  warden: { name: 'Warden', hp: 11, atk: 3, move: 1, range: 1, color: '#d8b56c', icon: 'shield' },
  ranger: { name: 'Ranger', hp: 7, atk: 2, move: 2, range: 2, color: '#7fc4b6', icon: 'bow' },
  hexblade: { name: 'Hexblade', hp: 8, atk: 4, move: 1, range: 1, color: '#b49bdd', icon: 'hex' },
};

const ENEMY_TYPES = {
  ghoul: { name: 'Ghoul', hp: 5, atk: 2, move: 1, range: 1, color: '#c07066', icon: 'claw' },
  wraith: { name: 'Wraith', hp: 4, atk: 2, move: 2, range: 1, color: '#9285c4', icon: 'hood' },
  archer: { name: 'Bone Archer', hp: 4, atk: 2, move: 1, range: 2, color: '#cbb07a', icon: 'skull' },
  boss: { name: 'Hollow King', hp: 15, atk: 4, move: 1, range: 1, color: '#d06b62', icon: 'crown' },
};

const STAGES = [
  {
    name: 'The Ashen Gate',
    enemies: [
      ['ghoul', 2, 0],
      ['ghoul', 4, 1],
    ],
  },
  {
    name: 'The Weeping Wood',
    enemies: [
      ['ghoul', 1, 0],
      ['ghoul', 4, 0],
      ['wraith', 2, 1],
    ],
  },
  {
    name: 'The Bone Choir',
    enemies: [
      ['archer', 1, 0],
      ['archer', 4, 1],
      ['wraith', 2, 0],
      ['wraith', 5, 2],
    ],
  },
  {
    name: 'The Broken Keep',
    enemies: [
      ['boss', 2, 1],
      ['ghoul', 4, 0],
      ['ghoul', 1, 2],
    ],
  },
  {
    name: 'The Hollow Throne',
    enemies: [
      ['boss', 2, 1],
      ['archer', 0, 0],
      ['archer', 5, 0],
      ['wraith', 3, 2],
    ],
  },
];

const UPGRADES = [
  { id: 'atk', icon: '\u2694', name: 'Sharpen Blades', desc: 'Every hero gains +1 attack.' },
  { id: 'hp', icon: '\u2665', name: 'Iron Resolve', desc: 'Every hero gains +2 max HP.' },
  { id: 'move', icon: '\u27A4', name: 'Fleet Footed', desc: 'Every hero gains +1 movement.' },
];

const DIRS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

/* ============================================================
   DOM
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const screens = {
  home: $('#home'),
  battle: $('#battle'),
};
const canvas = $('#board');
const boardWrap = $('#board-wrap');
const overlay = $('#overlay');
const unitStrip = $('#unit-strip');
const doneBtn = $('#btn-done');
const endBtn = $('#btn-end');
const hintEl = $('#hint');
const bannerEl = $('#banner');
const toastEl = $('#toast');
const continueBtn = $('#btn-continue');
const soundBtn = $('#btn-sound');

/* ============================================================
   STATE
   ============================================================ */

const G = {
  screen: 'home',
  stageIndex: 0,
  turn: 1,
  phase: 'home',
  units: [],
  selectedId: null,
  activeEnemyId: null,
  busy: false,
  token: 0,
  upgrades: { atk: 0, hp: 0, move: 0 },
  runTurns: 0,
  stats: { fallen: 0 },
  floaters: [],
  shake: 0,
  moveSet: new Map(),
  targetIds: new Set(),
  bannerTimer: 0,
  toastTimer: 0,
};

const view = {
  size: 0,
  cell: 0,
  dpr: 1,
  ctx: canvas ? canvas.getContext('2d') : null,
  last: 0,
};

let uid = 1;
let resizeRaf = 0;

/* ============================================================
   SOUND
   ============================================================ */

const Sound = {
  ctx: null,
  muted: (() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  })(),

  unlock() {
    if (this.muted) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      try {
        this.ctx = new Ctx();
      } catch {
        return;
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },

  tone(f0, f1, dur, type = 'sine', vol = 0.05, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, f0), t0);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  },

  noise(dur = 0.1, vol = 0.06) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
    }
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.buffer = buffer;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  },

  play(name) {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;
    switch (name) {
      case 'tap':
        this.tone(700, 560, 0.05, 'triangle', 0.03);
        break;
      case 'move':
        this.tone(300, 430, 0.09, 'sine', 0.035);
        break;
      case 'step':
        this.tone(150, 110, 0.06, 'sine', 0.025);
        break;
      case 'hit':
        this.noise(0.12, 0.075);
        this.tone(170, 65, 0.16, 'square', 0.045);
        break;
      case 'hurt':
        this.noise(0.1, 0.05);
        this.tone(230, 110, 0.14, 'sawtooth', 0.035);
        break;
      case 'kill':
        this.tone(200, 80, 0.24, 'triangle', 0.045);
        break;
      case 'turn':
        this.tone(392, 523, 0.14, 'triangle', 0.035);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.2, 'triangle', 0.045, i * 0.11));
        break;
      case 'lose':
        [330, 262, 196].forEach((f, i) => this.tone(f, f, 0.3, 'sawtooth', 0.035, i * 0.14));
        break;
      default:
        break;
    }
  },
};

function updateSoundBtn() {
  if (!soundBtn) return;
  soundBtn.classList.toggle('muted', Sound.muted);
  soundBtn.setAttribute('aria-label', Sound.muted ? 'Enable sound' : 'Mute sound');
}

function haptic(pattern) {
  if (!navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

/* ============================================================
   HELPERS
   ============================================================ */

const keyOf = (x, y) => `${x},${y}`;
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function inBounds(x, y) {
  return x >= 0 && x < BOARD && y >= 0 && y < BOARD;
}

function unitAt(x, y) {
  return G.units.find((u) => u.alive && u.x === x && u.y === y) || null;
}

function selectedHero() {
  const h = G.units.find((u) => u.id === G.selectedId);
  return h && h.alive ? h : null;
}

function firstReadyHero() {
  return G.units.find((u) => u.side === 'hero' && u.alive && !u.spent) || null;
}

function enemiesAlive() {
  return G.units.filter((u) => u.side === 'enemy' && u.alive);
}

function heroesAlive() {
  return G.units.filter((u) => u.side === 'hero' && u.alive);
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/* ============================================================
   SAVE / LOAD
   ============================================================ */

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p.stageIndex !== 'number' || p.stageIndex < 0 || p.stageIndex >= STAGES.length) return null;
    return p;
  } catch {
    return null;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        stageIndex: G.stageIndex,
        upgrades: G.upgrades,
        runTurns: G.runTurns,
      })
    );
  } catch {
    /* storage may be blocked */
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

/* ============================================================
   UNITS
   ============================================================ */

function makeHero(type, x, y) {
  const base = HERO_TYPES[type];
  const maxHp = base.hp + G.upgrades.hp * 2;
  return {
    id: `h${uid++}`,
    side: 'hero',
    type,
    name: base.name,
    x,
    y,
    rx: x,
    ry: y,
    hp: maxHp,
    maxHp,
    atk: base.atk + G.upgrades.atk,
    move: base.move + G.upgrades.move,
    range: base.range,
    color: base.color,
    icon: base.icon,
    alive: true,
    moved: false,
    attacked: false,
    spent: false,
    bob: Math.random() * Math.PI * 2,
    flash: 0,
    deathT: 0,
  };
}

function makeEnemy(type, x, y) {
  const base = ENEMY_TYPES[type];
  return {
    id: `e${uid++}`,
    side: 'enemy',
    type,
    name: base.name,
    x,
    y,
    rx: x,
    ry: y,
    hp: base.hp,
    maxHp: base.hp,
    atk: base.atk,
    move: base.move,
    range: base.range,
    color: base.color,
    icon: base.icon,
    alive: true,
    bob: Math.random() * Math.PI * 2,
    flash: 0,
    deathT: 0,
  };
}

/* ============================================================
   FLOW
   ============================================================ */

function showScreen(name) {
  Object.entries(screens).forEach(([id, el]) => {
    if (el) el.classList.toggle('active', id === name);
  });
  G.screen = name;
  if (name === 'battle') {
    requestAnimationFrame(resizeBoard);
  }
}

function updateHome() {
  const p = loadProgress();
  if (!continueBtn) return;
  continueBtn.disabled = !p;
  continueBtn.textContent = p ? `Continue \u00B7 Stage ${p.stageIndex + 1}` : 'Continue';
}

function goHome() {
  G.token++;
  G.phase = 'home';
  G.busy = false;
  G.selectedId = null;
  closeOverlay();
  updateHome();
  showScreen('home');
}

function startNewRun() {
  G.upgrades = { atk: 0, hp: 0, move: 0 };
  G.runTurns = 0;
  G.stageIndex = 0;
  startStage(0);
}

function continueRun() {
  const p = loadProgress();
  if (!p) {
    updateHome();
    return;
  }
  G.upgrades = { atk: 0, hp: 0, move: 0, ...(p.upgrades || {}) };
  G.runTurns = p.runTurns || 0;
  startStage(p.stageIndex);
}

function startStage(index) {
  const stage = STAGES[index];
  if (!stage) {
    goHome();
    return;
  }

  G.token++;
  G.stageIndex = index;
  G.turn = 1;
  G.phase = 'player';
  G.busy = false;
  G.selectedId = null;
  G.activeEnemyId = null;
  G.stats = { fallen: 0 };
  G.floaters = [];
  G.shake = 0;
  G.moveSet = new Map();
  G.targetIds = new Set();
  G.units = [];

  const heroTypes = index >= 1 ? ['warden', 'hexblade', 'ranger'] : ['warden', 'ranger'];
  const spawns = heroTypes.length === 3
    ? [[1, 5], [2, 4], [4, 5]]
    : [[2, 5], [3, 4]];

  heroTypes.forEach((type, i) => {
    G.units.push(makeHero(type, spawns[i][0], spawns[i][1]));
  });
  stage.enemies.forEach(([type, x, y]) => {
    G.units.push(makeEnemy(type, x, y));
  });

  showScreen('battle');
  updateHUD();
  updateStrip();
  updateHint();
  resizeBoard();
  saveProgress();

  const first = firstReadyHero();
  G.selectedId = first ? first.id : null;
  refreshSelection();
  updateStrip();
  updateHint();

  banner('YOUR TURN');
  Sound.play('turn');
}

/* ============================================================
   PLAYER ACTIONS
   ============================================================ */

function refreshSelection() {
  const hero = selectedHero();
  G.moveSet = hero ? computeMoveSet(hero) : new Map();
  G.targetIds = new Set(hero ? computeTargets(hero).map((u) => u.id) : []);
}

function computeMoveSet(hero) {
  const out = new Map();
  if (!hero || !hero.alive || hero.moved || hero.attacked) return out;

  const blocked = new Set();
  for (const u of G.units) {
    if (u.alive && u.id !== hero.id) blocked.add(keyOf(u.x, u.y));
  }

  const startKey = keyOf(hero.x, hero.y);
  const seen = new Set([startKey]);
  const queue = [[hero.x, hero.y, 0]];

  while (queue.length) {
    const [x, y, d] = queue.shift();
    if (d >= hero.move) continue;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const k = keyOf(nx, ny);
      if (seen.has(k) || blocked.has(k)) continue;
      seen.add(k);
      out.set(k, d + 1);
      queue.push([nx, ny, d + 1]);
    }
  }
  return out;
}

function computeTargets(hero) {
  if (!hero || hero.attacked) return [];
  return G.units.filter(
    (u) => u.side === 'enemy' && u.alive && dist(hero, u) <= hero.range
  );
}

function selectHero(id, silent = false) {
  if (G.phase !== 'player' || G.busy) return;
  const hero = G.units.find((u) => u.id === id);
  if (!hero || !hero.alive || hero.spent) return;
  if (G.selectedId === id) return;
  G.selectedId = id;
  refreshSelection();
  updateStrip();
  updateHint();
  if (!silent) {
    Sound.play('tap');
    haptic(6);
  }
}

function finishHero(hero) {
  if (!hero || !hero.alive || hero.spent) return;
  const wasSelected = G.selectedId === hero.id;
  hero.spent = true;

  if (wasSelected) {
    G.selectedId = null;
    const next = firstReadyHero();
    if (next) G.selectedId = next.id;
  }

  refreshSelection();
  updateStrip();
  updateHint();

  if (!firstReadyHero() && G.phase === 'player' && !G.busy) {
    const token = G.token;
    setTimeout(() => {
      if (token === G.token && G.phase === 'player' && !G.busy && !firstReadyHero()) {
        endPlayerTurn();
      }
    }, 420);
  }
}

async function moveHero(hero, x, y) {
  if (G.busy || G.phase !== 'player') return;
  hero.x = x;
  hero.y = y;
  hero.moved = true;
  Sound.play('move');
  haptic(7);
  refreshSelection();
  updateStrip();
  updateHint();

  if (computeTargets(hero).length === 0) {
    await sleep(240);
    if (G.phase === 'player' && !G.busy) finishHero(hero);
  } else {
    toast('Foe in range \u2014 tap to strike');
  }
}

async function attack(hero, enemy) {
  if (G.busy || G.phase !== 'player') return;
  G.busy = true;
  hero.attacked = true;
  hero.moved = true;
  refreshSelection();
  updateStrip();
  updateHint();

  Sound.play('hit');
  haptic(18);
  damageUnit(enemy, hero.atk);

  await sleep(430);

  if (!enemiesAlive().length) {
    stageWon();
    return;
  }

  G.busy = false;
  finishHero(hero);
}

function damageUnit(target, amount) {
  if (!target || !target.alive) return;
  target.hp = Math.max(0, target.hp - amount);
  target.flash = 1;
  G.shake = Math.min(9, G.shake + 4.5);
  addFloater(target.x, target.y, `-${amount}`, target.side === 'hero' ? '#ff9d92' : '#ffd98a');

  if (target.hp <= 0) {
    target.alive = false;
    target.deathT = 0.6;
    addFloater(target.x, target.y - 0.22, 'SLAIN', '#d8b56c', 0.8);
    if (target.side === 'enemy') Sound.play('kill');
  }
  updateHUD();
}

/* ============================================================
   TURN FLOW
   ============================================================ */

async function endPlayerTurn() {
  if (G.phase !== 'player' || G.busy) return;
  const token = G.token;

  G.phase = 'enemy';
  G.busy = true;
  G.selectedId = null;
  G.activeEnemyId = null;
  G.moveSet = new Map();
  G.targetIds = new Set();

  updateHUD();
  updateStrip();
  updateHint();
  banner('ENEMY TURN');
  Sound.play('turn');
  await sleep(560);
  if (token !== G.token) return;

  const enemies = enemiesAlive();
  for (const enemy of enemies) {
    if (token !== G.token) return;
    if (!heroesAlive().length) break;
    G.activeEnemyId = enemy.id;
    await enemyAct(enemy, token);
    await sleep(250);
  }

  if (token !== G.token) return;
  G.activeEnemyId = null;

  if (!heroesAlive().length) {
    defeat();
    return;
  }

  G.turn++;
  G.runTurns++;
  G.phase = 'player';
  G.busy = false;

  for (const u of G.units) {
    if (u.side === 'hero' && u.alive) {
      u.moved = false;
      u.attacked = false;
      u.spent = false;
    }
  }

  const first = firstReadyHero();
  G.selectedId = first ? first.id : null;
  refreshSelection();
  updateHUD();
  updateStrip();
  updateHint();
  banner('YOUR TURN');
  Sound.play('turn');
}

async function enemyAct(enemy, token) {
  if (!enemy.alive) return;
  const heroes = () => heroesAlive();
  if (!heroes().length) return;

  let targets = heroes().filter((h) => dist(enemy, h) <= enemy.range);

  if (!targets.length) {
    const reach = computeEnemyReach(enemy);
    let best = { x: enemy.x, y: enemy.y, score: Infinity };

    for (const k of reach) {
      const [x, y] = k.split(',').map(Number);
      let nearest = Infinity;
      for (const h of heroes()) {
        nearest = Math.min(nearest, Math.abs(h.x - x) + Math.abs(h.y - y));
      }
      const canHit = nearest <= enemy.range;
      // Ranged foes like to keep their distance; melee foes close in.
      const score = canHit
        ? Math.abs(nearest - enemy.range) * 10 + (x === enemy.x && y === enemy.y ? -1 : 0)
        : 100 + nearest * 10;
      if (score < best.score) best = { x, y, score };
    }

    if (best.x !== enemy.x || best.y !== enemy.y) {
      enemy.x = best.x;
      enemy.y = best.y;
      Sound.play('step');
      await sleep(300);
      if (token !== G.token) return;
    }

    targets = heroes().filter((h) => dist(enemy, h) <= enemy.range);
  }

  if (!targets.length) return;

  targets.sort((a, b) => a.hp - b.hp || dist(enemy, a) - dist(enemy, b));
  const victim = targets[0];

  await sleep(160);
  if (token !== G.token) return;

  Sound.play('hurt');
  haptic(14);
  damageUnit(victim, enemy.atk);

  if (victim.hp <= 0) {
    G.stats.fallen++;
    if (G.selectedId === victim.id) G.selectedId = null;
    toast(`${victim.name} has fallen`);
  }

  updateStrip();
  updateHUD();
  await sleep(360);
}

function computeEnemyReach(enemy) {
  const reach = new Set([keyOf(enemy.x, enemy.y)]);
  const blocked = new Set();
  for (const u of G.units) {
    if (u.alive && u.id !== enemy.id) blocked.add(keyOf(u.x, u.y));
  }

  const queue = [[enemy.x, enemy.y, 0]];
  const seen = new Set([keyOf(enemy.x, enemy.y)]);

  while (queue.length) {
    const [x, y, d] = queue.shift();
    if (d >= enemy.move) continue;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const k = keyOf(nx, ny);
      if (seen.has(k) || blocked.has(k)) continue;
      seen.add(k);
      reach.add(k);
      queue.push([nx, ny, d + 1]);
    }
  }
  return reach;
}

/* ============================================================
   END STATES
   ============================================================ */

function stageWon() {
  if (G.phase === 'over') return;
  G.token++;
  G.phase = 'over';
  G.busy = true;
  G.selectedId = null;
  G.moveSet = new Map();
  G.targetIds = new Set();
  updateStrip();
  updateHint();
  updateHUD();
  Sound.play('win');
  haptic([10, 40, 10]);
  const idx = G.stageIndex;
  setTimeout(() => {
    if (idx === STAGES.length - 1) victory();
    else stageClearSheet(idx);
  }, 700);
}

function stageClearSheet(idx) {
  const unlockedHex = idx === 0;
  let chosen = null;

  const cards = UPGRADES.map(
    (u) => `
      <button class="upgrade" data-up="${u.id}">
        <span class="up-icon">${u.icon}</span>
        <span><strong>${u.name}</strong><small>${u.desc}</small></span>
      </button>`
  ).join('');

  openOverlay(`
    <div class="sheet">
      <p class="kicker">STAGE ${idx + 1} CLEARED</p>
      <h2>Victory</h2>
      <div class="stats">
        <div><strong>${G.turn}</strong><span>Turns</span></div>
        <div><strong>${G.stats.fallen}</strong><span>Fallen</span></div>
        <div><strong>${heroesAlive().length}</strong><span>Standing</span></div>
      </div>
      ${unlockedHex ? '<div class="notice">\u2726 The Hexblade joins your company.</div>' : ''}
      <p class="upgrade-label">Choose a blessing</p>
      ${cards}
      <div class="sheet-actions">
        <button class="btn primary" id="btn-march" disabled>March On</button>
      </div>
    </div>
  `);

  const march = $('#btn-march');
  overlay.querySelectorAll('[data-up]').forEach((btn) => {
    btn.addEventListener('click', () => {
      chosen = btn.dataset.up;
      overlay.querySelectorAll('[data-up]').forEach((b) => b.classList.toggle('selected', b === btn));
      march.disabled = false;
      Sound.play('tap');
      haptic(6);
    });
  });

  march.addEventListener('click', () => {
    if (!chosen) return;
    G.upgrades[chosen]++;
    G.stageIndex = idx + 1;
    closeOverlay();
    startStage(idx + 1);
  });
}

function victory() {
  clearProgress();
  Sound.play('win');
  haptic([12, 60, 12, 60, 12]);
  openOverlay(`
    <div class="sheet">
      <p class="kicker">THE CHRONICLE ENDS</p>
      <h2>The Crown Is Yours</h2>
      <p>The Hollow King is dust. The throne is quiet at last. Your company has earned a name worth remembering.</p>
      <div class="stats">
        <div><strong>${STAGES.length}</strong><span>Stages</span></div>
        <div><strong>${G.runTurns}</strong><span>Turns</span></div>
      </div>
      <div class="sheet-actions">
        <button class="btn primary" id="btn-again">New Run</button>
        <button class="btn ghost" id="btn-home">Title Screen</button>
      </div>
    </div>
  `);
  $('#btn-again').addEventListener('click', () => {
    closeOverlay();
    startNewRun();
  });
  $('#btn-home').addEventListener('click', () => {
    closeOverlay();
    goHome();
  });
}

function defeat() {
  G.token++;
  G.phase = 'over';
  G.busy = true;
  G.selectedId = null;
  G.moveSet = new Map();
  G.targetIds = new Set();
  updateStrip();
  updateHint();
  updateHUD();
  Sound.play('lose');
  haptic([20, 60, 20]);

  openOverlay(`
    <div class="sheet">
      <p class="kicker">STAGE ${G.stageIndex + 1}</p>
      <h2>The Company Falls</h2>
      <p>Your heroes have fallen to the dark. The stage can be attempted again \u2014 the dead are patient, but not clever.</p>
      <div class="sheet-actions">
        <button class="btn primary" id="btn-retry">Retry Stage</button>
        <button class="btn ghost" id="btn-abandon">Abandon Run</button>
      </div>
    </div>
  `);

  $('#btn-retry').addEventListener('click', () => {
    closeOverlay();
    startStage(G.stageIndex);
  });
  $('#btn-abandon').addEventListener('click', askAbandon);
}

/* ============================================================
   OVERLAYS
   ============================================================ */

function openOverlay(html) {
  if (!overlay) return;
  overlay.innerHTML = html;
  overlay.classList.remove('hidden');
}

function closeOverlay() {
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}

function askNewRun() {
  if (!loadProgress()) {
    startNewRun();
    return;
  }
  openOverlay(`
    <div class="sheet">
      <p class="kicker">NEW RUN</p>
      <h2>Begin Again?</h2>
      <p>Your current chronicle will be overwritten.</p>
      <div class="sheet-actions row">
        <button class="btn ghost" id="btn-keep">Keep</button>
        <button class="btn primary" id="btn-begin">Begin</button>
      </div>
    </div>
  `);
  $('#btn-keep').addEventListener('click', closeOverlay);
  $('#btn-begin').addEventListener('click', () => {
    closeOverlay();
    startNewRun();
  });
}

function openHowTo() {
  openOverlay(`
    <div class="sheet">
      <p class="kicker">HOW TO PLAY</p>
      <h2>Three Simple Rules</h2>
      <ul class="rules">
        <li><span class="rule-num">1</span><span>Tap a hero card, then a <strong>teal tile</strong> to move. Each hero moves once per turn.</span></li>
        <li><span class="rule-num">2</span><span>Tap a foe ringed in <strong>red</strong> to attack. Each hero attacks once per turn.</span></li>
        <li><span class="rule-num">3</span><span>Press <strong>End Turn</strong> when you are done. Then the dead take their turn.</span></li>
      </ul>
      <p>Rangers can strike from two tiles away. The Warden is tough. The Hexblade hits hardest.</p>
      <div class="sheet-actions">
        <button class="btn primary" id="btn-gotit">Got It</button>
      </div>
    </div>
  `);
  $('#btn-gotit').addEventListener('click', closeOverlay);
}

function openPause() {
  if (G.screen !== 'battle') return;
  openOverlay(`
    <div class="sheet">
      <p class="kicker">PAUSED</p>
      <h2>Field Report</h2>
      <p>Stage ${G.stageIndex + 1} of ${STAGES.length} \u00B7 Turn ${G.turn}. Progress is saved at the start of each stage.</p>
      <div class="sheet-actions">
        <button class="btn primary" id="btn-resume">Resume</button>
        <button class="btn" id="btn-restart">Restart Stage</button>
        <button class="btn ghost" id="btn-abandon">Abandon Run</button>
      </div>
    </div>
  `);
  $('#btn-resume').addEventListener('click', closeOverlay);
  $('#btn-restart').addEventListener('click', () => {
    closeOverlay();
    startStage(G.stageIndex);
  });
  $('#btn-abandon').addEventListener('click', askAbandon);
}

function askAbandon() {
  openOverlay(`
    <div class="sheet">
      <p class="kicker">ABANDON RUN</p>
      <h2>Leave the Field?</h2>
      <p>Your saved stage progress will be lost.</p>
      <div class="sheet-actions row">
        <button class="btn ghost" id="btn-stay">Stay</button>
        <button class="btn primary" id="btn-leave">Leave</button>
      </div>
    </div>
  `);
  $('#btn-stay').addEventListener('click', closeOverlay);
  $('#btn-leave').addEventListener('click', () => {
    clearProgress();
    goHome();
  });
}

/* ============================================================
   UI UPDATES
   ============================================================ */

function updateHUD() {
  const stage = STAGES[G.stageIndex];
  if (!stage) return;
  $('#hud-stage').textContent = `STAGE ${G.stageIndex + 1} / ${STAGES.length}`;
  $('#hud-name').textContent = stage.name;
  $('#hud-turn').textContent = `Turn ${G.turn}`;
  const left = enemiesAlive().length;
  if (G.phase === 'enemy') {
    $('#hud-objective').textContent = 'The dead are moving\u2026';
  } else if (G.phase === 'over') {
    $('#hud-objective').textContent = left ? 'The field is lost' : 'Field cleared';
  } else {
    $('#hud-objective').textContent = `${left} ${left === 1 ? 'foe' : 'foes'} remain`;
  }
}

function updateStrip() {
  if (!unitStrip) return;
  const heroes = G.units.filter((u) => u.side === 'hero');
  unitStrip.innerHTML = heroes
    .map((h) => {
      const ratio = h.maxHp > 0 ? h.hp / h.maxHp : 0;
      const hpClass = ratio <= 0.34 ? 'low' : ratio <= 0.66 ? 'mid' : '';
      const state = !h.alive
        ? 'Fallen'
        : h.spent
          ? 'Done'
          : h.attacked
            ? 'Struck'
            : h.moved
              ? 'Moved'
              : 'Ready';
      const cls = !h.alive ? 'fallen' : h.spent ? 'spent' : G.selectedId === h.id ? 'selected' : '';
      return `
        <button class="hero-card ${cls}" data-hero="${h.id}" ${h.alive ? '' : 'disabled'}>
          <span class="hc-top">
            <span class="hc-name">${h.name}</span>
            <span class="hc-hpnum">${h.hp}/${h.maxHp}</span>
          </span>
          <span class="hc-bar"><i class="${hpClass}" style="width:${Math.max(0, ratio * 100)}%"></i></span>
          <span class="hc-state">${state}</span>
        </button>`;
    })
    .join('');

  const hero = selectedHero();
  doneBtn.disabled = !hero || G.phase !== 'player' || G.busy;
}

function updateHint() {
  if (!hintEl) return;
  let text = 'Tap a hero';

  if (G.phase === 'enemy') text = 'The dead take their turn\u2026';
  else if (G.phase === 'over') text = 'The field is still';
  else if (G.busy) text = '\u2026';
  else {
    const hero = selectedHero();
    if (hero) {
      const canMove = !hero.moved && !hero.attacked && G.moveSet.size > 0;
      const canHit = G.targetIds.size > 0;
      if (canMove && canHit) text = 'Move to a teal tile, or strike a marked foe';
      else if (canMove) text = 'Tap a teal tile to move';
      else if (canHit) text = 'Tap a marked foe to attack';
      else text = 'Tap Done to end this hero';
    } else if (!firstReadyHero()) {
      text = 'All heroes acted \u2014 End Turn';
    }
  }
  hintEl.textContent = text;
}

function banner(text) {
  if (!bannerEl) return;
  bannerEl.textContent = text;
  bannerEl.classList.add('show');
  clearTimeout(G.bannerTimer);
  G.bannerTimer = setTimeout(() => bannerEl.classList.remove('show'), 900);
}

function toast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(G.toastTimer);
  G.toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1700);
}

/* ============================================================
   INPUT
   ============================================================ */

function pointToCell(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * BOARD;
  const y = ((event.clientY - rect.top) / rect.height) * BOARD;
  return { x: Math.floor(x), y: Math.floor(y) };
}

function onBoardTap(event) {
  if (G.screen !== 'battle' || G.phase !== 'player' || G.busy) return;
  if (!overlay.classList.contains('hidden')) return;

  const cell = pointToCell(event);
  if (!inBounds(cell.x, cell.y)) return;

  const unit = unitAt(cell.x, cell.y);
  const hero = selectedHero();

  if (unit && unit.side === 'hero') {
    if (unit.id === G.selectedId) {
      toast(`${unit.name} \u00B7 ${unit.hp}/${unit.maxHp} HP \u00B7 ATK ${unit.atk} \u00B7 MOVE ${unit.move}`);
    } else {
      selectHero(unit.id);
    }
    return;
  }

  if (!hero) {
    if (unit && unit.side === 'enemy') {
      toast(`${unit.name} \u00B7 ${unit.hp}/${unit.maxHp} HP \u00B7 ATK ${unit.atk}`);
    }
    return;
  }

  if (unit && unit.side === 'enemy') {
    if (G.targetIds.has(unit.id)) attack(hero, unit);
    else toast(`${unit.name} is out of range`);
    return;
  }

  if (G.moveSet.has(keyOf(cell.x, cell.y))) {
    moveHero(hero, cell.x, cell.y);
    return;
  }

  if (cell.x === hero.x && cell.y === hero.y) {
    toast(`${hero.name} \u00B7 ${hero.hp}/${hero.maxHp} HP \u00B7 ATK ${hero.atk} \u00B7 MOVE ${hero.move}`);
    return;
  }

  toast('Too far');
}

/* ============================================================
   RENDER
   ============================================================ */

function resizeBoard() {
  if (!canvas || !boardWrap) return;
  const rect = boardWrap.getBoundingClientRect();
  const avail = Math.floor(Math.min(rect.width, rect.height));
  if (avail < 80) return;

  const size = Math.min(avail, 560);
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);

  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);

  view.size = size;
  view.cell = size / BOARD;
  view.dpr = dpr;
}

function addFloater(x, y, text, color, scale = 1) {
  G.floaters.push({
    x: x + 0.5,
    y: y + 0.32,
    text,
    color,
    t: 0,
    life: 1.05,
    scale,
  });
}

function updateFrame(dt, now) {
  const ease = Math.min(1, dt * 16);
  for (const u of G.units) {
    u.rx += (u.x - u.rx) * ease;
    u.ry += (u.y - u.ry) * ease;
    if (u.flash > 0) u.flash = Math.max(0, u.flash - dt * 5.5);
    if (!u.alive && u.deathT > 0) u.deathT = Math.max(0, u.deathT - dt);
  }
  for (const f of G.floaters) {
    f.t += dt;
    f.y -= dt * 0.55;
  }
  G.floaters = G.floaters.filter((f) => f.t < f.life);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 26);
  drawFrame(now);
}

function drawFrame(now) {
  const ctx = view.ctx;
  if (!ctx || G.screen !== 'battle' || !view.size) return;

  const size = view.size;
  const cell = view.cell;

  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#0e0c15');
  bg.addColorStop(0.55, '#0a0910');
  bg.addColorStop(1, '#07060a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size / 2, size * 0.38, 0, size / 2, size * 0.38, size * 0.75);
  glow.addColorStop(0, 'rgba(216,181,108,0.055)');
  glow.addColorStop(1, 'rgba(216,181,108,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  if (G.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
  }

  drawTiles(ctx, cell, now);
  drawUnits(ctx, cell, now);
  drawFloaters(ctx, cell);

  ctx.restore();

  // thin inner frame
  ctx.strokeStyle = 'rgba(216,181,108,0.16)';
  ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, size - 1, size - 1, 14);
  ctx.stroke();
}

function drawTiles(ctx, cell, now) {
  const pad = Math.max(1.5, cell * 0.035);
  const selected = selectedHero();

  for (let y = 0; y < BOARD; y++) {
    for (let x = 0; x < BOARD; x++) {
      const px = x * cell + pad;
      const py = y * cell + pad;
      const s = cell - pad * 2;
      const k = keyOf(x, y);

      ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(255,255,255,0.022)' : 'rgba(255,255,255,0.012)';
      roundRect(ctx, px, py, s, s, Math.max(3, cell * 0.07));
      ctx.fill();

      if (G.moveSet.has(k)) {
        const pulse = 0.16 + Math.sin(now * 3 + x + y) * 0.03;
        ctx.fillStyle = `rgba(127,196,182,${pulse})`;
        roundRect(ctx, px, py, s, s, Math.max(3, cell * 0.07));
        ctx.fill();
        ctx.strokeStyle = 'rgba(127,196,182,0.38)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(127,196,182,0.6)';
        ctx.beginPath();
        ctx.arc(px + s / 2, py + s / 2, Math.max(1.6, cell * 0.035), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(216,181,108,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (selected && selected.x === x && selected.y === y) {
        ctx.strokeStyle = 'rgba(216,181,108,0.85)';
        ctx.lineWidth = 2;
        roundRect(ctx, px + 1, py + 1, s - 2, s - 2, Math.max(3, cell * 0.07));
        ctx.stroke();
      }
    }
  }
}

function drawUnits(ctx, cell, now) {
  const sorted = [...G.units].sort((a, b) => a.ry - b.ry);
  for (const u of sorted) {
    if (!u.alive && u.deathT <= 0) continue;
    drawUnit(ctx, u, cell, now);
  }
}

function drawUnit(ctx, u, cell, now) {
  const cx = (u.rx + 0.5) * cell;
  const bob = u.alive ? Math.sin(now * 2 + u.bob) * cell * 0.018 : 0;
  const cy = (u.ry + 0.5) * cell + bob;
  const radius = cell * (u.icon === 'crown' ? 0.4 : 0.355);
  const dying = !u.alive;
  const alpha = dying ? Math.max(0, u.deathT / 0.6) : 1;
  const scale = dying ? 0.72 + 0.28 * (u.deathT / 0.6) : 1;
  const isSelected = u.side === 'hero' && u.id === G.selectedId && u.alive;
  const isTarget = u.side === 'enemy' && G.targetIds.has(u.id);
  const isActive = u.side === 'enemy' && u.id === G.activeEnemyId;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.78, radius * 0.8, radius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // selection / target rings
  if (isSelected) {
    ctx.strokeStyle = '#d8b56c';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(216,181,108,0.85)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  if (isTarget) {
    const pulse = 0.55 + Math.sin(now * 6) * 0.35;
    ctx.strokeStyle = `rgba(208,107,98,${pulse})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (isActive) {
    ctx.strokeStyle = 'rgba(208,107,98,0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // token body
  const body = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.1, 0, 0, radius * 1.1);
  body.addColorStop(0, shade(u.color, 0.32));
  body.addColorStop(0.55, shade(u.color, 0.12));
  body.addColorStop(1, 'rgba(8,7,11,0.96)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = u.alive ? u.color : 'rgba(120,110,130,0.5)';
  ctx.lineWidth = Math.max(1.4, cell * 0.035);
  ctx.stroke();

  // spent heroes are dimmed
  if (u.side === 'hero' && u.spent && u.alive) {
    ctx.fillStyle = 'rgba(5,4,8,0.42)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawIcon(ctx, u.icon, radius, u.color, u.alive);

  // hit flash
  if (u.flash > 0) {
    ctx.globalAlpha = alpha * u.flash * 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
  }

  // health bar
  if (u.alive) {
    const bw = radius * 1.55;
    const bh = Math.max(3, cell * 0.055);
    const bx = -bw / 2;
    const by = radius + Math.max(4, cell * 0.06);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    roundRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fill();

    const ratio = Math.max(0, u.hp / u.maxHp);
    let fill = '#7fc4b6';
    if (u.side === 'enemy') fill = '#d06b62';
    else if (ratio <= 0.34) fill = '#d06b62';
    else if (ratio <= 0.66) fill = '#d8b56c';
    ctx.fillStyle = fill;
    roundRect(ctx, bx, by, Math.max(bh, bw * ratio), bh, bh / 2);
    ctx.fill();
  }

  ctx.restore();

  // damage preview badge for attackable foes
  if (isTarget && u.alive) {
    const hero = selectedHero();
    if (hero) {
      const text = `-${hero.atk}`;
      const font = Math.max(9, cell * 0.17);
      ctx.save();
      ctx.font = `700 ${font}px ui-sans-serif, system-ui, sans-serif`;
      const w = ctx.measureText(text).width + cell * 0.12;
      const h = font + cell * 0.08;
      const bx = cx + radius * 0.55;
      const by = cy - radius - h * 0.7;
      ctx.fillStyle = 'rgba(58,18,18,0.95)';
      ctx.strokeStyle = 'rgba(208,107,98,0.8)';
      ctx.lineWidth = 1;
      roundRect(ctx, bx, by, w, h, h / 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd0c9';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + w / 2, by + h / 2 + 0.5);
      ctx.restore();
    }
  }
}

function drawFloaters(ctx, cell) {
  for (const f of G.floaters) {
    const progress = f.t / f.life;
    const alpha = Math.max(0, 1 - progress * progress);
    const font = Math.max(11, cell * 0.26 * f.scale);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `700 ${font}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, font * 0.16);
    ctx.strokeStyle = 'rgba(5,4,8,0.9)';
    ctx.strokeText(f.text, f.x * cell, f.y * cell);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x * cell, f.y * cell);
    ctx.restore();
  }
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * amount));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * amount));
  const b = Math.min(255, Math.round((n & 255) * amount));
  return `rgb(${r},${g},${b})`;
}

/* ============================================================
   ICONS (drawn, so no image assets are needed)
   ============================================================ */

function drawIcon(ctx, icon, r, color, alive) {
  ctx.save();
  ctx.strokeStyle = alive ? color : 'rgba(140,130,150,0.7)';
  ctx.fillStyle = alive ? color : 'rgba(140,130,150,0.7)';
  ctx.lineWidth = Math.max(1.4, r * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = r * 0.55;

  switch (icon) {
    case 'shield': {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.82, -s * 0.62);
      ctx.lineTo(s * 0.72, s * 0.2);
      ctx.quadraticCurveTo(0, s * 1.05, -s * 0.72, s * 0.2);
      ctx.lineTo(-s * 0.82, -s * 0.62);
      ctx.closePath();
      ctx.globalAlpha = 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.45);
      ctx.lineTo(0, s * 0.55);
      ctx.moveTo(-s * 0.4, -s * 0.02);
      ctx.lineTo(s * 0.4, -s * 0.02);
      ctx.stroke();
      break;
    }
    case 'bow': {
      ctx.beginPath();
      ctx.arc(-s * 0.15, 0, s * 0.95, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      const ex = -s * 0.15 + Math.cos(Math.PI * 0.42) * s * 0.95;
      const ey = Math.sin(Math.PI * 0.42) * s * 0.95;
      ctx.beginPath();
      ctx.moveTo(ex, -ey);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex - s * 0.55, 0);
      ctx.lineTo(ex + s * 0.55, 0);
      ctx.moveTo(ex + s * 0.55, 0);
      ctx.lineTo(ex + s * 0.25, -s * 0.2);
      ctx.moveTo(ex + s * 0.55, 0);
      ctx.lineTo(ex + s * 0.25, s * 0.2);
      ctx.stroke();
      break;
    }
    case 'hex': {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.78, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.78, 0);
      ctx.closePath();
      ctx.globalAlpha = 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, s * 0.4);
      ctx.lineTo(s * 0.4, -s * 0.4);
      ctx.stroke();
      break;
    }
    case 'claw': {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.42 - s * 0.18, -s * 0.85);
        ctx.quadraticCurveTo(i * s * 0.42 + s * 0.28, 0, i * s * 0.42 - s * 0.12, s * 0.85);
        ctx.stroke();
      }
      break;
    }
    case 'hood': {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.95, -s * 0.35, s * 0.72, s * 0.9);
      ctx.lineTo(-s * 0.72, s * 0.9);
      ctx.quadraticCurveTo(-s * 0.95, -s * 0.35, 0, -s);
      ctx.globalAlpha = 0.16;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.fillStyle = alive ? color : 'rgba(140,130,150,0.7)';
      ctx.beginPath();
      ctx.arc(-s * 0.28, s * 0.05, s * 0.11, 0, Math.PI * 2);
      ctx.arc(s * 0.28, s * 0.05, s * 0.11, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'skull': {
      ctx.beginPath();
      ctx.arc(0, -s * 0.18, s * 0.68, Math.PI * 0.9, Math.PI * 2.1);
      ctx.lineTo(s * 0.48, s * 0.5);
      ctx.lineTo(-s * 0.48, s * 0.5);
      ctx.closePath();
      ctx.globalAlpha = 0.14;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.fillStyle = '#0a0910';
      ctx.beginPath();
      ctx.arc(-s * 0.26, -s * 0.16, s * 0.17, 0, Math.PI * 2);
      ctx.arc(s * 0.26, -s * 0.16, s * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.22, s * 0.5);
      ctx.lineTo(-s * 0.22, s * 0.78);
      ctx.moveTo(0, s * 0.5);
      ctx.lineTo(0, s * 0.82);
      ctx.moveTo(s * 0.22, s * 0.5);
      ctx.lineTo(s * 0.22, s * 0.78);
      ctx.stroke();
      break;
    }
    case 'crown': {
      ctx.beginPath();
      ctx.moveTo(-s * 0.92, -s * 0.3);
      ctx.lineTo(-s * 0.6, s * 0.5);
      ctx.lineTo(s * 0.6, s * 0.5);
      ctx.lineTo(s * 0.92, -s * 0.3);
      ctx.lineTo(s * 0.4, s * 0.05);
      ctx.lineTo(0, -s * 0.62);
      ctx.lineTo(-s * 0.4, s * 0.05);
      ctx.closePath();
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.62, s * 0.72);
      ctx.lineTo(s * 0.62, s * 0.72);
      ctx.stroke();
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
  }
  ctx.restore();
}

/* ============================================================
   BOOT
   ============================================================ */

function loop(ts) {
  const dt = view.last ? Math.min(0.05, (ts - view.last) / 1000) : 0.016;
  view.last = ts;
  updateFrame(dt, ts / 1000);
  requestAnimationFrame(loop);
}

function bind() {
  $('#btn-new')?.addEventListener('click', () => {
    Sound.play('tap');
    askNewRun();
  });
  continueBtn?.addEventListener('click', () => {
    Sound.play('tap');
    continueRun();
  });
  $('#btn-how')?.addEventListener('click', () => {
    Sound.play('tap');
    openHowTo();
  });
  $('#btn-menu')?.addEventListener('click', () => {
    Sound.play('tap');
    openPause();
  });
  soundBtn?.addEventListener('click', () => {
    Sound.muted = !Sound.muted;
    try {
      localStorage.setItem(MUTE_KEY, Sound.muted ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!Sound.muted) {
      Sound.unlock();
      Sound.play('tap');
    }
    updateSoundBtn();
  });
  doneBtn?.addEventListener('click', () => {
    const hero = selectedHero();
    if (!hero || G.phase !== 'player' || G.busy) return;
    Sound.play('tap');
    finishHero(hero);
  });
  endBtn?.addEventListener('click', () => {
    Sound.play('tap');
    endPlayerTurn();
  });

  unitStrip?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-hero]');
    if (!card) return;
    selectHero(card.dataset.hero);
  });

  canvas?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    onBoardTap(event);
  });

  window.addEventListener(
    'pointerdown',
    () => {
      Sound.unlock();
    },
    { once: true }
  );

  window.addEventListener('resize', () => {
    if (G.screen !== 'battle') return;
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resizeBoard);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(resizeBoard, 120);
  });

  if (window.ResizeObserver && boardWrap) {
    new ResizeObserver(() => {
      if (G.screen === 'battle') {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(resizeBoard);
      }
    }).observe(boardWrap);
  }

  window.addEventListener('keydown', (event) => {
    if (G.screen !== 'battle') return;
    if (!overlay.classList.contains('hidden')) return;
    if (event.key === 'Escape') {
      openPause();
      return;
    }
    if (G.phase !== 'player' || G.busy) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      endPlayerTurn();
    } else if (event.key === 'd' || event.key === 'D') {
      const hero = selectedHero();
      if (hero) finishHero(hero);
    } else if (event.key === '1' || event.key === '2' || event.key === '3') {
      const heroes = G.units.filter((u) => u.side === 'hero');
      const hero = heroes[Number(event.key) - 1];
      if (hero) selectHero(hero.id);
    }
  });
}

function boot() {
  updateSoundBtn();
  updateHome();
  bind();
  resizeBoard();
  requestAnimationFrame(loop);

  if (
    'serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  if (new URLSearchParams(location.search).has('debug')) {
    window.__hc = {
      G,
      startStage,
      endPlayerTurn,
      stageWon,
      damageUnit,
      refreshSelection,
      updateStrip,
      updateHUD,
      updateHint,
      resizeBoard,
      enemiesAlive,
      heroesAlive,
    };
  }
}

boot();
