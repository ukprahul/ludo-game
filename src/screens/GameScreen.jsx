import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectCurrentPlayer, selectIsMyTurn } from '../store/gameStore';
import { GAME_PHASES, GAME_MODES, PLAYER_COLORS, AI_DIFFICULTY } from '../game-logic/constants';
import { chooseBotMove, chooseBotPowerCard } from '../game-logic/aiBot';
import { getValidMoves } from '../game-logic/gameRules';
import Board from '../components/Board';
import PlayerHUD from '../components/PlayerHUD';
import GameControls from '../components/GameControls';
import { playSound } from '../utils/sounds';

export default function GameScreen() {
  const players           = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const phase             = useGameStore(s => s.phase);
  const diceValues        = useGameStore(s => s.diceValues);
  const diceRolled        = useGameStore(s => s.diceRolled);
  const movableTokens     = useGameStore(s => s.movableTokens);
  const selectedCardType  = useGameStore(s => s.selectedCardType);
  const mode              = useGameStore(s => s.mode);
  const gameType          = useGameStore(s => s.gameType);
  const localPlayerId     = useGameStore(s => s.localPlayerId);

  const rollDice          = useGameStore(s => s.rollDice);
  const moveToken         = useGameStore(s => s.moveToken);
  const activatePowerCard = useGameStore(s => s.activatePowerCard);
  const applyPowerCard    = useGameStore(s => s.applyPowerCard);
  const cancelPowerCard   = useGameStore(s => s.cancelPowerCard);
  const forceSkipTurn     = useGameStore(s => s.forceSkipTurn);
  const resetGame         = useGameStore(s => s.resetGame);
  const setScreen         = useGameStore(s => s.setScreen);

  const [isRolling, setIsRolling] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const botTimerRef = useRef(null);
  const turnTimerRef = useRef(null);

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn      = gameType === 'local' || currentPlayer?.id === localPlayerId;
  const isBot         = currentPlayer?.type === 'ai';

  // ── Timer (Blitz mode) ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== GAME_MODES.BLITZ) { setTimerSeconds(null); return; }
    setTimerSeconds(15);
    const id = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) { forceSkipTurn(); return 15; }
        return prev - 1;
      });
    }, 1000);
    turnTimerRef.current = id;
    return () => clearInterval(id);
  }, [currentPlayerIndex, mode]);

  // ── Bot turns ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isBot || !isMyTurn) return;

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    async function runBot() {
      if (phase === GAME_PHASES.ROLLING) {
        await delay(900);
        handleRoll();
      }
    }

    botTimerRef.current = setTimeout(runBot, 600);
    return () => clearTimeout(botTimerRef.current);
  }, [phase, currentPlayerIndex, isBot]);

  // ── Bot move after dice ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isBot || phase !== GAME_PHASES.MOVING) return;
    const timer = setTimeout(() => {
      const move = chooseBotMove(currentPlayer, diceValues[0], players, currentPlayer.aiDifficulty);
      if (move) {
        playSound('move');
        moveToken(move.tokenId);
      } else {
        forceSkipTurn();
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, isBot, diceValues]);

  // ── Handle roll ────────────────────────────────────────────────────────────
  const handleRoll = useCallback(() => {
    if (isRolling || phase !== GAME_PHASES.ROLLING) return;
    setIsRolling(true);
    playSound('dice');
    setTimeout(() => {
      rollDice();
      setIsRolling(false);
    }, 650);
  }, [isRolling, phase, rollDice]);

  // ── Handle token click ─────────────────────────────────────────────────────
  const handleTokenClick = useCallback((playerId, tokenId) => {
    if (phase === GAME_PHASES.MOVING && movableTokens.includes(tokenId)) {
      playSound('move');
      moveToken(tokenId);
    } else if (phase === GAME_PHASES.POWER && selectedCardType) {
      // Power card target selected
      applyPowerCard(selectedCardType, { tokenId, targetPlayerId: playerId });
    }
  }, [phase, movableTokens, selectedCardType, moveToken, applyPowerCard]);

  // Board size responsive
  const boardSize = Math.min(window.innerWidth - 16, 420);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex flex-col items-center">
      {/* Top bar */}
      <div className="w-full max-w-[440px] flex items-center justify-between px-4 py-3">
        <button
          onClick={() => { if (window.confirm('Quit game?')) { resetGame(); setScreen('home'); } }}
          className="text-white/60 hover:text-white text-xl"
        >
          ×
        </button>
        <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          {mode === GAME_MODES.POWER ? '⚡ Power Mode' : mode === GAME_MODES.BLITZ ? '⏱ Blitz' : '🎯 Classic'}
        </span>
        <div className="w-6" />
      </div>

      {/* Player HUDs — top 2 players */}
      <div className="w-full max-w-[440px] grid grid-cols-2 gap-2 px-2">
        {players.slice(0, 2).map(player => (
          <PlayerHUD
            key={player.id}
            player={player}
            isCurrentTurn={players[currentPlayerIndex]?.id === player.id}
            isLocalPlayer={gameType === 'local' || player.id === localPlayerId}
            mode={mode}
            onSelectPowerCard={activatePowerCard}
            activePowerCardType={players[currentPlayerIndex]?.id === player.id ? selectedCardType : null}
            timerSeconds={players[currentPlayerIndex]?.id === player.id ? timerSeconds : null}
          />
        ))}
      </div>

      {/* Board */}
      <div className="my-2 flex-shrink-0" style={{ touchAction: 'none' }}>
        <Board
          players={players}
          movableTokenIds={phase === GAME_PHASES.MOVING && isMyTurn && !isBot ? movableTokens : []}
          selectedTokenId={null}
          onTokenClick={isMyTurn && !isBot ? handleTokenClick : undefined}
          boardSize={boardSize}
        />
      </div>

      {/* Player HUDs — bottom 2 players */}
      {players.length > 2 && (
        <div className="w-full max-w-[440px] grid grid-cols-2 gap-2 px-2">
          {players.slice(2, 4).map(player => (
            <PlayerHUD
              key={player.id}
              player={player}
              isCurrentTurn={players[currentPlayerIndex]?.id === player.id}
              isLocalPlayer={gameType === 'local' || player.id === localPlayerId}
              mode={mode}
              onSelectPowerCard={activatePowerCard}
              activePowerCardType={players[currentPlayerIndex]?.id === player.id ? selectedCardType : null}
              timerSeconds={players[currentPlayerIndex]?.id === player.id ? timerSeconds : null}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      {isMyTurn && !isBot && (
        <div className="w-full max-w-[440px] px-4 pb-4 mt-2">
          <div className="bg-white/8 rounded-2xl p-3 border border-white/10">
            <GameControls
              currentPlayer={currentPlayer}
              phase={phase}
              diceValues={diceValues}
              isRolling={isRolling}
              canRoll={phase === GAME_PHASES.ROLLING && !diceRolled && isMyTurn}
              onRoll={handleRoll}
            />

            {/* Power card cancel */}
            {selectedCardType && (
              <button
                onClick={cancelPowerCard}
                className="mt-2 w-full py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30"
              >
                Cancel Power Card
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bot thinking overlay */}
      {isBot && isMyTurn && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white/80 px-5 py-2 rounded-full text-sm flex items-center gap-2">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            ⚙️
          </motion.span>
          {currentPlayer?.name} is thinking…
        </div>
      )}
    </div>
  );
}
