import { useDraggable } from '@dnd-kit/core';
import { GripVertical, X, Edit3 } from 'lucide-react';

export default function GuestCard({ guest, group, onRemove, onEdit, compact = false }) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({
      id: `guest-${guest.id}`,
      data: { type: 'guest', guest },
    });

  const isDeclined = guest.rsvp === 'declined';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`guest-card flex items-center gap-2 ${
        isDragging ? 'guest-card-dragging' : ''
      } ${isDeclined ? 'opacity-50' : ''}`}
      style={group ? { borderLeftColor: group.color, borderLeftWidth: '3px' } : undefined}
    >
      <GripVertical size={14} className="text-gray-400 shrink-0" />
      <span className={`truncate flex-1 ${compact ? '' : 'font-medium'}`}>{guest.name}</span>
      {group && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: group.color }}
          title={group.name}
        />
      )}
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(guest.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-teal transition-colors shrink-0 p-0.5 cursor-pointer"
          title="Edit details"
        >
          <Edit3 size={compact ? 10 : 12} />
        </button>
      )}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(guest.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-0.5 cursor-pointer"
          title="Remove"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
