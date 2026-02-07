import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Search, Users, ChevronDown, ChevronRight } from 'lucide-react';
import GuestCard from './GuestCard';
import GuestForm from './GuestForm';
import CSVUploader from './CSVUploader';

export default function GuestSidebar({
  guests,
  unassigned,
  assigned,
  tables,
  onAddGuest,
  onAddGuests,
  onRemoveGuest,
}) {
  const [search, setSearch] = useState('');
  const [assignedCollapsed, setAssignedCollapsed] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar-unassigned',
    data: { type: 'sidebar' },
  });

  const filteredUnassigned = unassigned.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.party.toLowerCase().includes(search.toLowerCase())
  );

  const assignedByTable = {};
  for (const guest of assigned) {
    if (!assignedByTable[guest.tableId]) {
      assignedByTable[guest.tableId] = [];
    }
    assignedByTable[guest.tableId].push(guest);
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full no-print">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-serif text-lg text-wine font-semibold mb-1">
          Guest List
        </h2>
        <p className="text-sm text-gray-500">
          {assigned.length} of {guests.length} guests assigned
        </p>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-sage rounded-full h-2 transition-all duration-300"
            style={{
              width: guests.length > 0
                ? `${(assigned.length / guests.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Guest Form & CSV */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        <GuestForm onAddGuest={onAddGuest} onAddGuests={onAddGuests} />
        <CSVUploader onGuestsLoaded={onAddGuests} />
      </div>

      {/* Guest Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Unassigned */}
        <div
          ref={setNodeRef}
          className={`p-4 min-h-[100px] ${isOver ? 'bg-sage/10' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-600">
              Unassigned ({filteredUnassigned.length})
            </h3>
          </div>

          {filteredUnassigned.length === 0 && guests.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No guests yet</p>
              <p className="text-xs mt-1">Add guests above or import a CSV</p>
            </div>
          )}

          {filteredUnassigned.length === 0 && guests.length > 0 && unassigned.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              All guests are assigned!
            </p>
          )}

          <div className="space-y-1.5">
            {filteredUnassigned.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onRemove={onRemoveGuest}
              />
            ))}
          </div>
        </div>

        {/* Assigned */}
        {assigned.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setAssignedCollapsed(!assignedCollapsed)}
              className="flex items-center gap-2 mb-2 w-full text-left cursor-pointer"
            >
              {assignedCollapsed ? (
                <ChevronRight size={14} className="text-gray-500" />
              ) : (
                <ChevronDown size={14} className="text-gray-500" />
              )}
              <h3 className="text-sm font-semibold text-gray-600">
                Assigned ({assigned.length})
              </h3>
            </button>

            {!assignedCollapsed &&
              tables
                .filter((t) => assignedByTable[t.id]?.length > 0)
                .map((table) => (
                  <div key={table.id} className="mb-3">
                    <p className="text-xs font-medium text-wine mb-1">
                      {table.label}
                    </p>
                    <div className="space-y-1">
                      {assignedByTable[table.id].map((guest) => (
                        <GuestCard
                          key={guest.id}
                          guest={guest}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
