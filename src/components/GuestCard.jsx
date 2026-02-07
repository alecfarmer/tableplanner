import { useDraggable } from '@dnd-kit/core';
import { GripVertical, X, Utensils } from 'lucide-react';

export default function GuestCard({ guest, onRemove, compact = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `guest-${guest.id}`,
      data: { type: 'guest', guest },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 1000,
      }
    : undefined;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`guest-card flex items-center gap-2 ${
          isDragging ? 'guest-card-dragging' : ''
        }`}
      >
        <GripVertical size={14} className="text-gray-400 shrink-0" />
        <span className="truncate flex-1">{guest.name}</span>
        {guest.dietary && (
          <Utensils size={12} className="text-gold shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`guest-card flex items-center gap-2 ${
        isDragging ? 'guest-card-dragging' : ''
      }`}
    >
      <GripVertical size={14} className="text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{guest.name}</div>
        {(guest.party || guest.dietary) && (
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
            {guest.party && <span>{guest.party}</span>}
            {guest.dietary && (
              <span className="flex items-center gap-0.5 text-gold">
                <Utensils size={10} />
                {guest.dietary}
              </span>
            )}
          </div>
        )}
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(guest.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-0.5 cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
