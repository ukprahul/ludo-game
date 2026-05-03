import { ref, set, get, update, onDisconnect } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { createPlayer } from '../game-logic/gameRules';
import { dealPowerCards } from '../game-logic/powerCards';
import { GAME_MODES, PLAYERS } from '../game-logic/constants';

// ─── Generate a 6-digit room code ─────────────────────────────────────────────
export function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ─── Ensure anonymous auth ─────────────────────────────────────────────────────
export async function ensureAuth() {
  if (!auth.currentUser) {
    const { user } = await signInAnonymously(auth);
    return user;
  }
  return auth.currentUser;
}

// ─── Create a new room ────────────────────────────────────────────────────────
export async function createRoom({ hostName, mode, playerCount }) {
  const user = await ensureAuth();
  const code = generateRoomCode();
  const hostColorId = PLAYERS[0];

  const roomData = {
    code,
    mode,
    hostUid: user.uid,
    status: 'waiting',   // 'waiting' | 'playing' | 'finished'
    playerCount,
    createdAt: Date.now(),
    players: {
      [user.uid]: {
        uid: user.uid,
        name: hostName,
        colorId: hostColorId,
        ready: true,
        connected: true,
      },
    },
    gameState: null,
  };

  await set(ref(db, `rooms/${code}`), roomData);

  // Auto-remove on disconnect
  onDisconnect(ref(db, `rooms/${code}/players/${user.uid}/connected`)).set(false);

  return { code, uid: user.uid, colorId: hostColorId };
}

// ─── Join an existing room ─────────────────────────────────────────────────────
export async function joinRoom({ code, playerName }) {
  const user = await ensureAuth();
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);

  if (!snap.exists()) throw new Error('Room not found');
  const room = snap.val();
  if (room.status !== 'waiting') throw new Error('Game already started');

  const existingPlayers = Object.values(room.players || {});
  if (existingPlayers.length >= room.playerCount) throw new Error('Room is full');

  // Assign next available color
  const usedColors = existingPlayers.map(p => p.colorId);
  const colorId = PLAYERS.find(c => !usedColors.includes(c));

  await update(ref(db, `rooms/${code}/players/${user.uid}`), {
    uid: user.uid,
    name: playerName,
    colorId,
    ready: true,
    connected: true,
  });

  onDisconnect(ref(db, `rooms/${code}/players/${user.uid}/connected`)).set(false);

  return { code, uid: user.uid, colorId };
}

// ─── Push game state to Firebase ──────────────────────────────────────────────
export async function pushGameState(code, gameState) {
  await update(ref(db, `rooms/${code}`), {
    gameState: JSON.stringify(gameState),
    updatedAt: Date.now(),
  });
}

// ─── Mark room as started ─────────────────────────────────────────────────────
export async function markRoomStarted(code) {
  await update(ref(db, `rooms/${code}`), { status: 'playing' });
}
