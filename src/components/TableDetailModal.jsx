import { useState } from 'react';
import { X, Utensils, ArrowRightLeft, UserMinus, ChevronDown, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

function getSeatPositions(shape, seats, width, height) {
  const positions = [];
  if (shape === 'sweetheart') {
    const cy = height / 2;
    positions.push({ x: width * 0.3, y: cy });
    positions.push({ x: width * 0.7, y: cy });
    return positions;
  }
  if (shape === 'round') {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - 55;
    for (let i = 0; i < seats; i++) {
      const angle = (2 * Math.PI * i) / seats - Math.PI / 2;
      positions.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
  } else {
    const pad = 55;
    const iw = width - pad * 2;
    const ih = height - pad * 2;
    const peri = 2 * (iw + ih);
    const spacing = peri / seats;
    for (let i = 0; i < seats; i++) {
      let d = spacing * i;
      let x, y;
      if (d < iw) { x = pad + d; y = pad; }
      else if (d < iw + ih) { x = pad + iw; y = pad + (d - iw); }
      else if (d < 2 * iw + ih) { x = pad + iw - (d - iw - ih); y = pad + ih; }
      else { x = pad; y = pad + ih - (d - 2 * iw - ih); }
      positions.push({ x, y });
    }
  }
  return positions;
}

export default function TableDetailModal({
  table,
  guests,
  allGuests,
  groups,
  onClose,
  onAssignGuest,
  onUnassignGuest,
  onSwapGuests,
}) {
  const [swapSource, setSwapSource] = useState(null); // seatIndex being swapped
  const [assignSeat, setAssignSeat] = useState(null); // seatIndex to assign to

  if (!table) return null;

  const isSweetheart = table.shape === 'sweetheart';
  const effectiveSeats = isSweetheart ? 2 : table.seats;
  const width = isSweetheart ? 400 : table.shape === 'round' ? 400 : 500;
  const height = isSweetheart ? 240 : table.shape === 'round' ? 400 : 360;
  const seatSize = 70;

  const seatPositions = getSeatPositions(table.shape, effectiveSeats, width, height);

  // Build guest map for this table
  const guestMap = {};
  for (const g of guests) {
    if (g.tableId === table.id && g.seatIndex != null) {
      guestMap[g.seatIndex] = g;
    }
  }

  const assignedCount = Object.keys(guestMap).length;

  // Unassigned guests for the assign dropdown
  const unassigned = allGuests.filter((g) => !g.tableId);

  const groupMap = {};
  for (const g of (groups || [])) {
    groupMap[g.id] = g;
  }

  const handleSeatClick = (seatIndex) => {
    const guest = guestMap[seatIndex];

    // If we're in swap mode
    if (swapSource !== null) {
      if (seatIndex === swapSource) {
        setSwapSource(null);
        return;
      }
      const sourceGuest = guestMap[swapSource];
      const targetGuest = guestMap[seatIndex];

      if (sourceGuest && targetGuest) {
        onSwapGuests(sourceGuest.id, targetGuest.id);
        toast.success(`Swapped ${sourceGuest.name} and ${targetGuest.name}`);
      } else if (sourceGuest && !targetGuest) {
        // Move to empty seat
        onAssignGuest(sourceGuest.id, table.id, seatIndex);
        toast.success(`Moved ${sourceGuest.name} to seat ${seatIndex + 1}`);
      }
      setSwapSource(null);
      return;
    }

    // Empty seat — open assign dropdown
    if (!guest) {
      setAssignSeat(assignSeat === seatIndex ? null : seatIndex);
      return;
    }
  };

  const handleAssignFromDropdown = (guestId, seatIndex) => {
    onAssignGuest(guestId, table.id, seatIndex);
    const guest = allGuests.find((g) => g.id === guestId);
    toast.success(`${guest?.name || 'Guest'} seated at seat ${seatIndex + 1}`);
    setAssignSeat(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl font-semibold text-wine flex items-center gap-2">
              {isSweetheart && <Heart size={18} className="text-gold" fill="#f59e0b" />}
              {table.label}
            </h2>
            <p className="text-sm text-gray-500">
              {isSweetheart ? 'Sweetheart' : table.shape === 'round' ? 'Round' : 'Rectangular'} &middot;{' '}
              {assignedCount}/{effectiveSeats} seats filled
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 pt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ArrowRightLeft size={12} /> Click <b>Move/Swap</b> then click a target seat
          </span>
          <span className="flex items-center gap-1">
            <UserMinus size={12} /> Unassign a guest back to the sidebar
          </span>
          <span>Click an empty seat to assign an unassigned guest</span>
        </div>

        {/* Table visualization */}
        <div className="flex justify-center py-6 px-4">
          <div className="relative" style={{ width, height }}>
            {/* Table surface */}
            {isSweetheart ? (
              <div className="absolute border-2 rounded-full flex items-center justify-center"
                style={{
                  left: 40, top: 30, right: 40, bottom: 30,
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(245,230,224,0.5))',
                  borderColor: '#f59e0b',
                }}
              >
                <div className="text-center">
                  <Heart size={16} className="text-gold mx-auto mb-1" fill="#f59e0b" />
                  <p className="font-serif text-sm font-semibold text-gold-dark">{table.label}</p>
                  <p className="text-[11px] text-gray-500">{assignedCount}/2</p>
                </div>
              </div>
            ) : table.shape === 'round' ? (
              <div className="absolute bg-teal/10 border-2 border-teal/40 rounded-full flex items-center justify-center"
                style={{ left: 50, top: 50, right: 50, bottom: 50 }}
              >
                <div className="text-center">
                  <p className="font-serif text-sm font-semibold text-wine">{table.label}</p>
                  <p className="text-[11px] text-gray-500">{assignedCount}/{table.seats}</p>
                </div>
              </div>
            ) : (
              <div className="absolute bg-teal/10 border-2 border-teal/40 rounded-xl flex items-center justify-center"
                style={{ left: 40, top: 40, right: 40, bottom: 40 }}
              >
                <div className="text-center">
                  <p className="font-serif text-sm font-semibold text-wine">{table.label}</p>
                  <p className="text-[11px] text-gray-500">{assignedCount}/{table.seats}</p>
                </div>
              </div>
            )}

            {/* Seats */}
            {seatPositions.map((pos, i) => {
              const guest = guestMap[i];
              const isSwapSource = swapSource === i;
              const isSwapTarget = swapSource !== null && swapSource !== i;
              const isAssignTarget = assignSeat === i;
              const group = guest?.groupId ? groupMap[guest.groupId] : null;

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: pos.x - seatSize / 2,
                    top: pos.y - seatSize / 2,
                    width: seatSize,
                    height: seatSize,
                  }}
                >
                  {/* Seat circle */}
                  <button
                    onClick={() => handleSeatClick(i)}
                    className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center transition-all cursor-pointer
                      ${guest ? 'border-2 bg-sage/10' : 'border-2 border-dashed bg-white/80 hover:border-sage hover:bg-sage/5'}
                      ${isSwapSource ? 'ring-2 ring-gold ring-offset-2 border-gold bg-gold/10' : ''}
                      ${isSwapTarget ? 'ring-2 ring-gold/50 ring-offset-1 hover:ring-gold hover:bg-gold/10' : ''}
                      ${isAssignTarget ? 'ring-2 ring-sage ring-offset-2 border-sage bg-sage/10' : ''}
                    `}
                    style={{
                      borderColor: guest
                        ? (group?.color || '#0d9488')
                        : isSwapSource ? '#f59e0b' : undefined,
                      borderLeftWidth: group ? '4px' : undefined,
                      borderLeftColor: group?.color,
                    }}
                  >
                    {guest ? (
                      <>
                        <span className="text-[11px] font-medium text-gray-800 leading-tight px-1 truncate max-w-full">
                          {guest.name}
                        </span>
                        {guest.dietary && (
                          <span className="flex items-center gap-0.5 text-[9px] text-gold mt-0.5">
                            <Utensils size={8} />
                            {guest.dietary}
                          </span>
                        )}
                        {group && (
                          <span
                            className="text-[8px] mt-0.5 px-1 rounded-full"
                            style={{ backgroundColor: group.color + '30', color: '#666' }}
                          >
                            {group.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-400">{i + 1}</span>
                    )}
                  </button>

                  {/* Action buttons for occupied seats */}
                  {guest && !isSwapSource && swapSource === null && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSwapSource(i); setAssignSeat(null); }}
                        className="bg-white border border-gray-200 rounded-full p-0.5 hover:bg-gold/10 text-gray-500 hover:text-gold cursor-pointer shadow-sm"
                        title="Move or swap this guest"
                      >
                        <ArrowRightLeft size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnassignGuest(guest.id);
                          toast.success(`${guest.name} unassigned`);
                        }}
                        className="bg-white border border-gray-200 rounded-full p-0.5 hover:bg-red-50 text-gray-500 hover:text-red-500 cursor-pointer shadow-sm"
                        title="Unassign guest"
                      >
                        <UserMinus size={10} />
                      </button>
                    </div>
                  )}

                  {/* Assign dropdown for empty seats */}
                  {isAssignTarget && !guest && unassigned.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 max-h-40 overflow-y-auto">
                      <p className="text-[10px] text-gray-500 font-medium mb-1">Assign to seat {i + 1}:</p>
                      {unassigned.map((ug) => (
                        <button
                          key={ug.id}
                          onClick={(e) => { e.stopPropagation(); handleAssignFromDropdown(ug.id, i); }}
                          className="block w-full text-left text-xs text-gray-700 hover:bg-sage/10 rounded px-2 py-1 cursor-pointer truncate"
                        >
                          {ug.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Swap mode indicator */}
        {swapSource !== null && (
          <div className="px-6 pb-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-2 rounded-lg text-sm">
              <ArrowRightLeft size={14} />
              <span>
                Moving <b>{guestMap[swapSource]?.name}</b> — click a target seat
              </span>
              <button
                onClick={() => setSwapSource(null)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer ml-2"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Guest list summary */}
        <div className="px-6 pb-5 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <ChevronDown size={14} />
            Seated Guests ({assignedCount})
          </h4>
          {assignedCount === 0 ? (
            <p className="text-sm text-gray-400 italic">No guests at this table yet. Click an empty seat to assign.</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {Array.from({ length: table.seats }, (_, i) => i)
                .filter((i) => guestMap[i])
                .map((i) => {
                  const g = guestMap[i];
                  const grp = g.groupId ? groupMap[g.groupId] : null;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-gray-400 text-xs w-4 text-right shrink-0">{i + 1}.</span>
                      {grp && (
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: grp.color }} />
                      )}
                      <span className="text-gray-800 truncate flex-1">{g.name}</span>
                      {g.dietary && (
                        <span className="text-gold text-xs flex items-center gap-0.5 shrink-0">
                          <Utensils size={10} />
                          {g.dietary}
                        </span>
                      )}
                      {g.notes && (
                        <span className="text-gray-400 text-xs truncate max-w-[80px]" title={g.notes}>
                          {g.notes}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
