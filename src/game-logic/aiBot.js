import { getValidMoves, checkWinner } from './gameRules';
import { POWER_TYPES, FINISH_POSITION, MAIN_TRACK_LENGTH, AI_DIFFICULTY } from './constants';
import { rollDie } from './diceLogic';
import { isSafeZone, toAbsoluteIndex } from './boardPaths';

// ─── Score a single move for heuristic evaluation ────────────────────────────
function scoreMove(player, move, allPlayers, diceValue) {
  let score = 0;
  const token = player.tokens.find(t => t.id === move.tokenId);

  // Strongly prefer entering the board
  if (move.from === -1) score += 50;

  // Prefer advancing
  score += move.to - move.from;

  // Prefer moving closer to finish
  const distToFinish = FINISH_POSITION - move.to;
  score += (FINISH_POSITION - distToFinish) * 0.5;

  // Big bonus for entering home stretch
  if (move.to >= MAIN_TRACK_LENGTH && move.from < MAIN_TRACK_LENGTH) score += 30;

  // Bonus if landing captures an opponent
  if (move.to < MAIN_TRACK_LENGTH && !isSafeZone(player.id, move.to)) {
    const absTarget = toAbsoluteIndex(player.id, move.to);
    for (const opp of allPlayers) {
      if (opp.id === player.id) continue;
      for (const ot of opp.tokens) {
        if (ot.position < 0 || ot.position >= MAIN_TRACK_LENGTH) continue;
        if (!ot.isShielded && toAbsoluteIndex(opp.id, ot.position) === absTarget) {
          score += 80;
        }
      }
    }
  }

  // Penalty for landing on unsafe zone near opponent
  if (!isSafeZone(player.id, move.to)) {
    const absTarget = toAbsoluteIndex(player.id, move.to);
    for (const opp of allPlayers) {
      if (opp.id === player.id) continue;
      for (const ot of opp.tokens) {
        if (ot.position < 0 || ot.position >= MAIN_TRACK_LENGTH) continue;
        const oppAbs = toAbsoluteIndex(opp.id, ot.position);
        // If an opponent is within 6 steps of our landing square, penalise
        const dist = (absTarget - oppAbs + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
        if (dist > 0 && dist <= 6) score -= 20;
      }
    }
  }

  return score;
}

// ─── Choose best move based on difficulty ─────────────────────────────────────
export function chooseBotMove(player, diceValue, allPlayers, difficulty) {
  const validMoves = getValidMoves(player, diceValue);
  if (validMoves.length === 0) return null;
  if (difficulty === AI_DIFFICULTY.EASY) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  const scored = validMoves.map(m => ({
    move: m,
    score: scoreMove(player, m, allPlayers, diceValue),
  }));
  scored.sort((a, b) => b.score - a.score);

  if (difficulty === AI_DIFFICULTY.MEDIUM) {
    // 70% chance best move, 30% random
    return Math.random() < 0.7 ? scored[0].move : validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // Hard: always best
  return scored[0].move;
}

// ─── Bot power-card decision ─────────────────────────────────────────────────
export function chooseBotPowerCard(player, allPlayers, difficulty) {
  if (difficulty === AI_DIFFICULTY.EASY) return null; // easy bots never use powers

  const usable = player.powerCards.filter(c => !c.used);
  if (usable.length === 0) return null;

  // Decide whether to use a card this turn (medium: 20%, hard: 40%)
  const threshold = difficulty === AI_DIFFICULTY.HARD ? 0.4 : 0.2;
  if (Math.random() > threshold) return null;

  // Pick a card and minimal valid payload
  const card = usable[Math.floor(Math.random() * usable.length)];

  const myOnBoardTokens = player.tokens.filter(t => t.position >= 0 && t.position < FINISH_POSITION);
  const myCapturedTokens = player.tokens.filter(t => t.position === -1);

  const opponents = allPlayers.filter(p => p.id !== player.id);
  const oppOnBoard = opponents.flatMap(p =>
    p.tokens.filter(t => t.position >= 0 && t.position < MAIN_TRACK_LENGTH)
      .map(t => ({ playerId: p.id, tokenId: t.id }))
  );

  switch (card.type) {
    case POWER_TYPES.SHIELD:
      if (myOnBoardTokens.length === 0) return null;
      return { type: card.type, payload: { tokenId: myOnBoardTokens[0].id } };

    case POWER_TYPES.SPEED_BOOST: {
      const best = myOnBoardTokens.sort((a, b) => b.position - a.position)[0];
      if (!best) return null;
      return { type: card.type, payload: { tokenId: best.id } };
    }

    case POWER_TYPES.EXTRA_LIFE:
      if (myCapturedTokens.length === 0) return null;
      return { type: card.type, payload: { tokenId: myCapturedTokens[0].id } };

    case POWER_TYPES.FREEZE:
    case POWER_TYPES.REVERSE:
      if (oppOnBoard.length === 0) return null;
      return { type: card.type, payload: { targetPlayerId: oppOnBoard[0].playerId, tokenId: oppOnBoard[0].tokenId } };

    case POWER_TYPES.SWAP: {
      if (myOnBoardTokens.length === 0 || oppOnBoard.length === 0) return null;
      const target = oppOnBoard.sort((a, b) => b.position - a.position)[0];
      return { type: card.type, payload: { myTokenId: myOnBoardTokens[0].id, targetPlayerId: target.playerId, targetTokenId: target.tokenId } };
    }

    case POWER_TYPES.DOUBLE_ROLL:
      return { type: card.type, payload: {} };

    default:
      return null;
  }
}
