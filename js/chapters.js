/* ============================================================
   THE HOLLOW CROWN — 20-chapter campaign
   Fire Emblem-style chapters: story, deployment, battle, loot.
   ============================================================ */
import { JOBS, ITEM_MAP, getArt } from './data.js';

export const LEVEL_CAP = 20;
export const MAX_CHAPTER = 20;

/* ------------------------------------------------------------
   MAP LIBRARY (12 x 10)
   . stone  , grass  ^ high ground  = bridge  ~ water  # ruin
   ------------------------------------------------------------ */
const MAPS = {
  gate: [
    '############',
    '#....,,...^#',
    '#..,.,,...^#',
    '#..,....#..#',
    '#....==....#',
    '#.^^.==....#',
    '#.^^.==.,..#',
    '#.....,,...#',
    '#..,....,..#',
    '############',
  ],
  chapel: [
    '############',
    '#~~~..^^...#',
    '#~~~..^^...#',
    '#....==....#',
    '#.~~.==.~~.#',
    '#.~~.==.~~.#',
    '#....==....#',
    '#..,....,..#',
    '#..,....,..#',
    '############',
  ],
  road: [
    '############',
    '#^^......^^#',
    '#^^......^^#',
    '#....##....#',
    '#....##....#',
    '#..,....,..#',
    '#..,....,..#',
    '#.^^....^^.#',
    '#.^^....^^.#',
    '############',
  ],
  keep: [
    '############',
    '#..........#',
    '#..##..##..#',
    '#..##..##..#',
    '#..........#',
    '#..##..##..#',
    '#..##..##..#',
    '#..........#',
    '#..........#',
    '############',
  ],
  court: [
    '############',
    '#..~~..~~..#',
    '#..~~..~~..#',
    '#..........#',
    '#.^^....^^.#',
    '#.^^....^^.#',
    '#..........#',
    '#..~~..~~..#',
    '#..~~..~~..#',
    '############',
  ],
  throne: [
    '############',
    '#..^^^^^^..#',
    '#..^^^^^^..#',
    '#..........#',
    '#..,....,..#',
    '#..,....,..#',
    '#..........#',
    '#..^^^^^^..#',
    '#..........#',
    '############',
  ],
  stair: [
    '############',
    '#..........#',
    '#..##..##..#',
    '#..........#',
    '#....##....#',
    '#....##....#',
    '#..........#',
    '#..##..##..#',
    '#..........#',
    '############',
  ],
  ossuary: [
    '############',
    '#..,....,..#',
    '#..,....,..#',
    '#.^^....^^.#',
    '#..........#',
    '#..........#',
    '#.^^....^^.#',
    '#..,....,..#',
    '#..,....,..#',
    '############',
  ],
  fen: [
    '############',
    '#~..,..,..~#',
    '#~.,....,.~#',
    '#..,......~#',
    '#.,..~~..,.#',
    '#.,..~~..,.#',
    '#..,......~#',
    '#~.,....,.~#',
    '#~..,..,..~#',
    '############',
  ],
  bridge: [
    '############',
    '#^^......^^#',
    '#^^......^^#',
    '#...xxxx...#',
    '#...xxxx...#',
    '#...====...#',
    '#...====...#',
    '#^^......^^#',
    '#^^......^^#',
    '############',
  ],
  monastery: [
    '############',
    '#..##..##..#',
    '#..........#',
    '#.^^....^^.#',
    '#..........#',
    '#..##..##..#',
    '#..........#',
    '#.^^....^^.#',
    '#..........#',
    '############',
  ],
  choir: [
    '############',
    '#..^^..^^..#',
    '#..^^..^^..#',
    '#..........#',
    '#..##..##..#',
    '#..##..##..#',
    '#..........#',
    '#..^^..^^..#',
    '#..^^..^^..#',
    '############',
  ],
  wastes: [
    '############',
    '#..#....#..#',
    '#..#....#..#',
    '#..........#',
    '#..^^..^^..#',
    '#..^^..^^..#',
    '#..........#',
    '#..#....#..#',
    '#..#....#..#',
    '############',
  ],
  desert: [
    '############',
    '#..,....,..#',
    '#..........#',
    '#..~~~~~~..#',
    '#..~~~~~~..#',
    '#..........#',
    '#..,....,..#',
    '#..........#',
    '#..,....,..#',
    '############',
  ],
  eclipse: [
    '############',
    '#^^..~~..^^#',
    '#^^..~~..^^#',
    '#..........#',
    '#..##..##..#',
    '#..##..##..#',
    '#..........#',
    '#^^..~~..^^#',
    '#^^..~~..^^#',
    '############',
  ],
  city: [
    '############',
    '#.##..##...#',
    '#.##..##...#',
    '#..........#',
    '#..##..##..#',
    '#..##..##..#',
    '#..........#',
    '#...##..##.#',
    '#...##..##.#',
    '############',
  ],
  bell: [
    '############',
    '#..^^^^^^..#',
    '#..^^^^^^..#',
    '#..........#',
    '#..##..##..#',
    '#..##..##..#',
    '#..........#',
    '#..^^^^^^..#',
    '#..^^^^^^..#',
    '############',
  ],
  abyss: [
    '############',
    '#..^^^^^^..#',
    '#..^^^^^^..#',
    '#..........#',
    '#.~~....~~.#',
    '#.~~....~~.#',
    '#..........#',
    '#..^^^^^^..#',
    '#..........#',
    '############',
  ],
};

const SPAWNS = {
  gate: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  chapel: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  road: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  keep: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  court: [[1, 8], [2, 8], [5, 8], [6, 8], [9, 8]],
  throne: [[3, 8], [4, 8], [5, 8], [6, 8], [4, 7]],
  stair: [[3, 8], [4, 8], [5, 8], [6, 8], [5, 7]],
  ossuary: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  fen: [[2, 8], [3, 8], [5, 8], [6, 8], [8, 8]],
  bridge: [[4, 8], [5, 8], [6, 8], [7, 8], [5, 7]],
  monastery: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  choir: [[2, 8], [5, 8], [6, 8], [9, 8], [5, 7]],
  wastes: [[2, 8], [4, 8], [5, 8], [6, 8], [7, 8]],
  desert: [[2, 8], [3, 8], [4, 8], [5, 8], [3, 7]],
  eclipse: [[2, 8], [3, 8], [4, 8], [7, 8], [8, 8]],
  city: [[1, 8], [2, 8], [3, 8], [6, 8], [7, 8]],
  bell: [[3, 8], [4, 8], [5, 8], [6, 8], [4, 7]],
  abyss: [[3, 8], [4, 8], [5, 8], [6, 8], [4, 7]],
};

/* ------------------------------------------------------------
   ENEMY ARCHETYPES & SCALING
   ------------------------------------------------------------ */
