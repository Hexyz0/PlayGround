/* ============================================================
   THE HOLLOW CROWN — game data
   Jobs, arts, equipment, encounters and story.
   ============================================================ */

export const TERRAIN = {
  '.': { name: 'Stone',    elev: 0, cost: 1, color: '#2b2831', edge: '#39343f' },
  ',': { name: 'Grass',    elev: 0, cost: 1, color: '#252f27', edge: '#33402f', evade: 8 },
  '^': { name: 'High Ground', elev: 1, cost: 2, color: '#3a3326', edge: '#4c4330' },
  '=': { name: 'Bridge',   elev: 0, cost: 1, color: '#3a2f23', edge: '#4d3d2c' },
  '~': { name: 'Black Water', elev: 0, cost: 99, color: '#142a35', edge: '#1d3b48', block: true },
  '#': { name: 'Ruin',     elev: 2, cost: 99, color: '#19161c', edge: '#28222d', block: true },
  'x': { name: 'Void',     elev: 0, cost: 99, color: '#08070a', edge: '#08070a', block: true },
};

/* ------------------------------------------------------------
   JOBS
   ------------------------------------------------------------ */
export const JOBS = {
  squire: {
    id: 'squire', name: 'Squire', role: 'Vanguard', color: '#b9a273', sigil: '†',
    blurb: 'A soldier of the broken levy. Plain steel, stubborn heart.',
    move: 4, jump: 2, weapons: ['sword', 'spear'],
    bonus: { hp: 20, mp: 6, pa: 4, ma: 0, def: 3, res: 1, spd: 1, luck: 1 },
    arts: [
      { id: 'guard', name: 'Guard', desc: 'Brace yourself: +35% DEF for 3 turns.', mp: 4, jp: 15, req: 0, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'defUp', turns: 3, value: 0.35 }] },
      { id: 'powerStrike', name: 'Power Strike', desc: 'A heavy blow dealing 120% physical damage.', mp: 6, jp: 20, req: 0, range: 1, aoe: 0, power: 120, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'rally', name: 'Rally', desc: 'Allies within 1 tile gain +25% PA for 3 turns.', mp: 12, jp: 35, req: 1, range: 2, aoe: 1, kind: 'buff', target: 'ally', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.25 }] },
      { id: 'shieldWall', name: 'Shield Wall', desc: 'Grant an ally a 70-point barrier.', mp: 14, jp: 55, req: 2, range: 1, aoe: 0, kind: 'buff', target: 'ally', affect: 'allies', statuses: [{ id: 'shield', turns: 4, value: 70 }] },
      { id: 'lastStand', name: 'Last Stand', desc: 'Gain +30% PA and +30% DEF for 4 turns.', mp: 20, jp: 80, req: 3, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 4, value: 0.3 }, { id: 'defUp', turns: 4, value: 0.3 }] },
    ],
  },

  knight: {
    id: 'knight', name: 'Knight', role: 'Bulwark', color: '#8d9bb0', sigil: '⛨',
    blurb: 'The last oath of a drowned order. A wall that bleeds.',
    move: 3, jump: 2, weapons: ['sword', 'spear'],
    bonus: { hp: 50, mp: 0, pa: 7, ma: 0, def: 9, res: 2, spd: -1, luck: 0 },
    arts: [
      { id: 'shieldBash', name: 'Shield Bash', desc: '90% physical damage and stun for 1 turn.', mp: 8, jp: 20, req: 0, range: 1, aoe: 0, power: 90, kind: 'phys', target: 'enemy', affect: 'enemies', statuses: [{ id: 'stun', turns: 1 }] },
      { id: 'ironGuard', name: 'Iron Guard', desc: '+45% DEF for 3 turns.', mp: 6, jp: 25, req: 0, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'defUp', turns: 3, value: 0.45 }] },
      { id: 'provoke', name: 'Provoke', desc: 'Sunder an enemy\'s guard: -30% DEF for 3 turns.', mp: 10, jp: 35, req: 1, range: 2, aoe: 0, kind: 'debuff', target: 'enemy', affect: 'enemies', statuses: [{ id: 'defDown', turns: 3, value: 0.3 }] },
      { id: 'crushingBlow', name: 'Crushing Blow', desc: '160% physical damage. Slow but ruinous.', mp: 14, jp: 60, req: 2, range: 1, aoe: 0, power: 160, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'unyielding', name: 'Unyielding', desc: 'Gain a 90-point barrier and regeneration for 3 turns.', mp: 18, jp: 85, req: 3, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'shield', turns: 4, value: 90 }, { id: 'regen', turns: 3, value: 0.08 }] },
    ],
  },

  duelist: {
    id: 'duelist', name: 'Duelist', role: 'Blade', color: '#c98f6d', sigil: '⚔',
    blurb: 'A court blade with no court left. Speed is armour.',
    move: 4, jump: 3, weapons: ['sword', 'dagger'],
    bonus: { hp: 24, mp: 8, pa: 8, ma: 0, def: 3, res: 2, spd: 5, luck: 2 },
    arts: [
      { id: 'lunge', name: 'Lunge', desc: '110% physical damage at 2 tiles.', mp: 6, jp: 18, req: 0, range: 2, aoe: 0, power: 110, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'riposte', name: 'Riposte', desc: 'Counter physical attacks for 3 turns.', mp: 10, jp: 25, req: 0, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'riposte', turns: 3 }] },
      { id: 'feint', name: 'Feint', desc: '80% damage and -25% DEF for 2 turns.', mp: 8, jp: 35, req: 1, range: 1, aoe: 0, power: 80, kind: 'phys', target: 'enemy', affect: 'enemies', statuses: [{ id: 'defDown', turns: 2, value: 0.25 }] },
      { id: 'bladeDance', name: 'Blade Dance', desc: 'Two strikes of 70% physical damage.', mp: 12, jp: 60, req: 2, range: 1, aoe: 0, power: 70, hits: 2, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'execution', name: 'Execution', desc: '180% damage; +60% more against wounded foes.', mp: 18, jp: 90, req: 3, range: 1, aoe: 0, power: 180, kind: 'phys', target: 'enemy', affect: 'enemies', execute: true },
    ],
  },

  archer: {
    id: 'archer', name: 'Archer', role: 'Marksman', color: '#93ad7d', sigil: '➶',
    blurb: 'Patience, breath, release. The arrow remembers.',
    move: 4, jump: 3, weapons: ['bow'],
    bonus: { hp: 18, mp: 6, pa: 6, ma: 0, def: 2, res: 1, spd: 3, luck: 2 },
    arts: [
      { id: 'pinDown', name: 'Pin Down', desc: '90% damage and -30% SPD for 3 turns.', mp: 8, jp: 20, req: 0, range: 4, aoe: 0, power: 90, kind: 'phys', target: 'enemy', affect: 'enemies', statuses: [{ id: 'slow', turns: 3, value: 0.3 }] },
      { id: 'aim', name: 'Aim', desc: '+30% PA for 2 turns.', mp: 5, jp: 25, req: 0, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 2, value: 0.3 }] },
      { id: 'rainArrows', name: 'Rain of Arrows', desc: '80% damage to all foes in a 1-tile radius.', mp: 14, jp: 40, req: 1, range: 4, aoe: 1, power: 80, kind: 'phys', target: 'tile', affect: 'enemies' },
      { id: 'piercingShot', name: 'Piercing Shot', desc: '140% damage that ignores half of DEF.', mp: 12, jp: 60, req: 2, range: 4, aoe: 0, power: 140, kind: 'phys', target: 'enemy', affect: 'enemies', pierce: 0.5 },
      { id: 'hunterMark', name: 'Hunter\'s Mark', desc: 'Mark a foe: -30% DEF and -30% SPD for 3 turns.', mp: 14, jp: 75, req: 3, range: 4, aoe: 0, kind: 'debuff', target: 'enemy', affect: 'enemies', statuses: [{ id: 'defDown', turns: 3, value: 0.3 }, { id: 'slow', turns: 3, value: 0.3 }] },
    ],
  },

  blackmage: {
    id: 'blackmage', name: 'Black Mage', role: 'Destroyer', color: '#9a6fb5', sigil: '✶',
    blurb: 'Forbidden grammar. The sky answers in fire.',
    move: 3, jump: 2, weapons: ['staff', 'grimoire'],
    bonus: { hp: 8, mp: 30, pa: 1, ma: 9, def: 1, res: 4, spd: 2, luck: 1 },
    arts: [
      { id: 'ember', name: 'Ember', desc: '120% fire magic at 4 tiles.', mp: 8, jp: 18, req: 0, range: 4, aoe: 0, power: 120, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'fire' },
      { id: 'frost', name: 'Frost', desc: '100% ice magic and -30% SPD for 3 turns.', mp: 10, jp: 22, req: 0, range: 4, aoe: 0, power: 100, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'ice', statuses: [{ id: 'slow', turns: 3, value: 0.3 }] },
      { id: 'umbralBolt', name: 'Umbral Bolt', desc: '130% dark magic in a 1-tile radius.', mp: 18, jp: 40, req: 1, range: 4, aoe: 1, power: 130, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark' },
      { id: 'flameWall', name: 'Flame Wall', desc: '150% fire magic in a 1-tile radius.', mp: 22, jp: 60, req: 2, range: 4, aoe: 1, power: 150, kind: 'mag', target: 'tile', affect: 'enemies', element: 'fire', statuses: [{ id: 'burn', turns: 3, value: 0.06 }] },
      { id: 'voidRend', name: 'Void Rend', desc: '180% dark magic in a 1-tile radius.', mp: 30, jp: 90, req: 3, range: 5, aoe: 1, power: 180, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark' },
    ],
  },

  whitemage: {
    id: 'whitemage', name: 'White Mage', role: 'Light', color: '#d8cba4', sigil: '✚',
    blurb: 'The old prayers still work. That is the terrible part.',
    move: 3, jump: 2, weapons: ['staff'],
    bonus: { hp: 12, mp: 34, pa: 0, ma: 7, def: 2, res: 6, spd: 2, luck: 1 },
    arts: [
      { id: 'mend', name: 'Mend', desc: 'Restore 100% MA + 25 HP to an ally within 3 tiles.', mp: 8, jp: 18, req: 0, range: 3, aoe: 0, power: 100, kind: 'heal', target: 'ally', affect: 'allies' },
      { id: 'blessing', name: 'Blessing', desc: 'Heal all allies in a 1-tile radius.', mp: 16, jp: 28, req: 0, range: 3, aoe: 1, power: 80, kind: 'heal', target: 'ally', affect: 'allies' },
      { id: 'cleanse', name: 'Cleanse', desc: 'Remove all curses from an ally.', mp: 10, jp: 35, req: 1, range: 3, aoe: 0, kind: 'support', target: 'ally', affect: 'allies', cleanse: true },
      { id: 'sanctuary', name: 'Sanctuary', desc: 'Heal and grant regeneration in a 1-tile radius.', mp: 22, jp: 60, req: 2, range: 4, aoe: 1, power: 90, kind: 'heal', target: 'ally', affect: 'allies', statuses: [{ id: 'regen', turns: 3, value: 0.08 }] },
      { id: 'riteOfReturn', name: 'Rite of Return', desc: 'Revive a fallen ally with 45% HP.', mp: 30, jp: 95, req: 3, range: 3, aoe: 0, power: 45, kind: 'revive', target: 'deadAlly', affect: 'allies' },
    ],
  },

  inquisitor: {
    id: 'inquisitor', name: 'Inquisitor', role: 'Zealot', color: '#c2b06f', sigil: '☩',
    blurb: 'Faith sharpened into a weapon. Mercy is a later draft.',
    move: 4, jump: 2, weapons: ['staff', 'sword'],
    bonus: { hp: 22, mp: 24, pa: 4, ma: 6, def: 3, res: 5, spd: 2, luck: 1 },
    arts: [
      { id: 'smite', name: 'Smite', desc: '110% holy magic at 3 tiles.', mp: 8, jp: 20, req: 0, range: 3, aoe: 0, power: 110, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'holy' },
      { id: 'rebuke', name: 'Rebuke', desc: '100% holy damage and silence for 2 turns.', mp: 12, jp: 35, req: 1, range: 3, aoe: 0, power: 100, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'holy', statuses: [{ id: 'silence', turns: 2 }] },
      { id: 'purge', name: 'Purge', desc: '120% holy magic in a 1-tile radius.', mp: 18, jp: 45, req: 1, range: 3, aoe: 1, power: 120, kind: 'mag', target: 'tile', affect: 'enemies', element: 'holy' },
      { id: 'judgment', name: 'Judgment', desc: '160% holy damage and -30% DEF.', mp: 20, jp: 65, req: 2, range: 3, aoe: 0, power: 160, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'holy', statuses: [{ id: 'defDown', turns: 3, value: 0.3 }] },
      { id: 'absolution', name: 'Absolution', desc: 'Heal an ally and cleanse their curses.', mp: 18, jp: 90, req: 3, range: 3, aoe: 0, power: 110, kind: 'heal', target: 'ally', affect: 'allies', cleanse: true },
    ],
  },

  thief: {
    id: 'thief', name: 'Thief', role: 'Shadow', color: '#7f9c8e', sigil: '❖',
    blurb: 'The dead still carry coin. Someone has to take it.',
    move: 5, jump: 3, weapons: ['dagger', 'bow'],
    bonus: { hp: 16, mp: 10, pa: 5, ma: 0, def: 2, res: 1, spd: 7, luck: 3 },
    arts: [
      { id: 'steal', name: 'Steal', desc: 'Lift 45–90 gold from an adjacent foe.', mp: 4, jp: 20, req: 0, range: 1, aoe: 0, kind: 'steal', target: 'enemy', affect: 'enemies', steal: [45, 90] },
      { id: 'smoke', name: 'Smoke', desc: '+30% evasion for 2 turns.', mp: 8, jp: 25, req: 0, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'evade', turns: 2, value: 30 }] },
      { id: 'backstab', name: 'Backstab', desc: '130% physical damage; brutal from behind.', mp: 10, jp: 40, req: 1, range: 1, aoe: 0, power: 130, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'pilfer', name: 'Pilfer', desc: '90% damage and steal 60–120 gold.', mp: 12, jp: 55, req: 2, range: 1, aoe: 0, power: 90, kind: 'phys', target: 'enemy', affect: 'enemies', steal: [60, 120] },
      { id: 'shadowstep', name: 'Shadowstep', desc: 'Gain haste and +25% evasion for 3 turns.', mp: 16, jp: 80, req: 3, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'haste', turns: 3, value: 0.35 }, { id: 'evade', turns: 3, value: 25 }] },
    ],
  },

  darkknight: {
    id: 'darkknight', name: 'Dark Knight', role: 'Reaver', color: '#9c5b63', sigil: '☠',
    blurb: 'Every wound is a door. Every door takes something.',
    move: 4, jump: 2, weapons: ['sword', 'spear'],
    bonus: { hp: 44, mp: 12, pa: 9, ma: 3, def: 6, res: 2, spd: 1, luck: 0 },
    arts: [
      { id: 'dreadBlade', name: 'Dread Blade', desc: '120% damage; heal for half the harm dealt.', mp: 10, jp: 22, req: 0, range: 1, aoe: 0, power: 120, kind: 'phys', target: 'enemy', affect: 'enemies', drain: 0.5 },
      { id: 'bloodPrice', name: 'Blood Price', desc: 'Pay 15% HP for +40% PA for 3 turns.', mp: 6, jp: 28, req: 0, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.4 }], selfDamage: 0.15 },
      { id: 'graveWave', name: 'Grave Wave', desc: '120% dark magic in a 1-tile radius.', mp: 16, jp: 45, req: 1, range: 3, aoe: 1, power: 120, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark' },
      { id: 'soulReaver', name: 'Soul Reaver', desc: '150% damage; heal for 70% of the harm dealt.', mp: 18, jp: 65, req: 2, range: 1, aoe: 0, power: 150, kind: 'phys', target: 'enemy', affect: 'enemies', drain: 0.7 },
      { id: 'doom', name: 'Doom', desc: '160% dark magic and poison for 4 turns.', mp: 22, jp: 90, req: 3, range: 3, aoe: 0, power: 160, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'dark', statuses: [{ id: 'poison', turns: 4, value: 0.08 }] },
    ],
  },

  dragoon: {
    id: 'dragoon', name: 'Dragoon', role: 'Lancer', color: '#b58f5b', sigil: '⤒',
    blurb: 'They leapt from the burning walls and never came down.',
    move: 4, jump: 5, weapons: ['spear'],
    bonus: { hp: 36, mp: 8, pa: 8, ma: 0, def: 5, res: 2, spd: 3, luck: 1 },
    arts: [
      { id: 'leap', name: 'Leap', desc: '130% damage at 2 tiles.', mp: 8, jp: 22, req: 0, range: 2, aoe: 0, power: 130, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'highJump', name: 'High Jump', desc: '160% damage at 3 tiles.', mp: 12, jp: 40, req: 1, range: 3, aoe: 0, power: 160, kind: 'phys', target: 'enemy', affect: 'enemies' },
      { id: 'skyfall', name: 'Skyfall', desc: '120% damage to all foes in a 1-tile radius.', mp: 18, jp: 60, req: 2, range: 2, aoe: 1, power: 120, kind: 'phys', target: 'tile', affect: 'enemies' },
      { id: 'dragonHeart', name: 'Dragon Heart', desc: '+30% PA and haste for 3 turns.', mp: 16, jp: 85, req: 3, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.3 }, { id: 'haste', turns: 3, value: 0.3 }] },
    ],
  },

  necromancer: {
    id: 'necromancer', name: 'Necromancer', role: 'Gravecaller', color: '#7d6b9c', sigil: '☾',
    blurb: 'The throne is empty. The dead are patient. Ask them.',
    move: 3, jump: 2, weapons: ['staff', 'grimoire'],
    bonus: { hp: 20, mp: 32, pa: 2, ma: 10, def: 2, res: 5, spd: 1, luck: 1 },
    arts: [
      { id: 'boneSpear', name: 'Bone Spear', desc: '110% dark magic at 3 tiles.', mp: 8, jp: 22, req: 0, range: 3, aoe: 0, power: 110, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'dark' },
      { id: 'raiseThrall', name: 'Raise Thrall', desc: 'Summon a skeletal thrall to fight for you.', mp: 20, jp: 30, req: 0, range: 2, aoe: 0, kind: 'summon', target: 'tile', affect: 'allies', summon: { name: 'Thrall', job: 'squire', level: 1, hp: 42, pa: 12, ma: 2, def: 5, res: 2, spd: 8, move: 4, jump: 2, weapon: { name: 'Bone Claws', atk: 4, range: 1, type: 'sword' }, abilities: ['powerStrike'], color: '#8c8478' } },
      { id: 'curse', name: 'Curse', desc: '-30% DEF and poison for 3 turns.', mp: 14, jp: 40, req: 1, range: 3, aoe: 0, kind: 'debuff', target: 'enemy', affect: 'enemies', statuses: [{ id: 'defDown', turns: 3, value: 0.3 }, { id: 'poison', turns: 3, value: 0.07 }] },
      { id: 'deathGrasp', name: 'Death Grasp', desc: '150% dark damage; heal for half the harm dealt.', mp: 20, jp: 60, req: 2, range: 3, aoe: 0, power: 150, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'dark', drain: 0.5 },
      { id: 'plague', name: 'Plague', desc: '130% dark magic and poison in a 2-tile radius.', mp: 28, jp: 90, req: 3, range: 4, aoe: 2, power: 130, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark', statuses: [{ id: 'poison', turns: 4, value: 0.07 }] },
    ],
  },

  runefencer: {
    id: 'runefencer', name: 'Rune Fencer', role: 'Spellblade', color: '#6f9fb3', sigil: 'ᛉ',
    blurb: 'Old words cut both ways. So does the sword.',
    move: 4, jump: 3, weapons: ['sword', 'staff'],
    bonus: { hp: 28, mp: 20, pa: 5, ma: 6, def: 4, res: 4, spd: 3, luck: 1 },
    arts: [
      { id: 'runeBlade', name: 'Rune Blade', desc: '110% hybrid damage at 1 tile.', mp: 8, jp: 20, req: 0, range: 1, aoe: 0, power: 110, kind: 'hybrid', target: 'enemy', affect: 'enemies' },
      { id: 'ward', name: 'Ward', desc: '+45% RES to an ally for 3 turns.', mp: 8, jp: 24, req: 0, range: 2, aoe: 0, kind: 'buff', target: 'ally', affect: 'allies', statuses: [{ id: 'ward', turns: 3, value: 0.45 }] },
      { id: 'sunder', name: 'Sunder', desc: '120% damage and -25% DEF for 3 turns.', mp: 12, jp: 40, req: 1, range: 1, aoe: 0, power: 120, kind: 'hybrid', target: 'enemy', affect: 'enemies', statuses: [{ id: 'defDown', turns: 3, value: 0.25 }] },
      { id: 'aetherBolt', name: 'Aether Bolt', desc: '140% magic at 4 tiles.', mp: 18, jp: 60, req: 2, range: 4, aoe: 0, power: 140, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'arcane' },
      { id: 'runeOfFlame', name: 'Rune of Flame', desc: 'Ally gains +30% PA and haste for 3 turns.', mp: 18, jp: 80, req: 3, range: 2, aoe: 0, kind: 'buff', target: 'ally', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.3 }, { id: 'haste', turns: 3, value: 0.3 }] },
    ],
  },

  /* ================= ADVANCED JOBS (promotion, Lv 10) ================= */
  banneret: {
    id: 'banneret', name: 'Banneret', role: 'Commander', tier: 2, promotesFrom: 'squire', color: '#d8b978', sigil: '⚑',
    blurb: 'A squire who survived long enough to become the flag others rally to.',
    move: 4, jump: 2, weapons: ['sword', 'spear'],
    bonus: { hp: 45, mp: 20, pa: 10, ma: 2, def: 8, res: 4, spd: 3, luck: 3 },
    arts: [
      { id: 'command', name: 'Command', desc: 'All allies within 2 tiles gain +30% PA and haste for 3 turns.', mp: 20, jp: 60, req: 0, range: 0, aoe: 2, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.3 }, { id: 'haste', turns: 3, value: 0.3 }] },
      { id: 'holdTheLine', name: 'Hold the Line', desc: 'All allies within 2 tiles gain a 90-point barrier.', mp: 24, jp: 90, req: 1, range: 0, aoe: 2, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'shield', turns: 4, value: 90 }] },
      { id: 'rallyCry', name: 'Rally Cry', desc: 'Heal and cleanse all allies within 2 tiles.', mp: 26, jp: 120, req: 2, range: 0, aoe: 2, power: 90, kind: 'heal', target: 'self', affect: 'allies', cleanse: true },
    ],
  },
  paladin: {
    id: 'paladin', name: 'Paladin', role: 'Holy Wall', tier: 2, promotesFrom: 'knight', color: '#d7d0b4', sigil: '✠',
    blurb: 'The oath, finally given something worth guarding.',
    move: 4, jump: 2, weapons: ['sword', 'spear'],
    bonus: { hp: 70, mp: 24, pa: 12, ma: 5, def: 13, res: 8, spd: 2, luck: 2 },
    arts: [
      { id: 'holyBlade', name: 'Holy Blade', desc: '150% hybrid damage; heal yourself for 30% of the harm.', mp: 16, jp: 60, req: 0, range: 1, aoe: 0, power: 150, kind: 'hybrid', target: 'enemy', affect: 'enemies', element: 'holy', drain: 0.3 },
      { id: 'aegis', name: 'Aegis', desc: 'An ally gains +50% DEF/RES and a 70-point barrier.', mp: 22, jp: 90, req: 1, range: 3, aoe: 0, kind: 'buff', target: 'ally', affect: 'allies', statuses: [{ id: 'defUp', turns: 3, value: 0.5 }, { id: 'ward', turns: 3, value: 0.5 }, { id: 'shield', turns: 3, value: 70 }] },
      { id: 'lanceOfDawn', name: 'Lance of Dawn', desc: '180% holy damage at 2 tiles.', mp: 26, jp: 120, req: 2, range: 2, aoe: 0, power: 180, kind: 'hybrid', target: 'enemy', affect: 'enemies', element: 'holy' },
    ],
  },
  swordmaster: {
    id: 'swordmaster', name: 'Swordmaster', role: 'Blade Saint', tier: 2, promotesFrom: 'duelist', color: '#e0a07a', sigil: '⚔',
    blurb: 'The duel is over before the other person knows it began.',
    move: 5, jump: 3, weapons: ['sword', 'dagger'],
    bonus: { hp: 42, mp: 16, pa: 14, ma: 2, def: 5, res: 4, spd: 10, luck: 4 },
    arts: [
      { id: 'iai', name: 'Iai', desc: '130% damage with +25% critical chance.', mp: 14, jp: 60, req: 0, range: 1, aoe: 0, power: 130, kind: 'phys', target: 'enemy', affect: 'enemies', critBonus: 0.25 },
      { id: 'windSlash', name: 'Wind Slash', desc: '120% damage to foes in a line up to 3 tiles.', mp: 18, jp: 90, req: 1, range: 3, aoe: 1, power: 120, kind: 'phys', target: 'tile', affect: 'enemies' },
      { id: 'mirrorStance', name: 'Mirror Stance', desc: 'Gain riposte and +35% evasion for 3 turns.', mp: 20, jp: 120, req: 2, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'riposte', turns: 3 }, { id: 'evade', turns: 3, value: 35 }] },
    ],
  },
  sniper: {
    id: 'sniper', name: 'Sniper', role: 'Deadeye', tier: 2, promotesFrom: 'archer', color: '#b4cf96', sigil: '➶',
    blurb: 'One breath. One arrow. One less problem in the world.',
    move: 4, jump: 3, weapons: ['bow'],
    bonus: { hp: 34, mp: 16, pa: 13, ma: 2, def: 4, res: 3, spd: 7, luck: 4 },
    arts: [
      { id: 'deadeye', name: 'Deadeye', desc: '180% damage at 5 tiles with +20% critical chance.', mp: 18, jp: 60, req: 0, range: 5, aoe: 0, power: 180, kind: 'phys', target: 'enemy', affect: 'enemies', critBonus: 0.2 },
      { id: 'arrowStorm', name: 'Arrow Storm', desc: '110% damage to all foes in a 2-tile radius.', mp: 26, jp: 90, req: 1, range: 5, aoe: 2, power: 110, kind: 'phys', target: 'tile', affect: 'enemies' },
      { id: 'focus', name: 'Focus', desc: '+45% PA and +20% critical chance for 3 turns.', mp: 18, jp: 120, req: 2, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.45 }, { id: 'focus', turns: 3, value: 20 }] },
    ],
  },
  archmage: {
    id: 'archmage', name: 'Archmage', role: 'Cataclysm', tier: 2, promotesFrom: 'blackmage', color: '#b88bd6', sigil: '✶',
    blurb: 'The forbidden grammar, spoken fluently.',
    move: 3, jump: 2, weapons: ['staff', 'grimoire'],
    bonus: { hp: 24, mp: 60, pa: 2, ma: 18, def: 2, res: 10, spd: 3, luck: 2 },
    arts: [
      { id: 'meteor', name: 'Meteor', desc: '170% fire magic in a 2-tile radius.', mp: 34, jp: 60, req: 0, range: 5, aoe: 2, power: 170, kind: 'mag', target: 'tile', affect: 'enemies', element: 'fire' },
      { id: 'chainLightning', name: 'Chain Lightning', desc: '150% lightning magic in a 1-tile radius.', mp: 26, jp: 90, req: 1, range: 5, aoe: 1, power: 150, kind: 'mag', target: 'tile', affect: 'enemies', element: 'lightning', statuses: [{ id: 'stun', turns: 1 }] },
      { id: 'manaSurge', name: 'Mana Surge', desc: 'Restore 70 MP to an ally.', mp: 0, jp: 120, req: 2, range: 3, aoe: 0, power: 70, kind: 'mp', target: 'ally', affect: 'allies' },
    ],
  },
  bishop: {
    id: 'bishop', name: 'Bishop', role: 'Sanctuary', tier: 2, promotesFrom: 'whitemage', color: '#f0e4b8', sigil: '✚',
    blurb: 'The prayers are answered now. The answers are not kind.',
    move: 3, jump: 2, weapons: ['staff'],
    bonus: { hp: 34, mp: 60, pa: 2, ma: 14, def: 4, res: 14, spd: 3, luck: 3 },
    arts: [
      { id: 'massMend', name: 'Mass Mend', desc: 'Heal all allies in a 2-tile radius.', mp: 30, jp: 60, req: 0, range: 4, aoe: 2, power: 120, kind: 'heal', target: 'ally', affect: 'allies' },
      { id: 'holyNova', name: 'Holy Nova', desc: '130% holy damage and heal allies in a 2-tile radius.', mp: 32, jp: 90, req: 1, range: 4, aoe: 2, power: 130, kind: 'mag', target: 'tile', affect: 'all', element: 'holy', healAllies: 0.5 },
      { id: 'resurrection', name: 'Resurrection', desc: 'Revive a fallen ally at 80% HP.', mp: 40, jp: 120, req: 2, range: 4, aoe: 0, power: 80, kind: 'revive', target: 'deadAlly', affect: 'allies' },
    ],
  },
  grandinquisitor: {
    id: 'grandinquisitor', name: 'Grand Inquisitor', role: 'Verdict', tier: 2, promotesFrom: 'inquisitor', color: '#e8d27a', sigil: '☩',
    blurb: 'The list of names is complete. The reading is about to begin.',
    move: 4, jump: 2, weapons: ['staff', 'sword'],
    bonus: { hp: 44, mp: 44, pa: 9, ma: 13, def: 8, res: 11, spd: 3, luck: 2 },
    arts: [
      { id: 'verdict', name: 'Verdict', desc: '170% holy damage; +50% more against the wounded.', mp: 22, jp: 60, req: 0, range: 4, aoe: 0, power: 170, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'holy', execute: true },
      { id: 'wrathOfHeaven', name: 'Wrath of Heaven', desc: '150% holy magic in a 2-tile radius.', mp: 32, jp: 90, req: 1, range: 4, aoe: 2, power: 150, kind: 'mag', target: 'tile', affect: 'enemies', element: 'holy' },
      { id: 'grandSanctuary', name: 'Sanctuary', desc: 'Heal, cleanse and grant regeneration to all allies in 2 tiles.', mp: 30, jp: 120, req: 2, range: 4, aoe: 2, power: 100, kind: 'heal', target: 'ally', affect: 'allies', cleanse: true, statuses: [{ id: 'regen', turns: 3, value: 0.08 }] },
    ],
  },
  shadowlord: {
    id: 'shadowlord', name: 'Shadowlord', role: 'Nightfall', tier: 2, promotesFrom: 'thief', color: '#8fb5a4', sigil: '❖',
    blurb: 'What the dark does when it has learned to hold a knife.',
    move: 5, jump: 4, weapons: ['dagger', 'bow'],
    bonus: { hp: 34, mp: 24, pa: 11, ma: 2, def: 4, res: 4, spd: 12, luck: 5 },
    arts: [
      { id: 'assassinate', name: 'Assassinate', desc: '160% damage; +80% more against wounded foes.', mp: 20, jp: 60, req: 0, range: 1, aoe: 0, power: 160, kind: 'phys', target: 'enemy', affect: 'enemies', execute: true },
      { id: 'plagueDagger', name: 'Plague Dagger', desc: '120% damage and poison for 4 turns.', mp: 16, jp: 90, req: 1, range: 1, aoe: 0, power: 120, kind: 'phys', target: 'enemy', affect: 'enemies', statuses: [{ id: 'poison', turns: 4, value: 0.09 }] },
      { id: 'nightfall', name: 'Nightfall', desc: 'Gain haste, +40% evasion and riposte for 3 turns.', mp: 24, jp: 120, req: 2, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'haste', turns: 3, value: 0.4 }, { id: 'evade', turns: 3, value: 40 }, { id: 'riposte', turns: 3 }] },
    ],
  },
  reaver: {
    id: 'reaver', name: 'Reaver', role: 'Blood Oath', tier: 2, promotesFrom: 'darkknight', color: '#c16b76', sigil: '☠',
    blurb: 'The door in every wound, opened from the other side.',
    move: 4, jump: 2, weapons: ['sword', 'spear'],
    bonus: { hp: 70, mp: 28, pa: 16, ma: 6, def: 10, res: 5, spd: 2, luck: 1 },
    arts: [
      { id: 'bloodstorm', name: 'Bloodstorm', desc: '140% damage in a 1-tile radius; heal for 40% of harm.', mp: 26, jp: 60, req: 0, range: 2, aoe: 1, power: 140, kind: 'phys', target: 'tile', affect: 'enemies', drain: 0.4 },
      { id: 'dreadAura', name: 'Dread Aura', desc: 'All foes within 2 tiles lose 30% DEF and 30% SPD.', mp: 22, jp: 90, req: 1, range: 0, aoe: 2, kind: 'debuff', target: 'self', affect: 'enemies', statuses: [{ id: 'defDown', turns: 3, value: 0.3 }, { id: 'slow', turns: 3, value: 0.3 }] },
      { id: 'reap', name: 'Reap', desc: '210% damage; heal for 80% of the harm dealt.', mp: 30, jp: 120, req: 2, range: 1, aoe: 0, power: 210, kind: 'phys', target: 'enemy', affect: 'enemies', drain: 0.8 },
    ],
  },
  dragonlord: {
    id: 'dragonlord', name: 'Dragonlord', role: 'Skyfall', tier: 2, promotesFrom: 'dragoon', color: '#d6a463', sigil: '⤒',
    blurb: 'The sky remembers the shape of wings.',
    move: 5, jump: 7, weapons: ['spear'],
    bonus: { hp: 60, mp: 24, pa: 14, ma: 4, def: 9, res: 5, spd: 4, luck: 2 },
    arts: [
      { id: 'dragonDive', name: 'Dragon Dive', desc: '150% damage to all foes in a 1-tile radius at 3 tiles.', mp: 24, jp: 60, req: 0, range: 3, aoe: 1, power: 150, kind: 'phys', target: 'tile', affect: 'enemies' },
      { id: 'wyrmBreath', name: 'Wyrm Breath', desc: '150% fire magic in a 2-tile radius.', mp: 30, jp: 90, req: 1, range: 3, aoe: 2, power: 150, kind: 'mag', target: 'tile', affect: 'enemies', element: 'fire', statuses: [{ id: 'burn', turns: 3, value: 0.06 }] },
      { id: 'skySunder', name: 'Sky Sunder', desc: '230% damage to a single foe at 2 tiles.', mp: 32, jp: 120, req: 2, range: 2, aoe: 0, power: 230, kind: 'phys', target: 'enemy', affect: 'enemies' },
    ],
  },
  lich: {
    id: 'lich', name: 'Lich', role: 'Deathless', tier: 2, promotesFrom: 'necromancer', color: '#9b86c4', sigil: '☾',
    blurb: 'Death was a door. It has been left open.',
    move: 3, jump: 2, weapons: ['staff', 'grimoire'],
    bonus: { hp: 34, mp: 60, pa: 3, ma: 18, def: 4, res: 10, spd: 2, luck: 2 },
    arts: [
      { id: 'deathWave', name: 'Death Wave', desc: '160% dark magic in a 2-tile radius; heal for 30%.', mp: 32, jp: 60, req: 0, range: 4, aoe: 2, power: 160, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark', drain: 0.3 },
      { id: 'armyOfDead', name: 'Army of the Dead', desc: 'Summon two skeletal thralls.', mp: 36, jp: 90, req: 1, range: 2, aoe: 1, kind: 'summon', target: 'tile', affect: 'allies', summonCount: 2, summon: { name: 'Thrall', job: 'squire', level: 1, hp: 52, pa: 15, ma: 2, def: 6, res: 2, spd: 9, move: 4, jump: 2, weapon: { name: 'Bone Claws', atk: 5, range: 1, type: 'sword' }, abilities: ['powerStrike'], color: '#8c8478' } },
      { id: 'soulPact', name: 'Soul Pact', desc: '+50% MA and regeneration for 3 turns.', mp: 24, jp: 120, req: 2, range: 0, aoe: 0, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.5 }, { id: 'regen', turns: 3, value: 0.08 }] },
    ],
  },
  runelord: {
    id: 'runelord', name: 'Runelord', role: 'World Word', tier: 2, promotesFrom: 'runefencer', color: '#8cc3d8', sigil: 'ᛉ',
    blurb: 'Every rune is a sentence. This one is the whole book.',
    move: 4, jump: 3, weapons: ['sword', 'staff'],
    bonus: { hp: 48, mp: 44, pa: 10, ma: 13, def: 8, res: 9, spd: 4, luck: 2 },
    arts: [
      { id: 'runeStorm', name: 'Rune Storm', desc: '150% magic in a 2-tile radius.', mp: 30, jp: 60, req: 0, range: 4, aoe: 2, power: 150, kind: 'mag', target: 'tile', affect: 'enemies', element: 'arcane' },
      { id: 'prismWard', name: 'Prism Ward', desc: 'All allies within 2 tiles gain +50% DEF/RES.', mp: 26, jp: 90, req: 1, range: 0, aoe: 2, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'defUp', turns: 3, value: 0.5 }, { id: 'ward', turns: 3, value: 0.5 }] },
      { id: 'worldRune', name: 'World Rune', desc: '200% hybrid damage in a 1-tile radius.', mp: 34, jp: 120, req: 2, range: 3, aoe: 1, power: 200, kind: 'hybrid', target: 'tile', affect: 'enemies', element: 'arcane' },
    ],
  },
};

