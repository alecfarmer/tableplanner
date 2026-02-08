import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Search, Users, ChevronDown, ChevronRight, List, Layers, Filter } from 'lucide-react';
import GuestCard from './GuestCard';
import GuestForm from './GuestForm';
import CSVUploader from './CSVUploader';
import GroupManager from './GroupManager';
import RelationshipManager from './RelationshipManager';

const RSVP_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'pending', label: 'Pending' },
  { value: 'invited', label: 'Invited' },
  { value: 'declined', label: 'Declined' },
];

export default function GuestSidebar({
  guests,
  unassigned,
  assigned,
  tables,
  groups,
  relationships = [],
  searchQuery,
  onSearchChange,
  highlightedGuestIds,
  onAddGuest,
  onAddGuests,
  onRemoveGuest,
  onUpdateGuest,
  onAddGroup,
  onRemoveGroup,
  onUpdateGroup,
  onAutoGroup,
  onSetGuestGroup,
  onClearGuestGroups,
  onClearAllGroups,
  onAddRelationship,
  onRemoveRelationship,
  groupColors,
}) {
  const search = searchQuery ?? '';
  const setSearch = onSearchChange ?? (() => {});
  const [assignedCollapsed, setAssignedCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'groups'
  const [filterGroupId, setFilterGroupId] = useState(null);
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [filterTag, setFilterTag] = useState(null);

  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar-unassigned',
    data: { type: 'sidebar' },
  });

  const groupMap = {};
  for (const g of groups) {
    groupMap[g.id] = g;
  }

  // Collect all tags
  const allTags = [...new Set(guests.flatMap((g) => g.tags || []))];

  const matchesSearch = (g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.party || '').toLowerCase().includes(search.toLowerCase());

  const matchesGroupFilter = (g) =>
    !filterGroupId || g.groupId === filterGroupId;

  const matchesRsvpFilter = (g) =>
    filterRsvp === 'all' || (g.rsvp || 'pending') === filterRsvp;

  const matchesTagFilter = (g) =>
    !filterTag || (g.tags || []).includes(filterTag);

  const filteredUnassigned = unassigned.filter(
    (g) => matchesSearch(g) && matchesGroupFilter(g) && matchesRsvpFilter(g) && matchesTagFilter(g)
  );

  const assignedByTable = {};
  for (const guest of assigned) {
    if (!assignedByTable[guest.tableId]) {
      assignedByTable[guest.tableId] = [];
    }
    assignedByTable[guest.tableId].push(guest);
  }

  // Group unassigned guests by groupId for group view
  const unassignedByGroup = {};
  const unassignedUngrouped = [];
  for (const guest of filteredUnassigned) {
    if (guest.groupId) {
      if (!unassignedByGroup[guest.groupId]) {
        unassignedByGroup[guest.groupId] = [];
      }
      unassignedByGroup[guest.groupId].push(guest);
    } else {
      unassignedUngrouped.push(guest);
    }
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

      {/* Search + View Toggle */}
      <div className="px-4 pt-3 space-y-2">
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

        <div className="flex items-center gap-1">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => { setViewMode('list'); setFilterGroupId(null); }}
              className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={12} />
              All
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'groups' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers size={12} />
              By Group
            </button>
          </div>

          {/* Group filter chips */}
          {viewMode === 'list' && groups.length > 0 && (
            <div className="flex gap-1 overflow-x-auto flex-1 ml-1">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() =>
                    setFilterGroupId(filterGroupId === group.id ? null : group.id)
                  }
                  className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap cursor-pointer border transition-colors ${
                    filterGroupId === group.id
                      ? 'border-gray-400 font-medium'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: group.color + '40', color: '#555' }}
                  title={group.name}
                >
                  {group.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RSVP + Tag filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {RSVP_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterRsvp(filterRsvp === f.value ? 'all' : f.value)}
              className={`text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer border transition-colors ${
                filterRsvp === f.value && f.value !== 'all'
                  ? 'border-gray-400 font-medium bg-gray-100'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
          {allTags.length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              {allTags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer border transition-colors ${
                    filterTag === tag
                      ? 'border-sage font-medium bg-sage/10'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Guest Form & CSV */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        <GuestForm onAddGuest={onAddGuest} onAddGuests={onAddGuests} guests={guests} />
        <CSVUploader onGuestsLoaded={onAddGuests} />
      </div>

      {/* Group Manager */}
      <GroupManager
        groups={groups}
        guests={guests}
        onAddGroup={onAddGroup}
        onRemoveGroup={onRemoveGroup}
        onUpdateGroup={onUpdateGroup}
        onAutoGroup={onAutoGroup}
        onSetGuestGroup={onSetGuestGroup}
        onClearGuestGroups={onClearGuestGroups}
        onClearAllGroups={onClearAllGroups}
        groupColors={groupColors}
      />

      {/* Seating Rules */}
      <RelationshipManager
        relationships={relationships}
        guests={guests}
        onAddRelationship={onAddRelationship}
        onRemoveRelationship={onRemoveRelationship}
      />

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

          {viewMode === 'groups' ? (
            <div className="space-y-3">
              {/* Grouped guests */}
              {groups
                .filter((group) => unassignedByGroup[group.id]?.length > 0)
                .map((group) => (
                  <div key={group.id}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-xs font-medium text-gray-600">
                        {group.name} ({unassignedByGroup[group.id].length})
                      </span>
                    </div>
                    <div className="space-y-1 ml-4">
                      {unassignedByGroup[group.id].map((guest) => (
                        <GuestCard
                          key={guest.id}
                          guest={guest}
                          group={groupMap[guest.groupId]}
                          onRemove={onRemoveGuest}
                          onUpdate={onUpdateGuest}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              {/* Ungrouped guests */}
              {unassignedUngrouped.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-400 mb-1 block">
                    Ungrouped ({unassignedUngrouped.length})
                  </span>
                  <div className="space-y-1">
                    {unassignedUngrouped.map((guest) => (
                      <GuestCard
                        key={guest.id}
                        guest={guest}
                        onRemove={onRemoveGuest}
                        onUpdate={onUpdateGuest}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredUnassigned.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  group={groupMap[guest.groupId]}
                  onRemove={onRemoveGuest}
                  onUpdate={onUpdateGuest}
                />
              ))}
            </div>
          )}
        </div>

        {/* Search results for assigned guests */}
        {search.trim() && highlightedGuestIds && highlightedGuestIds.size > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gold/5">
            <div className="flex items-center gap-2 mb-2">
              <Search size={14} className="text-gold" />
              <h3 className="text-sm font-semibold text-gold-dark">
                Found at tables ({highlightedGuestIds.size})
              </h3>
            </div>
            <div className="space-y-1.5">
              {assigned
                .filter((g) => highlightedGuestIds.has(g.id))
                .map((guest) => {
                  const table = tables.find((t) => t.id === guest.tableId);
                  return (
                    <div
                      key={guest.id}
                      className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-gold/30 shadow-sm"
                    >
                      {groupMap[guest.groupId] && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: groupMap[guest.groupId].color }}
                        />
                      )}
                      <span className="text-sm text-gray-800 font-medium truncate flex-1">
                        {guest.name}
                      </span>
                      <span className="text-[11px] text-gold-dark bg-gold/10 px-1.5 py-0.5 rounded-full shrink-0">
                        {table?.label || 'Table'} &middot; Seat {(guest.seatIndex ?? 0) + 1}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

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
                          group={groupMap[guest.groupId]}
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
