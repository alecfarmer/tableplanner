import { useDroppable, useDraggable } from '@dnd-kit/core';
import { ArrowLeftRight } from 'lucide-react';

const RSVP_COLORS = {
  accepted: { bg: '#059669', hover: '#047857', text: 'white' },   // green
  invited:  { bg: '#2563eb', hover: '#1d4ed8', text: 'white' },   // blue
  pending:  { bg: '#d97706', hover: '#b45309', text: 'white' },   // amber
  declined: { bg: '#dc2626', hover: '#b91c1c', text: 'white' },   // red
};

const DIETARY_COLORS = {
  vegetarian: '#22c55e',
  vegan: '#16a34a',
  'gluten-free': '#eab308',
  'gluten free': '#eab308',
  'nut-free': '#f97316',
  'nut free': '#f97316',
  halal: '#8b5cf6',
  kosher: '#3b82f6',
  'dairy-free': '#06b6d4',
  'dairy free': '#06b6d4',
};

function getDietaryColor(dietary) {
  if (!dietary) return null;
  const lower = dietary.toLowerCase();
  for (const [key, color] of Object.entries(DIETARY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#f59e0b';
}

export default function Seat({ tableId, seatIndex, guest, position, size = 40, highlighted = false }) {
  const seatId = `seat-${tableId}-${seatIndex}`;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: seatId,
    data: { type: 'seat', tableId, seatIndex, currentGuest: guest },
  });

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } =
    useDraggable({
      id: guest ? `guest-${guest.id}` : `empty-seat-${seatId}`,
      data: guest ? { type: 'guest', guest } : { type: 'empty' },
      disabled: !guest,
    });

  const dragStyle = {};

  const dietaryColor = guest ? getDietaryColor(guest.dietary) : null;
  const rsvp = guest ? RSVP_COLORS[guest.rsvp || 'pending'] : null;

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      {...(guest ? { ...attributes, ...listeners } : {})}
      className={`absolute flex items-center justify-center rounded-full text-center transition-all duration-150
        ${guest
          ? 'shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-105'
          : 'border-[1.5px] border-dashed border-gray-300 bg-white hover:border-teal hover:bg-teal-50 hover:scale-105'
        }
        ${isOver && guest ? 'swap-indicator' : ''}
        ${isOver && !guest ? 'drop-target-active' : ''}
        ${isDragging ? 'opacity-30 pointer-events-none' : ''}
        ${highlighted ? 'ring-2 ring-amber ring-offset-1 z-20' : ''}
      `}
      style={{
        width: size,
        height: size,
        left: position.x - size / 2,
        top: position.y - size / 2,
        fontSize: '9px',
        lineHeight: '1.1',
        padding: '2px',
        ...(rsvp ? { backgroundColor: rsvp.bg, color: rsvp.text } : {}),
        ...(highlighted ? {
          boxShadow: '0 0 8px 2px rgba(245,158,11,0.5)',
          animation: 'pulse-gold 1.5s ease-in-out infinite',
        } : {}),
        ...dragStyle,
      }}
      title={guest ? `${guest.name}${guest.dietary ? ` (${guest.dietary})` : ''}${guest.meal ? ` [${guest.meal}]` : ''}` : `Seat ${seatIndex + 1}`}
    >
      {isOver && guest && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber/30 rounded-full z-10">
          <ArrowLeftRight size={14} className="text-amber-700" />
        </div>
      )}
      {guest ? (
        <>
          <span className="truncate block w-full font-semibold">
            {guest.name.split(' ')[0]}
          </span>
          {dietaryColor && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-white"
              style={{ backgroundColor: dietaryColor }}
              title={guest.dietary}
            />
          )}
        </>
      ) : (
        <span className="text-gray-400 text-[8px] font-medium">{seatIndex + 1}</span>
      )}
    </div>
  );
}
