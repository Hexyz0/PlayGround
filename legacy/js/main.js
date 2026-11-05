/* ============================================================
   THE HOLLOW CROWN — application shell
   Title, story, camp, deployment, battle hand-off and results.
   ============================================================ */
import {
  JOBS, JOB_LIST, BASE_JOBS, ADVANCED_JOBS, LORE, CREDITS,
  ITEM_MAP, SHOP_STOCK, getItem,
} from './data.js';
import { ENCOUNTERS, CHARACTERS, PROLOGUE } from './chapters.js';
import {
  newGame, loadGame, saveGame, hasSave, clearSave,
  currentEncounter, advanceEncounter, deployedUnits, deriveStats, jobOf,
  learnedArts, canLearn, learnArt, changeJob, jobOptions, promotionTarget,
  canPromote, promoteUnit, equipItem, canEquipItem, buyItem, owned, addItem,
  grantExp, grantJp, recruitUnit, toggleDeploy, MAX_DEPLOY, jobAllowedWeapon,
  expNeeded,
} from './state.js';
import { startBattle } from './battle.js';
import { drawPortrait, drawCrown } from './sprites.js';
import {
  $, $$, showScreen, esc, toast, openModal, closeModal, confirmDialog,
  bar, statusLabel, itemStatLine, levelProgress,
} from './ui.js';
import { sfx, initAudio, isMuted, toggleMute } from './audio.js';

let state = null;
let campTab = 'company';
let currentBattle = null;
let storyAdvance = null;
let storySkip = null;
let resultNextAction = null;
let titleRaf = 0;
let titleParticles = [];
let titleLast = 0;

/* ============================================================
   BOOT
   ============================================================ */
function boot() {
  bindTitle();
  bindStory();
  bindCamp();
  bindResult();
  updateContinueButton();
  showTitle();
  initAudioOnce();
}

function initAudioOnce() {
  const unlock = () => {
    initAudio();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
}

/* ============================================================
   TITLE
   ============================================================ */
function updateContinueButton() {
  const btn = $('#btn-continue');
  if (!btn) return;
  const saved = hasSave();
  btn.disabled = !saved;
  btn.title = saved ? 'Resume your chronicle' : 'No chronicle saved yet';
}

function showTitle() {
  showScreen('title-screen');
  updateContinueButton();
  startTitleLoop();
}

function bindTitle() {
  $('#btn-new')?.addEventListener('click', async () => {
    sfx('click');
    if (hasSave()) {
      const ok = await confirmDialog({
        title: 'Begin a New Chronicle?',
        text: 'This will overwrite the saved chronicle. The dead are patient; they will wait.',
        confirm: 'Begin again',
        danger: true,
      });
      if (!ok) return;
    }
    state = newGame();
    saveGame(state);
    stopTitleLoop();
    playStory(PROLOGUE, () => showCamp());
  });

  $('#btn-continue')?.addEventListener('click', () => {
    sfx('click');
    state = loadGame();
    if (!state) {
      toast('No chronicle found');
      updateContinueButton();
      return;
    }
    stopTitleLoop();
    showCamp();
  });

  $('#btn-help')?.addEventListener('click', () => { sfx('click'); openCodex(); });
  $('#btn-credits')?.addEventListener('click', () => { sfx('click'); openCredits(); });
}

function resizeTitle() {
  const canvas = $('#title-canvas');
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.dataset.dpr = String(dpr);
  const count = Math.min(110, Math.round(window.innerWidth / 14));
  titleParticles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 0.4 + Math.random() * 1.8,
    vy: 5 + Math.random() * 16,
    vx: -4 + Math.random() * 8,
    a: 0.12 + Math.random() * 0.4,
    warm: Math.random() > 0.45,
  }));
}

function startTitleLoop() {
  if (titleRaf) return;
  resizeTitle();
  window.addEventListener('resize', resizeTitle);
  titleLast = 0;
  titleRaf = requestAnimationFrame(drawTitle);
}

function stopTitleLoop() {
  if (titleRaf) cancelAnimationFrame(titleRaf);
  titleRaf = 0;
  window.removeEventListener('resize', resizeTitle);
}

function drawTitle(ts) {
  const canvas = $('#title-canvas');
  if (!canvas) { titleRaf = 0; return; }
  const dpr = Number(canvas.dataset.dpr) || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const dt = Math.min(0.05, (ts - (titleLast || ts)) / 1000);
  titleLast = ts;

  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#120d17');
  bg.addColorStop(0.5, '#08070a');
  bg.addColorStop(1, '#050407');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // distant ruined skyline
  ctx.fillStyle = 'rgba(9, 7, 12, 0.9)';
  const horizon = h * 0.72;
  for (let i = 0; i < 9; i++) {
    const bw = w * (0.03 + ((i * 37) % 7) * 0.006);
    const bh = h * (0.04 + ((i * 53) % 11) * 0.012);
    const bx = (i / 8) * w - bw / 2;
    ctx.fillRect(bx, horizon - bh, bw, bh);
  }
  ctx.fillStyle = 'rgba(214,181,106,0.05)';
  ctx.fillRect(0, horizon, w, 1);

  // faint crown behind the title
  ctx.save();
  ctx.globalAlpha = 0.07 + Math.sin(ts / 2400) * 0.015;
  drawCrown(ctx, w / 2, h * 0.24, Math.max(4, Math.round(Math.min(w, h) / 100)));
  ctx.restore();

  // embers
  for (const p of titleParticles) {
    p.x += p.vx * dt;
    p.y -= p.vy * dt;
    if (p.y < -10 || p.x < -10 || p.x > w + 10) {
      p.x = Math.random() * w;
      p.y = h + 10 + Math.random() * 30;
    }
    ctx.globalAlpha = p.a * (0.55 + Math.sin((ts / 800) + p.x) * 0.2);
    ctx.fillStyle = p.warm ? '#d6b56a' : '#79c0b4';
    ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.r), Math.ceil(p.r));
  }
  ctx.globalAlpha = 1;

  titleRaf = requestAnimationFrame(drawTitle);
}

