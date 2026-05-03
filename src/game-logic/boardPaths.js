import { PLAYER_START_INDEX, MAIN_TRACK_LENGTH, HOME_STRETCH_LENGTH, FINISH_POSITION, SAFE_ZONE_INDICES, HOME_BASE_POSITIONS } from './constants';

// ─── Main 52-square track (absolute indices 0–51, clockwise from Red's entry) ────
export const MAIN_PATH = [
  // Red entry area – moving right along row 6
  [6,1],[6,2],[6,3],[6,4],[6,5],          // 0–4   (0 = Red start)
  // Up left column of top arm (col 6)
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],    // 5–10
  // Across top of board
  [0,7],[0,8],                             // 11–12
  // Down right column of top arm (col 8)
  [1,8],[2,8],[3,8],[4,8],[5,8],          // 13–17  (13 = Blue start)
  // Right along row 6 through right arm
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14], // 18–23
  // Down right edge
  [7,14],[8,14],                            // 24–25
  // Left along row 8 through right arm
  [8,13],[8,12],[8,11],[8,10],[8,9],       // 26–30  (26 = Green start)
  // Down right column of bottom arm (col 8)
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8], // 31–36
  // Across bottom of board
  [14,7],[14,6],                            // 37–38
  // Up left column of bottom arm (col 6)
  [13,6],[12,6],[11,6],[10,6],[9,6],       // 39–43  (39 = Yellow start)
  // Left along row 8 through left arm
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],    // 44–49
  // Up left edge
  [7,0],[6,0],                             // 50–51
];

// ─── Home stretches – 6 squares each, entering toward center (7,7) ────────────
export const HOME_STRETCH = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],   // Row 7, left arm → right
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],   // Col 7, top arm  → down
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]], // Row 7, right arm → left
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]], // Col 7, bottom arm → up
};

export const CENTER_CELL = [7, 7];

// ─── Convert a player-relative position (0–57) to a [row, col] ───────────────
export function getTokenCell(playerId, position) {
  if (position < 0) return null; // in home base
  if (position >= FINISH_POSITION) return CENTER_CELL;
  if (position >= MAIN_TRACK_LENGTH) {
    const stretchIdx = position - MAIN_TRACK_LENGTH;
    return HOME_STRETCH[playerId][stretchIdx];
  }
  const absIdx = (PLAYER_START_INDEX[playerId] + position) % MAIN_TRACK_LENGTH;
  return MAIN_PATH[absIdx];
}

// ─── Absolute track index from player-relative position ─────────────────────
export function toAbsoluteIndex(playerId, position) {
  if (position < 0 || position >= MAIN_TRACK_LENGTH) return null;
  return (PLAYER_START_INDEX[playerId] + position) % MAIN_TRACK_LENGTH;
}

// ─── Check if a position is a safe zone ──────────────────────────────────────
export function isSafeZone(playerId, position) {
  if (position < 0 || position >= MAIN_TRACK_LENGTH) return true; // home base / home stretch are always safe
  const absIdx = toAbsoluteIndex(playerId, position);
  return SAFE_ZONE_INDICES.has(absIdx);
}

// ─── Build a grid-cell metadata map (15×15) used by the Board renderer ───────
export function buildCellMap() {
  const grid = Array.from({ length: 15 }, () =>
    Array.from({ length: 15 }, () => ({ type: 'void' }))
  );

  const set = (r, c, data) => { grid[r][c] = data; };

  // Home base areas (6×6 corners)
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++)        set(r, c,     { type: 'home', player: 'red' });
  for (let r = 0; r < 6; r++) for (let c = 9; c < 15; c++)       set(r, c,     { type: 'home', player: 'blue' });
  for (let r = 9; r < 15; r++) for (let c = 9; c < 15; c++)      set(r, c,     { type: 'home', player: 'green' });
  for (let r = 9; r < 15; r++) for (let c = 0; c < 6; c++)       set(r, c,     { type: 'home', player: 'yellow' });

  // Main track
  MAIN_PATH.forEach(([r, c], idx) => {
    const safe = SAFE_ZONE_INDICES.has(idx);
    // Determine starting player
    const startingPlayer = Object.entries(PLAYER_START_INDEX).find(([, v]) => v === idx)?.[0];
    set(r, c, {
      type: startingPlayer ? 'start' : safe ? 'safe' : 'path',
      player: startingPlayer || null,
      absIndex: idx,
    });
  });

  // Home stretches
  Object.entries(HOME_STRETCH).forEach(([player, squares]) => {
    squares.forEach(([r, c], idx) => {
      set(r, c, { type: 'homestretch', player, step: idx });
    });
  });

  // Center
  for (let r = 6; r <= 8; r++) {
    for (let c = 6; c <= 8; c++) {
      if (r === 7 && c === 7) {
        set(r, c, { type: 'center' });
      } else {
        // The four corner triangles of center (home-stretch color zones)
        const playerMap = { '6,6': 'red', '6,8': 'blue', '8,8': 'green', '8,6': 'yellow' };
        const p = playerMap[`${r},${c}`];
        set(r, c, p ? { type: 'center-zone', player: p } : { type: 'center-path' });
      }
    }
  }

  return grid;
}

// ─── Singleton: build once, export ───────────────────────────────────────────
export const CELL_MAP = buildCellMap();

// ─── Token home-base slot coordinates (for visual placement) ─────────────────
export { HOME_BASE_POSITIONS };
