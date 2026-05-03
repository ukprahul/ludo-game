import { useState } from 'react';
import { motion } from 'framer-motion';
import { POWER_CARD_INFO } from '../game-logic/constants';

export default function PowerCard({
  card,
  isActive = false,
  isSelectable = false,
  onSelect,
}) {
  const [flipped, setFlipped] = useState(false);
  const info = POWER_CARD_INFO[card.type];

  const handleClick = () => {
    if (!isSelectable || card.used) return;
    setFlipped(true);
    setTimeout(() => {
      setFlipped(false);
      onSelect?.(card.type);
    }, 300);
  };

  return (
    <motion.div
      onClick={handleClick}
      animate={isActive ? { y: -8, scale: 1.05 } : { y: 0, scale: 1 }}
      whileHover={isSelectable && !card.used ? { y: -4 } : {}}
      whileTap={isSelectable && !card.used ? { scale: 0.97 } : {}}
      style={{ perspective: 400 }}
      className={`relative w-[72px] flex-shrink-0 cursor-${isSelectable && !card.used ? 'pointer' : 'default'}`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 90 : 0 }}
        transition={{ duration: 0.2 }}
        className={`
          rounded-xl overflow-hidden shadow-md border-2
          ${isActive ? 'border-yellow-400 shadow-yellow-400/50' : 'border-white/20'}
          ${card.used ? 'opacity-40 grayscale' : ''}
        `}
        style={{ height: 96 }}
      >
        {/* Card gradient background */}
        <div className={`h-full bg-gradient-to-br ${info.color} flex flex-col items-center justify-center gap-1 p-1`}>
          <span className="text-2xl">{info.emoji}</span>
          <span className="text-white text-[9px] font-bold text-center leading-tight">
            {info.label}
          </span>
        </div>
      </motion.div>

      {/* Glow effect when selectable */}
      {isSelectable && !card.used && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ boxShadow: '0 0 12px 4px rgba(250,204,21,0.6)' }}
        />
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 z-50">
        <div className="bg-gray-900 text-white text-[9px] rounded p-1.5 text-center shadow-xl">
          {info.description}
        </div>
      </div>
    </motion.div>
  );
}