/* ============================================================
   STORY
   ============================================================ */
let storyState = null;
let storyTimer = null;

function bindStory() {
  $('#story-next')?.addEventListener('click', () => { sfx('click'); storyAdvance?.(); });
  $('#story-skip')?.addEventListener('click', () => { sfx('click'); storySkip?.(); });
  document.addEventListener('keydown', (e) => {
    if (!$('#story-screen')?.classList.contains('active')) return;
    if (!document.getElementById('modal-root')?.classList.contains('hidden')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      storyAdvance?.();
    }
  });
}

function clearStoryTimer() {
  if (storyTimer) clearInterval(storyTimer);
  storyTimer = null;
}

function playStory(scenes, onDone) {
  const list = (scenes || []).filter(s => s && s.lines && s.lines.length);
  if (!list.length) { onDone?.(); return; }
  const totalLines = list.reduce((n, s) => n + s.lines.length, 0);
  let sceneIndex = 0;
  let lineIndex = 0;
  let shown = 0;
  let typing = false;
  let finished = false;
  let fullText = '';

  storyState = { scenes: list, sceneIndex, lineIndex };

  const done = () => {
    if (finished) return;
    finished = true;
    clearStoryTimer();
    storyAdvance = null;
    storySkip = null;
    storyState = null;
    onDone?.();
  };

  const finishTyping = () => {
    clearStoryTimer();
    typing = false;
    const el = $('#story-text');
    if (el) el.textContent = fullText;
  };

  const typeLine = (text) => {
    clearStoryTimer();
    const el = $('#story-text');
    if (!el) return;
    fullText = text;
    typing = true;
    let i = 0;
    el.textContent = '';
    storyTimer = setInterval(() => {
      i += 2;
      el.textContent = fullText.slice(0, i);
      if (i >= fullText.length) {
        clearStoryTimer();
        typing = false;
        el.textContent = fullText;
      }
    }, 16);
  };

  const renderPortrait = (speaker) => {
    const canvas = $('#story-portrait');
    if (!canvas) return;
    const char = CHARACTERS[speaker];
    if (!char || !char.job) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || 132;
      const h = canvas.clientHeight || 152;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a1620');
      g.addColorStop(1, '#09080c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawCrown(ctx, w / 2, h / 2 - 12, 4);
      ctx.restore();
      ctx.strokeStyle = 'rgba(214,181,106,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
      return;
    }
    const team = ['Voss', 'Chancellor', 'Regent', 'First King'].includes(speaker) ? 'enemy' : 'player';
    drawPortrait(canvas, char.job, team);
  };

  const showLine = () => {
    const scene = list[sceneIndex];
    if (!scene) { done(); return; }
    const line = scene.lines[lineIndex];
    if (!line) { done(); return; }
    storyState = { scenes: list, sceneIndex, lineIndex };
    $('#story-label').textContent = scene.label || '';
    $('#story-title').textContent = scene.title || '';
    const char = CHARACTERS[line.speaker];
    const speakerEl = $('#story-speaker');
    speakerEl.textContent = line.speaker === 'Narration' ? '' : (char?.name || line.speaker || '');
    const textEl = $('#story-text');
    textEl.classList.toggle('narration', line.speaker === 'Narration');
    renderPortrait(line.speaker);
    typeLine(line.text);
    shown += 1;
    const prog = $('#story-progress');
    if (prog) prog.style.width = `${Math.min(100, (shown / totalLines) * 100)}%`;
  };

  storyAdvance = () => {
    if (finished) return;
    if (typing) { finishTyping(); return; }
    const scene = list[sceneIndex];
    lineIndex += 1;
    if (lineIndex >= scene.lines.length) {
      sceneIndex += 1;
      lineIndex = 0;
    }
    if (sceneIndex >= list.length) { done(); return; }
    showLine();
  };

  storySkip = () => {
    if (finished) return;
    done();
  };

  showScreen('story-screen');
  const prog = $('#story-progress');
  if (prog) prog.style.width = '0%';
  showLine();
}

/* ============================================================
   CAMP
   ============================================================ */
function persist() {
  if (state) saveGame(state);
}

