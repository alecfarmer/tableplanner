import { useState } from 'react';
import { Edit3, Check, Trash2, Settings, Heart, Copy, RotateCw } from 'lucide-react';
import Seat from './Seat';

export function getSeatPositions(shape, seats, width, height) {
  const positions = [];

  if (shape === 'sweetheart') {
    const centerY = height / 2;
    positions.push({ x: width * 0.3, y: centerY });
    positions.push({ x: width * 0.7, y: centerY });
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

function getCapacityClass(assigned, total) {
  const ratio = total > 0 ? assigned / total : 0;
  if (ratio >= 1) return 'capacity-full';
  if (ratio >= 0.75) return 'capacity-warning';
  return 'capacity-ok';
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
  const capacityClass = getCapacityClass(assignedCount, effectiveSeats);

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
        className="text-sage hover:text-sage-dark cursor-pointer"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Check size={12} />
      </button>
    </div>
  ) : (
    <button
      onClick={() => setEditing(true)}
      onPointerDown={(e) => e.stopPropagation()}
      className={`text-xs font-serif font-semibold flex items-center gap-1 hover:opacity-70 cursor-pointer ${
        isSweetheart ? 'text-gold-dark' : 'text-wine'
      }`}
    >
      {table.label}
      <Edit3 size={10} />
    </button>
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
        <div
          className="absolute inset-4 border-2 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(245,230,224,0.5))',
            borderColor: '#c9a84c',
          }}
        >
          <Heart size={12} className="text-gold mb-0.5" fill="#c9a84c" />
          {labelBlock}
          <span className="text-[10px] text-gray-500 mt-0.5">
            {assignedCount}/2
          </span>
        </div>
      ) : table.shape === 'round' ? (
        <div className={`absolute inset-8 bg-blush/40 border-2 border-blush-dark rounded-full flex flex-col items-center justify-center ${capacityClass}`}>
          {labelBlock}
          <span className="text-[10px] text-gray-500 mt-0.5">
            {assignedCount}/{table.seats}
          </span>
          {table.notes && (
            <span className="text-[8px] text-gray-400 mt-0.5 truncate max-w-[60px]" title={table.notes}>
              {table.notes}
            </span>
          )}
        </div>
      ) : (
        <div className={`absolute inset-6 bg-blush/40 border-2 border-blush-dark rounded-lg flex flex-col items-center justify-center ${capacityClass}`}>
          {labelBlock}
          <span className="text-[10px] text-gray-500 mt-0.5">
            {assignedCount}/{table.seats}
          </span>
          {table.notes && (
            <span className="text-[8px] text-gray-400 mt-0.5 truncate max-w-[80px]" title={table.notes}>
              {table.notes}
            </span>
          )}
        </div>
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

      {/* Settings popup (not for sweetheart) */}
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
