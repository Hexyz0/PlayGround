/* ============================================================
   THE HOLLOW CROWN — procedural 16-bit sound
   ============================================================ */
let ctx = null;
let master = null;
let muted = false;
try { muted = localStorage.getItem('hollow-crown-muted') === '1'; } catch { /* ignore */ }

function ensure() {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, dur, type = 'square', vol = 0.5, slide = 0, delay = 0) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur = 0.12, vol = 0.5, low = false) {
  const c = ensure();
  if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = low ? 'lowpass' : 'highpass';
  filter.frequency.value = low ? 500 : 900;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start();
}

export function sfx(name) {
  if (muted) return;
  switch (name) {
    case 'click': tone(420, 0.04, 'square', 0.3); break;
    case 'hover': tone(600, 0.02, 'square', 0.12); break;
    case 'move': tone(220, 0.05, 'triangle', 0.25, 30); break;
    case 'hit':
      noise(0.12, 0.55, true);
      tone(120, 0.12, 'square', 0.4, -50);
      break;
    case 'crit':
      noise(0.16, 0.7, false);
      tone(180, 0.16, 'sawtooth', 0.45, -90);
      break;
    case 'magic':
      tone(540, 0.22, 'sine', 0.3, 260);
      tone(270, 0.18, 'triangle', 0.2, -80, 0.02);
      break;
    case 'heal':
      tone(520, 0.12, 'sine', 0.28, 120);
      tone(780, 0.18, 'sine', 0.22, 160, 0.08);
      break;
    case 'buff':
      tone(330, 0.12, 'triangle', 0.24, 90);
      tone(495, 0.18, 'triangle', 0.2, 90, 0.08);
      break;
    case 'debuff':
      tone(300, 0.18, 'sawtooth', 0.2, -120);
      break;
    case 'turn':
      tone(392, 0.08, 'square', 0.22);
      tone(523, 0.12, 'square', 0.2, 0, 0.08);
      break;
    case 'enemyTurn':
      tone(196, 0.1, 'square', 0.22);
      tone(147, 0.14, 'square', 0.2, 0, 0.09);
      break;
    case 'select': tone(660, 0.04, 'square', 0.18); break;
    case 'cancel': tone(220, 0.06, 'square', 0.18, -40); break;
    case 'victory':
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'square', 0.22, 0, i * 0.1));
      break;
    case 'defeat':
      [330, 294, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.25, -20, i * 0.14));
      break;
    case 'levelup':
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.14, 'square', 0.2, 0, i * 0.06));
      break;
    case 'loot':
      tone(880, 0.08, 'square', 0.2);
      tone(1174, 0.14, 'square', 0.18, 0, 0.07);
      break;
    default: break;
  }
}

export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('hollow-crown-muted', muted ? '1' : '0'); } catch { /* ignore */ }
  if (!muted) sfx('click');
  return muted;
}
export function initAudio() { ensure(); }
