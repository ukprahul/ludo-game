import { motion } from 'framer-motion';
import DiceRoller from './DiceRoller';
import { GAME_PHASES, PLAYER_COLORS } from '../game-logic/constants';

export default function GameControls({
  currentPlayer,
  phase,
  diceValues,
  isRolling,
  canRoll,
  onRoll,
  onSkipTurn,
  timerSeconds,
}) {
  const color = PLAYER_COLORS[currentPlayer?.id];

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Turn indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ backgroundColor: color?.primary }}
          className="w-3 h-3 rounded-full"
        />
        <span className="text-white font-semibold text-sm">
          {currentPlayer?.name}'s Turn
        </span>
        {currentPlayer?.type === 'ai' && (
          <span className="text-xs text-white/60">🤖 thinking…</span>
        )}
      </div>

      {/* Dice */}
      <DiceRoller
        values={diceValues}
        isRolling={isRolling}
        canRoll={canRoll}
        onRoll={onRoll}
      />

      {/* Phase hint */}
      <p className="text-white/60 text-xs text-center">
        {phase === GAME_PHASES.ROLLING && canRoll && 'Tap Roll Dice to continue'}
        {phase === GAME_PHASES.MOVING && 'Select a highlighted token to move'}
        {phase === GAME_PHASES.POWER  && 'Select a target for your power card'}
      </p>
    </div>
  );
}
