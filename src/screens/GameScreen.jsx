import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GAME_PHASES, GAME_MODES, PLAYER_COLORS } from '../game-logic/constants';
import { chooseBotMove } from '../game-logic/aiBot';
import Board from '../components/Board';
import PlayerHUD from '../components/PlayerHUD';
import DiceRoller from '../components/DiceRoller';
import { playSound } from '../utils/sounds';

export default function GameScreen() {
  const players            = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const phase              = useGameStore(s => s.phase);
  const diceValues         = useGameStore(s => s.diceValues);
  const diceRolled         = useGameStore(s => s.diceRolled);
  const movableTokens      = useGameStore(s => s.movableTokens);
  const selectedCardType   = useGameStore(s => s.selectedCardType);
  const mode               = useGameStore(s => s.mode);
  const gameType           = useGameStore(s => s.gameType);
  const localPlayerId      = useGameStore(s => s.localPlayerId);

  const rollDiceAction    = useGameStore(s => s.rollDice);
  const moveToken         = useGameStore(s => s.moveToken);
  const activatePowerCard = useGameStore(s => s.activatePowerCard);
  const applyPowerCard    = useGameStore(s => s.applyPowerCard);
  const cancelPowerCard   = useGameStore(s => s.cancelPowerCard);
  const forceSkipTurn     = useGameStore(s => s.forceSkipTurn);
  const resetGame         = useGameStore(s => s.resetGame);
  const setScreen         = useGameStore(s => s.setScreen);

  const [isRolling, setIsRolling]       = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const botTimerRef  = useRef(null);
  const turnTimerRef = useRef(null);

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn      = gameType === 'local' || currentPlayer?.id === localPlayerId;
  const isBot         = currentPlayer?.type === 'ai';
  const color         = PLAYER_COLORS[currentPlayer?.id] ?? PLAYER_COLORS.red;

  // ── Blitz timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== GAME_MODES.BLITZ) { setTimerSeconds(null); return; }
    setTimerSeconds(15);
    const id = setInterval(() => {
      setTimerSeconds(p => { if (p <= 1) { forceSkipTurn(); return 15; } return p - 1; });
    }, 1000);
    turnTimerRef.current = id;
    return () => clearInterval(id);
  }, [currentPlayerIndex, mode]);

  // ── Bot: roll (150 ms pause so player can see whose turn it is, then roll) ──
  useEffect(() => {
    if (!isBot || phase !== GAME_PHASES.ROLLING) return;
    botTimerRef.current = setTimeout(() => handleRoll(), 150);
    return () => clearTimeout(botTimerRef.current);
  }, [phase, currentPlayerIndex, isBot]);

  // ── Bot: move (250 ms after dice lands so player can read the value) ────────
  useEffect(() => {
    if (!isBot || phase !== GAME_PHASES.MOVING) return;
    const t = setTimeout(() => {
      const move = chooseBotMove(currentPlayer, diceValues[0], players, currentPlayer.aiDifficulty);
      if (move) { playSound('move'); moveToken(move.tokenId); }
      else forceSkipTurn();
    }, 250);
    return () => clearTimeout(t);
  }, [phase, isBot, diceValues]);

  // ── Human: roll (300 ms animation — snappy for human, same code path for bot) ─
  const handleRoll = useCallback(() => {
    if (isRolling || phase !== GAME_PHASES.ROLLING) return;
    setIsRolling(true);
    playSound('dice');
    setTimeout(() => { rollDiceAction(); setIsRolling(false); }, 300);
  }, [isRolling, phase, rollDiceAction]);

  // ── Token click ───────────────────────────────────────────────────────────
  const handleTokenClick = useCallback((playerId, tokenId) => {
    if (phase === GAME_PHASES.MOVING && movableTokens.includes(tokenId)) {
      playSound('move');
      moveToken(tokenId);
    } else if (phase === GAME_PHASES.POWER && selectedCardType) {
      applyPowerCard(selectedCardType, { tokenId, targetPlayerId: playerId });
    }
  }, [phase, movableTokens, selectedCardType, moveToken, applyPowerCard]);

  // Board fills whatever space is left between the two HUD rows and controls
  const boardSize = Math.min(430 - 8, window.innerWidth - 8);

  const canRoll = phase === GAME_PHASES.ROLLING && !diceRolled && isMyTurn && !isBot;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-indigo-950 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={() => { if (window.confirm('Quit game?')) { resetGame(); setScreen('home'); } }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 text-lg leading-none"
        >
          ×
        </button>

        {/* Turn pill */}
        <motion.div
          key={currentPlayer?.id}
          initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10"
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color.primary }}
          />
          <span className="text-white text-xs font-semibold">
            {currentPlayer?.name}{isBot ? ' 🤖' : "'s turn"}
          </span>
        </motion.div>

        <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
          {mode === GAME_MODES.POWER ? '⚡' : mode === GAME_MODES.BLITZ ? '⏱' : '🎯'}
        </span>
      </div>

      {/* ── Top HUDs (players 0 & 1) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 px-2 flex-shrink-0">
        {players.slice(0, 2).map(p => (
          <PlayerHUD
            key={p.id}
            player={p}
            isCurrentTurn={players[currentPlayerIndex]?.id === p.id}
            isLocalPlayer={gameType === 'local' || p.id === localPlayerId}
            mode={mode}
            onSelectPowerCard={activatePowerCard}
            activePowerCardType={players[currentPlayerIndex]?.id === p.id ? selectedCardType : null}
            timerSeconds={players[currentPlayerIndex]?.id === p.id ? timerSeconds : null}
          />
        ))}
      </div>

      {/* ── Board ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center py-1" style={{ touchAction: 'none' }}>
        <Board
          players={players}
          movableTokenIds={phase === GAME_PHASES.MOVING && isMyTurn && !isBot ? movableTokens : []}
          onTokenClick={isMyTurn && !isBot ? handleTokenClick : undefined}
          boardSize={Math.min(boardSize, 380)}
        />
      </div>

      {/* ── Bottom HUDs (players 2 & 3) ─────────────────────────────────── */}
      {players.length > 2 && (
        <div className="grid grid-cols-2 gap-1.5 px-2 flex-shrink-0">
          {players.slice(2, 4).map(p => (
            <PlayerHUD
              key={p.id}
              player={p}
              isCurrentTurn={players[currentPlayerIndex]?.id === p.id}
              isLocalPlayer={gameType === 'local' || p.id === localPlayerId}
              mode={mode}
              onSelectPowerCard={activatePowerCard}
              activePowerCardType={players[currentPlayerIndex]?.id === p.id ? selectedCardType : null}
              timerSeconds={players[currentPlayerIndex]?.id === p.id ? timerSeconds : null}
            />
          ))}
        </div>
      )}

      {/* ── Controls / Dice ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-1">
        {isBot && isMyTurn ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-2xl border border-white/10">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="text-lg"
            >⚙️</motion.span>
            <span className="text-white/60 text-sm">{currentPlayer?.name} is thinking…</span>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-3 flex items-center justify-between gap-4">
            {/* Dice display */}
            <DiceRoller
              values={diceValues}
              isRolling={isRolling}
              canRoll={canRoll}
              onRoll={handleRoll}
              compact
            />

            {/* Phase hint */}
            <div className="flex-1 text-right">
              {phase === GAME_PHASES.ROLLING && !diceRolled && (
                <p className="text-white/50 text-xs">Tap <b className="text-white/80">Roll Dice</b></p>
              )}
              {phase === GAME_PHASES.MOVING && (
                <p className="text-yellow-400/80 text-xs font-semibold">Tap a glowing token</p>
              )}
              {phase === GAME_PHASES.POWER && (
                <div>
                  <p className="text-purple-400 text-xs font-semibold">Select a target token</p>
                  <button onClick={cancelPowerCard} className="text-red-400/70 text-[10px] mt-0.5">cancel</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
