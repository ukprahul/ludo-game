import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { isFirebaseConfigured } from '../multiplayer/firebaseConfig';
import { createRoom, joinRoom, markRoomStarted } from '../multiplayer/roomManager';
import { subscribeToRoom } from '../multiplayer/firebaseSync';

function FirebaseNotConfigured({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-6 gap-5 text-center">
      <div className="text-5xl">🔧</div>
      <h2 className="text-white font-bold text-xl">Firebase Not Configured</h2>
      <p className="text-white/60 text-sm max-w-xs">
        Copy <code className="bg-white/10 px-1 rounded">.env.example</code> to{' '}
        <code className="bg-white/10 px-1 rounded">.env</code> and add your Firebase
        credentials to enable online multiplayer.
      </p>
      <button
        onClick={onBack}
        className="mt-4 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold"
      >
        ← Back
      </button>
    </div>
  );
}

export default function OnlineLobbyScreen() {
  const setScreen  = useGameStore(s => s.setScreen);
  const startGame  = useGameStore(s => s.startGame);
  const mode       = useGameStore(s => s.setup.mode);

  const [tab, setTab]               = useState('create');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode]     = useState('');
  const [roomCode, setRoomCode]     = useState('');
  const [roomInfo, setRoomInfo]     = useState(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [myUid, setMyUid]           = useState(null);

  if (!isFirebaseConfigured()) {
    return <FirebaseNotConfigured onBack={() => setScreen('home')} />;
  }

  const handleCreate = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return; }
    setLoading(true); setError('');
    try {
      const { code, uid } = await createRoom({ hostName: playerName.trim(), mode, playerCount: 4 });
      setRoomCode(code);
      setMyUid(uid);
      subscribeToRoom(code, (room) => {
        setRoomInfo(room);
        if (room.status === 'playing') {
          const allPlayers = Object.values(room.players || {});
          startGame({
            mode: room.mode, gameType: 'online',
            localPlayerId: allPlayers.find(p => p.uid === uid)?.colorId,
            roomCode: code,
            playerConfigs: allPlayers.map(p => ({
              id: p.colorId, name: p.name,
              type: p.uid === uid ? 'human' : 'remote',
            })),
          });
        }
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return; }
    if (!joinCode.trim())   { setError('Enter room code'); return; }
    setLoading(true); setError('');
    try {
      const { code, uid } = await joinRoom({ code: joinCode.toUpperCase(), playerName: playerName.trim() });
      setRoomCode(code);
      setMyUid(uid);
      subscribeToRoom(code, (room) => {
        setRoomInfo(room);
        if (room.status === 'playing') {
          const allPlayers = Object.values(room.players || {});
          startGame({
            mode: room.mode, gameType: 'online',
            localPlayerId: allPlayers.find(p => p.uid === uid)?.colorId,
            roomCode: code,
            playerConfigs: allPlayers.map(p => ({
              id: p.colorId, name: p.name,
              type: p.uid === uid ? 'human' : 'remote',
            })),
          });
        }
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const connectedPlayers = roomInfo ? Object.values(roomInfo.players || {}) : [];

  if (roomCode && roomInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center">
          <p className="text-white/70 text-sm mb-1">Room Code</p>
          <div className="text-4xl font-extrabold text-yellow-400 tracking-widest">{roomCode}</div>
          <p className="text-white/50 text-xs mt-1">Share this with friends</p>
        </div>

        <div className="w-full max-w-sm bg-white/10 rounded-2xl border border-white/15 p-4">
          <p className="text-white/70 text-xs mb-3 font-semibold uppercase tracking-widest">
            Players ({connectedPlayers.length}/4)
          </p>
          {connectedPlayers.map(p => (
            <div key={p.uid} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white font-semibold">{p.name}</span>
              {p.uid === myUid && <span className="text-white/40 text-xs">(you)</span>}
            </div>
          ))}
        </div>

        {connectedPlayers[0]?.uid === myUid && connectedPlayers.length >= 2 ? (
          <button
            onClick={() => markRoomStarted(roomCode)}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-extrabold text-lg"
          >
            🎲 Start Game
          </button>
        ) : (
          <p className="text-white/50 text-sm">
            {connectedPlayers[0]?.uid === myUid
              ? 'Waiting for more players…'
              : 'Waiting for host to start…'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-5 gap-5">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => setScreen('home')} className="text-white/70 hover:text-white text-xl">←</button>
        <h2 className="text-white font-bold text-xl">Online Multiplayer</h2>
      </div>

      <div className="flex bg-white/10 rounded-xl p-1">
        {['create', 'join'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-white text-gray-900' : 'text-white/60'
            }`}
          >
            {t === 'create' ? '+ Create Room' : '→ Join Room'}
          </button>
        ))}
      </div>

      <input
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
        placeholder="Your name"
        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none focus:border-yellow-400/60"
      />

      {tab === 'join' && (
        <input
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Room Code (e.g. AB12CD)"
          maxLength={6}
          className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none focus:border-yellow-400/60 tracking-widest font-mono text-center text-lg"
        />
      )}

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={tab === 'create' ? handleCreate : handleJoin}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-extrabold text-lg disabled:opacity-50"
      >
        {loading ? '⏳ Loading…' : tab === 'create' ? '🏠 Create Room' : '🚀 Join Room'}
      </button>
    </div>
  );
}
