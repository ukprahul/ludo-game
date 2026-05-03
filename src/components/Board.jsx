import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CELL_MAP, getTokenCell, HOME_BASE_POSITIONS } from '../game-logic/boardPaths';
import { PLAYER_COLORS, PLAYERS } from '../game-logic/constants';
import Token from './Token';

// ─── Color utilities ──────────────────────────────────────────────────────────
const HOME_BG = {
  red:    '#fee2e2',
  blue:   '#dbeafe',
  green:  '#dcfce7',
  yellow: '#fef9c3',
};
const STRETCH_BG = {
  red:    '#fca5a5',
  blue:   '#93c5fd',
  green:  '#86efac',
  yellow: '#fde047',
};
const START_BG = {
  red:    '#ef4444',
  blue:   '#3b82f6',
  green:  '#22c55e',
  yellow: '#eab308',
};

function cellBackground(cell) {
  switch (cell.type) {
    case 'void':        return '#c8a96e';
    case 'home':        return HOME_BG[cell.player];
    case 'path':        return '#ffffff';
    case 'safe':        return '#e0f2fe';
    case 'start':       return START_BG[cell.player];
    case 'homestretch': return STRETCH_BG[cell.player];
    case 'center':      return '#7c3aed';
    case 'center-zone': return STRETCH_BG[cell.player];
    case 'center-path': return '#ffffff';
    default:            return '#ffffff';
  }
}

function cellBorder(cell) {
  if (cell.type === 'void') return 'none';
  return '1px solid rgba(0,0,0,0.1)';
}