function showCamp() {
  if (!state) { showTitle(); return; }
  campTab = 'company';
  renderCamp();
  showScreen('camp-screen');
  persist();
}

function bindCamp() {
  $('#camp-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    sfx('click');
    campTab = btn.dataset.tab;
    renderCamp();
  });

  $('#btn-save')?.addEventListener('click', () => {
    persist();
    sfx('click');
    toast('Chronicle saved');
  });

  $('#btn-camp-codex')?.addEventListener('click', () => { sfx('click'); openCodex(); });

  $('#btn-quit')?.addEventListener('click', async () => {
    sfx('click');
    persist();
    const ok = await confirmDialog({
      title: 'Return to Title?',
      text: 'Your chronicle is saved. The company will wait by the fire.',
      confirm: 'Return',
    });
    if (!ok) return;
    showTitle();
  });

  $('#btn-deploy')?.addEventListener('click', () => { sfx('click'); deploy(); });

  $('#camp-content')?.addEventListener('click', (e) => {
    const buy = e.target.closest('[data-buy]');
    if (buy) {
      buyItemById(buy.dataset.buy);
      return;
    }
    const deployBtn = e.target.closest('[data-deploy]');
    if (deployBtn) {
      const id = deployBtn.dataset.deploy;
      const res = toggleDeploy(state, id);
      if (!res.ok) { toast(res.reason || 'Cannot change deployment'); sfx('cancel'); return; }
      sfx('click');
      persist();
      renderCamp();
      return;
    }
    const unitCard = e.target.closest('[data-unit]');
    if (unitCard) {
      sfx('click');
      openUnitModal(unitCard.dataset.unit);
    }
  });
}

