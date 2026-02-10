import { useState, useMemo } from 'react';
import { X, Search, MapPin } from 'lucide-react';

export default function FindMySeat({ tables, guests, groups = [], onClose }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return guests
      .filter((g) => g.name.toLowerCase().includes(q))
      .map((g) => {
        const table = tables.find((t) => t.id === g.tableId);
        const group = groups.find((gr) => gr.id === g.groupId);
        return { ...g, table, group };
      });
  }, [query, guests, tables, groups]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal-dark p-6 text-center relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
          <h2 className="font-serif text-2xl text-white mb-1">Find My Seat</h2>
          <p className="text-white/70 text-sm">Enter your name to find your table</p>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your name..."
              className="input-field pl-10 text-lg py-3"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-6 pb-6 max-h-[300px] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <p className="text-center text-gray-500 py-4">No guests found matching "{query}"</p>
          )}

          {results.map((guest) => (
            <div key={guest.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-teal/10 rounded-full p-2">
                  <MapPin size={20} className="text-teal" />
                </div>
                <div className="flex-1">
                  <p className="font-serif font-semibold text-lg text-gray-800">{guest.name}</p>
                  {guest.table ? (
                    <div className="mt-1">
                      <p className="text-teal font-medium">
                        {guest.table.label}
                        <span className="text-gray-500 font-normal"> &middot; Seat {(guest.seatIndex ?? 0) + 1}</span>
                      </p>
                      {guest.meal && (
                        <p className="text-xs text-gray-500 mt-0.5">Meal: {guest.meal}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">Not yet assigned to a table</p>
                  )}
                  {guest.group && (
                    <span
                      className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1"
                      style={{ backgroundColor: guest.group.color + '30' }}
                    >
                      {guest.group.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
