import { useDraggable } from '@dnd-kit/core';
import { GripVertical, X, Utensils, UtensilsCrossed } from 'lucide-react';

const RSVP_STYLES = {
  accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
  declined: { bg: 'bg-red-100', text: 'text-red-600', label: 'Declined' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  invited: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Invited' },
};

export default function GuestCard({ guest, group, onRemove, compact = false }) {
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

  const borderStyle = group
    ? { borderLeftColor: group.color, borderLeftWidth: '3px' }
    : {};

  const rsvpInfo = RSVP_STYLES[guest.rsvp] || RSVP_STYLES.pending;
  const isDeclined = guest.rsvp === 'declined';

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, ...borderStyle }}
        {...attributes}
        {...listeners}
        className={`guest-card flex items-center gap-2 ${
          isDragging ? 'guest-card-dragging' : ''
        } ${isDeclined ? 'opacity-50' : ''}`}
      >
        <GripVertical size={14} className="text-gray-400 shrink-0" />
        <span className="truncate flex-1">{guest.name}</span>
        {group && (
          <span
            className="text-[9px] px-1 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: group.color + '30', color: '#666' }}
          >
            {group.name}
          </span>
        )}
        {guest.meal && (
          <span className="text-[9px] text-gray-500 shrink-0" title={`Meal: ${guest.meal}`}>
            <UtensilsCrossed size={10} className="inline" />
          </span>
        )}
        {guest.dietary && (
          <Utensils size={12} className="text-gold shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...borderStyle }}
      {...attributes}
      {...listeners}
      className={`guest-card flex items-center gap-2 ${
        isDragging ? 'guest-card-dragging' : ''
      } ${isDeclined ? 'opacity-50' : ''}`}
    >
      <GripVertical size={14} className="text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate flex items-center gap-1.5">
          {guest.name}
          {group && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-normal"
              style={{ backgroundColor: group.color + '30', color: '#666' }}
            >
              {group.name}
            </span>
          )}
          {guest.rsvp && guest.rsvp !== 'pending' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-normal ${rsvpInfo.bg} ${rsvpInfo.text}`}>
              {rsvpInfo.label}
            </span>
          )}
        </div>
        {(guest.party || guest.dietary || guest.meal) && (
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
            {guest.party && <span>{guest.party}</span>}
            {guest.dietary && (
              <span className="flex items-center gap-0.5 text-gold">
                <Utensils size={10} />
                {guest.dietary}
              </span>
            )}
            {guest.meal && (
              <span className="flex items-center gap-0.5 text-gray-500">
                <UtensilsCrossed size={10} />
                {guest.meal}
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
