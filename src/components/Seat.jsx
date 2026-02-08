import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

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
  return '#c9a84c'; // gold fallback
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

  const dragStyle = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 1000,
      }
    : {};

  const dietaryColor = guest ? getDietaryColor(guest.dietary) : null;

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      {...(guest ? { ...attributes, ...listeners } : {})}
      className={`absolute flex items-center justify-center rounded-full text-center
        ${guest ? 'seat-occupied cursor-grab active:cursor-grabbing' : 'seat-empty'}
        ${isOver ? 'drop-target-active' : ''}
        ${isDragging ? 'opacity-50 ring-2 ring-sage' : ''}
        ${highlighted ? 'ring-2 ring-gold ring-offset-1 z-20' : ''}
      `}
      style={{
        width: size,
        height: size,
        left: position.x - size / 2,
        top: position.y - size / 2,
        fontSize: '9px',
        lineHeight: '1.1',
        padding: '2px',
        ...(highlighted ? {
          boxShadow: '0 0 8px 2px rgba(201,168,76,0.5)',
          animation: 'pulse-gold 1.5s ease-in-out infinite',
        } : {}),
        ...dragStyle,
      }}
      title={guest ? `${guest.name}${guest.dietary ? ` (${guest.dietary})` : ''}${guest.meal ? ` [${guest.meal}]` : ''}` : `Seat ${seatIndex + 1}`}
    >
      {guest ? (
        <>
          <span className="truncate block w-full font-medium">
            {guest.name.split(' ')[0]}
          </span>
          {dietaryColor && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white"
              style={{ backgroundColor: dietaryColor }}
              title={guest.dietary}
            />
          )}
        </>
      ) : (
        <span className="text-gray-400 text-[8px]">{seatIndex + 1}</span>
      )}
    </div>
  );
}
