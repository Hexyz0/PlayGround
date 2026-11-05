/* ============================================================
   THE HOLLOW CROWN — state, progression and save data
   ============================================================ */
import {
  JOBS, ROSTER, ITEM_MAP, getArt, getItem, EQUIPMENT,
  BASE_JOBS, ADVANCED_JOBS, PROMOTIONS,
} from './data.js';
import { ENCOUNTERS, recommendedLevel } from './chapters.js';

export const SAVE_KEY = 'hollow-crown-save-v1';
export const MAX_DEPLOY = 5;

const clone = (v) => JSON.parse(JSON.stringify(v));

export function newGame() {
  const roster = ROSTER.slice(0, 4).map((r, i) => makeUnit(r, i < 4));
  const state = {
    version: 1,
    gold: 260,
    inventory: {},
    roster,
    encounterIndex: 0,
    completed: false,
    stats: { battles: 0, victories: 0, kills: 0, goldEarned: 0, turns: 0 },
    seenIntros: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  addItem(state, 'potion', 3);
  addItem(state, 'antidote', 1);
  addItem(state, 'ether', 1);
  addItem(state, 'hiPotion', 1);
  addItem(state, 'phoenixDown', 1);
  addItem(state, 'ironRing', 1);
  for (const u of roster) for (const id of Object.values(u.equipment)) if (id) addItem(state, id, 1);
  return state;
}

function makeUnit(tpl, deployed) {
  const unit = {
    id: tpl.id,
    name: tpl.name,
    title: tpl.title,
    job: tpl.job,
    level: tpl.level,
    exp: 0,
    jp: 30,
    base: clone(tpl.base),
    equipment: clone(tpl.equipment),
    arts: clone(tpl.arts),
    bio: tpl.bio,
    deployed: !!deployed,
    promoted: false,
    advancedJob: null,
    unlockedJobs: [],
  };
  return unit;
}

/* ------------------------------------------------------------
   Derived stats
   ------------------------------------------------------------ */
export function jobOf(unit) { return JOBS[unit.job] || JOBS.squire; }

export function weaponOf(unit) {
  const item = unit.equipment?.weapon ? ITEM_MAP[unit.equipment.weapon] : null;
  if (item && item.slot === 'weapon') return item;
  return { id: 'fists', name: 'Fists', atk: 2, mag: 0, range: 1, type: 'fist', glyph: '·' };
}

export function deriveStats(unit) {
  const job = jobOf(unit);
  const s = {
    maxHp: unit.base.hp + job.bonus.hp,
    maxMp: unit.base.mp + job.bonus.mp,
    pa: unit.base.pa + job.bonus.pa,
    ma: unit.base.ma + job.bonus.ma,
    def: unit.base.def + job.bonus.def,
    res: unit.base.res + job.bonus.res,
    spd: unit.base.spd + job.bonus.spd,
    luck: unit.base.luck + (job.bonus.luck || 0),
    move: job.move,
    jump: job.jump,
  };
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const id = unit.equipment?.[slot];
    if (!id) continue;
    const it = ITEM_MAP[id];
    if (!it) continue;
    for (const k of ['hp', 'mp', 'pa', 'ma', 'def', 'res', 'spd', 'move', 'luck']) {
      if (!it[k]) continue;
      if (k === 'hp') s.maxHp += it.hp;
      else if (k === 'mp') s.maxMp += it.mp;
      else s[k] += it[k];
    }
  }
  const w = weaponOf(unit);
  s.weapon = w;
  s.maxHp = Math.max(1, Math.round(s.maxHp));
  s.maxMp = Math.max(0, Math.round(s.maxMp));
  s.pa = Math.max(1, Math.round(s.pa));
  s.ma = Math.max(0, Math.round(s.ma));
  s.def = Math.max(0, Math.round(s.def));
  s.res = Math.max(0, Math.round(s.res));
  s.spd = Math.max(1, Math.round(s.spd));
  s.move = Math.max(1, Math.round(s.move));
  s.jump = Math.max(1, Math.round(s.jump));
  return s;
}

export function maxHp(unit) { return deriveStats(unit).maxHp; }
export function maxMp(unit) { return deriveStats(unit).maxMp; }

export function learnedArts(unit) {
  const ids = unit.arts?.[unit.job] || [];
  return ids.map(getArt).filter(Boolean);
}

export function jobRank(unit, jobId = unit.job) {
  return (unit.arts?.[jobId] || []).length;
}

