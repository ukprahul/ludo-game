import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PLAYER_COLORS } from '../game-logic/constants';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';

export default function ResultScreen() {
  const winner     = useGameStore(s => s.winner);
  const players    = useGameStore(s => s.players);
  const resetGame  = useGameStore(s => s.resetGame);
  const setScreen  = useGameStore(s => s.setScreen);
  const startGame  = useGameStore(s => s.startGame);
  const setup      = useGameStore(s => s.setup);
  const mode       = useGameStore(s => s.mode);
  const gameType   = useGameStore(s => s.gameType);

  const winnerPlayer = players.find(p => p.id === winner);
  const color = winnerPlayer ? PLAYER_COLORS[winnerPlayer.id] : null;

  useEffect(() => {
    playSound('win');
  }, []);

  // Sort players by finished count descending
  const ranked = [...players].sort((a, b) => b.finishedCount - a.finishedCount);

  const handlePlayAgain = () => {
    const configs = setup.playerConfigs.filter(p => p.type !== 'off');
    startGame({ mode, gameType, playerConfigs: configs });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-6 gap-8">
      <Confetti active />

      {/* Winner announcement */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <div className="text-6xl mb-3">🏆</div>
        <div
          className="text-4xl font-extrabold mb-1"
          style={{ color: color?.primary }}
        >
          {winnerPlayer?.name}
        </div>
        <p className="text-white/70 text-lg">Wins the game!</p>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm bg-white/10 rounded-2xl border border-white/15 overflow-hidden"
      >
        {ranked.map((player, idx) => {
          const c = PLAYER_COLORS[player.id];
          const medals = ['🥇', '🥈', '🥉', '4️⃣'];
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-0"
            >
              <span className="text-xl">{medals[idx]}</span>
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 border border-white/30"
                style={{ backgroundColor: c.primary }}
              />
              <span className="text-white font-semibold flex-1">{player.name}</span>
              <span className="text-white/60 text-sm">{player.finishedCount}/4 home</span>
            </div>
          );
        })}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        <button
          onClick={handlePlayAgain}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-extrabold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          🎲 Play Again
        </button>
        <button
          onClick={() => { resetGame(); setScreen('home'); }}
          className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold"
        >
          🏠 Main Menu
        </button>
      </motion.div>
    </div>
  );
}