// ─── Individual board cell ────────────────────────────────────────────────────
function BoardCell({ cell, row, col, tokens, movableTokenIds, selectedTokenId, onTokenClick, boardSize }) {
  const cellPx = boardSize / 15;

  const handleClick = useCallback(() => {
    if (tokens.length === 1) {
      onTokenClick?.(tokens[0].playerId, tokens[0].tokenId);
    }
  }, [tokens, onTokenClick]);

  const hasMovable = tokens.some(t => movableTokenIds.includes(t.tokenId));

  return (
    <div
      onClick={tokens.length > 0 ? handleClick : undefined}
      style={{
        width: cellPx,
        height: cellPx,
        backgroundColor: cellBackground(cell),
        border: cellBorder(cell),
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasMovable ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    >
      {/* Safe zone star */}
      {cell.type === 'safe' && (
        <span style={{ position: 'absolute', opacity: 0.35, fontSize: cellPx * 0.55, lineHeight: 1 }}>
          ⭐
        </span>
      )}

      {/* Start player icon */}
      {cell.type === 'start' && (
        <span style={{ position: 'absolute', opacity: 0.25, fontSize: cellPx * 0.5, lineHeight: 1 }}>
          ⭐
        </span>
      )}

      {/* Center diamond */}
      {cell.type === 'center' && (
        <div style={{
          width: cellPx * 0.6,
          height: cellPx * 0.6,
          background: 'linear-gradient(135deg, #ef4444 25%, #3b82f6 25% 50%, #22c55e 50% 75%, #eab308 75%)',
          transform: 'rotate(45deg)',
          borderRadius: 2,
        }} />
      )}

      {/* Movable highlight pulse */}
      {hasMovable && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: '#facc15',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tokens */}
      {tokens.length > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center',
          gap: 1, padding: 1,
          zIndex: 2,
        }}>
          {tokens.map((t, idx) => (
            <Token
              key={`${t.playerId}-${t.tokenId}`}
              playerId={t.playerId}
              tokenId={t.tokenId}
              size={tokens.length > 1 ? 'sm' : 'md'}
              isSelectable={movableTokenIds.includes(t.tokenId)}
              isSelected={selectedTokenId === t.tokenId}
              isShielded={t.token.isShielded}
              isFrozen={t.token.isFrozen}
              stacked={tokens.length > 1}
              stackIndex={idx}
              onClick={() => onTokenClick?.(t.playerId, t.tokenId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Home base corner (tokens in 2×2 grid slots) ─────────────────────────────
function HomeBase({ player, tokens, movableTokenIds, selectedTokenId, onTokenClick, cellPx }) {
  const positions = HOME_BASE_POSITIONS[player];
  const homeTokens = tokens[player]?.filter(t => t.token.position === -1) || [];
  const color = PLAYER_COLORS[player];

  return (
    <div style={{
      position: 'absolute',
      inset: cellPx * 0.5,
      backgroundColor: color.primary + '22',
      border: `2px solid ${color.primary}55`,
      borderRadius: 8,
      display: 'flex',
      flexWrap: 'wrap',
      gap: cellPx * 0.1,
      padding: cellPx * 0.2,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {Array.from({ length: 4 }).map((_, i) => {
        const t = homeTokens[i];
        return (
          <div
            key={i}
            style={{
              width: cellPx * 1.1,
              height: cellPx * 1.1,
              borderRadius: '50%',
              backgroundColor: t ? 'transparent' : color.primary + '33',
              border: `2px dashed ${color.primary}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {t && (
              <Token
                playerId={player}
                tokenId={t.token.id}
                size="md"
                isSelectable={movableTokenIds.includes(t.token.id)}
                isSelected={selectedTokenId === t.token.id}
                isShielded={t.token.isShielded}
                isFrozen={t.token.isFrozen}
                onClick={() => onTokenClick?.(player, t.token.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Board component ─────────────────────────────────────────────────────
export default function Board({
  players,
  movableTokenIds = [],
  selectedTokenId = null,
  onTokenClick,
  boardSize = 315,
}) {
  const cellPx = boardSize / 15;

  // Build token-by-cell lookup
  const tokensByCell = useMemo(() => {
    const map = {};
    for (const player of players) {
      for (const token of player.tokens) {
        if (token.position === -1) continue; // handled by HomeBase
        const cell = getTokenCell(player.id, token.position);
        if (!cell) continue;
        const key = `${cell[0]},${cell[1]}`;
        if (!map[key]) map[key] = [];
        map[key].push({ playerId: player.id, tokenId: token.id, token });
      }
    }
    return map;
  }, [players]);

  // Build player token lookup for HomeBase
  const homeTokensByPlayer = useMemo(() => {
    const map = {};
    for (const player of players) {
      map[player.id] = player.tokens
        .filter(t => t.position === -1)
        .map(token => ({ token }));
    }
    return map;
  }, [players]);

  return (
    <div
      style={{
        width: boardSize,
        height: boardSize,
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Grid of cells */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(15, ${cellPx}px)`,
        gridTemplateRows: `repeat(15, ${cellPx}px)`,
        width: boardSize,
        height: boardSize,
      }}>
        {CELL_MAP.map((row, r) =>
          row.map((cell, c) => {
            const tokensHere = tokensByCell[`${r},${c}`] || [];
            // Home base areas are drawn as overlays; render base cells as colored only
            return (
              <BoardCell
                key={`${r}-${c}`}
                cell={cell}
                row={r}
                col={c}
                tokens={tokensHere}
                movableTokenIds={movableTokenIds}
                selectedTokenId={selectedTokenId}
                onTokenClick={onTokenClick}
                boardSize={boardSize}
              />
            );
          })
        )}
      </div>

      {/* Home base overlays with token slots */}
      {PLAYERS.map(player => {
        const corners = {
          red:    { top: 0, left: 0 },
          blue:   { top: 0, right: 0 },
          green:  { bottom: 0, right: 0 },
          yellow: { bottom: 0, left: 0 },
        };
        return (
          <div
            key={player}
            style={{
              position: 'absolute',
              width: cellPx * 6,
              height: cellPx * 6,
              ...corners[player],
            }}
          >
            <HomeBase
              player={player}
              tokens={homeTokensByPlayer}
              movableTokenIds={movableTokenIds}
              selectedTokenId={selectedTokenId}
              onTokenClick={onTokenClick}
              cellPx={cellPx}
            />
          </div>
        );
      })}

      {/* Board border */}
      <div
        style={{
          position: 'absolute', inset: 0,
          border: '3px solid #92400e',
          borderRadius: 4,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
