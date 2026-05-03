import { motion } from 'framer-motion';
import { PLAYER_COLORS } from '../game-logic/constants';

export default function Token({
  playerId,
  tokenId,
  isSelectable = false,
  isSelected = false,
  isShielded = false,
  isFrozen = false,
  size = 'md',
  onClick,
  stacked = false,
  stackIndex = 0,
}) {
  const color = PLAYER_COLORS[playerId];
  const sizes = { sm: 16, md: 22, lg: 30 };
  const px = sizes[size] ?? sizes.md;

  return (
    <motion.div
      onClick={isSelectable ? onClick : undefined}
      initial={{ scale: 0 }}
      animate={{
        scale: isSelected ? 1.3 : 1,
        y: stacked ? -stackIndex * 3 : 0,
      }}
      whileHover={isSelectable ? { scale: 1.2 } : {}}
      whileTap={isSelectable ? { scale: 0.9 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        backgroundColor: color.primary,
        border: `2px solid ${isSelected ? '#facc15' : color.dark}`,
        cursor: isSelectable ? 'pointer' : 'default',
        position: 'relative',
        flexShrink: 0,
        boxShadow: isSelected
          ? `0 0 0 3px #facc15, 0 2px 8px rgba(0,0,0,0.4)`
          : `inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)`,
      }}
      className={`flex items-center justify-center select-none
        ${isSelectable ? 'animate-pulse-glow' : ''}
      `}
    >
      {/* Inner circle highlight */}
      <div
        style={{
          width: px * 0.45,
          height: px * 0.45,
          borderRadius: '50%',
          backgroundColor: color.light,
          opacity: 0.7,
        }}
      />

      {/* Shield indicator */}
      {isShielded && (
        <span
          style={{ position: 'absolute', top: -6, right: -6, fontSize: 10, lineHeight: 1 }}
        >
          🛡️
        </span>
      )}

      {/* Frozen indicator */}
      {isFrozen && (
        <span
          style={{ position: 'absolute', top: -6, left: -6, fontSize: 10, lineHeight: 1 }}
        >
          ❄️
        </span>
      )}
    </motion.div>
  );
}
