/* ============================================================
   THE HOLLOW CROWN — shared UI helpers
   ============================================================ */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function showScreen(id) {
  for (const screen of $$('.screen')) screen.classList.toggle('active', screen.id === id);
  const active = document.getElementById(id);
  if (active) active.scrollTop = 0;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastEl = null;
let toastTimer = 0;
export function toast(message, ms = 2200) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.id = 'global-toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

/* ---------- modal ---------- */
let modalMount = null;
let modalKeyHandler = null;

export function openModal({ title, body, footer = '', onMount = null, wide = false }) {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = `
    <div class="modal-card" role="document" ${wide ? 'style="width:min(1040px,97vw)"' : ''}>
      <div class="modal-head">
        <h2>${esc(title)}</h2>
        <button class="modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-body" style="padding-top:0">${footer}</div>` : ''}
    </div>`;
  root.classList.remove('hidden');
  const card = root.querySelector('.modal-card');
  const close = () => closeModal();
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  root.onclick = (e) => { if (e.target === root) close(); };
  modalKeyHandler = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', modalKeyHandler);
  modalMount = onMount;
  if (onMount) onMount(card, root);
  return card;
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.classList.add('hidden');
  root.innerHTML = '';
  root.onclick = null;
  if (modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler);
  modalKeyHandler = null;
  modalMount = null;
}

export function confirmDialog({ title = 'Confirm', text = '', confirm = 'Confirm', cancel = 'Cancel', danger = false }) {
  return new Promise(resolve => {
    let settled = false;
    const done = (v) => {
      if (settled) return;
      settled = true;
      closeModal();
      resolve(v);
    };
    const card = openModal({
      title,
      body: `<p class="dialog-text">${esc(text)}</p>`,
      footer: `<div class="dialog-actions">
        <button class="btn ghost" data-act="cancel">${esc(cancel)}</button>
        <button class="btn ${danger ? 'danger' : 'gold'}" data-act="ok">${esc(confirm)}</button>
      </div>`,
    });
    card.querySelector('[data-act="cancel"]').onclick = () => done(false);
    card.querySelector('[data-act="ok"]').onclick = () => done(true);
    card.querySelector('.modal-close').addEventListener('click', () => done(false));
    // Esc / backdrop also resolve false
    const oldClose = document.getElementById('modal-root');
    oldClose.addEventListener('click', (e) => { if (e.target === oldClose) done(false); });
  });
}

/* ---------- formatting ---------- */
export const STAT_NAMES = { maxHp: 'HP', maxMp: 'MP', pa: 'PA', ma: 'MA', def: 'DEF', res: 'RES', spd: 'SPD', move: 'MOV', jump: 'JMP', luck: 'LUK' };

export function bar(value, max, cls = 'hp') {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return `<div class="bar"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>`;
}

export function statusLabel(id) {
  return {
    stun: 'Stun', slow: 'Slow', haste: 'Haste', poison: 'Poison', burn: 'Burn',
    regen: 'Regen', defUp: 'DEF+', atkUp: 'PA+', silence: 'Silence', shield: 'Shield',
    defDown: 'DEF-', ward: 'RES+', evade: 'Evade', riposte: 'Riposte', focus: 'Focus',
  }[id] || id;
}

export function statusKind(id) {
  return ['poison', 'burn', 'slow', 'silence', 'defDown', 'stun'].includes(id) ? 'bad' : 'good';
}

export function itemStatLine(item) {
  if (!item) return '';
  const parts = [];
  if (item.atk) parts.push(`ATK ${item.atk}`);
  if (item.mag) parts.push(`MAG ${item.mag}`);
  if (item.range) parts.push(`RNG ${item.range}`);
  if (item.def) parts.push(`DEF ${item.def}`);
  if (item.res) parts.push(`RES ${item.res}`);
  if (item.hp) parts.push(`HP ${item.hp}`);
  if (item.mp) parts.push(`MP ${item.mp}`);
  if (item.spd) parts.push(`SPD ${item.spd}`);
  if (item.move) parts.push(`MOV ${item.move}`);
  return parts.join(' · ');
}

export function levelProgress(exp, level) {
  const need = 42 + level * 19;
  return { exp, need, pct: Math.min(100, (exp / need) * 100) };
}
