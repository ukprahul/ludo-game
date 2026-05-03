import { ref, onValue, off, update } from 'firebase/database';
import { getFirebaseDB } from './firebaseConfig';
import { pushGameState } from './roomManager';

export function subscribeToRoom(code, onRoomChange) {
  const db = getFirebaseDB();
  const roomRef = ref(db, `rooms/${code}`);
  onValue(roomRef, (snap) => { if (snap.exists()) onRoomChange(snap.val()); });
  return () => off(roomRef);
}

export function subscribeToGameState(code, onStateChange) {
  const db = getFirebaseDB();
  const stateRef = ref(db, `rooms/${code}/gameState`);
  onValue(stateRef, (snap) => {
    if (!snap.exists()) return;
    try { onStateChange(JSON.parse(snap.val())); } catch {}
  });
  return () => off(stateRef);
}

export async function broadcastMove(code, gameState) {
  await pushGameState(code, gameState);
}

export async function markReconnected(code, uid) {
  const db = getFirebaseDB();
  await update(ref(db, `rooms/${code}/players/${uid}`), { connected: true });
}
