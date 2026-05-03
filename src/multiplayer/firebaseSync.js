import { ref, onValue, off, update } from 'firebase/database';
import { db } from './firebaseConfig';
import { pushGameState } from './roomManager';

// ─── Subscribe to room state changes ─────────────────────────────────────────
export function subscribeToRoom(code, onRoomChange) {
  const roomRef = ref(db, `rooms/${code}`);
  const unsubscribe = onValue(roomRef, (snap) => {
    if (!snap.exists()) return;
    onRoomChange(snap.val());
  });
  return () => off(roomRef, 'value', unsubscribe);
}

// ─── Subscribe to game state ──────────────────────────────────────────────────
export function subscribeToGameState(code, onStateChange) {
  const stateRef = ref(db, `rooms/${code}/gameState`);
  const unsubscribe = onValue(stateRef, (snap) => {
    if (!snap.exists()) return;
    try {
      const state = JSON.parse(snap.val());
      onStateChange(state);
    } catch (e) {
      console.error('Failed to parse game state', e);
    }
  });
  return () => off(stateRef, 'value', unsubscribe);
}

// ─── Send a move to the room ──────────────────────────────────────────────────
export async function broadcastMove(code, gameState) {
  await pushGameState(code, gameState);
}

// ─── Mark player as reconnected ───────────────────────────────────────────────
export async function markReconnected(code, uid) {
  await update(ref(db, `rooms/${code}/players/${uid}`), { connected: true });
}
