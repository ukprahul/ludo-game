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
  const finished = player.finishedCount;

  return (
    <motion.div
      animate={{
        borderColor: isCurrentTurn ? color.primary : 'rgba(255,255,255,0.07)',
        backgroundColor: isCurrentTurn ? `${color.primary}18` : 'rgba(255,255,255,0.04)',
      }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border px-2.5 py-2 flex flex-col gap-1.5"
    >
      {/* Row 1: color dot + name + turn dot */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
          style={{ backgroundColor: color.primary }}
        />
        <span className="text-white/90 font-semibold text-xs truncate flex-1">
          {player.name}
          {player.type === 'ai' && <span className="text-white/30 ml-0.5">🤖</span>}
        </span>
        {/* Home tokens count */}
        <span className="text-white/40 text-[10px]">
          {finished > 0 && `${finished}⭐`}
        </span>
        {isCurrentTurn && (
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"
          />
        )}
      </div>

      {/* Blitz timer bar */}
      {isCurrentTurn && timerSeconds !== null && (
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-yellow-400"
            animate={{ width: `${(timerSeconds / 15) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Power cards */}
      {mode === GAME_MODES.POWER && player.powerCards.length > 0 && (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
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
