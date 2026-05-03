import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CELL_MAP, getTokenCell, HOME_BASE_POSITIONS } from '../game-logic/boardPaths';
import { PLAYER_COLORS, PLAYERS } from '../game-logic/constants';
import Token from './Token';

// ─── Cell color palette ───────────────────────────────────────────────────────
const HOME_LIGHT  = { red: '#fee2e2', blue: '#dbeafe', green: '#dcfce7', yellow: '#fef9c3' };
const STRETCH_COL = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308' };
const START_COL   = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308' };

function cellBg(cell) {
  switch (cell.type) {
    case 'void':         return '#b45309';
    case 'home':         return HOME_LIGHT[cell.player];
    case 'path':         return '#ffffff';
    case 'safe':         return '#f0fdf4';
    case 'start':        return START_COL[cell.player];
    case 'homestretch':  return STRETCH_COL[cell.player];
    case 'center':       return '#7c3aed';
    case 'center-zone':  return STRETCH_COL[cell.player];
    case 'center-path':  return '#ede9fe';
    default:             return '#ffffff';
  }
}

// ─── Single board cell ────────────────────────────────────────────────────────
function Cell({ cell, row, col, tokensHere, movableTokenIds, onTokenClick, cellPx }) {
  const hasMovable = tokensHere.some(t => movableTokenIds.includes(t.tokenId));

  return (
    <div
      style={{
        width: cellPx, height: cellPx,
        backgroundColor: cellBg(cell),
        border: cell.type === 'void' ? 'none' : '0.5px solid rgba(0,0,0,0.12)',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: hasMovable ? 'pointer' : 'default',
        flexShrink: 0,
        overflow: 'hidden',
      }}
      onClick={hasMovable && tokensHere.length === 1
        ? () => onTokenClick?.(tokensHere[0].playerId, tokensHere[0].tokenId)
        : undefined}
    >
      {/* Safe zone star */}
      {(cell.type === 'safe' || cell.type === 'start') && (
        <span style={{ position: 'absolute', fontSize: cellPx * 0.52, opacity: cell.type === 'start' ? 0.5 : 0.4, pointerEvents: 'none' }}>
          ⭐
        </span>
      )}

      {/* Center diamond */}
      {cell.type === 'center' && (
        <div style={{
          width: cellPx * 0.7, height: cellPx * 0.7,
          background: 'conic-gradient(#ef4444 0 25%, #3b82f6 25% 50%, #22c55e 50% 75%, #eab308 75%)',
          transform: 'rotate(45deg)',
          borderRadius: 2,
        }} />
      )}

      {/* Movable highlight */}
      {hasMovable && (
        <motion.div
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, backgroundColor: '#facc15', pointerEvents: 'none' }}
        />
      )}

      {/* Tokens stacked */}
      {tokensHere.length > 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center',
          gap: 1, padding: 1,
        }}>
          {tokensHere.map((t, idx) => (
            <Token
              key={`${t.playerId}-${t.tokenId}`}
              playerId={t.playerId}
              tokenId={t.tokenId}
              size={tokensHere.length > 1 ? 'sm' : 'md'}
              isSelectable={movableTokenIds.includes(t.tokenId)}
              isShielded={t.token.isShielded}
              isFrozen={t.token.isFrozen}
              stacked={tokensHere.length > 1}
              stackIndex={idx}
              onClick={() => onTokenClick?.(t.playerId, t.tokenId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Home base overlay — big colored circle with 4 token slots ────────────────
function HomeBase({ player, homeTokens, movableTokenIds, onTokenClick, cellPx }) {
  const color = PLAYER_COLORS[player];
  const pad   = cellPx * 0.7;
  const diam  = cellPx * 6 - pad * 2;   // circle diameter
  const slotR = (diam / 2 - cellPx * 0.3) * 0.58; // token slot radius from center

  const slotPositions = [
    { top: '22%', left: '22%' },
    { top: '22%', right: '22%' },
    { bottom: '22%', left: '22%' },
    { bottom: '22%', right: '22%' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Outer ring */}
      <div style={{
        width: diam, height: diam,
        borderRadius: '50%',
        backgroundColor: color.primary,
        boxShadow: `0 2px 12px ${color.primary}55`,
        position: 'relative',
      }}>
        {/* Inner lighter circle */}
        <div style={{
          position: 'absolute',
          inset: '12%',
          borderRadius: '50%',
          backgroundColor: color.light,
          opacity: 0.4,
        }} />

        {/* 4 token slots */}
        {slotPositions.map((pos, i) => {
          const t = homeTokens[i];
          const slotSize = cellPx * 1.15;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: slotSize, height: slotSize,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: 'translate(-50%,-50%)',
                ...Object.fromEntries(
                  Object.entries(pos).map(([k, v]) => [k, typeof v === 'string' && v.endsWith('%')
                    ? `calc(${v})` : v])
                ),
                // override: use left/top with percent
                left: pos.left, top: pos.top,
                right: pos.right, bottom: pos.bottom,
                transform: undefined,
              }}
            >
              {t && (
                <Token
                  playerId={player}
                  tokenId={t.token.id}
                  size="md"
                  isSelectable={movableTokenIds.includes(t.token.id)}
                  isShielded={t.token.isShielded}
                  isFrozen={t.token.isFrozen}
                  onClick={() => onTokenClick?.(player, t.token.id)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function Board({ players, movableTokenIds = [], onTokenClick, boardSize = 360 }) {
  const cellPx = boardSize / 15;

  // Tokens on the main/home-stretch path, keyed by "row,col"
  const tokensByCell = useMemo(() => {
    const map = {};
    for (const player of players) {
      for (const token of player.tokens) {
        if (token.position < 0) continue;
        const cell = getTokenCell(player.id, token.position);
        if (!cell) continue;
        const key = `${cell[0]},${cell[1]}`;
        if (!map[key]) map[key] = [];
        map[key].push({ playerId: player.id, tokenId: token.id, token });
      }
    }
    return map;
  }, [players]);

  // Home-base tokens per player
  const homeToksByPlayer = useMemo(() => {
    const map = {};
    for (const player of players) {
      map[player.id] = player.tokens
        .filter(t => t.position === -1)
        .map(token => ({ token }));
    }
    return map;
  }, [players]);

  // Corner positions for home-base overlays
  const corners = {
    red:    { top: 0,    left: 0 },
    blue:   { top: 0,    right: 0 },
    green:  { bottom: 0, right: 0 },
    yellow: { bottom: 0, left: 0 },
  };

  return (
    <div style={{
      width: boardSize, height: boardSize,
      position: 'relative',
      borderRadius: 6,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      border: '3px solid #92400e',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      {/* 15×15 grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(15, ${cellPx}px)`,
        gridTemplateRows:    `repeat(15, ${cellPx}px)`,
        width: boardSize, height: boardSize,
      }}>
        {CELL_MAP.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell} row={r} col={c}
              tokensHere={tokensByCell[`${r},${c}`] || []}
              movableTokenIds={movableTokenIds}
              onTokenClick={onTokenClick}
              cellPx={cellPx}
            />
          ))
        )}
      </div>

      {/* Home-base circle overlays */}
      {PLAYERS.map(player => (
        <div
          key={player}
          style={{
            position: 'absolute',
            width: cellPx * 6, height: cellPx * 6,
            ...corners[player],
            pointerEvents: 'none',
          }}
        >
          <HomeBase
            player={player}
            homeTokens={homeToksByPlayer[player] || []}
            movableTokenIds={movableTokenIds}
            onTokenClick={onTokenClick}
            cellPx={cellPx}
          />
        </div>
      ))}
    </div>
  );
}