function campHeader() {
  const enc = currentEncounter(state);
  const chapterEl = $('#camp-chapter');
  if (chapterEl) {
    chapterEl.textContent = state.completed
      ? 'The Chronicle Complete'
      : enc ? `Ch. ${enc.chapter} · ${enc.title}` : 'The Road Ends';
  }
  const gold = $('#camp-gold');
  const seals = $('#camp-seals');
  const items = $('#camp-items');
  if (gold) gold.textContent = state.gold;
  if (seals) seals.textContent = owned(state, 'crownSeal');
  if (items) {
    let n = 0;
    for (const [id, qty] of Object.entries(state.inventory || {})) {
      if (ITEM_MAP[id]?.use) n += qty;
    }
    items.textContent = n;
  }
  for (const tab of $$('#camp-tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.tab === campTab);
  }
  const deploy = $('#btn-deploy');
  if (deploy) {
    const dep = deployedUnits(state).length;
    deploy.disabled = state.completed || dep === 0;
    deploy.innerHTML = state.completed
      ? 'Chronicle Complete'
      : `March to Battle <span class="arrow">›</span>`;
  }
  const hint = $('#camp-hint');
  if (hint) {
    hint.textContent = state.completed
      ? 'The crown is buried. The company has earned the road south.'
      : campTab === 'company'
        ? `Choose up to ${MAX_DEPLOY} companions to march. Select a companion to change jobs, learn Arts, or equip gear.`
        : campTab === 'armory'
          ? 'Spend gold on supplies and steel. Equipment is shared through the company stores.'
          : 'Review the road behind and the dark ahead.';
  }
}

function renderCamp() {
  if (!state) return;
  campHeader();
  const el = $('#camp-content');
  if (!el) return;
  if (campTab === 'company') el.innerHTML = renderCompany();
  else if (campTab === 'armory') el.innerHTML = renderArmory();
  else el.innerHTML = renderChronicle();
}

function renderCompany() {
  const enc = currentEncounter(state);
  const dep = deployedUnits(state).length;
  const cards = state.roster.map(unit => {
    const job = jobOf(unit);
    const st = deriveStats(unit);
    const prog = levelProgress(unit.exp, unit.level);
    const canP = canPromote(state, unit);
    return `
      <article class="unit-card ${unit.deployed ? '' : 'undeployed'}" data-unit="${esc(unit.id)}" tabindex="0" role="button" aria-label="Open ${esc(unit.name)}">
        <div class="unit-sigil">${esc(job.sigil || '†')}</div>
        <div class="unit-meta">
          <h3>${esc(unit.name)}</h3>
          <div class="unit-job">${esc(job.name)} · Lv ${unit.level}</div>
          <div class="unit-bars">
            ${bar(1, 1, 'hp')}
            ${bar(prog.exp, prog.need, 'mp')}
          </div>
          <div class="unit-tags">
            <span class="tag ${unit.deployed ? 'march' : ''}">${unit.deployed ? 'Marching' : 'Resting'}</span>
            ${unit.promoted ? '<span class="tag promoted">Promoted</span>' : ''}
            ${canP.ok ? '<span class="tag seal">Seal ready</span>' : ''}
            <span class="tag">HP ${st.maxHp}</span>
            <span class="tag">JP ${unit.jp}</span>
          </div>
          <button class="btn ${unit.deployed ? 'ghost' : ''} dr-toggle" data-deploy="${esc(unit.id)}" style="margin-top:8px;padding:5px 8px;font-size:9px">${unit.deployed ? 'Leave at camp' : 'Send to march'}</button>
        </div>
      </article>`;
  }).join('');

  const brief = enc ? `
    <div class="brief-card">
      <h3>Next March</h3>
      <div class="brief-title">${esc(enc.title)}</div>
      <p>${esc(enc.subtitle)}</p>
      <div class="brief-row"><span>Objective</span><strong>${esc(enc.objective)}</strong></div>
      <div class="brief-row"><span>Recommended</span><strong>Lv ${enc.recommendedLevel}</strong></div>
      <div class="brief-row"><span>Company</span><strong>${dep} / ${MAX_DEPLOY} marching</strong></div>
      <div class="brief-row"><span>Purse</span><strong>${state.gold} gold</strong></div>
      <p style="margin-top:10px">${state.seenIntros.includes(enc.id) ? 'The road is known. March when ready.' : 'A new chapter waits. The first march will open with story.'}</p>
    </div>` : `
    <div class="brief-card">
      <h3>Chronicle Complete</h3>
      <div class="brief-title">The Living Crown</div>
      <p>The First King is ended and the hollow crown is buried. The company rests on the road south.</p>
    </div>`;

  return `
    <div class="company-layout">
      <div>
        <div class="company-grid">${cards}</div>
      </div>
      <div class="company-side">
        ${brief}
        <div class="panel-card">
          <h3>Company Roster</h3>
          <div class="brief-row"><span>Companions</span><strong>${state.roster.length}</strong></div>
          <div class="brief-row"><span>Marching</span><strong>${dep} / ${MAX_DEPLOY}</strong></div>
          <div class="brief-row"><span>Battles won</span><strong>${state.stats.victories}</strong></div>
          <div class="brief-row"><span>Foes felled</span><strong>${state.stats.kills}</strong></div>
          <div class="brief-row"><span>Crown Seals</span><strong>${owned(state, 'crownSeal')}</strong></div>
        </div>
      </div>
    </div>`;
}

function renderArmory() {
  const chapter = state.encounterIndex;
  const cards = SHOP_STOCK.map(entry => {
    const item = ITEM_MAP[entry.id];
    if (!item) return '';
    const locked = entry.unlock > chapter;
    const count = owned(state, entry.id);
    const stats = itemStatLine(item);
    return `
      <div class="shop-card ${locked ? 'shop-locked' : ''}">
        <div class="item-glyph">${esc(item.glyph || '·')}</div>
        <div class="item-meta">
          <h4>${esc(item.name)}</h4>
          <div class="item-stats">${esc(stats || (item.use ? 'Consumable' : ''))}</div>
          <div class="item-desc">${esc(item.desc || '')}</div>
          <div class="owned">Owned: ${count}${locked ? ` · Locked until Ch. ${entry.unlock + 1}` : ''}</div>
        </div>
        <div class="price">
          ${item.cost} g
          <button class="buy-btn" data-buy="${esc(item.id)}" ${locked || state.gold < item.cost ? 'disabled' : ''}>Buy</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="armory-head">
      <div>
        <h2>The Quartermaster</h2>
        <p>Steel, salves and small miracles. Stock expands as the company marches north.</p>
      </div>
      <div class="price" style="font-size:13px">Purse: <strong style="color:var(--gold2)">${state.gold} gold</strong></div>
    </div>
    <div class="shop-grid">${cards}</div>`;
}

function renderChronicle() {
  const nodes = ENCOUNTERS.map((enc, i) => {
    const status = i < state.encounterIndex ? 'cleared' : i === state.encounterIndex ? 'current' : 'locked';
    return `
      <div class="map-node ${status}">
        <div class="node-dot">${enc.chapter}</div>
        <div class="node-info">
          <h4>${esc(enc.title)}</h4>
          <p>${esc(enc.subtitle)}</p>
        </div>
        <div class="node-meta">Lv ${enc.recommendedLevel}<br>${status === 'cleared' ? 'Cleared' : status === 'current' ? 'Next' : 'Locked'}</div>
      </div>`;
  }).join('');

  return `
    <div class="chronicle-head">
      <div>
        <h2>The Chronicle</h2>
        <p>The road from the Ashen Gate to the thing beneath the throne.</p>
      </div>
      <div class="price" style="font-size:12px">${state.encounterIndex} / ${ENCOUNTERS.length} chapters</div>
    </div>
    <div class="chronicle-layout">
      <div class="map-track">${nodes}</div>
      <div class="company-side">
        <div class="panel-card">
          <h3>Company Record</h3>
          <div class="stats-grid">
            <div class="stat"><span>Battles</span><strong>${state.stats.battles}</strong></div>
            <div class="stat"><span>Victories</span><strong>${state.stats.victories}</strong></div>
            <div class="stat"><span>Kills</span><strong>${state.stats.kills}</strong></div>
            <div class="stat"><span>Turns</span><strong>${state.stats.turns}</strong></div>
            <div class="stat"><span>Gold earned</span><strong>${state.stats.goldEarned}</strong></div>
            <div class="stat"><span>Companions</span><strong>${state.roster.length}</strong></div>
          </div>
        </div>
        <div class="panel-card">
          <h3>Field Notes</h3>
          <p style="color:var(--muted);font-size:10px;line-height:1.6;margin:0">
            Downed companions return after battle. Supplies are spent only when you win.
            A Crown Seal and Lv 10 unlock a promotion. Change jobs freely — the first Art of each job is free.
          </p>
        </div>
      </div>
    </div>`;
}

function buyItemById(id) {
  const res = buyItem(state, id, 1);
  if (!res.ok) { toast(res.reason || 'Cannot buy that'); sfx('cancel'); return; }
  sfx('loot');
  toast(`Bought ${res.item.name}`);
  persist();
  renderCamp();
}

/* ============================================================
   UNIT MODAL
   ============================================================ */
function openUnitModal(unitId) {
  const unit = state.roster.find(u => u.id === unitId);
  if (!unit) return;
  const job = jobOf(unit);
  const st = deriveStats(unit);
  const prog = levelProgress(unit.exp, unit.level);
  const options = jobOptions(unit);
  const learned = unit.arts[unit.job] || [];
  const promote = promotionTarget(unit);
  const promoteCheck = canPromote(state, unit);

  const jobs = options.map(j => {
    const active = j.id === unit.job;
    const rank = (unit.arts[j.id] || []).length;
    const locked = !!j.tier && !(unit.unlockedJobs || []).includes(j.id);
    return `
      <button class="job-card ${active ? 'active' : ''} ${locked ? 'locked' : ''}" data-job="${esc(j.id)}" ${locked ? 'disabled' : ''}>
        <span class="jc-rank">${locked ? 'LOCK' : `R${rank}`}</span>
        <div class="jc-name">${esc(j.name)}</div>
        <div class="jc-role">${esc(j.role)}${j.tier ? ' · Advanced' : ''}</div>
        <div class="jc-bonus">HP +${j.bonus.hp} · PA +${j.bonus.pa} · DEF +${j.bonus.def}</div>
      </button>`;
  }).join('');

  const arts = job.arts.map(art => {
    const isKnown = learned.includes(art.id);
    const check = canLearn(unit, art);
    return `
      <div class="art-row ${isKnown ? 'learned' : ''}">
        <div>
          <div class="ar-name">${esc(art.name)}</div>
          <div class="ar-desc">${esc(art.desc)}</div>
          <div class="ar-meta"><span class="mp">MP ${art.mp}</span> · <span class="jp">JP ${art.jp}</span> · Rank ${(art.req || 0) + 1} · ${esc(art.kind)}</div>
        </div>
        <div class="ar-state">
          ${isKnown ? 'Learned' : `<button class="btn ${check.ok ? 'gold' : 'ghost'}" data-learn="${esc(art.id)}" ${check.ok ? '' : 'disabled'} style="padding:6px 8px;font-size:9px">${check.ok ? 'Learn' : esc(check.reason)}</button>`}
        </div>
      </div>`;
  }).join('');

  const gearSlot = (slot, label) => {
    const current = unit.equipment?.[slot] || '';
    const ids = new Set();
    for (const [id, qty] of Object.entries(state.inventory || {})) {
      if (qty <= 0) continue;
      const it = ITEM_MAP[id];
      if (it && it.slot === slot) ids.add(id);
    }
    if (current) ids.add(current);
    const opts = [...ids].map(id => {
      const it = ITEM_MAP[id];
      if (!it) return '';
      const extra = itemStatLine(it);
      return `<option value="${esc(id)}" ${id === current ? 'selected' : ''}>${esc(it.name)}${extra ? ` — ${esc(extra)}` : ''}</option>`;
    }).join('');
    return `
      <div class="gear-row">
        <label>${esc(label)}</label>
        <select data-slot="${slot}">
          <option value="">— none —</option>
          ${opts}
        </select>
      </div>`;
  };

  const promoteBox = promote ? `
    <div class="promote-box">
      <h4>${unit.promoted ? `Promoted: ${esc(promote.name)}` : `Promotion: ${esc(promote.name)}`}</h4>
      <p>${esc(promote.blurb)}</p>
      <div class="req">Requires Lv 10 and 1 Crown Seal. You have ${owned(state, 'crownSeal')} seal(s).</div>
      ${unit.promoted
        ? '<div class="req" style="color:var(--teal);margin-top:8px">This companion has already taken the advanced path.</div>'
        : `<button class="btn ${promoteCheck.ok ? 'gold' : 'ghost'}" data-promote="1" ${promoteCheck.ok ? '' : 'disabled'} style="margin-top:8px">${promoteCheck.ok ? `Promote to ${esc(promote.name)}` : esc(promoteCheck.reason)}</button>`}
    </div>` : '';

  const body = `
    <div class="unit-summary">
      <canvas id="unit-modal-portrait"></canvas>
      <div>
        <div class="us-name">${esc(unit.name)}</div>
        <div class="us-sub">${esc(job.name)} · ${esc(job.role)} · Lv ${unit.level} · JP ${unit.jp}</div>
        <div class="us-bio">${esc(unit.bio || '')}</div>
        <div class="bar"><div class="bar-fill mp" style="width:${prog.pct}%"></div></div>
        <div class="us-sub" style="margin-top:3px">EXP ${prog.exp} / ${prog.need} to next level</div>
        <div class="us-stats">
          <div class="us-stat"><span>HP</span><strong>${st.maxHp}</strong></div>
          <div class="us-stat"><span>MP</span><strong>${st.maxMp}</strong></div>
          <div class="us-stat"><span>PA</span><strong>${st.pa}</strong></div>
          <div class="us-stat"><span>MA</span><strong>${st.ma}</strong></div>
          <div class="us-stat"><span>DEF</span><strong>${st.def}</strong></div>
          <div class="us-stat"><span>RES</span><strong>${st.res}</strong></div>
          <div class="us-stat"><span>SPD</span><strong>${st.spd}</strong></div>
          <div class="us-stat"><span>MOV</span><strong>${st.move}</strong></div>
          <div class="us-stat"><span>JMP</span><strong>${st.jump}</strong></div>
          <div class="us-stat"><span>LUK</span><strong>${st.luck}</strong></div>
          <div class="us-stat"><span>RNG</span><strong>${st.weapon.range}</strong></div>
          <div class="us-stat"><span>ATK</span><strong>${st.weapon.atk || st.weapon.mag || 0}</strong></div>
        </div>
      </div>
    </div>

    <div class="section-title">Job</div>
    <div class="job-grid">${jobs}</div>

    <div class="section-title">Arts · ${esc(job.name)}</div>
    <div class="art-list">${arts || '<p class="empty">No Arts in this job.</p>'}</div>

    <div class="section-title">Equipment</div>
    <div class="gear-grid">
      ${gearSlot('weapon', 'Weapon')}
      ${gearSlot('armor', 'Armour')}
      ${gearSlot('accessory', 'Accessory')}
    </div>
    <p class="us-bio">Weapon: ${esc(st.weapon.name)} (${esc(st.weapon.type)}, RNG ${st.weapon.range}). ${esc(job.weapons.join(', '))} allowed.</p>
    ${promoteBox}`;

  const card = openModal({
    title: `${unit.name} — ${job.name}`,
    wide: true,
    body,
    onMount: (root) => {
      const canvas = root.querySelector('#unit-modal-portrait');
      if (canvas) drawPortrait(canvas, unit.job, 'player');

      root.querySelectorAll('[data-job]').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = changeJob(unit, btn.dataset.job);
          if (!res.ok) { toast(res.reason || 'Cannot change job'); sfx('cancel'); return; }
          const weapon = unit.equipment?.weapon ? ITEM_MAP[unit.equipment.weapon] : null;
          if (weapon && !jobAllowedWeapon(unit, weapon)) {
            unit.equipment.weapon = null;
            toast(`Changed to ${res.job.name}. Weapon unequipped.`);
          } else {
            toast(`Changed to ${res.job.name}`);
          }
          sfx('click');
          persist();
          closeModal();
          openUnitModal(unit.id);
        });
      });

      root.querySelectorAll('[data-learn]').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = learnArt(unit, btn.dataset.learn);
          if (!res.ok) { toast(res.reason || 'Cannot learn that'); sfx('cancel'); return; }
          sfx('levelup');
          toast(`Learned ${res.art.name}`);
          persist();
          closeModal();
          openUnitModal(unit.id);
        });
      });

      root.querySelectorAll('[data-slot]').forEach(sel => {
        sel.addEventListener('change', () => {
          const slot = sel.dataset.slot;
          const value = sel.value || null;
          const res = equipItem(state, unit, slot, value);
          if (!res.ok) {
            toast(res.reason || 'Cannot equip that');
            sfx('cancel');
            closeModal();
            openUnitModal(unit.id);
            return;
          }
          sfx('click');
          persist();
          closeModal();
          openUnitModal(unit.id);
        });
      });

      root.querySelector('[data-promote]')?.addEventListener('click', () => {
        const res = promoteUnit(state, unit);
        if (!res.ok) { toast(res.reason || 'Cannot promote'); sfx('cancel'); return; }
        sfx('levelup');
        toast(`${unit.name} is now a ${res.job.name}`);
        persist();
        closeModal();
        openUnitModal(unit.id);
      });
    },
  });
  return card;
}