const ARCHETYPES = {
  soldier:   { job: 'squire',      hp: 32, pa: 10, ma: 2,  def: 3,  res: 1,  spd: 8,  hpG: 5.0, paG: 1.05, maG: .2,  defG: .6,  resG: .3,  spdG: .3 },
  knight:    { job: 'knight',      hp: 46, pa: 12, ma: 2,  def: 7,  res: 3,  spd: 6,  hpG: 6.0, paG: .95,  maG: .2,  defG: .95, resG: .4,  spdG: .2 },
  duelist:   { job: 'duelist',     hp: 34, pa: 12, ma: 2,  def: 3,  res: 2,  spd: 11, hpG: 4.5, paG: 1.12, maG: .2,  defG: .5,  resG: .35, spdG: .6 },
  archer:    { job: 'archer',      hp: 30, pa: 11, ma: 2,  def: 2,  res: 1,  spd: 10, hpG: 4.2, paG: 1.05, maG: .2,  defG: .4,  resG: .3,  spdG: .55 },
  blackmage: { job: 'blackmage',   hp: 26, pa: 4,  ma: 12, def: 2,  res: 5,  spd: 8,  hpG: 3.5, paG: .3,   maG: 1.15, defG: .35, resG: .55, spdG: .35 },
  whitemage: { job: 'whitemage',   hp: 28, pa: 4,  ma: 10, def: 3,  res: 6,  spd: 8,  hpG: 3.6, paG: .3,   maG: 1.0,  defG: .4,  resG: .65, spdG: .35 },
  inquisitor:{ job: 'inquisitor',  hp: 32, pa: 8,  ma: 11, def: 4,  res: 6,  spd: 9,  hpG: 4.2, paG: .7,   maG: .95,  defG: .5,  resG: .6,  spdG: .4 },
  thief:     { job: 'thief',       hp: 30, pa: 11, ma: 2,  def: 3,  res: 2,  spd: 13, hpG: 4.0, paG: 1.0,  maG: .2,  defG: .45, resG: .35, spdG: .7 },
  darkknight:{ job: 'darkknight',  hp: 50, pa: 14, ma: 5,  def: 7,  res: 3,  spd: 8,  hpG: 6.5, paG: 1.15, maG: .5,  defG: .8,  resG: .45, spdG: .3 },
  dragoon:   { job: 'dragoon',     hp: 44, pa: 13, ma: 3,  def: 6,  res: 3,  spd: 10, hpG: 5.5, paG: 1.1,  maG: .3,  defG: .7,  resG: .4,  spdG: .45 },
  necromancer:{ job: 'necromancer',hp: 30, pa: 5,  ma: 14, def: 3,  res: 6,  spd: 8,  hpG: 4.0, paG: .35,  maG: 1.2,  defG: .4,  resG: .6,  spdG: .35 },
  runefencer:{ job: 'runefencer',  hp: 36, pa: 10, ma: 11, def: 5,  res: 5,  spd: 10, hpG: 4.8, paG: .85,  maG: 1.0,  defG: .6,  resG: .55, spdG: .45 },
};

/* Advanced roles reuse a base archetype and a promotion job. */
const ADVANCED = {
  banneret: { base: 'soldier', job: 'banneret', mult: 1.25 },
  paladin: { base: 'knight', job: 'paladin', mult: 1.3 },
  swordmaster: { base: 'duelist', job: 'swordmaster', mult: 1.28 },
  sniper: { base: 'archer', job: 'sniper', mult: 1.28 },
  archmage: { base: 'blackmage', job: 'archmage', mult: 1.3 },
  bishop: { base: 'whitemage', job: 'bishop', mult: 1.28 },
  grandinquisitor: { base: 'inquisitor', job: 'grandinquisitor', mult: 1.3 },
  shadowlord: { base: 'thief', job: 'shadowlord', mult: 1.28 },
  reaver: { base: 'darkknight', job: 'reaver', mult: 1.32 },
  dragonlord: { base: 'dragoon', job: 'dragonlord', mult: 1.3 },
  lich: { base: 'necromancer', job: 'lich', mult: 1.32 },
  runelord: { base: 'runefencer', job: 'runelord', mult: 1.3 },
  firstking: { base: 'darkknight', job: 'reaver', mult: 1.5 },
};

const WEAPON_TIERS = {
  sword: ['rustedSword', 'ashenBlade', 'silverSword', 'runicBlade', 'reapersEdge'],
  spear: ['ironSpear', 'graveLance', 'serpentSpear', 'stormLance', 'stormLance'],
  bow: ['huntingBow', 'blackthornBow', 'windBow', 'windBow', 'windBow'],
  dagger: ['boneDagger', 'nightfang', 'moonDagger', 'moonDagger', 'moonDagger'],
  staff: ['oakStaff', 'cinderStaff', 'sunStaff', 'sunStaff', 'voidGrimoire'],
  grimoire: ['oakStaff', 'grimoire', 'voidGrimoire', 'voidGrimoire', 'voidGrimoire'],
};

const LOOT_BANDS = [
  { max: 4, items: ['potion', 'antidote', 'rustedSword', 'huntingBow', 'oakStaff', 'travelersGarb', 'ironRing', 'ironSpear', 'boneDagger'] },
  { max: 8, items: ['hiPotion', 'ether', 'chainmail', 'mageRobe', 'silverCharm', 'ashenBlade', 'graveLance', 'blackthornBow', 'nightfang', 'swiftBoots', 'reliquary', 'bomb', 'crownSeal'] },
  { max: 12, items: ['phoenixDown', 'wardSigil', 'cinderStaff', 'ashenPlate', 'shadeCloak', 'bloodstone', 'grimoire', 'silverSword', 'serpentSpear', 'windBow', 'moonDagger', 'sunStaff', 'crownSeal'] },
  { max: 16, items: ['wardenMail', 'archmageVestments', 'shadowweave', 'phoenixFeather', 'titanBelt', 'sagesEye', 'runicBlade', 'stormLance', 'voidGrimoire', 'elixir', 'megaEther', 'crownSeal'] },
  { max: 99, items: ['dragonplate', 'kingsbane', 'crownFragment', 'reapersEdge', 'crownSeal', 'elixir', 'phoenixDown'] },
];

const ENEMY_NAMES = {
  soldier: ['Ashen Levy', 'Grave-Robber', 'Hollow Hound', 'Bone Thrall', 'Cinder Militia'],
  knight: ['Cordon Knight', 'Drowned Knight', 'Keep Warden', 'Crown Guard', 'Salt Knight'],
  duelist: ['Court Blade', 'Gallows Duelist', 'Glass Duelist', 'Pale Sword'],
  archer: ['Ashen Bowman', 'Gallows Archer', 'Keep Archer', 'Hanging Marksman'],
  blackmage: ['Ash Adept', 'Choir Flame', 'Glass Magus', 'Cinder Warlock'],
  whitemage: ['Pale Acolyte', 'Drowned Priest', 'Choir Healer', 'Salt Cantor'],
  inquisitor: ['Cordon Inquisitor', 'Pale Inquisitor', 'Choir Inquisitor'],
  thief: ['Fen Cutter', 'Hanging Thief', 'Glass Cutpurse'],
  darkknight: ['Keep Reaver', 'Throne Reaver', 'Ashfall Reaver', 'First King\'s Reaver'],
  dragoon: ['Keep Dragoon', 'Falling Dragoon', 'Eclipse Lancer'],
  necromancer: ['Chapel Gravecaller', 'Court Gravecaller', 'Choir Gravecaller', 'Glass Gravecaller'],
  runefencer: ['Rune Warden', 'Eclipse Runesmith', 'Glass Runewright'],
  banneret: ['Ashen Banneret', 'Crown Banneret'],
  paladin: ['Oathbound Paladin', 'Salt Paladin', 'First King\'s Paladin'],
  swordmaster: ['Blade Saint', 'Hanging Blade', 'Eclipse Swordmaster'],
  sniper: ['Deadeye', 'Bell Sniper', 'Hanging Sniper'],
  archmage: ['Archmage of Ash', 'Glass Archmage', 'Eclipse Archmage'],
  bishop: ['Choir Bishop', 'Salt Bishop'],
  grandinquisitor: ['Grand Inquisitor', 'Last Inquisitor'],
  shadowlord: ['Shadowlord', 'Hanging Shadow'],
  reaver: ['Blood Reaver', 'Salt Reaver', 'First King\'s Reaver'],
  dragonlord: ['Dragonlord', 'Eclipse Dragonlord'],
  lich: ['Lich of the Ossuary', 'Eclipse Lich', 'Deathless Chancellor'],
  runelord: ['Runelord', 'Glass Runelord'],
  firstking: ['The First King'],
};

export function recommendedLevel(chapterIndex) {
  return Math.min(LEVEL_CAP, 2 + Math.floor(chapterIndex * 0.95));
}

export function lootForChapter(chapterIndex) {
  const band = LOOT_BANDS.find(b => chapterIndex < b.max) || LOOT_BANDS[LOOT_BANDS.length - 1];
  return band.items;
}

