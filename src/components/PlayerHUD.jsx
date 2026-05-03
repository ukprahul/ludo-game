import { motion } from 'framer-motion';
import { PLAYER_COLORS, TOKEN_COUNT, GAME_MODES } from '../game-logic/constants';
import PowerCard from './PowerCard';

export default function PlayerHUD({
  player,
  isCurrentTurn,
  isLocalPlayer,
  mode,
  onSelectPowerCard,
  activePowerCardType,
  timerSeconds,
}) {
  const color = PLAYER_COLORS[player.id];
  const remaining = TOKEN_COUNT - player.finishedCount;

  return (
    <motion.div
      animate={{
        borderColor: isCurrentTurn ? color.primary : 'rgba(255,255,255,0.1)',
        boxShadow: isCurrentTurn ? `0 0 16px 2px ${color.primary}55` : 'none',
      }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-2xl border-2 p-3 flex flex-col gap-2
        ${isCurrentTurn ? 'bg-white/10' : 'bg-white/5'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-white/30"
            style={{ backgroundColor: color.primary }}
          />
          <span className="text-white font-bold text-sm truncate max-w-[100px]">
            {player.name}
            {player.type === 'ai' && (
              <span className="ml-1 text-[10px] text-white/50">🤖</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Token count */}
          <span className="text-white/70 text-xs">{remaining} left</span>
          {isCurrentTurn && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-yellow-400"
            />
          )}
        </div>
      </div>

      {/* Finished tokens */}
      {player.finishedCount > 0 && (
        <div className="flex gap-1">
          {Array.from({ length: player.finishedCount }).map((_, i) => (
            <span key={i} className="text-sm">⭐</span>
          ))}
        </div>
      )}

      {/* Turn timer */}
      {isCurrentTurn && timerSeconds !== null && timerSeconds !== undefined && (
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <motion.div
            className="h-full rounded-full bg-yellow-400"
            animate={{ width: `${(timerSeconds / 15) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Power cards */}
      {mode === GAME_MODES.POWER && player.powerCards.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {player.powerCards.map(card => (
            <PowerCard
              key={card.id}
              card={card}
              isSelectable={isCurrentTurn && isLocalPlayer && !card.used}
              isActive={activePowerCardType === card.type}
              onSelect={onSelectPowerCard}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