export const JOB_LIST = Object.values(JOBS);
export const BASE_JOBS = JOB_LIST.filter(j => !j.tier);
export const ADVANCED_JOBS = JOB_LIST.filter(j => j.tier === 2);
export const PROMOTIONS = Object.fromEntries(ADVANCED_JOBS.map(j => [j.promotesFrom, j.id]));

/* Extra, non-job arts used by bosses and special foes. */
export const EXTRA_ARTS = [
  { id: 'crownOfAsh', name: 'Crown of Ash', desc: '150% dark magic in a 2-tile radius.', mp: 26, jp: 0, req: 0, range: 5, aoe: 2, power: 150, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark' },
  { id: 'kingsCommand', name: "King's Command", desc: 'All allies gain +30% PA and DEF for 3 turns.', mp: 20, jp: 0, req: 0, range: 0, aoe: 8, kind: 'buff', target: 'self', affect: 'allies', statuses: [{ id: 'atkUp', turns: 3, value: 0.3 }, { id: 'defUp', turns: 3, value: 0.3 }] },
  { id: 'hollowBolt', name: 'Hollow Bolt', desc: '140% dark magic at 4 tiles.', mp: 12, jp: 0, req: 0, range: 4, aoe: 0, power: 140, kind: 'mag', target: 'enemy', affect: 'enemies', element: 'dark' },
  { id: 'gravemark', name: 'Gravemark', desc: '120% damage and slow in a 1-tile radius.', mp: 16, jp: 0, req: 0, range: 3, aoe: 1, power: 120, kind: 'mag', target: 'tile', affect: 'enemies', element: 'dark', statuses: [{ id: 'slow', turns: 3, value: 0.3 }] },
];

export const ARTS = {};
for (const job of JOB_LIST) for (const art of job.arts) ARTS[art.id] = { ...art, job: job.id };
for (const art of EXTRA_ARTS) ARTS[art.id] = art;

export function getArt(id) { return ARTS[id]; }

/* ------------------------------------------------------------
   EQUIPMENT & CONSUMABLES
   ------------------------------------------------------------ */
export const EQUIPMENT = [
  // Weapons
  { id: 'rustedSword', name: 'Rusted Sword', slot: 'weapon', type: 'sword', atk: 6, mag: 0, range: 1, cost: 60, glyph: '†', desc: 'Notched, but it remembers the hand that held it.' },
  { id: 'ashenBlade', name: 'Ashen Blade', slot: 'weapon', type: 'sword', atk: 14, mag: 0, range: 1, cost: 320, glyph: '†', desc: 'Forged in the last cold fire of the old smithy.' },
  { id: 'kingsbane', name: "King's Bane", slot: 'weapon', type: 'sword', atk: 24, mag: 4, range: 1, cost: 900, glyph: '†', desc: 'A blade with a crown etched into the fuller. It drinks.' },
  { id: 'ironSpear', name: 'Iron Spear', slot: 'weapon', type: 'spear', atk: 10, mag: 0, range: 2, cost: 120, glyph: '↑', desc: 'Reach is a kind of mercy: you die before you are close.' },
  { id: 'graveLance', name: 'Grave Lance', slot: 'weapon', type: 'spear', atk: 18, mag: 0, range: 2, cost: 420, glyph: '↑', desc: 'Tipped with a nail from a gallows.' },
  { id: 'huntingBow', name: 'Hunting Bow', slot: 'weapon', type: 'bow', atk: 8, mag: 0, range: 3, cost: 140, glyph: '➶', desc: 'Strung with sinew and patience.' },
  { id: 'blackthornBow', name: 'Blackthorn Bow', slot: 'weapon', type: 'bow', atk: 16, mag: 0, range: 4, cost: 460, glyph: '➶', desc: 'The wood still has thorns. It likes them.' },
  { id: 'boneDagger', name: 'Bone Dagger', slot: 'weapon', type: 'dagger', atk: 5, mag: 0, range: 1, cost: 70, glyph: '⌁', spd: 2, desc: 'Ground from something that used to have a name.' },
  { id: 'nightfang', name: 'Nightfang', slot: 'weapon', type: 'dagger', atk: 12, mag: 0, range: 1, cost: 360, glyph: '⌁', spd: 3, desc: 'A thin black smile of a blade.' },
  { id: 'oakStaff', name: 'Oak Staff', slot: 'weapon', type: 'staff', atk: 3, mag: 6, range: 2, cost: 110, glyph: '✶', desc: 'The grain runs in spirals if you look too long.' },
  { id: 'cinderStaff', name: 'Cinder Staff', slot: 'weapon', type: 'staff', atk: 4, mag: 14, range: 2, cost: 480, glyph: '✶', desc: 'Warm to the touch. Never quite cools.' },
  { id: 'reliquary', name: 'Reliquary Staff', slot: 'weapon', type: 'staff', atk: 3, mag: 10, range: 2, cost: 380, glyph: '✶', res: 4, desc: 'A saint\'s fingerbone, set in silver. It points down.' },
  { id: 'grimoire', name: 'Grimoire of Ash', slot: 'weapon', type: 'grimoire', atk: 2, mag: 12, range: 2, cost: 520, glyph: '▤', desc: 'Every page is the same page. It is always burning.' },
  // Armour
  { id: 'travelersGarb', name: "Traveler's Garb", slot: 'armor', type: 'light', def: 3, res: 1, hp: 10, cost: 70, glyph: '◈', desc: 'Wool, wax, and stubbornness.' },
  { id: 'chainmail', name: 'Chainmail', slot: 'armor', type: 'heavy', def: 8, res: 1, hp: 20, cost: 220, glyph: '◈', desc: 'Heavy. Loud. Better than being opened.' },
  { id: 'ashenPlate', name: 'Ashen Plate', slot: 'armor', type: 'heavy', def: 14, res: 2, hp: 40, spd: -1, cost: 700, glyph: '◈', desc: 'Plate of the old royal guard, scorched black.' },
  { id: 'mageRobe', name: 'Mage Robe', slot: 'armor', type: 'light', def: 3, res: 8, mp: 15, cost: 260, glyph: '◈', desc: 'The sigils are stitched in hair. Whose is unrecorded.' },
  { id: 'shadeCloak', name: 'Shade Cloak', slot: 'armor', type: 'light', def: 4, res: 3, spd: 3, cost: 340, glyph: '◈', desc: 'It does not make you invisible. It makes you forgettable.' },
  // Accessories
  { id: 'ironRing', name: 'Iron Ring', slot: 'accessory', type: 'ring', hp: 15, cost: 90, glyph: '○', desc: 'A plain band. It has been on many fingers.' },
  { id: 'silverCharm', name: 'Silver Charm', slot: 'accessory', type: 'charm', res: 5, mp: 10, cost: 240, glyph: '✦', desc: 'Cold silver, warm memory.' },
  { id: 'swiftBoots', name: 'Swift Boots', slot: 'accessory', type: 'boots', spd: 3, cost: 300, glyph: '⌇', desc: 'The soles are worn through. They still run.' },
  { id: 'wardSigil', name: 'Ward Sigil', slot: 'accessory', type: 'charm', res: 8, def: 2, cost: 420, glyph: '✧', desc: 'A ward against the things that knock at night.' },
  { id: 'bloodstone', name: 'Bloodstone', slot: 'accessory', type: 'ring', pa: 4, hp: 10, cost: 520, glyph: '◆', desc: 'A red stone that beats when held.' },
  { id: 'crownFragment', name: 'Crown Fragment', slot: 'accessory', type: 'relic', ma: 5, mp: 20, res: 3, cost: 780, glyph: '♛', desc: 'A shard of the Hollow Crown. It whispers in first person.' },

  // Late-game weapons
  { id: 'silverSword', name: 'Silver Sword', slot: 'weapon', type: 'sword', atk: 19, mag: 0, range: 1, cost: 620, glyph: '†', desc: 'Bright enough to show the face of the thing you are killing.' },
  { id: 'runicBlade', name: 'Runic Blade', slot: 'weapon', type: 'sword', atk: 22, mag: 8, range: 1, cost: 880, glyph: '†', desc: 'The fuller is a sentence in a language with no future tense.' },
  { id: 'serpentSpear', name: 'Serpent Spear', slot: 'weapon', type: 'spear', atk: 21, mag: 0, range: 2, cost: 640, glyph: '↑', desc: 'It bends toward the wound it has not made yet.' },
  { id: 'stormLance', name: 'Storm Lance', slot: 'weapon', type: 'spear', atk: 26, mag: 6, range: 2, cost: 920, glyph: '↑', desc: 'Thunder sleeps in the shaft. Do not wake it indoors.' },
  { id: 'windBow', name: 'Wind Bow', slot: 'weapon', type: 'bow', atk: 20, mag: 0, range: 4, cost: 660, glyph: '➶', desc: 'The arrow arrives before the sound of the string.' },
  { id: 'moonDagger', name: 'Moon Dagger', slot: 'weapon', type: 'dagger', atk: 17, mag: 4, range: 1, cost: 620, glyph: '⌁', spd: 4, desc: 'A sliver of something that was never quite metal.' },
  { id: 'sunStaff', name: 'Sun Staff', slot: 'weapon', type: 'staff', atk: 5, mag: 19, range: 2, cost: 760, glyph: '✶', desc: 'It remembers daylight. It would like to see it again.' },
  { id: 'voidGrimoire', name: 'Void Grimoire', slot: 'weapon', type: 'grimoire', atk: 4, mag: 24, range: 2, cost: 980, glyph: '▤', desc: 'The pages are blank because the words ate them.' },
  { id: 'reapersEdge', name: "Reaper's Edge", slot: 'weapon', type: 'sword', atk: 30, mag: 8, range: 1, cost: 1200, glyph: '☠', desc: 'The last blade of the first king. It has been waiting.' },
  // Late-game armour
  { id: 'wardenMail', name: 'Warden Mail', slot: 'armor', type: 'heavy', def: 20, res: 6, hp: 60, cost: 900, glyph: '◈', desc: 'Mail woven for a wall that was expected to last.' },
  { id: 'archmageVestments', name: 'Archmage Vestments', slot: 'armor', type: 'light', def: 7, res: 16, mp: 30, cost: 880, glyph: '◈', desc: 'The stitching spells a name no one has spoken aloud.' },
  { id: 'shadowweave', name: 'Shadowweave', slot: 'armor', type: 'light', def: 10, res: 8, spd: 6, hp: 20, cost: 820, glyph: '◈', desc: 'Cut from the space between two shadows.' },
  { id: 'dragonplate', name: 'Dragonplate', slot: 'armor', type: 'heavy', def: 24, res: 10, hp: 80, spd: -1, cost: 1150, glyph: '◈', desc: 'Scales from something that used to own the sky.' },
  // Late-game accessories
  { id: 'phoenixFeather', name: 'Phoenix Feather', slot: 'accessory', type: 'charm', hp: 30, res: 6, spd: 4, cost: 700, glyph: '✧', desc: 'Warm. It does not burn. It waits.' },
  { id: 'titanBelt', name: 'Titan Belt', slot: 'accessory', type: 'ring', pa: 8, def: 4, hp: 30, cost: 760, glyph: '◆', desc: 'Worn by something that no longer needed a waist.' },
  { id: 'sagesEye', name: "Sage's Eye", slot: 'accessory', type: 'relic', ma: 9, res: 5, mp: 25, cost: 840, glyph: '◉', desc: 'It blinks when you are not looking.' },
  { id: 'crownSeal', name: 'Crown Seal', slot: 'item', cost: 650, glyph: '♛', desc: 'A seal of the old royal line. Required to promote a unit at Lv 10.', promote: true },
];

export const CONSUMABLES = [
  { id: 'potion', name: 'Potion', slot: 'item', cost: 40, glyph: '❖', desc: 'Restore 80 HP to an ally.', use: { kind: 'heal', power: 80, range: 1, aoe: 0, target: 'ally' } },
  { id: 'hiPotion', name: 'Hi-Potion', slot: 'item', cost: 130, glyph: '❖', desc: 'Restore 200 HP to an ally.', use: { kind: 'heal', power: 200, range: 1, aoe: 0, target: 'ally' } },
  { id: 'ether', name: 'Ether', slot: 'item', cost: 110, glyph: '◉', desc: 'Restore 40 MP to an ally.', use: { kind: 'mp', power: 40, range: 1, aoe: 0, target: 'ally' } },
  { id: 'antidote', name: 'Antidote', slot: 'item', cost: 50, glyph: '⌁', desc: 'Cleanse curses from an adjacent ally.', use: { kind: 'cleanse', range: 1, aoe: 0, target: 'ally' } },
  { id: 'phoenixDown', name: 'Phoenix Down', slot: 'item', cost: 180, glyph: '✧', desc: 'Revive a fallen ally at 50% HP.', use: { kind: 'revive', power: 0.5, range: 1, aoe: 0, target: 'deadAlly' } },
  { id: 'bomb', name: 'Ash Bomb', slot: 'item', cost: 90, glyph: '●', desc: 'Deal 90 magic damage in a 1-tile radius.', use: { kind: 'damage', power: 90, range: 3, aoe: 1, target: 'tile', element: 'fire' } },
  { id: 'elixir', name: 'Elixir', slot: 'item', cost: 260, glyph: '❖', desc: 'Fully restore an ally\'s HP.', use: { kind: 'heal', power: 9999, range: 1, aoe: 0, target: 'ally' } },
  { id: 'megaEther', name: 'Mega Ether', slot: 'item', cost: 220, glyph: '◉', desc: 'Restore 100 MP to an ally.', use: { kind: 'mp', power: 100, range: 1, aoe: 0, target: 'ally' } },
];

export const ALL_ITEMS = [...EQUIPMENT, ...CONSUMABLES];
export const ITEM_MAP = Object.fromEntries(ALL_ITEMS.map(i => [i.id, i]));
export function getItem(id) { return ITEM_MAP[id]; }

export const SHOP_STOCK = [
  { id: 'potion', unlock: 0 }, { id: 'antidote', unlock: 0 }, { id: 'rustedSword', unlock: 0 },
  { id: 'huntingBow', unlock: 0 }, { id: 'oakStaff', unlock: 0 }, { id: 'travelersGarb', unlock: 0 },
  { id: 'ironRing', unlock: 0 }, { id: 'ironSpear', unlock: 0 }, { id: 'boneDagger', unlock: 0 },
  { id: 'ether', unlock: 1 }, { id: 'hiPotion', unlock: 1 }, { id: 'chainmail', unlock: 1 },
  { id: 'mageRobe', unlock: 1 }, { id: 'silverCharm', unlock: 1 }, { id: 'ashenBlade', unlock: 2 },
  { id: 'graveLance', unlock: 2 }, { id: 'blackthornBow', unlock: 2 }, { id: 'nightfang', unlock: 2 },
  { id: 'swiftBoots', unlock: 2 }, { id: 'reliquary', unlock: 2 }, { id: 'bomb', unlock: 2 },
  { id: 'phoenixDown', unlock: 3 }, { id: 'wardSigil', unlock: 3 }, { id: 'cinderStaff', unlock: 3 },
  { id: 'ashenPlate', unlock: 3 }, { id: 'shadeCloak', unlock: 3 }, { id: 'bloodstone', unlock: 4 },
  { id: 'grimoire', unlock: 4 }, { id: 'crownSeal', unlock: 4 }, { id: 'elixir', unlock: 4 },
  { id: 'megaEther', unlock: 4 }, { id: 'silverSword', unlock: 6 }, { id: 'serpentSpear', unlock: 6 },
  { id: 'windBow', unlock: 6 }, { id: 'moonDagger', unlock: 6 }, { id: 'sunStaff', unlock: 6 },
  { id: 'wardenMail', unlock: 7 }, { id: 'archmageVestments', unlock: 7 }, { id: 'shadowweave', unlock: 7 },
  { id: 'phoenixFeather', unlock: 8 }, { id: 'titanBelt', unlock: 8 }, { id: 'sagesEye', unlock: 8 },
  { id: 'runicBlade', unlock: 9 }, { id: 'stormLance', unlock: 9 }, { id: 'voidGrimoire', unlock: 9 },
  { id: 'dragonplate', unlock: 10 }, { id: 'kingsbane', unlock: 11 }, { id: 'crownFragment', unlock: 12 },
  { id: 'reapersEdge', unlock: 16 },
];

/* ------------------------------------------------------------
   ROSTER TEMPLATES
   ------------------------------------------------------------ */
export const ROSTER = [
  {
    id: 'sera', name: 'Sera Vane', title: 'the Unpaid', job: 'duelist', level: 2,
    base: { hp: 52, mp: 18, pa: 14, ma: 6, def: 8, res: 6, spd: 14, luck: 8 },
    equipment: { weapon: 'rustedSword', armor: 'travelersGarb', accessory: null },
    arts: { duelist: ['lunge', 'riposte'] }, bio: 'A duelist who killed the wrong lord and has been apologising with a blade ever since.',
  },
  {
    id: 'bran', name: 'Bran Hollow', title: 'the Wall', job: 'knight', level: 2,
    base: { hp: 78, mp: 10, pa: 15, ma: 4, def: 14, res: 6, spd: 8, luck: 5 },
    equipment: { weapon: 'ironSpear', armor: 'chainmail', accessory: null },
    arts: { knight: ['shieldBash', 'ironGuard'] }, bio: 'The last surviving guard of the Ashen Gate. He was told to hold it. He is still holding it.',
  },
  {
    id: 'ysolde', name: 'Ysolde', title: 'the Unheard', job: 'whitemage', level: 2,
    base: { hp: 44, mp: 42, pa: 6, ma: 16, def: 6, res: 12, spd: 10, luck: 6 },
    equipment: { weapon: 'oakStaff', armor: 'mageRobe', accessory: null },
    arts: { whitemage: ['mend', 'blessing'] }, bio: 'A village healer whose prayers began to be answered by something other than the gods.',
  },
  {
    id: 'kael', name: 'Kael', title: 'the Quiet', job: 'archer', level: 2,
    base: { hp: 48, mp: 14, pa: 13, ma: 5, def: 7, res: 5, spd: 13, luck: 7 },
    equipment: { weapon: 'huntingBow', armor: 'travelersGarb', accessory: null },
    arts: { archer: ['pinDown', 'aim'] }, bio: 'A poacher who stopped counting kills when the count started counting back.',
  },
  {
    id: 'vey', name: 'Vey', title: 'the Unwise', job: 'blackmage', level: 2,
    base: { hp: 40, mp: 50, pa: 7, ma: 18, def: 5, res: 10, spd: 11, luck: 5 },
    equipment: { weapon: 'oakStaff', armor: 'mageRobe', accessory: null },
    arts: { blackmage: ['ember', 'frost'] }, bio: 'Expelled from the Athenaeum for reading a book that had been chained shut for a reason.',
  },
  {
    id: 'mirelle', name: 'Mirelle', title: 'the Quick', job: 'thief', level: 3,
    base: { hp: 46, mp: 18, pa: 14, ma: 5, def: 7, res: 5, spd: 18, luck: 10 },
    equipment: { weapon: 'boneDagger', armor: 'shadeCloak', accessory: null },
    arts: { thief: ['steal', 'smoke'] }, bio: 'She was already living in the camp when the company arrived. Nobody has asked.',
  },
  {
    id: 'orin', name: 'Orin', title: 'the Fallen', job: 'dragoon', level: 4,
    base: { hp: 80, mp: 16, pa: 18, ma: 5, def: 12, res: 6, spd: 12, luck: 6 },
    equipment: { weapon: 'graveLance', armor: 'chainmail', accessory: null },
    arts: { dragoon: ['leap', 'highJump'] }, bio: 'The only dragoon to survive the sky-burning. He has been trying to fall ever since.',
  },
  {
    id: 'nara', name: 'Sister Nara', title: 'the Penitent', job: 'inquisitor', level: 4,
    base: { hp: 60, mp: 38, pa: 10, ma: 16, def: 9, res: 12, spd: 10, luck: 6 },
    equipment: { weapon: 'reliquary', armor: 'mageRobe', accessory: null },
    arts: { inquisitor: ['smite', 'rebuke'] }, bio: 'She burned heretics for the Regent. Now she keeps a list of their names and reads it aloud each night.',
  },
  {
    id: 'malachai', name: 'Malachai', title: 'the Oathless', job: 'darkknight', level: 5,
    base: { hp: 95, mp: 24, pa: 21, ma: 8, def: 16, res: 8, spd: 9, luck: 5 },
    equipment: { weapon: 'ashenBlade', armor: 'ashenPlate', accessory: null },
    arts: { darkknight: ['dreadBlade', 'bloodPrice'] }, bio: 'He held the Black Keep for a king who was already dead. He would like a new reason.',
  },
  {
    id: 'wren', name: 'Wren', title: 'the Unwritten', job: 'runefencer', level: 7,
    base: { hp: 58, mp: 44, pa: 13, ma: 15, def: 9, res: 12, spd: 12, luck: 7 },
    equipment: { weapon: 'reliquary', armor: 'mageRobe', accessory: null },
    arts: { runefencer: ['runeBlade', 'ward', 'sunder'] }, bio: 'A rune-scribe who found a word in the margin of the world and has been trying to erase it ever since.',
  },
  {
    id: 'tobias', name: 'Tobias', title: 'the Late', job: 'knight', level: 9,
    base: { hp: 98, mp: 18, pa: 19, ma: 6, def: 17, res: 8, spd: 8, luck: 5 },
    equipment: { weapon: 'serpentSpear', armor: 'wardenMail', accessory: null },
    arts: { knight: ['shieldBash', 'ironGuard', 'provoke', 'crushingBlow'] }, bio: 'He arrived at every battle after it ended. This time, he is early.',
  },
  {
    id: 'sable', name: 'Sable', title: 'the Patient', job: 'necromancer', level: 11,
    base: { hp: 62, mp: 66, pa: 10, ma: 23, def: 8, res: 14, spd: 10, luck: 6 },
    equipment: { weapon: 'voidGrimoire', armor: 'archmageVestments', accessory: null },
    arts: { necromancer: ['boneSpear', 'raiseThrall', 'curse', 'deathGrasp'] }, bio: 'She has been waiting under the glass desert for a very long time, and she is very good at waiting.',
  },
];

export const LORE = [
  {
    title: 'The Kingdom of Vaer',
    text: 'Vaer was never a kind kingdom, but it was a kingdom. Its roads were kept, its granaries filled, its borders marked. Nine winters ago King Aldric died without an heir. The Pale Regent — a courtier whose name has been scraped from every record — took the throne. Since then the borders have been drifting, and the dead have been gathering at them like leaves at a fence.',
  },
  {
    title: 'The Hollow Crown',
    text: 'The crown of Vaer is not gold. It is a circlet of blackened bone, taken from the first king, who was not a man but a bargain. It does not grant power. It grants absence: the wearer becomes the shape of whatever the kingdom needs to fear. The Pale Regent has worn it for nine years. There is very little of him left.',
  },
  {
    title: 'The Ashen Company',
    text: 'A company is a small kingdom that moves. It has a leader, a wall, a light, a shadow, and a road. The Ashen Company has all five, and a mule. They are not the first company to march north. They are the first to march north and come back, which is a different kind of legend.',
  },
  {
    title: 'Jobs & Arts',
    text: 'Every soldier carries a job: the shape their training takes under pressure. Jobs grant Arts — techniques bought with JP earned in battle. Change jobs freely at camp; the first Art of every job is always free. A unit\'s learned Arts stay with them, so a Knight can carry a Black Mage\'s fire in their blood if they earn it.',
  },
  {
    title: 'The Turn of Battle',
    text: 'Battle runs on CT. Every tick, each living unit adds its Speed to its CT. At 100 CT a unit acts, then its CT resets. Faster units act more often. High ground grants +10% damage per level; attacking from a foe\'s flank grants +10%, and from behind +25%. Rear attacks are how small companies kill large ones.',
  },
  {
    title: 'Death & the Road',
    text: 'A unit reduced to 0 HP is Downed, not dead. The company heals and revives all Downed units between battles. In battle, only a Phoenix Down or a White Mage\'s Rite of Return can bring them back. If every deployed unit is Downed, the battle is lost — but the chronicle is not. Retry from camp.',
  },
];

export const CREDITS = [
  'THE HOLLOW CROWN',
  'A grim tactical chronicle',
  '',
  'Design, writing, code: the Ashen Company',
  'Engine: hand-rolled canvas SRPG',
  'Sound: procedural Web Audio',
  '',
  'Built with OpenCode on OMGithub.',
  'No external assets. All art is drawn at runtime.',
];
