import { useState } from 'react';
import { UserPlus, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { parseBulkText } from '../utils/csvParser';

const RSVP_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'invited', label: 'Invited' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];

const MEAL_SUGGESTIONS = ['Chicken', 'Fish', 'Beef', 'Vegetarian', 'Vegan'];

const ROLE_OPTIONS = [
  '', 'Host', 'Co-Host', 'VIP', 'Speaker', 'Organizer',
  'Bride', 'Groom', 'Maid of Honor', 'Best Man',
  'Bridesmaid', 'Groomsman', 'Family', 'Plus One',
];

export default function GuestForm({ onAddGuest, onAddGuests, guests = [] }) {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [rsvp, setRsvp] = useState('pending');
  const [meal, setMeal] = useState('');
  const [role, setRole] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [plusOneOf, setPlusOneOf] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGuest({ name: name.trim(), party, dietary, notes, rsvp, meal, role, tags: [...tags], plusOneOf: plusOneOf || null });
    setName('');
    setParty('');
    setDietary('');
    setNotes('');
    setRsvp('pending');
    setMeal('');
    setRole('');
    setTags([]);
    setTagInput('');
    setPlusOneOf('');
  };

  const handleAddTag = (val) => {
    const t = (val || tagInput).trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const newGuests = parseBulkText(bulkText);
    if (newGuests.length > 0) {
      onAddGuests(newGuests);
      setBulkText('');
      setShowBulk(false);
    }
  };

  return (
    <div className="space-y-3">
      {!showBulk ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest name..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary flex items-center gap-1 whitespace-nowrap">
              <UserPlus size={16} />
              Add
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
          >
            {showOptional ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Optional details
          </button>

          {showOptional && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="Party/Group"
                className="input-field"
              />
              <select
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value)}
                className="input-field"
              >
                {RSVP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Dietary needs"
                className="input-field"
              />
              <div>
                <input
                  type="text"
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  placeholder="Meal choice"
                  className="input-field"
                  list="meal-suggestions"
                />
                <datalist id="meal-suggestions">
                  {MEAL_SUGGESTIONS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="">Role (optional)</option>
                {ROLE_OPTIONS.filter(Boolean).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={plusOneOf}
                onChange={(e) => setPlusOneOf(e.target.value)}
                className="input-field"
              >
                <option value="">Plus-one of...</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <div className="col-span-2">
                <div className="flex gap-1 flex-wrap mb-1">
                  {tags.map((t) => (
                    <span key={t} className="text-[10px] bg-sage/20 text-sage-dark px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500 cursor-pointer">&times;</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Tags (press Enter to add)"
                  className="input-field"
                />
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                className="input-field col-span-2"
              />
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste guest names, one per line..."
            className="input-field h-32 resize-none"
            rows={5}
          />
          <div className="flex gap-2">
            <button onClick={handleBulkAdd} className="btn-primary flex items-center gap-1">
              <Users size={16} />
              Add All
            </button>
            <button onClick={() => setShowBulk(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowBulk(!showBulk)}
        className="text-xs text-sage-dark hover:text-sage font-medium cursor-pointer"
      >
        {showBulk ? 'Single entry' : 'Bulk add names'}
      </button>
    </div>
  );
}
