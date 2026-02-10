import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Search, Users, List, Layers, UserPlus, Upload, UsersRound, Link2, CheckCircle2, ChevronUp, X } from 'lucide-react';
import GuestCard from './GuestCard';
import GuestForm from './GuestForm';
import CSVUploader from './CSVUploader';
import GroupManager from './GroupManager';
import RelationshipManager from './RelationshipManager';
import AccordionSection from './AccordionSection';

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
  onEditGuest,
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
  const [viewMode, setViewMode] = useState('list');
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

  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-navy font-semibold mb-1">
            Guest List
          </h2>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {assigned.length} of {guests.length} guests assigned
        </p>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-teal rounded-full h-2 transition-all duration-300"
            style={{
              width: guests.length > 0
                ? `${(assigned.length / guests.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-20 left-4 z-30 bg-teal text-white shadow-lg rounded-full p-3 no-print"
        title="Guest List"
      >
        <Users size={20} />
        {unassigned.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-coral text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unassigned.length}
          </span>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: bottom sheet */}
      <div className={`
        no-print overflow-x-hidden bg-white flex flex-col
        md:w-80 md:border-r md:border-gray-200 md:h-full md:relative md:z-auto
        fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl shadow-2xl
        transition-transform duration-300 ease-out
        md:translate-y-0 md:rounded-none md:shadow-none
        ${mobileOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {sidebarContent}

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
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

      {/* Scrollable accordion sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Add Guests */}
        <AccordionSection
          title="Add Guests"
          icon={UserPlus}
          defaultOpen={guests.length === 0}
        >
          <div className="space-y-2">
            <GuestForm onAddGuest={onAddGuest} onAddGuests={onAddGuests} guests={guests} />
            <CSVUploader onGuestsLoaded={onAddGuests} />
          </div>
        </AccordionSection>

        {/* Groups */}
        <AccordionSection
          title="Groups"
          icon={UsersRound}
          count={groups.length}
        >
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
            embedded
          />
        </AccordionSection>

        {/* Seating Rules */}
        <AccordionSection
          title="Seating Rules"
          icon={Link2}
          count={relationships.length}
        >
          <RelationshipManager
            relationships={relationships}
            guests={guests}
            onAddRelationship={onAddRelationship}
            onRemoveRelationship={onRemoveRelationship}
            embedded
          />
        </AccordionSection>

        {/* Unassigned Guests */}
        <AccordionSection
          title="Unassigned"
          icon={Users}
          count={filteredUnassigned.length}
          defaultOpen={true}
        >
          <div className="space-y-2">
            {/* View toggle + filters */}
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
                          ? 'border-teal font-medium bg-teal/10'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Guest list */}
            <div
              ref={setNodeRef}
              className={`min-h-[60px] rounded-lg transition-colors ${isOver ? 'bg-teal/10' : ''}`}
            >
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
                              onEdit={onEditGuest}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
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
                            onEdit={onEditGuest}
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
                      onEdit={onEditGuest}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </AccordionSection>

        {/* Search results for assigned guests */}
        {search.trim() && highlightedGuestIds && highlightedGuestIds.size > 0 && (
          <div className="p-4 border-b border-gray-100 bg-amber/5">
            <div className="flex items-center gap-2 mb-2">
              <Search size={14} className="text-amber" />
              <h3 className="text-sm font-semibold text-amber-700">
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
                      className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-amber/30 shadow-sm"
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
                      <span className="text-[11px] text-amber-700 bg-amber/10 px-1.5 py-0.5 rounded-full shrink-0">
                        {table?.label || 'Table'} &middot; Seat {(guest.seatIndex ?? 0) + 1}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Assigned Guests */}
        {assigned.length > 0 && (
          <AccordionSection
            title="Assigned"
            icon={CheckCircle2}
            count={assigned.length}
          >
            {tables
              .filter((t) => assignedByTable[t.id]?.length > 0)
              .map((table) => (
                <div key={table.id} className="mb-3 last:mb-0">
                  <p className="text-xs font-medium text-teal mb-1">
                    {table.label}
                  </p>
                  <div className="space-y-1">
                    {assignedByTable[table.id].map((guest) => (
                      <GuestCard
                        key={guest.id}
                        guest={guest}
                        group={groupMap[guest.groupId]}
                        onEdit={onEditGuest}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
          </AccordionSection>
        )}
      </div>
    </div>
    </>
  );
}