/* ============================================================
   DEPLOYMENT & BATTLE HAND-OFF
   ============================================================ */
function deploy() {
  if (!state || state.completed) return;
  const enc = currentEncounter(state);
  if (!enc) { toast('There is no road left to march'); return; }
  if (!deployedUnits(state).length) { toast('Choose at least one companion to march'); return; }
  persist();
  if (!state.seenIntros.includes(enc.id)) {
    state.seenIntros.push(enc.id);
    persist();
    playStory(enc.intro, () => launchBattle(enc));
  } else {
    launchBattle(enc);
  }
}

function launchBattle(enc) {
  showScreen('battle-screen');
  const root = $('#board-wrap');
  if (root) root.scrollTop = 0;
  currentBattle = startBattle({
    state,
    encounter: enc,
    onEnd: (result) => handleBattleEnd(enc, result),
  });
}

function handleBattleEnd(enc, result) {
  currentBattle = null;
  if (result.victory) {
    const summary = applyVictory(enc, result);
    showResult(enc, result, summary);
  } else {
    state.stats.battles += 1;
    persist();
    showResult(enc, result, null);
  }
}

function applyVictory(enc, result) {
  // Supplies are consumed only on a victory.
  for (const [id, qty] of Object.entries(result.usedItems || {})) {
    state.inventory[id] = Math.max(0, (state.inventory[id] || 0) - qty);
  }

  const reward = enc.rewards || { gold: 0, jp: 0, exp: 0, items: [] };
  const gold = (reward.gold || 0) + (result.stolenGold || 0);
  state.gold += gold;
  state.stats.goldEarned += gold;

  const loot = [];
  for (const drop of result.loot || []) {
    addItem(state, drop.id, drop.qty || 1);
    loot.push({ id: drop.id, qty: drop.qty || 1, source: drop.source });
  }
  for (const item of reward.items || []) {
    addItem(state, item.id, item.qty || 1);
    loot.push({ id: item.id, qty: item.qty || 1, source: 'Chapter reward' });
  }

  const levelUps = [];
  for (const unit of deployedUnits(state)) {
    const before = unit.level;
    const gained = grantExp(unit, reward.exp || 0);
    grantJp(unit, reward.jp || 0);
    if (gained > 0) levelUps.push({ unit, from: before, to: unit.level });
  }

  const recruits = [];
  for (const id of enc.recruits || []) {
    const unit = recruitUnit(state, id);
    if (unit) recruits.push(unit);
  }

  state.stats.battles += 1;
  state.stats.victories += 1;
  state.stats.kills += result.kills || 0;
  state.stats.turns += result.turns || 0;

  advanceEncounter(state);
  persist();

  return {
    gold,
    exp: reward.exp || 0,
    jp: reward.jp || 0,
    loot,
    levelUps,
    recruits,
    usedItems: result.usedItems || {},
    stolenGold: result.stolenGold || 0,
  };
}

