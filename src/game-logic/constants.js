export const PLAYERS = ['red', 'blue', 'green', 'yellow'];

export const PLAYER_COLORS = {
  red:    { primary: '#dc2626', light: '#fca5a5', dark: '#991b1b', text: 'text-red-600',    bg: 'bg-red-500',    border: 'border-red-600',    tailwind: 'red' },
  blue:   { primary: '#2563eb', light: '#93c5fd', dark: '#1e40af', text: 'text-blue-600',   bg: 'bg-blue-500',   border: 'border-blue-600',   tailwind: 'blue' },
  green:  { primary: '#16a34a', light: '#86efac', dark: '#14532d', text: 'text-green-600',  bg: 'bg-green-500',  border: 'border-green-600',  tailwind: 'green' },
  yellow: { primary: '#d97706', light: '#fcd34d', dark: '#92400e', text: 'text-yellow-600', bg: 'bg-yellow-500', border: 'border-yellow-600', tailwind: 'yellow' },
};

export const TOKEN_COUNT = 4;

// Player starting indices on the main (absolute) 52-square track
export const PLAYER_START_INDEX = { red: 0, blue: 13, green: 26, yellow: 39 };

// Player token home-base cell positions [row, col] for visual display (2×2 inside each corner)
export const HOME_BASE_POSITIONS = {
  red:    [[1,1],[1,4],[4,1],[4,4]],
  blue:   [[1,10],[1,13],[4,10],[4,13]],
  green:  [[10,10],[10,13],[13,10],[13,13]],
  yellow: [[10,1],[10,4],[13,1],[13,4]],
};

// Safe zones – absolute indices on the main 52-track where tokens cannot be captured
export const SAFE_ZONE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Steps on main track before entering home stretch
export const MAIN_TRACK_LENGTH = 52;
// Home stretch squares per player
export const HOME_STRETCH_LENGTH = 6;
// A token is "finished" at this player-relative position
export const FINISH_POSITION = MAIN_TRACK_LENGTH + HOME_STRETCH_LENGTH; // 58

// Game modes
export const GAME_MODES = {
  CLASSIC: 'classic',
  POWER:   'power',
  BLITZ:   'blitz',
};

// Turn timer durations (ms)
export const TURN_TIMERS = {
  [GAME_MODES.CLASSIC]: null,
  [GAME_MODES.POWER]:   null,
  [GAME_MODES.BLITZ]:   15000,
};

// AI difficulty labels
export const AI_DIFFICULTY = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' };

// Power card types
export const POWER_TYPES = {
  SHIELD:      'shield',
  TELEPORT:    'teleport',
  DOUBLE_ROLL: 'double_roll',
  FREEZE:      'freeze',
  SWAP:        'swap',
  SPEED_BOOST: 'speed_boost',
  REVERSE:     'reverse',
  EXTRA_LIFE:  'extra_life',
};

export const POWER_CARDS_PER_PLAYER = 3;

export const POWER_CARD_INFO = {
  [POWER_TYPES.SHIELD]:      { label: 'Shield',      emoji: '🛡️',  description: 'Protect one token from capture for 2 turns.',         color: 'from-blue-500 to-cyan-400' },
  [POWER_TYPES.TELEPORT]:    { label: 'Teleport',    emoji: '✨',  description: 'Move any token instantly to any safe zone.',          color: 'from-purple-500 to-pink-400' },
  [POWER_TYPES.DOUBLE_ROLL]: { label: 'Double Roll', emoji: '🎲',  description: 'Roll twice; apply both values to one or two tokens.',  color: 'from-orange-500 to-yellow-400' },
  [POWER_TYPES.FREEZE]:      { label: 'Freeze',      emoji: '❄️',  description: "Freeze one opponent token – they skip it next turn.", color: 'from-sky-500 to-blue-300' },
  [POWER_TYPES.SWAP]:        { label: 'Swap',        emoji: '🔄',  description: 'Swap positions with any opponent token.',             color: 'from-green-500 to-teal-400' },
  [POWER_TYPES.SPEED_BOOST]: { label: 'Speed Boost', emoji: '⚡',  description: 'Instantly move one token forward 6 steps.',          color: 'from-yellow-500 to-orange-400' },
  [POWER_TYPES.REVERSE]:     { label: 'Reverse',     emoji: '↩️',  description: 'Force an opponent token backward 3 steps.',          color: 'from-red-500 to-rose-400' },
  [POWER_TYPES.EXTRA_LIFE]:  { label: 'Extra Life',  emoji: '💫',  description: 'Revive a captured token without needing a 6.',       color: 'from-emerald-500 to-green-300' },
};

export const GAME_PHASES = {
  SETUP:    'setup',
  ROLLING:  'rolling',
  MOVING:   'moving',
  POWER:    'power',
  FINISHED: 'finished',
};
