export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(count = 1) {
  return Array.from({ length: count }, rollDie);
}

// SVG dot positions for each face value (normalized 0–1 grid)
export const DICE_DOTS = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5],  [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25],[0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25],[0.5, 0.5],   [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.2],  [0.75, 0.2], [0.25, 0.5],  [0.75, 0.5],  [0.25, 0.8], [0.75, 0.8]],
};