export function canLearn(unit, art) {
  if (!art || art.jp <= 0) return { ok: false, reason: 'Unlearnable' };
  if ((unit.arts?.[art.job] || []).includes(art.id)) return { ok: false, reason: 'Known' };
  if (jobRank(unit, art.job) < (art.req || 0)) return { ok: false, reason: `Requires rank ${(art.req || 0) + 1}` };
  if (unit.jp < art.jp) return { ok: false, reason: 'Not enough JP' };
  return { ok: true };
}

export function learnArt(unit, artId) {
  const art = getArt(artId);
  if (!art) return { ok: false, reason: 'No such Art' };
  const check = canLearn(unit, art);
  if (!check.ok) return check;
  unit.arts[art.job] = unit.arts[art.job] || [];
  unit.arts[art.job].push(artId);
  unit.jp -= art.jp;
  return { ok: true, art };
}

export function changeJob(unit, jobId, force = false) {
  const job = JOBS[jobId];
  if (!job) return { ok: false, reason: 'No such job' };
  if (job.tier && !force && !(unit.unlockedJobs || []).includes(jobId)) {
    return { ok: false, reason: 'Promotion required' };
  }
  unit.job = jobId;
  unit.arts[jobId] = unit.arts[jobId] || [];
  const free = job.arts.filter(a => (a.req || 0) === 0);
  for (const a of free) if (!unit.arts[jobId].includes(a.id)) unit.arts[jobId].push(a.id);
  return { ok: true, job };
}

export function jobOptions(unit) {
  const unlocked = unit.unlockedJobs || [];
  return [...BASE_JOBS, ...ADVANCED_JOBS.filter(j => unlocked.includes(j.id))];
}

export function promotionTarget(unit) {
  const job = jobOf(unit);
  if (job.tier) return null;
  return PROMOTIONS[job.id] ? JOBS[PROMOTIONS[job.id]] : null;
}

export function canPromote(state, unit) {
  const target = promotionTarget(unit);
  if (!target) return { ok: false, reason: unit.promoted ? 'Already promoted' : 'No promotion path' };
  if (unit.promoted) return { ok: false, reason: 'Already promoted' };
  if (unit.level < 10) return { ok: false, reason: 'Requires Lv 10' };
  if (owned(state, 'crownSeal') < 1) return { ok: false, reason: 'Requires a Crown Seal' };
  return { ok: true, target };
}

export function promoteUnit(state, unit) {
  const check = canPromote(state, unit);
  if (!check.ok) return check;
  const target = check.target;
  const baseJobId = unit.job;
  state.inventory.crownSeal = Math.max(0, (state.inventory.crownSeal || 0) - 1);
  unit.promoted = true;
  unit.advancedJob = target.id;
  unit.unlockedJobs = Array.from(new Set([...(unit.unlockedJobs || []), target.id]));
  // Carry every learned Art from the base class into the advanced class.
  const carried = unit.arts[baseJobId] || [];
  unit.arts[target.id] = Array.from(new Set([...carried, ...target.arts.filter(a => (a.req || 0) === 0).map(a => a.id)]));
  changeJob(unit, target.id, true);
  return { ok: true, job: target };
}

export function jobAllowedWeapon(unit, item) {
  if (!item || item.slot !== 'weapon') return false;
  return jobOf(unit).weapons.includes(item.type);
}

/* ------------------------------------------------------------
   Inventory & equipment
   ------------------------------------------------------------ */
export function owned(state, id) { return state.inventory?.[id] || 0; }

export function addItem(state, id, qty = 1) {
  if (!id) return;
  state.inventory = state.inventory || {};
  state.inventory[id] = (state.inventory[id] || 0) + qty;
}

export function equippedElsewhere(state, unitId, slot, itemId) {
  return state.roster.filter(u => u.id !== unitId && u.equipment?.[slot] === itemId).length;
}

export function canEquipItem(state, unit, slot, itemId) {
  const item = ITEM_MAP[itemId];
  if (!item) return { ok: false, reason: 'Unknown item' };
  if (item.slot !== slot) return { ok: false, reason: 'Wrong slot' };
  if (slot === 'weapon' && !jobAllowedWeapon(unit, item)) return { ok: false, reason: `${jobOf(unit).name}s cannot wield ${item.type}s` };
  const already = unit.equipment?.[slot] === itemId ? 1 : 0;
  if (owned(state, itemId) < equippedElsewhere(state, unit.id, slot, itemId) + 1 - already) {
    return { ok: false, reason: 'Every copy is already equipped' };
  }
  return { ok: true };
}

