import { useState } from 'react';
import { UserPlus, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { parseBulkText } from '../utils/csvParser';

export default function GuestForm({ onAddGuest, onAddGuests }) {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGuest({ name: name.trim(), party, dietary, notes });
    setName('');
    setParty('');
    setDietary('');
    setNotes('');
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const guests = parseBulkText(bulkText);
    if (guests.length > 0) {
      onAddGuests(guests);
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
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Dietary needs"
                className="input-field"
              />
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
