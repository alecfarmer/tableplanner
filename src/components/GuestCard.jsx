import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, X, Utensils, UtensilsCrossed, Edit3, Check, Crown } from 'lucide-react';

const RSVP_STYLES = {
  accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
  declined: { bg: 'bg-red-100', text: 'text-red-600', label: 'Declined' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  invited: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Invited' },
};

const ROLE_OPTIONS = [
  '', 'Bride', 'Groom', 'Maid of Honor', 'Best Man',
  'Bridesmaid', 'Groomsman', 'Flower Girl', 'Ring Bearer',
  'Mother of Bride', 'Father of Bride', 'Mother of Groom', 'Father of Groom',
  'Officiant', 'Usher',
];

export default function GuestCard({ guest, group, onRemove, onUpdate, compact = false }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(guest.name);
  const [editMeal, setEditMeal] = useState(guest.meal || '');
  const [editDietary, setEditDietary] = useState(guest.dietary || '');
  const [editRole, setEditRole] = useState(guest.role || '');
  const [editRsvp, setEditRsvp] = useState(guest.rsvp || 'pending');

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `guest-${guest.id}`,
      data: { type: 'guest', guest },
      disabled: editing,
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

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate(guest.id, {
        name: editName.trim() || guest.name,
        meal: editMeal,
        dietary: editDietary,
        role: editRole,
        rsvp: editRsvp,
      });
    }
    setEditing(false);
  };

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
        {guest.role && (
          <Crown size={10} className="text-gold shrink-0" title={guest.role} />
        )}
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

  if (editing) {
    return (
      <div
        className="guest-card space-y-2 border-sage"
        style={borderStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="input-field text-sm font-medium"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-1.5">
          <select value={editRsvp} onChange={(e) => setEditRsvp(e.target.value)} className="input-field text-xs">
            {Object.entries(RSVP_STYLES).map(([val, info]) => (
              <option key={val} value={val}>{info.label}</option>
            ))}
          </select>
          <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="input-field text-xs">
            <option value="">No role</option>
            {ROLE_OPTIONS.filter(Boolean).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input type="text" value={editMeal} onChange={(e) => setEditMeal(e.target.value)} placeholder="Meal" className="input-field text-xs" />
          <input type="text" value={editDietary} onChange={(e) => setEditDietary(e.target.value)} placeholder="Dietary" className="input-field text-xs" />
        </div>
        {guest.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guest.tags.map((t) => (
              <span key={t} className="text-[9px] bg-sage/20 text-sage-dark px-1 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        <div className="flex gap-1">
          <button onClick={handleSaveEdit} className="btn-primary text-xs py-1 px-2 flex items-center gap-1">
            <Check size={12} /> Save
          </button>
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-2">
            Cancel
          </button>
        </div>
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
          {guest.role && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-normal bg-wine/10 text-wine">
              {guest.role}
            </span>
          )}
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
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {guest.tags?.length > 0 && guest.tags.map((t) => (
            <span key={t} className="text-[8px] bg-sage/15 text-sage-dark px-1 py-0.5 rounded">
              {t}
            </span>
          ))}
          {(guest.party || guest.dietary || guest.meal) && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
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
      </div>
      {onUpdate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditName(guest.name);
            setEditMeal(guest.meal || '');
            setEditDietary(guest.dietary || '');
            setEditRole(guest.role || '');
            setEditRsvp(guest.rsvp || 'pending');
            setEditing(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-sage transition-colors shrink-0 p-0.5 cursor-pointer"
          title="Edit"
        >
          <Edit3 size={12} />
        </button>
      )}
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