export function rollLoot(chapterIndex, rng = Math.random) {
  const items = lootForChapter(chapterIndex);
  return items[Math.floor(rng() * items.length)];
}

function pickWeapon(job, chapterIndex) {
  const type = job.weapons[0] || 'sword';
  const tier = Math.min(4, Math.floor(chapterIndex / 4));
  const list = WEAPON_TIERS[type] || WEAPON_TIERS.sword;
  const id = list[Math.min(tier, list.length - 1)];
  return ITEM_MAP[id];
}

/**
 * Build a scaled enemy. `spec` is compact:
 * { role, name?, level?, pos, boss?, elite?, leader?, undead?, beast?,
 *   dropId?, abilities?, weaponId?, mult? }
 * Scaling deliberately tracks the player's deployed average so every
 * chapter stays challenging but never becomes a wall.
 */
export function buildEnemy(spec, chapterIndex, avgLevel = recommendedLevel(chapterIndex)) {
  const role = spec.role || 'soldier';
  const adv = ADVANCED[role];
  const baseKey = adv ? adv.base : role;
  const base = ARCHETYPES[baseKey] || ARCHETYPES.soldier;
  const jobId = spec.job || (adv ? adv.job : base.job);
  const job = JOBS[jobId] || JOBS.squire;
  const level = Math.max(1, Math.min(30, spec.level || recommendedLevel(chapterIndex)));
  const expected = recommendedLevel(chapterIndex);
  const catchUp = Math.max(0.84, Math.min(1.32, 1 + (avgLevel - expected) * 0.065));
  const chapterScale = 1 + chapterIndex * 0.012;
  const tierMult = (adv ? adv.mult : 1) * (spec.mult || 1);
  const bossMult = spec.boss ? 1 : 1;
  const hpBoss = spec.boss ? (spec.final ? 2.6 : 2.1) : 1;
  const statBoss = spec.boss ? 1.14 : 1;
  const elite = spec.elite ? 1.16 : 1;
  const m = tierMult * catchUp * chapterScale * statBoss * elite;

  const weapon = spec.weaponId ? ITEM_MAP[spec.weaponId] : pickWeapon(job, chapterIndex);
  const arts = (spec.abilities && spec.abilities.length)
    ? spec.abilities.map(getArt).filter(Boolean)
    : job.arts.slice(0, Math.max(2, Math.min(5, 1 + Math.floor(level / 4))));

  const stats = {
    maxHp: Math.round((base.hp + base.hpG * (level - 1)) * m * hpBoss),
    maxMp: Math.round((8 + level * 2 + (job.bonus.mp || 0)) * (spec.boss ? 1.4 : 1)),
    pa: Math.round((base.pa + base.paG * (level - 1)) * m),
    ma: Math.round((base.ma + base.maG * (level - 1)) * m),
    def: Math.round((base.def + base.defG * (level - 1)) * m),
    res: Math.round((base.res + base.resG * (level - 1)) * m),
    spd: Math.round((base.spd + base.spdG * (level - 1)) * Math.min(1.25, m)),
    move: job.move,
    jump: job.jump,
  };

  const names = ENEMY_NAMES[role] || ENEMY_NAMES.soldier;
  const name = spec.name || names[(chapterIndex + spec.pos[0] + spec.pos[1]) % names.length];

  return {
    name,
    job: jobId,
    level,
    pos: spec.pos,
    stats,
    weapon: {
      name: weapon.name,
      atk: weapon.atk || 0,
      mag: weapon.mag || 0,
      range: weapon.range || 1,
      type: weapon.type || 'sword',
      id: weapon.id,
    },
    abilities: arts.map(a => a.id),
    boss: !!spec.boss,
    final: !!spec.final,
    leader: !!spec.leader || !!spec.boss,
    elite: !!spec.elite,
    undead: !!spec.undead,
    beast: !!spec.beast,
    dropId: spec.dropId || null,
    dropChance: spec.boss ? 1 : (spec.elite ? 0.55 : 0.34),
    xp: Math.round((spec.boss ? 55 : 18) + level * (spec.boss ? 5 : 2.6)),
    color: job.color,
    role,
  };
}

/* ------------------------------------------------------------
   CHARACTERS (story portraits)
   ------------------------------------------------------------ */
export const CHARACTERS = {
  'Sera': { name: 'Sera Vane', job: 'duelist' },
  'Bran': { name: 'Bran Hollow', job: 'knight' },
  'Ysolde': { name: 'Ysolde', job: 'whitemage' },
  'Kael': { name: 'Kael', job: 'archer' },
  'Vey': { name: 'Vey', job: 'blackmage' },
  'Mirelle': { name: 'Mirelle', job: 'thief' },
  'Orin': { name: 'Orin', job: 'dragoon' },
  'Nara': { name: 'Sister Nara', job: 'inquisitor' },
  'Malachai': { name: 'Malachai', job: 'darkknight' },
  'Wren': { name: 'Wren', job: 'runefencer' },
  'Tobias': { name: 'Tobias', job: 'knight' },
  'Sable': { name: 'Sable', job: 'necromancer' },
  'Voss': { name: 'Inquisitor Voss', job: 'inquisitor' },
  'Chancellor': { name: 'The Silent Chancellor', job: 'necromancer' },
  'Regent': { name: 'The Pale Regent', job: 'darkknight' },
  'First King': { name: 'The First King', job: 'reaver' },
  'Narration': { name: '', job: null },
};

/* ------------------------------------------------------------
   20 CHAPTERS
   ------------------------------------------------------------ */
