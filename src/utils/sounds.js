// Sound manager using Web Audio API (no external files needed)
// Generates procedural audio for all game events

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone({ frequency = 440, type = 'sine', duration = 0.15, volume = 0.3, delay = 0 }) {
  try {
    const ctx = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch {
    // Audio not available – silently ignore
  }
}

const SOUNDS = {
  dice: () => {
    // Rattling sound: rapid random tones
    for (let i = 0; i < 6; i++) {
      playTone({ frequency: 200 + Math.random() * 300, type: 'square', duration: 0.07, volume: 0.15, delay: i * 0.06 });
    }
  },
  move: () => {
    playTone({ frequency: 520, type: 'sine', duration: 0.12, volume: 0.25 });
    playTone({ frequency: 660, type: 'sine', duration: 0.1,  volume: 0.2, delay: 0.1 });
  },
  capture: () => {
    playTone({ frequency: 300, type: 'sawtooth', duration: 0.2, volume: 0.3 });
    playTone({ frequency: 220, type: 'sawtooth', duration: 0.3, volume: 0.3, delay: 0.15 });
  },
  power: () => {
    playTone({ frequency: 880, type: 'sine', duration: 0.15, volume: 0.3 });
    playTone({ frequency: 1100, type: 'sine', duration: 0.15, volume: 0.3, delay: 0.12 });
    playTone({ frequency: 1320, type: 'sine', duration: 0.2,  volume: 0.3, delay: 0.24 });
  },
  win: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone({ frequency: freq, type: 'sine', duration: 0.3, volume: 0.35, delay: i * 0.18 });
    });
  },
  error: () => {
    playTone({ frequency: 200, type: 'square', duration: 0.25, volume: 0.2 });
  },
};

export function playSound(name) {
  SOUNDS[name]?.();
}
