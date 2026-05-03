import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DICE_DOTS } from '../game-logic/diceLogic';

function DieFace({ value, size = 52, rolling = false }) {
  const dots = DICE_DOTS[value] || [];
  return (
    <motion.div
      animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 0.9, 1.1, 1] } : {}}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className="relative bg-white rounded-xl shadow-lg border-2 border-gray-200 flex-shrink-0"
    >
      {dots.map(([cx, cy], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: size * 0.19,
            height: size * 0.19,
            borderRadius: '50%',
            backgroundColor: '#1e1b4b',
            left: `${cx * 100}%`,
            top:  `${cy * 100}%`,
            transform: 'translate(-50%,-50%)',
          }}
        />
      ))}
    </motion.div>
  );
}

export default function DiceRoller({ values = [], isRolling = false, canRoll = false, onRoll, compact = false }) {
  const [display, setDisplay] = useState(values);

  useEffect(() => {
    if (isRolling) {
      let n = 0;
      const id = setInterval(() => {
        setDisplay(Array.from({ length: values.length || 1 }, () => Math.ceil(Math.random() * 6)));
        if (++n >= 8) clearInterval(id);
      }, 65);
      return () => clearInterval(id);
    } else {
      setDisplay(values);
    }
  }, [isRolling, values]);

  const shown = isRolling ? display : (values.length ? values : []);
  const dieSize = compact ? 44 : 56;

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'flex-col'}`}>
      {/* Dice faces */}
      <div className="flex gap-2">
        {shown.length > 0
          ? shown.map((v, i) => <DieFace key={i} value={v} size={dieSize} rolling={isRolling} />)
          : <DieFace value={6} size={dieSize} />}
      </div>

      {/* Button */}
      <motion.button
        onClick={canRoll && !isRolling ? onRoll : undefined}
        whileHover={canRoll ? { scale: 1.06 } : {}}
        whileTap={canRoll ? { scale: 0.93 } : {}}
        disabled={!canRoll || isRolling}
        className={`
          font-bold text-white rounded-xl transition-all
          ${compact ? 'px-4 py-2 text-sm' : 'px-6 py-2.5 text-base w-full'}
          ${canRoll && !isRolling
            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-900/50 cursor-pointer'
            : 'bg-gray-600/60 cursor-not-allowed opacity-50'
          }
        `}
      >
        {isRolling ? '…' : '🎲 Roll'}
      </motion.button>
    </div>
  );
}
