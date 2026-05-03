import { POWER_TYPES, POWER_CARDS_PER_PLAYER, FINISH_POSITION, MAIN_TRACK_LENGTH } from './constants';
import { isSafeZone, MAIN_PATH } from './boardPaths';

// ─── Assign random power cards at game start ──────────────────────────────────
export function dealPowerCards() {
  const all = Object.values(POWER_TYPES);
  const dealt = [];
  while (dealt.length < POWER_CARDS_PER_PLAYER) {
    const pick = all[Math.floor(Math.random() * all.length)];
    if (!dealt.includes(pick)) dealt.push(pick);
  }
  return dealt.map((type, id) => ({ id, type, used: false }));
}


// ─── Apply a power card; returns updated state ────────────────────────────────
export function applyPowerCard(gameState, actingPlayerId, cardType, payload) {
  const state = JSON.parse(JSON.stringify(gameState));
  const actor = state.players.find(p => p.id === actingPlayerId);

  // Mark card as used
  const card = actor.powerCards.find(c => c.type === cardType && !c.used);
  if (card) card.used = true;

  switch (cardType) {
    case POWER_TYPES.SHIELD: {
      // payload: { tokenId }
      const token = actor.tokens.find(t => t.id === payload.tokenId);
      if (token) {
        token.isShielded = true;
        token.shieldTurns = 2;
      }
      break;
    }

    case POWER_TYPES.TELEPORT: {
      // payload: { tokenId, safeZoneAbsIndex }
      const token = actor.tokens.find(t => t.id === payload.tokenId);
      if (!token || token.position < 0) break;
      const targetAbs = payload.safeZoneAbsIndex;
      const PS_MAP = { red: 0, blue: 13, green: 26, yellow: 39 };
      const ps = PS_MAP[actingPlayerId];
      const relPos = (targetAbs - ps + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
      token.position = relPos;
      break;
    }

    case POWER_TYPES.DOUBLE_ROLL: {
      // payload: handled at UI level – game gets two dice values
      // This card is handled before the move phase; mark used here
      break;
    }

    case POWER_TYPES.FREEZE: {
      // payload: { targetPlayerId, tokenId }
      const opp = state.players.find(p => p.id === payload.targetPlayerId);
      if (opp) {
        const t = opp.tokens.find(t => t.id === payload.tokenId);
        if (t) { t.isFrozen = true; t.frozenTurns = 1; }
      }
      break;
    }

    case POWER_TYPES.SWAP: {
      // payload: { myTokenId, targetPlayerId, targetTokenId }
      const myToken = actor.tokens.find(t => t.id === payload.myTokenId);
      const opp     = state.players.find(p => p.id === payload.targetPlayerId);
      const oppToken = opp?.tokens.find(t => t.id === payload.targetTokenId);
      if (myToken && oppToken && myToken.position >= 0 && oppToken.position >= 0
          && myToken.position < FINISH_POSITION && oppToken.position < FINISH_POSITION) {
        const tmpPos = myToken.position;
        myToken.position = oppToken.position;
        oppToken.position = tmpPos;
      }
      break;
    }

    case POWER_TYPES.SPEED_BOOST: {
      // payload: { tokenId }
      const token = actor.tokens.find(t => t.id === payload.tokenId);
      if (token && token.position >= 0) {
        const newPos = Math.min(token.position + 6, FINISH_POSITION);
        token.position = newPos;
        if (newPos === FINISH_POSITION) actor.finishedCount += 1;
      }
      break;
    }

    case POWER_TYPES.REVERSE: {
      // payload: { targetPlayerId, tokenId }
      const opp = state.players.find(p => p.id === payload.targetPlayerId);
      if (opp) {
        const t = opp.tokens.find(t => t.id === payload.tokenId);
        if (t && t.position > 0) {
          t.position = Math.max(0, t.position - 3);
        }
      }
      break;
    }

    case POWER_TYPES.EXTRA_LIFE: {
      // payload: { tokenId } — revive a captured (home-base) token to position 0
      const token = actor.tokens.find(t => t.id === payload.tokenId);
      if (token && token.position === -1) {
        token.position = 0;
      }
      break;
    }

    default:
      break;
  }

  return state;
}

// ─── Which powers need a target selection ────────────────────────────────────
export const POWERS_NEEDING_OWN_TOKEN     = [POWER_TYPES.SHIELD, POWER_TYPES.SPEED_BOOST, POWER_TYPES.EXTRA_LIFE, POWER_TYPES.TELEPORT];
export const POWERS_NEEDING_OPPONENT_TOKEN = [POWER_TYPES.FREEZE, POWER_TYPES.REVERSE, POWER_TYPES.SWAP];
export const POWERS_INSTANT               = [POWER_TYPES.DOUBLE_ROLL];
