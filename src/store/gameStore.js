import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  GAME_MODES, GAME_PHASES, PLAYERS, TOKEN_COUNT, POWER_TYPES, TURN_TIMERS,
} from '../game-logic/constants';
import { createPlayer, getValidMoves, applyMove, checkWinner, nextPlayerIndex } from '../game-logic/gameRules';
import { rollDice as rollDiceValues } from '../game-logic/diceLogic';
import { applyPowerCard, dealPowerCards } from '../game-logic/powerCards';

const DEFAULT_SETUP = {
  mode: GAME_MODES.CLASSIC,
  playerCount: 4,
  playerConfigs: PLAYERS.map((id, idx) => ({
    id,
    name: idx === 0 ? 'You' : `Player ${idx + 1}`,
    type: idx === 0 ? 'human' : 'ai',
    aiDifficulty: 'medium',
  })),
};

const INITIAL_STATE = {
  setup: DEFAULT_SETUP,
  screen: 'home',
  gameType: 'local',
  roomCode: null,
  localPlayerId: null,

  mode: GAME_MODES.CLASSIC,
  players: [],
  currentPlayerIndex: 0,
  phase: GAME_PHASES.SETUP,

  diceValues: [],
  diceRolled: false,
  usedDiceIndices: [],
  pendingDoubleRoll: false,

  selectedCardType: null,

  movableTokens: [],
  selectedTokenId: null,

  winner: null,
  turnStartTime: null,
  timerDuration: null,
};

