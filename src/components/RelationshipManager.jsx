import { useState } from 'react';
import { Link, Unlink, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function RelationshipManager({
  relationships,
  guests,
  onAddRelationship,
  onRemoveRelationship,
  embedded = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [guest1Id, setGuest1Id] = useState('');
  const [guest2Id, setGuest2Id] = useState('');
  const [relType, setRelType] = useState('together');

  const handleAdd = () => {
    if (!guest1Id || !guest2Id || guest1Id === guest2Id) return;
    onAddRelationship(guest1Id, guest2Id, relType);
    setGuest1Id('');
    setGuest2Id('');
  };

  const guestName = (id) => guests.find((g) => g.id === id)?.name || 'Unknown';

  const content = (
    <div className="space-y-2">
      {/* Add rule */}
      <div className="space-y-1.5">
        <select
          value={guest1Id}
          onChange={(e) => setGuest1Id(e.target.value)}
          className="input-field text-xs"
        >
          <option value="">Select guest...</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value)}
            className="input-field text-xs flex-1"
          >
            <option value="together">should sit with</option>
            <option value="apart">keep away from</option>
          </select>
        </div>
        <select
          value={guest2Id}
          onChange={(e) => setGuest2Id(e.target.value)}
          className="input-field text-xs"
        >
          <option value="">Select guest...</option>
          {guests
            .filter((g) => g.id !== guest1Id)
            .map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!guest1Id || !guest2Id || guest1Id === guest2Id}
          className="btn-primary text-xs py-1 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Rule
        </button>
      </div>

      {/* Existing rules */}
      {relationships.length > 0 && (
        <div className="space-y-1 mt-2">
          {relationships.map((rel) => (
            <div
              key={rel.id}
              className={`flex items-center gap-1.5 text-xs rounded-lg px-2 py-1.5 ${
                rel.type === 'apart' ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              {rel.type === 'apart' ? (
                <Unlink size={10} className="text-red-500 shrink-0" />
              ) : (
                <Link size={10} className="text-green-600 shrink-0" />
              )}
              <span className="flex-1 truncate">
                <b>{guestName(rel.guestId1)}</b>
                {rel.type === 'apart' ? ' apart from ' : ' with '}
                <b>{guestName(rel.guestId2)}</b>
              </span>
              <button
                onClick={() => onRemoveRelationship(rel.id)}
                className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="px-4 py-2 border-b border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left cursor-pointer"
      >
        {expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        <Link size={14} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-600">
          Seating Rules ({relationships.length})
        </span>
      </button>
      {expanded && <div className="mt-2">{content}</div>}
    </div>
  );
}
