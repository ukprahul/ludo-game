import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#ec4899', '#facc15'];
const SHAPES = ['circle', 'rect', 'triangle'];

function Piece({ delay, color, x, shape }) {
  const size = 6 + Math.random() * 8;
  const duration = 2.5 + Math.random() * 2;
  const rotation = Math.random() * 720;

  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{ y: '110vh', opacity: 0, rotate: rotation }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'fixed',
        top: 0,
        width: size,
        height: shape === 'rect' ? size * 0.5 : size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'rect' ? 2 : 0,
        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

export default function Confetti({ active = false, count = 120 }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (active) {
      setPieces(
        Array.from({ length: count }, (_, i) => ({
          id: i,
          delay: Math.random() * 1.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          x: Math.random() * window.innerWidth,
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        }))
      );
    } else {
      setPieces([]);
    }
  }, [active, count]);

  return (
    <>
      {pieces.map(p => (
        <Piece key={p.id} {...p} />
      ))}
    </>
  );
}