export const useGameStore = create(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    // ── Navigation ────────────────────────────────────────────────────────
    setScreen: (screen) => set({ screen }),

    // ── Setup mutations ───────────────────────────────────────────────────
    updateSetup: (patch) => set(s => ({ setup: { ...s.setup, ...patch } })),
    updatePlayerConfig: (id, patch) => set(s => ({
      setup: {
        ...s.setup,
        playerConfigs: s.setup.playerConfigs.map(p => p.id === id ? { ...p, ...patch } : p),
      },
    })),

    // ── Start game ────────────────────────────────────────────────────────
    startGame: ({ mode, gameType, playerConfigs, roomCode, localPlayerId }) => {
      const withPowers = mode === GAME_MODES.POWER;
      const players = playerConfigs.map(cfg => {
        const p = createPlayer(cfg.id, cfg.name, cfg.type, cfg.aiDifficulty);
        if (withPowers) p.powerCards = dealPowerCards();
        return p;
      });
      set({
        mode, gameType,
        roomCode:    roomCode || null,
        localPlayerId: localPlayerId || playerConfigs[0].id,
        screen: 'game',
        phase:  GAME_PHASES.ROLLING,
        players,
        currentPlayerIndex: 0,
        diceValues: [],
        diceRolled: false,
        usedDiceIndices: [],
        pendingDoubleRoll: false,
        winner: null,
        selectedCardType: null,
        selectedTokenId: null,
        movableTokens: [],
        turnStartTime: Date.now(),
        timerDuration: TURN_TIMERS[mode],
      });
    },

    // ── Roll dice ─────────────────────────────────────────────────────────
    rollDice: () => {
      const { phase, players, currentPlayerIndex, diceRolled, pendingDoubleRoll } = get();
      if (phase !== GAME_PHASES.ROLLING || diceRolled) return;

      const count  = pendingDoubleRoll ? 2 : 1;
      const values = rollDiceValues(count);
      const player = players[currentPlayerIndex];
      const validMoves = getValidMoves(player, values[0]);
      const movableTokens = validMoves.map(m => m.tokenId);

      if (validMoves.length === 0 && values.length === 1) {
        // No moves – auto-skip turn
        const next = (currentPlayerIndex + 1) % players.length;
        set({
          diceValues: values, diceRolled: true,
          phase: GAME_PHASES.ROLLING,
          currentPlayerIndex: next,
          diceRolled: false, diceValues: [],
          movableTokens: [],
          pendingDoubleRoll: false,
          turnStartTime: Date.now(),
        });
      } else {
        set({
          diceValues: values,
          diceRolled: true,
          usedDiceIndices: [],
          movableTokens,
          phase: GAME_PHASES.MOVING,
          pendingDoubleRoll: false,
        });
      }
    },

    // ── Move a token ──────────────────────────────────────────────────────
    moveToken: (tokenId) => {
      const { players, currentPlayerIndex, diceValues, usedDiceIndices } = get();
      const player = players[currentPlayerIndex];
      const diceIdx  = usedDiceIndices.length === 0 ? 0 : 1;
      const diceValue = diceValues[diceIdx];

      const validMoves = getValidMoves(player, diceValue);
      const move = validMoves.find(m => m.tokenId === tokenId);
      if (!move) return;

      const { state: newState, capturedInfo } = applyMove({ players }, player.id, tokenId, move.to);
      const newPlayers = newState.players;

      const winner = checkWinner(newPlayers);
      if (winner) {
        set({ players: newPlayers, winner: winner.id, phase: GAME_PHASES.FINISHED, screen: 'result' });
        return;
      }

      const newUsed = [...usedDiceIndices, diceIdx];
      const rolledSix = diceValue === 6;
      const captured  = !!capturedInfo;

      // If double roll and second dice unused
      if (diceValues.length === 2 && newUsed.length < 2) {
        const nextDiceVal = diceValues[1];
        const nextMoves = getValidMoves(newPlayers[currentPlayerIndex], nextDiceVal);
        if (nextMoves.length > 0) {
          set({
            players: newPlayers,
            usedDiceIndices: newUsed,
            movableTokens: nextMoves.map(m => m.tokenId),
          });
          return;
        }
      }

      // Advance turn
      const nextIdx = nextPlayerIndex(currentPlayerIndex, newPlayers, rolledSix, captured);
      set({
        players: newPlayers,
        currentPlayerIndex: nextIdx,
        phase: GAME_PHASES.ROLLING,
        diceRolled: false,
        diceValues: [],
        usedDiceIndices: [],
        movableTokens: [],
        selectedTokenId: null,
        turnStartTime: Date.now(),
      });
    },

    // ── Power cards ───────────────────────────────────────────────────────
    activatePowerCard: (cardType) => {
      if (cardType === POWER_TYPES.DOUBLE_ROLL) {
        // Mark card used and flag next roll as double
        const { players, currentPlayerIndex } = get();
        const newPlayers = players.map((p, i) => {
          if (i !== currentPlayerIndex) return p;
          return {
            ...p,
            powerCards: p.powerCards.map(c => c.type === cardType && !c.used ? { ...c, used: true } : c),
          };
        });
        set({ players: newPlayers, pendingDoubleRoll: true, selectedCardType: null });
      } else {
        set({ selectedCardType: cardType, phase: GAME_PHASES.POWER });
      }
    },

    applyPowerCard: (cardType, payload) => {
      const { players, currentPlayerIndex } = get();
      const player = players[currentPlayerIndex];
      const newState = applyPowerCard({ players }, player.id, cardType, payload);
      set({ players: newState.players, selectedCardType: null, phase: GAME_PHASES.ROLLING });
    },

    cancelPowerCard: () => set({ selectedCardType: null, phase: GAME_PHASES.ROLLING }),

    // ── Remote state sync ─────────────────────────────────────────────────
    syncRemoteState: (remoteState) => set(remoteState),

    // ── Force skip (timer expired) ────────────────────────────────────────
    forceSkipTurn: () => {
      const { players, currentPlayerIndex } = get();
      const next = (currentPlayerIndex + 1) % players.length;
      set({
        currentPlayerIndex: next,
        phase: GAME_PHASES.ROLLING,
        diceRolled: false,
        diceValues: [],
        movableTokens: [],
        turnStartTime: Date.now(),
      });
    },

    // ── Reset ─────────────────────────────────────────────────────────────
    resetGame: () => set(INITIAL_STATE),
  }))
);

// Selectors
export const selectCurrentPlayer = (s) => s.players[s.currentPlayerIndex];
export const selectIsMyTurn = (s) =>
  s.gameType === 'local' || s.players[s.currentPlayerIndex]?.id === s.localPlayerId;
