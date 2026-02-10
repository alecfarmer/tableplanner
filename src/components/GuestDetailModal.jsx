import { useState, useEffect } from 'react';
import { X, Trash2, Utensils, Crown, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const RSVP_OPTIONS = [
  { value: 'pending', label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { value: 'invited', label: 'Invited', bg: 'bg-blue-100', text: 'text-blue-700' },
  { value: 'accepted', label: 'Accepted', bg: 'bg-green-100', text: 'text-green-700' },
  { value: 'declined', label: 'Declined', bg: 'bg-red-100', text: 'text-red-600' },
];

const ROLE_OPTIONS = [
  '', 'Host', 'Co-Host', 'VIP', 'Speaker', 'Organizer',
  'Bride', 'Groom', 'Maid of Honor', 'Best Man',
  'Bridesmaid', 'Groomsman', 'Family', 'Plus One',
];

const MEAL_SUGGESTIONS = ['Chicken', 'Fish', 'Beef', 'Vegetarian', 'Vegan'];

export default function GuestDetailModal({
  guest,
  guests,
  groups,
  tables,
  onUpdate,
  onRemove,
  onClose,
}) {
  const [name, setName] = useState(guest.name);
  const [rsvp, setRsvp] = useState(guest.rsvp || 'pending');
  const [role, setRole] = useState(guest.role || '');
  const [meal, setMeal] = useState(guest.meal || '');
  const [dietary, setDietary] = useState(guest.dietary || '');
  const [party, setParty] = useState(guest.party || '');
  const [plusOneOf, setPlusOneOf] = useState(guest.plusOneOf || '');
  const [notes, setNotes] = useState(guest.notes || '');
  const [tags, setTags] = useState(guest.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Reset form when guest changes
  useEffect(() => {
    setName(guest.name);
    setRsvp(guest.rsvp || 'pending');
    setRole(guest.role || '');
    setMeal(guest.meal || '');
    setDietary(guest.dietary || '');
    setParty(guest.party || '');
    setPlusOneOf(guest.plusOneOf || '');
    setNotes(guest.notes || '');
    setTags(guest.tags || []);
    setTagInput('');
  }, [guest.id]);

  const handleSave = () => {
    onUpdate(guest.id, {
      name: name.trim() || guest.name,
      rsvp,
      role,
      meal,
      dietary,
      party,
      plusOneOf: plusOneOf || null,
      notes,
      tags: [...tags],
    });
    onClose();
  };

  const handleDelete = () => {
    onRemove(guest.id);
    onClose();
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Seating info
  const assignedTable = guest.tableId ? tables.find((t) => t.id === guest.tableId) : null;
  const group = guest.groupId ? groups.find((g) => g.id === guest.groupId) : null;
  const plusOneGuest = guest.plusOneOf ? guests.find((g) => g.id === guest.plusOneOf) : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-serif font-bold text-navy bg-transparent border-none outline-none w-full placeholder-gray-300"
              placeholder="Guest name"
            />
            <div className="flex items-center gap-2 mt-1">
              {group && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: group.color + '30', color: group.color }}
                >
                  {group.name}
                </span>
              )}
              {assignedTable && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} />
                  {assignedTable.label} &middot; Seat {(guest.seatIndex ?? 0) + 1}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 -mr-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* RSVP chips */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">RSVP Status</label>
            <div className="flex gap-2">
              {RSVP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRsvp(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
                    rsvp === opt.value
                      ? `${opt.bg} ${opt.text} ring-1 ring-current`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">None</option>
                {ROLE_OPTIONS.filter(Boolean).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Party / Group</label>
              <input
                type="text"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="e.g. Host's side"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Meal Choice</label>
              <input
                type="text"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                placeholder="e.g. Chicken"
                className="input-field text-sm"
                list="modal-meal-suggestions"
              />
              <datalist id="modal-meal-suggestions">
                {MEAL_SUGGESTIONS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Dietary Needs</label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Vegetarian, nut-free"
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Plus-one */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Plus-One Of</label>
            <select
              value={plusOneOf}
              onChange={(e) => setPlusOneOf(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">None</option>
              {guests
                .filter((g) => g.id !== guest.id)
                .map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-teal/10 text-teal-dark px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-teal-dark/50 hover:text-red-500 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type a tag and press Enter"
              className="input-field text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="input-field text-sm resize-none h-20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete Guest
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-sm py-1.5 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary text-sm py-1.5 px-4"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