export function equipItem(state, unit, slot, itemId) {
  if (!itemId) { unit.equipment[slot] = null; return { ok: true }; }
  const check = canEquipItem(state, unit, slot, itemId);
  if (!check.ok) return check;
  unit.equipment[slot] = itemId;
  return { ok: true };
}

export function buyItem(state, itemId, qty = 1) {
  const item = ITEM_MAP[itemId];
  if (!item) return { ok: false, reason: 'Unknown item' };
  const cost = item.cost * qty;
  if (state.gold < cost) return { ok: false, reason: 'Not enough gold' };
  state.gold -= cost;
  addItem(state, itemId, qty);
  return { ok: true, item, cost };
}

export function gearForShop(state) {
  return EQUIPMENT.filter(i => owned(state, i.id) > 0);
}

/* ------------------------------------------------------------
   Progression
   ------------------------------------------------------------ */
export function expNeeded(level) { return 42 + level * 19; }

export function grantExp(unit, amount) {
  unit.exp += amount;
  let gained = 0;
  while (unit.level < 20 && unit.exp >= expNeeded(unit.level)) {
    unit.exp -= expNeeded(unit.level);
    unit.level += 1;
    gained += 1;
    unit.base.hp += 6;
    unit.base.mp += 3;
    unit.base.pa += 1;
    if (unit.level % 2 === 0) unit.base.def += 1;
    if (unit.level % 3 === 0) { unit.base.ma += 1; unit.base.res += 1; }
    if (unit.level % 4 === 0) unit.base.spd += 1;
  }
  if (unit.level >= 20) unit.exp = Math.min(unit.exp, expNeeded(20) - 1);
  return gained;
}

export function grantJp(unit, amount) { unit.jp += amount; }

export function recruitUnit(state, templateId) {
  if (state.roster.some(u => u.id === templateId)) return null;
  const tpl = ROSTER.find(r => r.id === templateId);
  if (!tpl) return null;
  const deployedCount = state.roster.filter(u => u.deployed).length;
  const unit = makeUnit(tpl, deployedCount < MAX_DEPLOY);
  state.roster.push(unit);
  for (const id of Object.values(unit.equipment)) if (id) addItem(state, id, 1);
  return unit;
}

export function toggleDeploy(state, unitId) {
  const unit = state.roster.find(u => u.id === unitId);
  if (!unit) return { ok: false };
  if (!unit.deployed && state.roster.filter(u => u.deployed).length >= MAX_DEPLOY) {
    return { ok: false, reason: `Only ${MAX_DEPLOY} may march` };
  }
  if (unit.deployed && state.roster.filter(u => u.deployed).length <= 1) {
    return { ok: false, reason: 'At least one must march' };
  }
  unit.deployed = !unit.deployed;
  return { ok: true, deployed: unit.deployed };
}

export function deployedUnits(state) {
  return state.roster.filter(u => u.deployed);
}

export function currentEncounter(state) {
  return ENCOUNTERS[state.encounterIndex] || null;
}

export function advanceEncounter(state) {
  state.encounterIndex += 1;
  if (state.encounterIndex >= ENCOUNTERS.length) state.completed = true;
}

/* ------------------------------------------------------------
   Save / load
   ------------------------------------------------------------ */
export function saveGame(state) {
  try {
    state.updatedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.roster)) return null;
    state.inventory = state.inventory || {};
    state.stats = state.stats || { battles: 0, victories: 0, kills: 0, goldEarned: 0, turns: 0 };
    state.seenIntros = state.seenIntros || [];
    state.encounterIndex = Math.min(state.encounterIndex || 0, ENCOUNTERS.length);
    for (const u of state.roster) {
      u.arts = u.arts || {};
      u.equipment = u.equipment || {};
      if (u.deployed === undefined) u.deployed = true;
      if (u.promoted === undefined) u.promoted = false;
      if (u.advancedJob === undefined) u.advancedJob = null;
      if (!Array.isArray(u.unlockedJobs)) u.unlockedJobs = [];
      if (JOBS[u.job]?.tier && !u.unlockedJobs.includes(u.job)) u.unlockedJobs.push(u.job);
    }
    if (state.completed === undefined) state.completed = state.encounterIndex >= ENCOUNTERS.length;
    return state;
  } catch { return null; }
}

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}
