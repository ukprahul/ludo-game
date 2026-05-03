import { ref, set, get, update, onDisconnect } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { getFirebaseDB, getFirebaseAuth } from './firebaseConfig';
import { createPlayer } from '../game-logic/gameRules';
import { GAME_MODES, PLAYERS } from '../game-logic/constants';

export function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function ensureAuth() {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    const { user } = await signInAnonymously(auth);
    return user;
  }
  return auth.currentUser;
}

export async function createRoom({ hostName, mode, playerCount }) {
  const db   = getFirebaseDB();
  const user = await ensureAuth();
  const code = generateRoomCode();
  const hostColorId = PLAYERS[0];

  const roomData = {
    code, mode, hostUid: user.uid,
    status: 'waiting', playerCount,
    createdAt: Date.now(),
    players: {
      [user.uid]: { uid: user.uid, name: hostName, colorId: hostColorId, ready: true, connected: true },
    },
    gameState: null,
  };

  await set(ref(db, `rooms/${code}`), roomData);
  onDisconnect(ref(db, `rooms/${code}/players/${user.uid}/connected`)).set(false);
  return { code, uid: user.uid, colorId: hostColorId };
}

export async function joinRoom({ code, playerName }) {
  const db   = getFirebaseDB();
  const user = await ensureAuth();
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);

  if (!snap.exists()) throw new Error('Room not found');
  const room = snap.val();
  if (room.status !== 'waiting') throw new Error('Game already started');

  const existingPlayers = Object.values(room.players || {});
  if (existingPlayers.length >= room.playerCount) throw new Error('Room is full');

  const usedColors = existingPlayers.map(p => p.colorId);
  const colorId = PLAYERS.find(c => !usedColors.includes(c));

  await update(ref(db, `rooms/${code}/players/${user.uid}`), {
    uid: user.uid, name: playerName, colorId, ready: true, connected: true,
  });
  onDisconnect(ref(db, `rooms/${code}/players/${user.uid}/connected`)).set(false);
  return { code, uid: user.uid, colorId };
}

export async function pushGameState(code, gameState) {
  const db = getFirebaseDB();
  await update(ref(db, `rooms/${code}`), {
    gameState: JSON.stringify(gameState), updatedAt: Date.now(),
  });
}

export async function markRoomStarted(code) {
  const db = getFirebaseDB();
  await update(ref(db, `rooms/${code}`), { status: 'playing' });
}
