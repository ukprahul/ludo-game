import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PLAYERS, PLAYER_COLORS, AI_DIFFICULTY } from '../game-logic/constants';

const PLAYER_TYPES = [
  { value: 'human', label: '👤 Human' },
  { value: 'ai',    label: '🤖 Bot' },
  { value: 'off',   label: '❌ Off' },
];

const DIFFICULTY_LABELS = {
  [AI_DIFFICULTY.EASY]:   '😊 Easy',
  [AI_DIFFICULTY.MEDIUM]: '🧠 Medium',
  [AI_DIFFICULTY.HARD]:   '💀 Hard',
};

export default function LobbyScreen() {
  const setScreen        = useGameStore(s => s.setScreen);
  const setup            = useGameStore(s => s.setup);
  const updatePlayerConfig = useGameStore(s => s.updatePlayerConfig);
  const startGame        = useGameStore(s => s.startGame);

  const [editingName, setEditingName] = useState(null);

  const activePlayers = setup.playerConfigs.filter(p => p.type !== 'off');
  const canStart = activePlayers.length >= 2;

  const handleStart = () => {
    const configs = setup.playerConfigs.filter(p => p.type !== 'off');
    startGame({
      mode: setup.mode,
      gameType: 'local',
      playerConfigs: configs,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-5 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setScreen('home')}
          className="text-white/70 hover:text-white text-xl"
        >
          ←
        </button>
        <h2 className="text-white font-bold text-xl">Setup Game</h2>
      </div>

      {/* Players */}
      <div className="flex flex-col gap-3">
        {PLAYERS.map((id, idx) => {
          const cfg = setup.playerConfigs.find(p => p.id === id);
          const color = PLAYER_COLORS[id];
          return (
            <motion.div
              key={id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.07 }}
              className={`
                rounded-2xl p-4 border-2 flex flex-col gap-3
                ${cfg.type === 'off' ? 'border-white/10 bg-white/5 opacity-50' : 'border-white/20 bg-white/10'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Color swatch */}
                <div
                  className="w-8 h-8 rounded-full border-2 border-white/30 flex-shrink-0"
                  style={{ backgroundColor: color.primary }}
                />

                {/* Name */}
                {editingName === id ? (
                  <input
                    autoFocus
                    value={cfg.name}
                    onChange={e => updatePlayerConfig(id, { name: e.target.value })}
                    onBlur={() => setEditingName(null)}
                    onKeyDown={e => e.key === 'Enter' && setEditingName(null)}
                    className="flex-1 bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm outline-none border border-white/30"
                  />
                ) : (
                  <button
                    onClick={() => cfg.type !== 'off' && setEditingName(id)}
                    className="flex-1 text-left text-white font-semibold text-sm"
                  >
                    {cfg.name}
                    {cfg.type !== 'off' && <span className="text-white/40 ml-1 text-xs">✏️</span>}
                  </button>
                )}
              </div>

              {/* Type selector */}
              <div className="flex gap-2">
                {PLAYER_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => {
                      updatePlayerConfig(id, { type: t.value });
                      if (t.value === 'human' && idx > 0) updatePlayerConfig(id, { name: `Player ${idx + 1}` });
                      if (t.value === 'ai') updatePlayerConfig(id, { name: `Bot ${idx + 1}` });
                    }}
                    className={`
                      flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border
                      ${cfg.type === t.value
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'
                      }
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* AI difficulty */}
              {cfg.type === 'ai' && (
                <div className="flex gap-2">
                  {Object.entries(DIFFICULTY_LABELS).map(([level, label]) => (
                    <button
                      key={level}
                      onClick={() => updatePlayerConfig(id, { aiDifficulty: level })}
                      className={`
                        flex-1 py-1 rounded-lg text-xs transition-all border
                        ${cfg.aiDifficulty === level
                          ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
                          : 'bg-transparent border-white/10 text-white/40 hover:border-white/25'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Start */}
      <div className="mt-auto">
        {!canStart && (
          <p className="text-white/50 text-xs text-center mb-3">At least 2 players required</p>
        )}
        <button
          disabled={!canStart}
          onClick={handleStart}
          className={`
            w-full py-4 rounded-2xl font-extrabold text-lg transition-all
            ${canStart
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
            }
          `}
        >
          🎲 Start Game
        </button>
      </div>
    </div>
  );
}
