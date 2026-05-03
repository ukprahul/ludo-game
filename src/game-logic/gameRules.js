import {
  PLAYERS,
  PLAYER_START_INDEX,
  MAIN_TRACK_LENGTH,
  HOME_STRETCH_LENGTH,
  FINISH_POSITION,
  TOKEN_COUNT,
} from './constants';
import { isSafeZone, getTokenCell, toAbsoluteIndex } from './boardPaths';

// ─── Token creation ────────────────────────────────────────────────────────────
export function createToken(id) {
  return {
    id,
    position: -1,   // -1 = home base, 0..57 = on board, 58 = finished
    isShielded: false,
    shieldTurns: 0,
    isFrozen: false,
    frozenTurns: 0,
  };
}

export function createPlayer(id, name, type = 'human', aiDifficulty = 'medium') {
  return {
    id,
    name,
    type,
    aiDifficulty,
    tokens: Array.from({ length: TOKEN_COUNT }, (_, i) => createToken(i)),
    powerCards: [],
    finishedCount: 0,
  };
}

// ─── Valid moves for one dice value ──────────────────────────────────────────
export function getValidMoves(player, diceValue) {
  const moves = [];
  for (const token of player.tokens) {
    if (token.position === FINISH_POSITION) continue;  // already finished
    if (token.isFrozen) continue;                       // frozen this turn

    if (token.position === -1) {
      // Token in home base: needs a 6 to enter
      if (diceValue === 6) {
        moves.push({ tokenId: token.id, from: -1, to: 0 });
      }
    } else {
      const newPos = token.position + diceValue;
      if (newPos > FINISH_POSITION) continue;           // would overshoot center
      // Can't enter home stretch of another player's stretch (safe by default)
      moves.push({ tokenId: token.id, from: token.position, to: newPos });
    }
  }
  return moves;
}

// ─── Apply a move; returns { nextState, capturedToken } ──────────────────────
export function applyMove(gameState, playerId, tokenId, targetPosition) {
  // Deep-clone state to avoid mutation
  const state = JSON.parse(JSON.stringify(gameState));
  const player = state.players.find(p => p.id === playerId);
  const token = player.tokens.find(t => t.id === tokenId);
  const oldPosition = token.position;

  token.position = targetPosition;

  let capturedInfo = null;

  if (targetPosition === FINISH_POSITION) {
    player.finishedCount += 1;
  }

  // Check capture: only on main track, not in safe zones
  if (targetPosition >= 0 && targetPosition < MAIN_TRACK_LENGTH) {
    if (!isSafeZone(playerId, targetPosition)) {
      const absTarget = toAbsoluteIndex(playerId, targetPosition);
      for (const opp of state.players) {
        if (opp.id === playerId) continue;
        for (const ot of opp.tokens) {
          if (ot.position < 0 || ot.position >= MAIN_TRACK_LENGTH) continue;
          const oppAbs = toAbsoluteIndex(opp.id, ot.position);
          if (oppAbs === absTarget && !ot.isShielded) {
            capturedInfo = { playerId: opp.id, tokenId: ot.id };
            ot.position = -1; // send home
          }
        }
      }
    }
  }

  // Decrement shield/freeze counters
  for (const p of state.players) {
    for (const t of p.tokens) {
      if (t.isShielded && t.shieldTurns > 0) {
        t.shieldTurns -= 1;
        if (t.shieldTurns === 0) t.isShielded = false;
      }
      if (t.isFrozen && t.frozenTurns > 0) {
        t.frozenTurns -= 1;
        if (t.frozenTurns === 0) t.isFrozen = false;
      }
    }
  }

  return { state, capturedInfo };
}

// ─── Check if a player has won ────────────────────────────────────────────────
export function checkWinner(players) {
  return players.find(p => p.finishedCount === TOKEN_COUNT) || null;
}

// ─── Determine next player index ──────────────────────────────────────────────
export function nextPlayerIndex(currentIndex, players, rolledSix, captured) {
  // Rolling a 6 or capturing grants an extra turn
  if (rolledSix || captured) return currentIndex;
  let next = (currentIndex + 1) % players.length;
  return next;
}

// ─── Tokens that land on the same absolute cell (for stacking display) ────────
export function getTokensAtCell(players, row, col) {
  const result = [];
  for (const player of players) {
    for (const token of player.tokens) {
      const cell = getTokenCell(player.id, token.position);
      if (cell && cell[0] === row && cell[1] === col) {
        result.push({ playerId: player.id, tokenId: token.id, token });
      }
    }
  }
  return result;
}
