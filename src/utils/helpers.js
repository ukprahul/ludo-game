// Clamp a number between min and max
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Deep equality check (lightweight)
export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Shuffle an array (Fisher-Yates)
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Format timer seconds as MM:SS
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Pluralize a word
export function pluralize(count, word) {
  return `${count} ${count === 1 ? word : word + 's'}`;
}
