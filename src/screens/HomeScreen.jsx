import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GAME_MODES } from '../game-logic/constants';

const MODE_INFO = {
  [GAME_MODES.CLASSIC]: { label: 'Classic', emoji: '🎯', desc: 'Traditional Ludo rules' },
  [GAME_MODES.POWER]:   { label: 'Power Mode', emoji: '⚡', desc: 'Special power cards' },
  [GAME_MODES.BLITZ]:   { label: 'Blitz', emoji: '⏱️', desc: '15-second turns' },
};

export default function HomeScreen() {
  const setScreen  = useGameStore(s => s.setScreen);
  const updateSetup = useGameStore(s => s.updateSetup);
  const mode        = useGameStore(s => s.setup.mode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-6 gap-8">
      {/* Logo / Title */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-center"
      >
        <div className="text-7xl mb-2">🎲</div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight">LUDO</h1>
        <p className="text-white/60 mt-1 text-sm">Classic board game reimagined</p>
      </motion.div>

      {/* Mode selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm"
      >
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3 text-center">
          Game Mode
        </p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(MODE_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => updateSetup({ mode: key })}
              className={`
                flex flex-col items-center gap-1 rounded-xl py-3 px-2 border-2 transition-all text-sm
                ${mode === key
                  ? 'border-yellow-400 bg-yellow-400/15 text-white'
                  : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30'
                }
              `}
            >
              <span className="text-2xl">{info.emoji}</span>
              <span className="font-bold text-xs">{info.label}</span>
              <span className="text-[9px] opacity-70 text-center">{info.desc}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Play buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        <button
          onClick={() => setScreen('lobby')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-extrabold text-lg shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          🎮 Play Now
        </button>

        <button
          onClick={() => setScreen('online-lobby')}
          className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-base hover:bg-white/15 transition-colors"
        >
          🌐 Online Multiplayer
        </button>
      </motion.div>

      {/* Footer */}
      <p className="text-white/25 text-xs">v1.0.0</p>
    </div>
  );
}