/* ============================================================
   RESULT
   ============================================================ */
function bindResult() {
  $('#result-next')?.addEventListener('click', async () => {
    sfx('click');
    if (resultNextAction) await resultNextAction();
  });
}

function showResult(enc, result, summary) {
  const victory = !!result.victory;
  const mark = $('#result-mark');
  const label = $('#result-label');
  const title = $('#result-title');
  const body = $('#result-body');
  if (mark) mark.textContent = victory ? '✦' : '☠';
  if (label) label.textContent = victory ? 'BATTLE COMPLETE' : 'THE COMPANY FALLS';
  if (title) {
    title.textContent = victory
      ? (state.completed ? 'The Crown Is Ended' : 'Victory')
      : 'Defeat';
    title.style.color = victory ? '' : 'var(--blood2)';
  }

  if (!victory) {
    if (body) {
      body.innerHTML = `
        <p class="dialog-text" style="text-align:center">${esc(enc.title)} — ${esc(enc.objective)}.</p>
        <div class="result-note" style="text-align:center;font-size:12px">
          Every companion is downed, not dead. The company wakes at camp with its wounds and its supplies intact.
          Change a job, buy a salve, or try a different road. The chronicle is not lost.
        </div>
        <div class="reward-grid">
          <div class="reward"><span>Turn</span><strong>${result.turns}</strong></div>
          <div class="reward"><span>Foes felled</span><strong>${result.kills}</strong></div>
          <div class="reward"><span>Supplies spent</span><strong>0</strong></div>
        </div>`;
    }
    const btn = $('#result-next');
    if (btn) btn.textContent = 'Return to Camp';
    resultNextAction = () => showCamp();
    showScreen('result-screen');
    return;
  }

  const lootChips = (summary.loot || []).map(l => {
    const item = getItem(l.id);
    return `<span class="loot-chip">${esc(item?.name || l.id)} ×${l.qty}</span>`;
  }).join('');
  const levels = (summary.levelUps || []).map(l =>
    `<div class="level-up"><strong>${esc(l.unit.name)}</strong> reached Lv ${l.to}${l.to > l.from + 1 ? ` (+${l.to - l.from})` : ''}.</div>`
  ).join('');
  const recruits = (summary.recruits || []).map(u =>
    `<div class="level-up"><strong>${esc(u.name)}</strong> joined the company as a ${esc(jobOf(u).name)}.</div>`
  ).join('');

  if (body) {
    body.innerHTML = `
      <p class="dialog-text" style="text-align:center;margin-top:0">${esc(enc.title)} — ${esc(enc.objective)}.</p>
      <div class="reward-grid">
        <div class="reward"><span>Gold</span><strong>${summary.gold}</strong></div>
        <div class="reward"><span>EXP each</span><strong>${summary.exp}</strong></div>
        <div class="reward"><span>JP each</span><strong>${summary.jp}</strong></div>
        <div class="reward"><span>Turns</span><strong>${result.turns}</strong></div>
        <div class="reward"><span>Foes felled</span><strong>${result.kills}</strong></div>
      </div>
      ${lootChips ? `<div class="section-title">Spoils</div><div class="loot-list">${lootChips}</div>` : ''}
      ${levels ? `<div class="section-title">Levels</div><div class="level-up-list">${levels}</div>` : ''}
      ${recruits ? `<div class="section-title">New Companions</div><div class="level-up-list">${recruits}</div>` : ''}
      <div class="result-note">
        Downed companions recover at camp.${state.completed ? ' The road is complete — the hollow crown is buried under salt.' : ' The next chapter waits on the road north.'}
      </div>`;
  }

  const btn = $('#result-next');
  if (btn) btn.textContent = state.completed ? 'See the Ending' : 'Continue the Chronicle';
  resultNextAction = () => {
    playStory(enc.outro, () => {
      showCamp();
      if (state.completed) {
        toast('The chronicle is complete. The living crown endures.');
      }
    });
  };
  showScreen('result-screen');
}

