import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DICE_DOTS } from '../game-logic/diceLogic';

function DieFace({ value, size = 64, rolling = false }) {
  const dots = DICE_DOTS[value] || [];
  return (
    <motion.div
      animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 0.9, 1.1, 1] } : {}}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className="relative bg-white rounded-xl shadow-lg border-2 border-gray-300 flex-shrink-0"
    >
      {dots.map(([cx, cy], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: '50%',
            backgroundColor: '#1e1b4b',
            left: `${cx * 100}%`,
            top:  `${cy * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </motion.div>
  );
}

export default function DiceRoller({
  values = [],
  isRolling = false,
  canRoll = false,
  onRoll,
}) {
  const [animValues, setAnimValues] = useState(values);

  useEffect(() => {
    if (isRolling) {
      // Cycle through random values during animation
      let frame = 0;
      const id = setInterval(() => {
        setAnimValues(
          Array.from({ length: values.length || 1 }, () => Math.floor(Math.random() * 6) + 1)
        );
        frame++;
        if (frame > 8) clearInterval(id);
      }, 80);
      return () => clearInterval(id);
    } else {
      setAnimValues(values);
    }
  }, [isRolling, values]);

  const displayValues = isRolling ? animValues : values;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        {displayValues.length > 0
          ? displayValues.map((v, i) => (
              <DieFace key={i} value={v} rolling={isRolling} />
            ))
          : <DieFace value={1} rolling={false} />
        }
      </div>

      <motion.button
        onClick={canRoll && !isRolling ? onRoll : undefined}
        whileHover={canRoll ? { scale: 1.05 } : {}}
        whileTap={canRoll ? { scale: 0.95 } : {}}
        disabled={!canRoll || isRolling}
        className={`
          px-6 py-2 rounded-full font-bold text-white text-sm transition-all
          ${canRoll && !isRolling
            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed opacity-60'
          }
        `}
      >
        {isRolling ? 'Rolling…' : 'Roll Dice'}
      </motion.button>
    </div>
  );
}