const CHAPTER_DEFS = [
  {
    id: 'ashen-gate', num: 1, chapter: 'I', name: 'The Ashen Gate', map: 'gate', spawns: SPAWNS.gate,
    subtitle: 'Where the road begins to remember', objective: 'Rout the grave-robbers',
    enemies: [
      { role: 'soldier', name: 'Grave-Robber', pos: [8, 1] },
      { role: 'soldier', name: 'Grave-Robber', pos: [9, 1] },
      { role: 'archer', name: 'Ashen Bowman', pos: [8, 2] },
      { role: 'soldier', name: 'Hollow Hound', pos: [9, 2], beast: true },
    ],
    rewards: { gold: 180, jp: 30, exp: 40, items: [{ id: 'potion', qty: 2 }, { id: 'antidote', qty: 1 }] },
    recruits: ['vey'],
    intro: [{
      label: 'CHAPTER I · THE ASHEN GATE',
      title: 'A Road With No King',
      lines: [
        { speaker: 'Narration', text: 'The kingdom of Vaer died nine winters ago. Nobody told the crown.' },
        { speaker: 'Sera', text: 'Gate ahead. Four of them, maybe more in the ruins. Vey, can you see?' },
        { speaker: 'Vey', text: 'I can see everything, Sera. That is the problem with being a mage.' },
        { speaker: 'Bran', text: 'The gate was mine to hold once. I would like it back.' },
        { speaker: 'Ysolde', text: 'Then we take it back. Try not to die before I can be useful.' },
        { speaker: 'Sera', text: 'You heard the healer. Forward.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER I · AFTERMATH',
      title: 'The Boy in the Ash',
      lines: [
        { speaker: 'Narration', text: 'The last grave-robber falls. In the ash beyond the gate, a young mage sits reading a scorched book by the light of his own hand.' },
        { speaker: 'Vey', text: 'You killed them. They were already dead. That is a distinction the living enjoy making.' },
        { speaker: 'Sera', text: 'You are coming with us.' },
        { speaker: 'Vey', text: 'Obviously. I want to know what the crown is reading.' },
      ],
    }],
  },
  {
    id: 'drowned-chapel', num: 2, chapter: 'II', name: 'The Drowned Chapel', map: 'chapel', spawns: SPAWNS.chapel,
    subtitle: 'The water remembers every prayer', objective: 'Silence the gravecaller',
    enemies: [
      { role: 'knight', name: 'Drowned Knight', pos: [8, 1], undead: true },
      { role: 'knight', name: 'Drowned Knight', pos: [9, 1], undead: true },
      { role: 'soldier', name: 'Bilge Thrall', pos: [8, 2], undead: true },
      { role: 'necromancer', name: 'Chapel Gravecaller', pos: [9, 2], leader: true },
    ],
    rewards: { gold: 240, jp: 38, exp: 55, items: [{ id: 'ether', qty: 1 }, { id: 'hiPotion', qty: 1 }] },
    recruits: ['mirelle'],
    intro: [{
      label: 'CHAPTER II · THE DROWNED CHAPEL',
      title: 'What the Water Keeps',
      lines: [
        { speaker: 'Narration', text: 'The chapel sank with its congregation. The water did not kill them so much as keep them.' },
        { speaker: 'Kael', text: 'Singing. Under the water. That is not a thing water should do.' },
        { speaker: 'Ysolde', text: 'It is a gravecaller. The drowned are learning the words.' },
        { speaker: 'Mirelle', text: 'Took you long enough. The singing is terrible.' },
        { speaker: 'Sera', text: 'And you are?' },
        { speaker: 'Mirelle', text: 'The person who already picked the lock. Do keep up.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER II · AFTERMATH',
      title: 'The Song Stops',
      lines: [
        { speaker: 'Narration', text: 'The gravecaller sinks beneath the black water, still humming. The chapel goes quiet for the first time in nine years.' },
        { speaker: 'Mirelle', text: 'Wet coins, a fingerbone, and a child\'s wooden crown. For luck.' },
        { speaker: 'Bran', text: 'That is not luck. That is grave-robbing.' },
        { speaker: 'Mirelle', text: 'I prefer to think of it as inventory.' },
      ],
    }],
  },
  {
    id: 'gallows-road', num: 3, chapter: 'II', name: 'The Gallows Road', map: 'road', spawns: SPAWNS.road,
    subtitle: 'The Regent\'s justice, still swinging', objective: 'Break the Inquisitor\'s cordon',
    enemies: [
      { role: 'archer', name: 'Gallows Archer', pos: [2, 1] },
      { role: 'archer', name: 'Gallows Archer', pos: [9, 1] },
      { role: 'knight', name: 'Cordon Knight', pos: [4, 3] },
      { role: 'knight', name: 'Cordon Knight', pos: [7, 3] },
      { role: 'inquisitor', name: 'Inquisitor Voss', pos: [5, 2], boss: true, leader: true, level: 6, dropId: 'reliquary' },
    ],
    rewards: { gold: 320, jp: 46, exp: 70, items: [{ id: 'phoenixDown', qty: 1 }, { id: 'hiPotion', qty: 2 }] },
    recruits: ['orin'],
    intro: [{
      label: 'CHAPTER III · THE GALLOWS ROAD',
      title: 'A Cordon of the Faithful',
      lines: [
        { speaker: 'Narration', text: 'Inquisitor Voss has strung a cordon across the only road north. The gallows behind him are full.' },
        { speaker: 'Voss', text: 'The Regent offers pardon. Lay down your arms. Confess. The crown is merciful.' },
        { speaker: 'Sera', text: 'The crown is empty. And so is your pardon.' },
        { speaker: 'Nara', text: 'He has been hanging the same families for years. The ropes are the only thing in Vaer that still gets replaced.' },
        { speaker: 'Bran', text: 'Then we cut the ropes.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER III · AFTERMATH',
      title: 'The Weight of the Rope',
      lines: [
        { speaker: 'Narration', text: 'Voss falls to his knees, surprised to be dying. "You will not find him," he says. "The Regent is not a man. The Regent is a vacancy."' },
        { speaker: 'Orin', text: 'North. The Black Keep. I have been trying to get in for years.' },
        { speaker: 'Sera', text: 'And now you have a key.' },
        { speaker: 'Orin', text: 'I have a company. That is better.' },
      ],
    }],
  },
  {
    id: 'black-keep', num: 4, chapter: 'III', name: 'The Black Keep', map: 'keep', spawns: SPAWNS.keep,
    subtitle: 'The oath outlives the oath-taker', objective: 'Survive the keep\'s garrison',
    enemies: [
      { role: 'darkknight', name: 'Keep Reaver', pos: [2, 1], undead: true },
      { role: 'darkknight', name: 'Keep Reaver', pos: [9, 1], undead: true },
      { role: 'runefencer', name: 'Rune Warden', pos: [5, 2] },
      { role: 'dragoon', name: 'Keep Dragoon', pos: [6, 2] },
      { role: 'archer', name: 'Keep Archer', pos: [5, 1] },
    ],
    rewards: { gold: 420, jp: 55, exp: 85, items: [{ id: 'bloodstone', qty: 1 }, { id: 'hiPotion', qty: 2 }] },
    recruits: ['nara', 'malachai'],
    intro: [{
      label: 'CHAPTER IV · THE BLACK KEEP',
      title: 'The Gate That Held',
      lines: [
        { speaker: 'Narration', text: 'The Black Keep was built to be impossible. It has been impossible for four hundred years. The garrison inside is still obeying its last order.' },
        { speaker: 'Malachai', text: 'Turn back. I hold this gate.' },
        { speaker: 'Sera', text: 'For a king who is dead.' },
        { speaker: 'Malachai', text: 'For a king who was. There is a difference. There was.' },
        { speaker: 'Nara', text: 'I burned heretics for the Regent. I would like to be useful before I am forgiven.' },
        { speaker: 'Sera', text: 'Then hold the gate for us.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER IV · AFTERMATH',
      title: 'The Oathless',
      lines: [
        { speaker: 'Narration', text: 'Malachai lowers his blade. The garrison falls still, as if a held breath has finally been released.' },
        { speaker: 'Malachai', text: 'I held this gate for a dead king. Give me a living reason and I will hold it again.' },
        { speaker: 'Sera', text: 'The reason is downstairs. The Regent has been waiting nine years for someone to knock.' },
        { speaker: 'Malachai', text: 'Then let us be rude.' },
      ],
    }],
  },
  {
    id: 'silent-court', num: 5, chapter: 'III', name: 'The Silent Court', map: 'court', spawns: SPAWNS.court,
    subtitle: 'A court of bones, still holding session', objective: 'Silence the Court Gravecaller',
    enemies: [
      { role: 'soldier', name: 'Court Thrall', pos: [2, 2], undead: true },
      { role: 'soldier', name: 'Court Thrall', pos: [9, 2], undead: true },
      { role: 'soldier', name: 'Court Thrall', pos: [2, 7], undead: true },
      { role: 'soldier', name: 'Court Thrall', pos: [9, 7], undead: true },
      { role: 'knight', name: 'Drowned Honour Guard', pos: [4, 3], undead: true },
      { role: 'knight', name: 'Drowned Honour Guard', pos: [7, 3], undead: true },
      { role: 'necromancer', name: 'The Silent Chancellor', pos: [5, 2], boss: true, leader: true, level: 8, dropId: 'crownFragment' },
    ],
    rewards: { gold: 520, jp: 64, exp: 100, items: [{ id: 'crownSeal', qty: 1 }, { id: 'phoenixDown', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER V · THE SILENT COURT',
      title: 'The Chancellor Speaks',
      lines: [
        { speaker: 'Narration', text: 'The throne room has been kept clean. The court sits in its old places. Protocol is the last thing the dead forget.' },
        { speaker: 'Chancellor', text: 'The Regent is not receiving. The Regent is becoming. You are early.' },
        { speaker: 'Vey', text: 'Becoming what?' },
        { speaker: 'Chancellor', text: 'A vacancy with a crown on it.' },
        { speaker: 'Sera', text: 'We have come to fill the vacancy.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER V · AFTERMATH',
      title: 'The Door to the Throne',
      lines: [
        { speaker: 'Narration', text: 'The chancellor comes apart into a cloud of paper and old seals. The court slumps. The crown keeps turning.' },
        { speaker: 'Malachai', text: 'This was mine once. I gave it to him. I did not know what he would do with it.' },
        { speaker: 'Nara', text: 'You could not have known.' },
        { speaker: 'Malachai', text: 'I could have asked.' },
      ],
    }],
  },
  {
    id: 'hollow-crown', num: 6, chapter: 'IV', name: 'The Hollow Crown', map: 'throne', spawns: SPAWNS.throne,
    subtitle: 'The last empty chair', objective: 'End the Pale Regent',
    enemies: [
      { role: 'darkknight', name: 'Throne Reaver', pos: [3, 2] },
      { role: 'darkknight', name: 'Throne Reaver', pos: [7, 2] },
      { role: 'necromancer', name: 'Pale Gravecaller', pos: [2, 3] },
      { role: 'necromancer', name: 'Pale Gravecaller', pos: [8, 3] },
      { role: 'knight', name: 'Silent Guard', pos: [5, 3], undead: true },
      { role: 'darkknight', name: 'The Pale Regent', pos: [5, 1], boss: true, leader: true, level: 10, dropId: 'crownFragment' },
    ],
    rewards: { gold: 700, jp: 80, exp: 130, items: [{ id: 'crownSeal', qty: 1 }, { id: 'elixir', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER VI · THE HOLLOW CROWN',
      title: 'The Vacancy',
      lines: [
        { speaker: 'Narration', text: 'The throne room is enormous and entirely empty, except for the thing wearing the crown.' },
        { speaker: 'Regent', text: 'You are late. The coronation is already over. I am the king now. I am the law. I am the hole where the king should be.' },
        { speaker: 'Sera', text: 'Then we will fill it.' },
        { speaker: 'Regent', text: 'You are welcome to try. The last company that tried is standing behind me.' },
        { speaker: 'Bran', text: 'Not anymore.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER VI · AFTERMATH',
      title: 'The Crown Escapes',
      lines: [
        { speaker: 'Narration', text: 'The Regent comes apart. The crown falls — and does not hit the floor. It hangs, turns, and drives itself into the stone like a nail.' },
        { speaker: 'Vey', text: 'That is not a crown. That is a door.' },
        { speaker: 'Narration', text: 'The floor opens. Below the throne, a stair descends into a kingdom that was buried before Vaer had a name.' },
        { speaker: 'Sera', text: 'Then we go down.' },
      ],
    }],
  },
  {
    id: 'sunken-stair', num: 7, chapter: 'IV', name: 'The Sunken Stair', map: 'stair', spawns: SPAWNS.stair,
    subtitle: 'Down is a direction too', objective: 'Break the stairwarden\'s seal',
    enemies: [
      { role: 'paladin', name: 'Oathbound Paladin', pos: [5, 2], boss: true, leader: true, level: 9, dropId: 'silverSword' },
      { role: 'swordmaster', name: 'Blade Saint', pos: [2, 2] },
      { role: 'swordmaster', name: 'Blade Saint', pos: [9, 2] },
      { role: 'sniper', name: 'Deadeye', pos: [2, 1] },
      { role: 'bishop', name: 'Pale Acolyte', pos: [8, 1] },
    ],
    rewards: { gold: 560, jp: 72, exp: 110, items: [{ id: 'crownSeal', qty: 1 }, { id: 'hiPotion', qty: 2 }] },
    recruits: ['wren'],
    intro: [{
      label: 'CHAPTER VII · THE SUNKEN STAIR',
      title: 'A Kingdom Under the Kingdom',
      lines: [
        { speaker: 'Narration', text: 'The stair goes down for a day and a night. The walls are carved with kings who have no faces.' },
        { speaker: 'Wren', text: 'Do not touch the writing. It is still being written.' },
        { speaker: 'Kael', text: 'And you are?' },
        { speaker: 'Wren', text: 'Wren. I was erasing a word in the margin of the world. Then you stepped on it.' },
        { speaker: 'Sera', text: 'Can you fight?' },
        { speaker: 'Wren', text: 'I can make the world forget a small piece of itself. Is that fighting?' },
      ],
    }],
    outro: [{
      label: 'CHAPTER VII · AFTERMATH',
      title: 'The Margin',
      lines: [
        { speaker: 'Narration', text: 'The stairwarden falls. The seal on the lower door goes out like a candle.' },
        { speaker: 'Wren', text: 'The word is still there. It is getting longer.' },
        { speaker: 'Vey', text: 'What word?' },
        { speaker: 'Wren', text: 'I do not know. Every time I read it, I forget my own name.' },
      ],
    }],
  },
  {
    id: 'ossuary-gate', num: 8, chapter: 'V', name: 'The Ossuary Gate', map: 'ossuary', spawns: SPAWNS.ossuary,
    subtitle: 'Every bone remembers a name', objective: 'Destroy the ossuary lich',
    enemies: [
      { role: 'necromancer', name: 'Ossuary Gravecaller', pos: [2, 2], undead: true },
      { role: 'necromancer', name: 'Ossuary Gravecaller', pos: [9, 2], undead: true },
      { role: 'knight', name: 'Bone Warden', pos: [4, 3], undead: true },
      { role: 'knight', name: 'Bone Warden', pos: [7, 3], undead: true },
      { role: 'lich', name: 'Lich of the Ossuary', pos: [5, 2], boss: true, leader: true, level: 11, dropId: 'voidGrimoire' },
    ],
    rewards: { gold: 620, jp: 80, exp: 120, items: [{ id: 'crownSeal', qty: 1 }, { id: 'megaEther', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER VIII · THE OSSUARY GATE',
      title: 'The Library of Bones',
      lines: [
        { speaker: 'Narration', text: 'The gate is made of ribs. Behind it, a library of bones stretches farther than the eye can follow.' },
        { speaker: 'Sable', text: 'Quiet. The librarian is reading.' },
        { speaker: 'Mirelle', text: 'There is no librarian.' },
        { speaker: 'Sable', text: 'There is always a librarian.' },
        { speaker: 'Nara', text: 'That is a lich.' },
        { speaker: 'Sable', text: 'That is a librarian with tenure.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER VIII · AFTERMATH',
      title: 'A Page Turns',
      lines: [
        { speaker: 'Narration', text: 'The lich collapses into a heap of annotated bone. One page remains, pinned under its skull.' },
        { speaker: 'Vey', text: 'It is a map. The first kingdom. It has been underneath us the whole time.' },
        { speaker: 'Wren', text: 'And someone has been drawing on it.' },
      ],
    }],
  },
  {
    id: 'weeping-fen', num: 9, chapter: 'V', name: 'The Weeping Fen', map: 'fen', spawns: SPAWNS.fen,
    subtitle: 'The water has learned to cry', objective: 'Cross the fen and break the ambush',
    enemies: [
      { role: 'thief', name: 'Fen Cutter', pos: [2, 2] },
      { role: 'thief', name: 'Fen Cutter', pos: [9, 2] },
      { role: 'archer', name: 'Fen Marksman', pos: [3, 3] },
      { role: 'archer', name: 'Fen Marksman', pos: [8, 3] },
      { role: 'runelord', name: 'Runelord of the Fen', pos: [5, 2], boss: true, leader: true, level: 12, dropId: 'stormLance' },
      { role: 'knight', name: 'Drowned Knight', pos: [5, 7], undead: true },
    ],
    rewards: { gold: 660, jp: 86, exp: 125, items: [{ id: 'phoenixDown', qty: 2 }, { id: 'elixir', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER IX · THE WEEPING FEN',
      title: 'The Water Cries',
      lines: [
        { speaker: 'Narration', text: 'The fen weeps. Not metaphorically. The water makes a sound like a child in another room.' },
        { speaker: 'Kael', text: 'We are being watched.' },
        { speaker: 'Mirelle', text: 'We are being herded. There is a difference, and I do not like either.' },
        { speaker: 'Orin', text: 'I can jump the water. The rest of you will have to be clever.' },
        { speaker: 'Sera', text: 'Then be clever loudly. I will be clever with a sword.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER IX · AFTERMATH',
      title: 'The Fen Keeper',
      lines: [
        { speaker: 'Narration', text: 'The runelord sinks. The weeping stops, then starts again farther off, as if it has found a new room.' },
        { speaker: 'Ysolde', text: 'It is not the water. It is the kingdom underneath. It is crying because it is waking up.' },
        { speaker: 'Sera', text: 'Then we should hurry before it opens its eyes.' },
      ],
    }],
  },
  {
    id: 'broken-bridge', num: 10, chapter: 'VI', name: 'The Broken Bridge', map: 'bridge', spawns: SPAWNS.bridge,
    subtitle: 'The only way across is through', objective: 'Hold the bridge and break the lancers',
    enemies: [
      { role: 'sniper', name: 'Bell Sniper', pos: [2, 1] },
      { role: 'sniper', name: 'Bell Sniper', pos: [9, 1] },
      { role: 'knight', name: 'Bridge Warden', pos: [4, 2] },
      { role: 'knight', name: 'Bridge Warden', pos: [7, 2] },
      { role: 'dragonlord', name: 'Falling Dragonlord', pos: [5, 1], boss: true, leader: true, level: 13, dropId: 'stormLance' },
    ],
    rewards: { gold: 720, jp: 92, exp: 135, items: [{ id: 'crownSeal', qty: 1 }, { id: 'dragonplate', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER X · THE BROKEN BRIDGE',
      title: 'A Narrow Place',
      lines: [
        { speaker: 'Narration', text: 'The bridge is the only dry road for fifty miles. Something has been waiting on the far side for a very long time.' },
        { speaker: 'Orin', text: 'That is a dragonlord. I know him.' },
        { speaker: 'Sera', text: 'Friend?' },
        { speaker: 'Orin', text: 'We fell together. He did not stop.' },
        { speaker: 'Bran', text: 'Then we will stop him.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER X · AFTERMATH',
      title: 'The Falling',
      lines: [
        { speaker: 'Narration', text: 'The dragonlord falls at last. Orin watches him go, and does not look away.' },
        { speaker: 'Orin', text: 'He was the best of us. He held the sky while the rest of us ran.' },
        { speaker: 'Sera', text: 'Then we will hold the road.' },
      ],
    }],
  },
  {
    id: 'cinder-monastery', num: 11, chapter: 'VI', name: 'The Cinder Monastery', map: 'monastery', spawns: SPAWNS.monastery,
    subtitle: 'The last prayer is a command', objective: 'Break the Cinder Choir',
    enemies: [
      { role: 'inquisitor', name: 'Cinder Inquisitor', pos: [2, 2] },
      { role: 'inquisitor', name: 'Cinder Inquisitor', pos: [9, 2] },
      { role: 'bishop', name: 'Choir Bishop', pos: [5, 1] },
      { role: 'knight', name: 'Cinder Knight', pos: [4, 3] },
      { role: 'knight', name: 'Cinder Knight', pos: [7, 3] },
      { role: 'grandinquisitor', name: 'The Cinder Prior', pos: [5, 2], boss: true, leader: true, level: 14, dropId: 'sunStaff' },
    ],
    rewards: { gold: 760, jp: 98, exp: 145, items: [{ id: 'crownSeal', qty: 1 }, { id: 'elixir', qty: 2 }] },
    recruits: ['tobias'],
    intro: [{
      label: 'CHAPTER XI · THE CINDER MONASTERY',
      title: 'The Last Prayer',
      lines: [
        { speaker: 'Narration', text: 'The monastery burned a hundred years ago and has been burning ever since. The monks inside have not noticed.' },
        { speaker: 'Tobias', text: 'I am late.' },
        { speaker: 'Sera', text: 'You are early. The battle has not started.' },
        { speaker: 'Tobias', text: 'Then I am exactly on time. I have been practising.' },
        { speaker: 'Nara', text: 'The prior is a grand inquisitor. He will not listen.' },
        { speaker: 'Tobias', text: 'I did not bring a listening sword.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XI · AFTERMATH',
      title: 'The Cinder Prior',
      lines: [
        { speaker: 'Narration', text: 'The prior falls. The monastery keeps burning. Somewhere under the ash, a bell begins to ring.' },
        { speaker: 'Tobias', text: 'That bell. I have heard it before.' },
        { speaker: 'Wren', text: 'So has the word. They are rhyming.' },
      ],
    }],
  },
  {
    id: 'choir-of-nails', num: 12, chapter: 'VII', name: 'The Choir of Nails', map: 'choir', spawns: SPAWNS.choir,
    subtitle: 'Every hymn is a nail', objective: 'Silence the nail choir',
    enemies: [
      { role: 'necromancer', name: 'Nail Gravecaller', pos: [2, 2] },
      { role: 'necromancer', name: 'Nail Gravecaller', pos: [9, 2] },
      { role: 'soldier', name: 'Nailed Thrall', pos: [3, 7], undead: true },
      { role: 'soldier', name: 'Nailed Thrall', pos: [8, 7], undead: true },
      { role: 'knight', name: 'Choir Warden', pos: [5, 3] },
      { role: 'lich', name: 'The Nail Chanter', pos: [5, 2], boss: true, leader: true, level: 15, dropId: 'crownFragment' },
    ],
    rewards: { gold: 820, jp: 104, exp: 155, items: [{ id: 'crownSeal', qty: 1 }, { id: 'megaEther', qty: 2 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XII · THE CHOIR OF NAILS',
      title: 'A Hymn With Teeth',
      lines: [
        { speaker: 'Narration', text: 'The choir is made of nails. Each one holds a voice. Together they are singing the kingdom awake.' },
        { speaker: 'Ysolde', text: 'They are not calling the dead. They are calling something older.' },
        { speaker: 'Sable', text: 'The first thing. The thing under the first king.' },
        { speaker: 'Sera', text: 'Then we pull the nails.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XII · AFTERMATH',
      title: 'One Voice Left',
      lines: [
        { speaker: 'Narration', text: 'The last nail comes free. The hymn ends. In the silence, something enormous shifts beneath the floor.' },
        { speaker: 'Malachai', text: 'That is not a kingdom. That is a mouth.' },
        { speaker: 'Vey', text: 'Technically, a kingdom is a mouth. It eats taxes.' },
      ],
    }],
  },
  {
    id: 'ashfall-wastes', num: 13, chapter: 'VII', name: 'The Ashfall Wastes', map: 'wastes', spawns: SPAWNS.wastes,
    subtitle: 'Nothing grows but the dead', objective: 'Cross the wastes and break the reaver line',
    enemies: [
      { role: 'darkknight', name: 'Ashfall Reaver', pos: [2, 2] },
      { role: 'darkknight', name: 'Ashfall Reaver', pos: [9, 2] },
      { role: 'reaver', name: 'The Ash Reaver', pos: [5, 2], boss: true, leader: true, level: 16, dropId: 'runicBlade' },
      { role: 'archer', name: 'Ashfall Marksman', pos: [4, 3] },
      { role: 'archer', name: 'Ashfall Marksman', pos: [7, 3] },
    ],
    rewards: { gold: 880, jp: 110, exp: 165, items: [{ id: 'crownSeal', qty: 1 }, { id: 'titanBelt', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XIII · THE ASHFALL WASTES',
      title: 'The Grey Sea',
      lines: [
        { speaker: 'Narration', text: 'The wastes are what is left of the first kingdom\'s farmland. The ash falls upward here, back toward a sky that does not want it.' },
        { speaker: 'Bran', text: 'I have never seen so much nothing.' },
        { speaker: 'Sera', text: 'Then stop looking at it. Look at them.' },
        { speaker: 'Nara', text: 'Reavers. They have been eating the ash.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XIII · AFTERMATH',
      title: 'What the Ash Remembers',
      lines: [
        { speaker: 'Narration', text: 'The reaver line breaks. Beneath the ash, the ground is warm. Something has been breathing here.' },
        { speaker: 'Wren', text: 'The word is longer. It has a verb now.' },
        { speaker: 'Kael', text: 'What is the verb?' },
        { speaker: 'Wren', text: 'Wake.' },
      ],
    }],
  },
  {
    id: 'glass-desert', num: 14, chapter: 'VIII', name: 'The Glass Desert', map: 'desert', spawns: SPAWNS.desert,
    subtitle: 'The sand has been melted into mirrors', objective: 'Shatter the glass court',
    enemies: [
      { role: 'runelord', name: 'Glass Runelord', pos: [2, 2] },
      { role: 'runelord', name: 'Glass Runelord', pos: [9, 2] },
      { role: 'swordmaster', name: 'Glass Blade', pos: [3, 2] },
      { role: 'swordmaster', name: 'Glass Blade', pos: [8, 2] },
      { role: 'archmage', name: 'The Glass Magus', pos: [5, 2], boss: true, leader: true, level: 17, dropId: 'voidGrimoire' },
    ],
    rewards: { gold: 940, jp: 116, exp: 175, items: [{ id: 'crownSeal', qty: 1 }, { id: 'sagesEye', qty: 1 }] },
    recruits: ['sable'],
    intro: [{
      label: 'CHAPTER XIV · THE GLASS DESERT',
      title: 'A Mirror With No Sky',
      lines: [
        { speaker: 'Narration', text: 'The sand has been melted into glass. The company walks across a floor that shows them walking across a floor.' },
        { speaker: 'Sable', text: 'You are late. I have been waiting under the glass for eleven years.' },
        { speaker: 'Sera', text: 'Waiting for what?' },
        { speaker: 'Sable', text: 'For someone to break it. I did not want to do it alone.' },
        { speaker: 'Vey', text: 'That is the most reasonable thing anyone has said today.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XIV · AFTERMATH',
      title: 'Under the Glass',
      lines: [
        { speaker: 'Narration', text: 'The glass shatters. Under it, there is no sand. There is a road, and the road is full of people who have been walking it for a very long time.' },
        { speaker: 'Sable', text: 'The first kingdom is not dead. It has been walking in place.' },
        { speaker: 'Sera', text: 'Then we give it somewhere to go.' },
      ],
    }],
  },
  {
    id: 'salt-throne', num: 15, chapter: 'VIII', name: 'The Salt Throne', map: 'throne', spawns: SPAWNS.throne,
    subtitle: 'A crown preserved in salt', objective: 'Take the Salt Throne',
    enemies: [
      { role: 'reaver', name: 'Salt Reaver', pos: [5, 1], boss: true, leader: true, level: 18, dropId: 'reapersEdge' },
      { role: 'paladin', name: 'Salt Paladin', pos: [3, 2] },
      { role: 'paladin', name: 'Salt Paladin', pos: [7, 2] },
      { role: 'bishop', name: 'Salt Bishop', pos: [2, 3] },
      { role: 'sniper', name: 'Salt Sniper', pos: [8, 3] },
    ],
    rewards: { gold: 1000, jp: 122, exp: 185, items: [{ id: 'crownSeal', qty: 1 }, { id: 'dragonplate', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XV · THE SALT THRONE',
      title: 'The Preserved King',
      lines: [
        { speaker: 'Narration', text: 'The throne is made of salt. The king on it is made of salt. He has been preserved so well that he has not noticed he is dead.' },
        { speaker: 'First King', text: 'Who approaches the throne?' },
        { speaker: 'Sera', text: 'The living.' },
        { speaker: 'First King', text: 'Ah. You are early.' },
        { speaker: 'Malachai', text: 'Everyone keeps saying that.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XV · AFTERMATH',
      title: 'Salt in the Wound',
      lines: [
        { speaker: 'Narration', text: 'The salt king falls apart. The throne remains, white and patient.' },
        { speaker: 'Wren', text: 'That was not the First King. That was a copy. A very old copy.' },
        { speaker: 'Sera', text: 'Then where is the original?' },
        { speaker: 'Wren', text: 'Closer.' },
      ],
    }],
  },
  {
    id: 'first-kings-road', num: 16, chapter: 'IX', name: "The First King's Road", map: 'road', spawns: SPAWNS.road,
    subtitle: 'The road was built before the kingdom', objective: 'Break the First King\'s honour guard',
    enemies: [
      { role: 'darkknight', name: "First King's Reaver", pos: [2, 2] },
      { role: 'darkknight', name: "First King's Reaver", pos: [9, 2] },
      { role: 'reaver', name: "First King's Reaver", pos: [4, 3] },
      { role: 'reaver', name: "First King's Reaver", pos: [7, 3] },
      { role: 'lich', name: 'The Road Warden', pos: [5, 1], boss: true, leader: true, level: 19, dropId: 'crownFragment' },
      { role: 'dragonlord', name: 'Eclipse Dragonlord', pos: [5, 2] },
    ],
    rewards: { gold: 1080, jp: 128, exp: 195, items: [{ id: 'crownSeal', qty: 1 }, { id: 'phoenixFeather', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XVI · THE FIRST KING\'S ROAD',
      title: 'The Road Before the Kingdom',
      lines: [
        { speaker: 'Narration', text: 'The road is older than the kingdom. It runs straight through hills that were built to stop it.' },
        { speaker: 'Orin', text: 'This is the road the dragoons used to fall from.' },
        { speaker: 'Bran', text: 'It is a road. Roads do not fall.' },
        { speaker: 'Orin', text: 'This one did.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XVI · AFTERMATH',
      title: 'The Straight Road',
      lines: [
        { speaker: 'Narration', text: 'The road warden falls. The road continues, straight as a held breath, into a darkness that has a shape.' },
        { speaker: 'Sable', text: 'That is the First King\'s gate. I have seen it in the glass.' },
        { speaker: 'Sera', text: 'Then we knock.' },
      ],
    }],
  },
  {
    id: 'eclipse-gate', num: 17, chapter: 'IX', name: 'The Eclipse Gate', map: 'eclipse', spawns: SPAWNS.eclipse,
    subtitle: 'The sun has been eaten', objective: 'Open the Eclipse Gate',
    enemies: [
      { role: 'lich', name: 'Eclipse Lich', pos: [4, 1], boss: true, leader: true, level: 19, dropId: 'voidGrimoire' },
      { role: 'archmage', name: 'Eclipse Archmage', pos: [3, 2] },
      { role: 'archmage', name: 'Eclipse Archmage', pos: [7, 2] },
      { role: 'paladin', name: 'Eclipse Paladin', pos: [2, 3] },
      { role: 'grandinquisitor', name: 'Eclipse Inquisitor', pos: [8, 3] },
    ],
    rewards: { gold: 1160, jp: 134, exp: 205, items: [{ id: 'crownSeal', qty: 1 }, { id: 'elixir', qty: 2 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XVII · THE ECLIPSE GATE',
      title: 'The Eaten Sun',
      lines: [
        { speaker: 'Narration', text: 'The gate is a ring of black stone. Inside the ring, the sun is setting and rising at the same time, over and over.' },
        { speaker: 'Vey', text: 'It is not a gate. It is a wound in the sky.' },
        { speaker: 'Ysolde', text: 'Then we stitch it.' },
        { speaker: 'Nara', text: 'I have stitched worse.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XVII · AFTERMATH',
      title: 'The Stitch',
      lines: [
        { speaker: 'Narration', text: 'The ring breaks. Daylight spills through for the first time in nine years, thin and grey as old milk.' },
        { speaker: 'Kael', text: 'I forgot what it looked like.' },
        { speaker: 'Sera', text: 'Do not get used to it. We are going under.' },
      ],
    }],
  },
  {
    id: 'hanging-city', num: 18, chapter: 'X', name: 'The Hanging City', map: 'city', spawns: SPAWNS.city,
    subtitle: 'The last city hangs by its own rope', objective: 'Cut the city down',
    enemies: [
      { role: 'shadowlord', name: 'Hanging Shadow', pos: [1, 2] },
      { role: 'shadowlord', name: 'Hanging Shadow', pos: [10, 2] },
      { role: 'sniper', name: 'Hanging Sniper', pos: [4, 3] },
      { role: 'sniper', name: 'Hanging Sniper', pos: [7, 3] },
      { role: 'swordmaster', name: 'The Hanging Blade', pos: [5, 2], boss: true, leader: true, level: 20, dropId: 'moonDagger' },
    ],
    rewards: { gold: 1240, jp: 140, exp: 215, items: [{ id: 'crownSeal', qty: 1 }, { id: 'shadowweave', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XVIII · THE HANGING CITY',
      title: 'A City on a Rope',
      lines: [
        { speaker: 'Narration', text: 'The city hangs from the roof of the underworld by a rope made of names. Every name is someone who tried to cut it.' },
        { speaker: 'Mirelle', text: 'I know half these names.' },
        { speaker: 'Sera', text: 'Then cut the other half.' },
        { speaker: 'Mirelle', text: 'I was hoping you would say that.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XVIII · AFTERMATH',
      title: 'The Rope',
      lines: [
        { speaker: 'Narration', text: 'The rope parts. The city does not fall. It simply stops pretending to hang, and becomes a road.' },
        { speaker: 'Wren', text: 'The word is almost complete. It has a subject now.' },
        { speaker: 'Vey', text: 'What is the subject?' },
        { speaker: 'Wren', text: 'Us.' },
      ],
    }],
  },
  {
    id: 'last-bell', num: 19, chapter: 'X', name: 'The Last Bell', map: 'bell', spawns: SPAWNS.bell,
    subtitle: 'The bell that would not ring', objective: 'Ring the last bell',
    enemies: [
      { role: 'grandinquisitor', name: 'The Last Inquisitor', pos: [5, 1], boss: true, leader: true, level: 21, dropId: 'sunStaff' },
      { role: 'bishop', name: 'Bell Bishop', pos: [3, 2] },
      { role: 'paladin', name: 'Bell Paladin', pos: [7, 2] },
      { role: 'lich', name: 'Bell Lich', pos: [2, 3] },
      { role: 'reaver', name: 'Bell Reaver', pos: [8, 3] },
    ],
    rewards: { gold: 1400, jp: 150, exp: 230, items: [{ id: 'crownSeal', qty: 2 }, { id: 'kingsbane', qty: 1 }] },
    recruits: [],
    intro: [{
      label: 'CHAPTER XIX · THE LAST BELL',
      title: 'The Bell That Would Not Ring',
      lines: [
        { speaker: 'Narration', text: 'The bell has not rung since the king died. It is not broken. It is waiting for someone with the authority to ring it.' },
        { speaker: 'Nara', text: 'I have no authority left.' },
        { speaker: 'Sera', text: 'You have a sword.' },
        { speaker: 'Nara', text: 'That is not the same thing.' },
        { speaker: 'Bran', text: 'It has been enough so far.' },
      ],
    }],
    outro: [{
      label: 'CHAPTER XIX · AFTERMATH',
      title: 'The Ring',
      lines: [
        { speaker: 'Narration', text: 'The bell rings once. The sound goes down instead of out, through the floor, into the dark.' },
        { speaker: 'Narration', text: 'Something at the bottom of the world answers.' },
        { speaker: 'Sera', text: 'That is our cue.' },
      ],
    }],
  },
  {
    id: 'crown-beneath', num: 20, chapter: 'Final', name: 'The Crown Beneath', map: 'abyss', spawns: SPAWNS.abyss,
    subtitle: 'The first king, and the thing that wore him', objective: 'End the First King',
    enemies: [
      { role: 'firstking', name: 'The First King', pos: [5, 1], boss: true, final: true, leader: true, level: 24, mult: 1.1, dropId: 'reapersEdge', abilities: ['crownOfAsh', 'kingsCommand', 'graveWave', 'soulReaver', 'doom', 'hollowBolt'] },
      { role: 'reaver', name: "First King's Reaver", pos: [3, 2] },
      { role: 'reaver', name: "First King's Reaver", pos: [7, 2] },
      { role: 'lich', name: 'Deathless Chancellor', pos: [2, 3] },
      { role: 'lich', name: 'Deathless Chancellor', pos: [8, 3] },
      { role: 'dragonlord', name: 'Eclipse Dragonlord', pos: [5, 3] },
      { role: 'grandinquisitor', name: 'The Last Inquisitor', pos: [4, 1] },
    ],
    rewards: { gold: 2000, jp: 200, exp: 400, items: [{ id: 'crownSeal', qty: 2 }, { id: 'elixir', qty: 3 }] },
    recruits: [],
    intro: [{
      label: 'FINAL CHAPTER · THE CROWN BENEATH',
      title: 'The First and Last King',
      lines: [
        { speaker: 'Narration', text: 'At the bottom of the world there is a throne. On the throne there is a king. Around the king there is a crown, and around the crown there is a mouth.' },
        { speaker: 'First King', text: 'I was the first. I will be the last. You are only the middle, and the middle is always brief.' },
        { speaker: 'Sera', text: 'We have come a long way to be brief at you.' },
        { speaker: 'First King', text: 'Then come. The crown is hungry.' },
        { speaker: 'Bran', text: 'Hold the line.' },
        { speaker: 'Sera', text: 'No. Break it.' },
      ],
    }],
    outro: [{
      label: 'EPILOGUE · THE LIVING CROWN',
      title: 'What the Living Do',
      lines: [
        { speaker: 'Narration', text: 'The First King comes apart. The crown does not shatter; it simply stops pretending to be solid, and the ash of nine winters goes up the chimney of the world.' },
        { speaker: 'Narration', text: 'The dead lie down. The roads open. The kingdom is still broken, but it is broken in the way living things are broken: loudly, and with a future.' },
        { speaker: 'Sera', text: 'No new king. We bury the throne under salt and turn the hall into a granary.' },
        { speaker: 'Bran', text: 'And then?' },
        { speaker: 'Sera', text: 'Then we go south. There is a town that does not know it has been saved.' },
        { speaker: 'Narration', text: 'The Ashen Company walks south. There is no song. There is a road, and the sound of five people breathing.' },
      ],
    }],
  },
];

export const ENCOUNTERS = CHAPTER_DEFS.map((def, index) => ({
  id: def.id,
  num: def.num,
  chapter: def.chapter,
  chapterName: def.name,
  title: def.name,
  subtitle: def.subtitle,
  objective: def.objective,
  map: MAPS[def.map],
  playerSpawns: def.spawns,
  enemySpecs: def.enemies,
  rewards: def.rewards,
  recruits: def.recruits || [],
  intro: def.intro,
  outro: def.outro,
  recommendedLevel: recommendedLevel(index),
}));

export const PROLOGUE = [
  {
    label: 'PROLOGUE · THE BELL THAT WOULD NOT RING',
    title: 'Nine Winters',
    lines: [
      { speaker: 'Narration', text: 'The kingdom of Vaer died nine winters ago, but nobody told the crown.' },
      { speaker: 'Narration', text: 'King Aldric was buried with full rites. The Pale Regent took the throne the same night, and the bell in the high tower has not rung since.' },
      { speaker: 'Narration', text: 'The dead do not need to be told to come back. They only need to be invited.' },
    ],
  },
  {
    label: 'PROLOGUE · THE ASHEN COMPANY',
    title: 'A Direction, Mostly',
    lines: [
      { speaker: 'Narration', text: 'They are not heroes. They are the people who were still standing when the smoke cleared.' },
      { speaker: 'Sera', text: 'We take the crown. Then we decide what to do with it.' },
      { speaker: 'Bran', text: 'That is not a plan.' },
      { speaker: 'Sera', text: 'It has a direction in it. That is more than the kingdom has.' },
    ],
  },
];

export const CHAPTERS = ENCOUNTERS.map((enc, i) => ({
  num: enc.chapter, name: enc.name, blurb: enc.subtitle, recommendedLevel: recommendedLevel(i),
}));
