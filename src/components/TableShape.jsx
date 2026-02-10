import { useState } from 'react';
import { Edit3, Check, Trash2, Settings, Heart, Copy, RotateCw } from 'lucide-react';
import Seat from './Seat';

export function getSeatPositions(shape, seats, width, height) {
  const positions = [];

  if (shape === 'sweetheart') {
    const centerX = width / 2;
    const centerY = height / 2;
    const rx = 75;
    const gap = 7; // matches round table seat-to-edge gap
    positions.push({ x: centerX - rx - gap, y: centerY });
    positions.push({ x: centerX + rx + gap, y: centerY });
    return positions;
  }

  if (shape === 'round') {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 25;

    for (let i = 0; i < seats; i++) {
      const angle = (2 * Math.PI * i) / seats - Math.PI / 2;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
  } else {
    const padding = 30;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const perimeter = 2 * (innerW + innerH);
    const spacing = perimeter / seats;

    for (let i = 0; i < seats; i++) {
      let d = spacing * i;
      let x, y;

      if (d < innerW) {
        x = padding + d;
        y = padding;
      } else if (d < innerW + innerH) {
        x = padding + innerW;
        y = padding + (d - innerW);
      } else if (d < 2 * innerW + innerH) {
        x = padding + innerW - (d - innerW - innerH);
        y = padding + innerH;
      } else {
        x = padding;
        y = padding + innerH - (d - 2 * innerW - innerH);
      }

      positions.push({ x, y });
    }
  }

  return positions;
}

function getTableDimensions(shape) {
  if (shape === 'sweetheart') return { width: 260, height: 140 };
  if (shape === 'round') return { width: 200, height: 200 };
  return { width: 260, height: 180 };
}

function getCapacityInfo(assigned, total) {
  const ratio = total > 0 ? assigned / total : 0;
  if (ratio >= 1) return { label: 'Full', color: '#f97066', bg: '#fef2f2' };
  if (ratio >= 0.75) return { label: 'Almost full', color: '#f59e0b', bg: '#fffbeb' };
  return { label: null, color: '#0d9488', bg: null };
}

export default function TableShape({
  table,
  guests,
  highlightedGuestIds,
  onUpdateTable,
  onRemoveTable,
  onDuplicateTable,
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(table.label);
  const [showSettings, setShowSettings] = useState(false);

  const isSweetheart = table.shape === 'sweetheart';
  const { width, height } = getTableDimensions(table.shape);
  const effectiveSeats = isSweetheart ? 2 : table.seats;
  const rotation = table.rotation || 0;

  const seatPositions = getSeatPositions(table.shape, effectiveSeats, width, height);

  const guestMap = {};
  for (const g of guests) {
    if (g.tableId === table.id && g.seatIndex != null) {
      guestMap[g.seatIndex] = g;
    }
  }

  const handleLabelSave = () => {
    onUpdateTable(table.id, { label: label.trim() || table.label });
    setEditing(false);
  };

  const assignedCount = Object.keys(guestMap).length;
  const capacity = getCapacityInfo(assignedCount, effectiveSeats);

  const labelBlock = editing ? (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
        className="text-xs bg-white border border-gray-300 rounded px-1 py-0.5 w-20 text-center"
        autoFocus
      />
      <button
        onClick={handleLabelSave}
        className="text-teal hover:text-teal-dark cursor-pointer"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Check size={12} />
      </button>
    </div>
  ) : (
    <button
      onClick={() => setEditing(true)}
      onPointerDown={(e) => e.stopPropagation()}
      className="text-xs font-serif font-semibold flex items-center gap-1 hover:opacity-70 cursor-pointer text-navy"
    >
      {table.label}
      <Edit3 size={10} className="text-gray-400" />
    </button>
  );

  // Shared SVG filter for soft shadow
  const shadowFilter = (id) => (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.06" />
    </filter>
  );

  return (
    <div
      className="relative"
      style={{
        width,
        height,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      {/* Table surface */}
      {isSweetheart ? (
        <>
          <svg className="absolute inset-0" width={width} height={height}>
            <defs>
              {shadowFilter(`sweet-shadow-${table.id}`)}
              <radialGradient id={`sweet-fill-${table.id}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fce7f3" />
              </radialGradient>
            </defs>
            <ellipse
              cx={width / 2} cy={height / 2}
              rx={75} ry={42}
              fill={`url(#sweet-fill-${table.id})`}
              stroke="#f9a8d4" strokeWidth="1.5"
              filter={`url(#sweet-shadow-${table.id})`}
            />
            <ellipse
              cx={width / 2} cy={height / 2}
              rx={60} ry={30}
              fill="none" stroke="#f9a8d4" strokeWidth="0.5" opacity="0.3"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <Heart size={12} className="text-pink-400 mb-0.5" fill="#f472b6" />
            {labelBlock}
            <span className="text-[10px] text-gray-400 mt-0.5">
              {assignedCount}/2
            </span>
          </div>
        </>
      ) : table.shape === 'round' ? (
        <>
          <svg className="absolute inset-0" width={width} height={height}>
            <defs>
              {shadowFilter(`round-shadow-${table.id}`)}
              <radialGradient id={`round-fill-${table.id}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </radialGradient>
            </defs>
            <circle
              cx={width / 2} cy={height / 2} r={width / 2 - 32}
              fill={`url(#round-fill-${table.id})`}
              stroke="#cbd5e1" strokeWidth="1.5"
              filter={`url(#round-shadow-${table.id})`}
            />
            <circle
              cx={width / 2} cy={height / 2} r={width / 2 - 42}
              fill="none" stroke="#e2e8f0" strokeWidth="0.5"
            />
          </svg>
          <div className="absolute inset-8 rounded-full flex flex-col items-center justify-center z-10">
            {labelBlock}
            <span className="text-[10px] text-gray-400 mt-0.5">
              {assignedCount}/{table.seats}
            </span>
            {capacity.label && (
              <span
                className="text-[8px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full"
                style={{ color: capacity.color, backgroundColor: capacity.bg }}
              >
                {capacity.label}
              </span>
            )}
            {table.notes && (
              <span className="text-[8px] text-gray-400 mt-0.5 truncate max-w-[60px]" title={table.notes}>
                {table.notes}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <svg className="absolute inset-0" width={width} height={height}>
            <defs>
              {shadowFilter(`rect-shadow-${table.id}`)}
              <linearGradient id={`rect-fill-${table.id}`} x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            </defs>
            <rect
              x={24} y={24} width={width - 48} height={height - 48} rx={12}
              fill={`url(#rect-fill-${table.id})`}
              stroke="#cbd5e1" strokeWidth="1.5"
              filter={`url(#rect-shadow-${table.id})`}
            />
            <rect
              x={34} y={34} width={width - 68} height={height - 68} rx={8}
              fill="none" stroke="#e2e8f0" strokeWidth="0.5"
            />
          </svg>
          <div className="absolute inset-6 rounded-lg flex flex-col items-center justify-center z-10">
            {labelBlock}
            <span className="text-[10px] text-gray-400 mt-0.5">
              {assignedCount}/{table.seats}
            </span>
            {capacity.label && (
              <span
                className="text-[8px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full"
                style={{ color: capacity.color, backgroundColor: capacity.bg }}
              >
                {capacity.label}
              </span>
            )}
            {table.notes && (
              <span className="text-[8px] text-gray-400 mt-0.5 truncate max-w-[80px]" title={table.notes}>
                {table.notes}
              </span>
            )}
          </div>
        </>
      )}

      {/* Table controls */}
      <div className="absolute -top-3 -right-3 flex gap-1 z-10">
        {!isSweetheart && (
          <>
            <button
              onClick={() => setShowSettings(!showSettings)}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-white shadow-sm border border-gray-200 rounded-full p-1 hover:bg-gray-50 text-gray-500 cursor-pointer"
            >
              <Settings size={12} />
            </button>
            {onDuplicateTable && (
              <button
                onClick={() => onDuplicateTable(table.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="bg-white shadow-sm border border-gray-200 rounded-full p-1 hover:bg-gray-50 text-gray-500 cursor-pointer"
                title="Duplicate table"
              >
                <Copy size={12} />
              </button>
            )}
          </>
        )}
        <button
          onClick={() => onRemoveTable(table.id)}
          onPointerDown={(e) => e.stopPropagation()}
          className="bg-white shadow-sm border border-gray-200 rounded-full p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Settings popup */}
      {showSettings && !isSweetheart && (
        <div
          className="absolute -top-2 right-10 z-20 bg-white shadow-lg rounded-lg border border-gray-200 p-3 w-52"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-gray-500">Seats</span>
              <input
                type="number"
                min={1}
                max={20}
                value={table.seats}
                onChange={(e) =>
                  onUpdateTable(table.id, { seats: parseInt(e.target.value) || 1 })
                }
                className="input-field mt-0.5"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">Shape</span>
              <select
                value={table.shape}
                onChange={(e) => onUpdateTable(table.id, { shape: e.target.value })}
                className="input-field mt-0.5"
              >
                <option value="round">Round</option>
                <option value="rectangular">Rectangular</option>
              </select>
            </label>
            {table.shape === 'rectangular' && (
              <label className="block">
                <span className="text-xs text-gray-500">Rotation</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={rotation}
                    onChange={(e) => onUpdateTable(table.id, { rotation: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-gray-500 w-8">{rotation}°</span>
                </div>
              </label>
            )}
            <label className="block">
              <span className="text-xs text-gray-500">Notes</span>
              <input
                type="text"
                value={table.notes || ''}
                onChange={(e) => onUpdateTable(table.id, { notes: e.target.value })}
                placeholder="e.g. Near dance floor"
                className="input-field mt-0.5"
              />
            </label>
            <button
              onClick={() => setShowSettings(false)}
              className="btn-primary w-full text-xs py-1"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Seats */}
      {seatPositions.map((pos, i) => (
        <Seat
          key={i}
          tableId={table.id}
          seatIndex={i}
          guest={guestMap[i] || null}
          position={pos}
          highlighted={!!(guestMap[i] && highlightedGuestIds?.has(guestMap[i].id))}
        />
      ))}
    </div>
  );
}