/* ============================================================
   CODEX & CREDITS
   ============================================================ */
function openCodex() {
  const lore = LORE.map(entry => `
    <div class="codex-entry"><h4>${esc(entry.title)}</h4><p>${esc(entry.text)}</p></div>`).join('');

  const jobBlock = (jobs) => jobs.map(j => `
    <div class="codex-job">
      <div>
        <div class="cj-name">${esc(j.sigil)} ${esc(j.name)}</div>
        <div class="cj-role">${esc(j.role)}${j.tier ? ' · Advanced' : ''}</div>
      </div>
      <div class="cj-role">MOV ${j.move} · JMP ${j.jump}</div>
      <div class="cj-arts">${j.arts.map(a => esc(a.name)).join(' · ')}</div>
    </div>`).join('');

  const panels = {
    lore: `<div class="codex-entry"><h4>Vaer, in brief</h4><p>The kingdom died nine winters ago. The crown did not. What follows is the record of the people who went to ask it politely to stop.</p></div>${lore}`,
    jobs: `
      <div class="section-title">Base Jobs</div>${jobBlock(BASE_JOBS)}
      <div class="section-title">Advanced Jobs</div>${jobBlock(ADVANCED_JOBS)}`,
    battle: LORE.slice(4).map(entry => `
      <div class="codex-entry"><h4>${esc(entry.title)}</h4><p>${esc(entry.text)}</p></div>`).join('') + `
      <div class="codex-entry"><h4>Conditions</h4><p>Poison and burn tick at the start of a turn. Stun skips a turn. Shields absorb damage before HP. Cleansing removes curses. Haste and Slow alter CT gain.</p></div>`,
    controls: `
      <div class="codex-entry"><h4>On the Board</h4><p>Tap or click a companion, then a teal tile to move. Tap a foe to inspect it. Use the action dock to Attack, open Arts, use Items, Wait, or check Info.</p></div>
      <div class="codex-entry"><h4>Desktop</h4><p>Hover a unit for its details. Escape cancels the current target or submenu. Click empty ground to dismiss a forecast.</p></div>
      <div class="codex-entry"><h4>Mobile</h4><p>The board, dock and turn order all fit small screens. Turn the device sideways for a wider field. Tap the board once to select, once to commit.</p></div>
      <div class="codex-entry"><h4>Sound</h4><p>All sound is generated in the browser. Use the Sound button in battle to mute or unmute.</p></div>`,
  };

  openModal({
    title: 'The Codex',
    wide: true,
    body: `
      <div class="codex-tabs">
        <button class="mtab active" data-codex="lore">Lore</button>
        <button class="mtab" data-codex="jobs">Jobs</button>
        <button class="mtab" data-codex="battle">Battle</button>
        <button class="mtab" data-codex="controls">Controls</button>
      </div>
      ${Object.entries(panels).map(([key, html]) =>
        `<div data-panel="${key}" ${key === 'lore' ? '' : 'class="hidden"'}>${html}</div>`).join('')}`,
    onMount: (card) => {
      card.querySelectorAll('[data-codex]').forEach(btn => {
        btn.addEventListener('click', () => {
          card.querySelectorAll('[data-codex]').forEach(b => b.classList.toggle('active', b === btn));
          card.querySelectorAll('[data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== btn.dataset.codex));
        });
      });
    },
  });
}

function openCredits() {
  openModal({
    title: 'Credits',
    body: `
      <div class="codex-entry">
        <h4>THE HOLLOW CROWN</h4>
        <p>A grim tactical chronicle of crumbling kingdoms, forbidden jobs, and brutal grid warfare.</p>
      </div>
      ${CREDITS.map(line => line ? `<p class="dialog-text" style="margin:6px 0">${esc(line)}</p>` : '<br>').join('')}
      <div class="codex-entry" style="margin-top:12px">
        <h4>No external assets</h4>
        <p>Every sprite, portrait, tile and sound is drawn or synthesised at runtime. The whole chronicle is HTML, CSS and JavaScript.</p>
      </div>`,
  });
}

/* ============================================================
   START
   ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// Expose a tiny debug handle for manual testing without affecting play.
window.HollowCrown = {
  get state() { return state; },
  get battle() { return currentBattle?.battle || null; },
  newGame() { state = newGame(); saveGame(state); showCamp(); },
  codex: openCodex,
};
