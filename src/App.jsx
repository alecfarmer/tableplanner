import { useState, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

import GuestSidebar from './components/GuestSidebar';
import TableCanvas from './components/TableCanvas';
import TableConfig from './components/TableConfig';
import TableDetailModal from './components/TableDetailModal';
import ExportImport from './components/ExportImport';
import PrintView from './components/PrintView';
import { useGuests } from './hooks/useGuests';
import { useTables } from './hooks/useTables';
import { useGroups } from './hooks/useGroups';
import { useSeatingPersistence } from './hooks/useSeatingPersistence';
import { computeAutoSeat } from './utils/autoSeat';
import { computeAutoLayout } from './utils/autoLayout';

export default function App() {
  const {
    guests,
    setGuests,
    addGuest,
    addGuests,
    removeGuest,
    assignGuest,
    unassignGuest,
    swapGuests,
    clearAllAssignments,
    setGuestGroup,
    clearGuestGroups,
    unassigned,
    assigned,
  } = useGuests();

  const {
    tables,
    setTables,
    addTable,
    removeTable,
    updateTable,
    moveTable,
  } = useTables();

  const {
    groups,
    setGroups,
    addGroup,
    removeGroup,
    updateGroup,
    clearAllGroups,
    autoGroupByLastName,
    GROUP_COLORS,
  } = useGroups();

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useSeatingPersistence(guests, tables, groups, setGuests, setTables, setGroups);

  // Compute highlighted guest IDs — assigned guests that match the active search
  const highlightedGuestIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set();
    const q = searchQuery.toLowerCase();
    const ids = new Set();
    for (const g of guests) {
      if (g.tableId && (g.name.toLowerCase().includes(q) || g.party?.toLowerCase().includes(q))) {
        ids.add(g.id);
      }
    }
    return ids;
  }, [searchQuery, guests]);

  const handleTableClick = useCallback((tableId) => {
    setSelectedTableId(tableId);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleRemoveTable = useCallback(
    (tableId) => {
      const tableGuests = guests.filter((g) => g.tableId === tableId);
      for (const g of tableGuests) {
        unassignGuest(g.id);
      }
      removeTable(tableId);
      toast.success('Table removed');
    },
    [guests, unassignGuest, removeTable]
  );

  const handleAddGuest = useCallback(
    (guest) => {
      addGuest(guest);
      toast.success(`Added ${guest.name}`);
    },
    [addGuest]
  );

  const handleAddGuests = useCallback(
    (newGuests) => {
      addGuests(newGuests);
      toast.success(`Added ${newGuests.length} guests`);
    },
    [addGuests]
  );

  const handleRemoveGuest = useCallback(
    (guestId) => {
      const guest = guests.find((g) => g.id === guestId);
      removeGuest(guestId);
      if (guest) toast.success(`Removed ${guest.name}`);
    },
    [guests, removeGuest]
  );

  const handleImport = useCallback(
    (data) => {
      setGuests(data.guests);
      setTables(data.tables);
      if (data.groups) {
        setGroups(data.groups);
      }
    },
    [setGuests, setTables, setGroups]
  );

  const handleAutoGroup = useCallback(
    (guestList) => {
      const result = autoGroupByLastName(guestList);
      if (Object.keys(result.guestGroupAssignments).length > 0) {
        for (const [guestId, groupId] of Object.entries(result.guestGroupAssignments)) {
          setGuestGroup(guestId, groupId);
        }
      }
      return result;
    },
    [autoGroupByLastName, setGuestGroup]
  );

  const handleAutoSeat = useCallback(() => {
    const assignments = computeAutoSeat(guests, tables, groups);
    if (assignments.length === 0) {
      toast('No guests to seat or no available seats');
      return;
    }
    for (const { guestId, tableId, seatIndex } of assignments) {
      assignGuest(guestId, tableId, seatIndex);
    }
    toast.success(`Auto-seated ${assignments.length} guests (groups kept together)`);
  }, [guests, tables, groups, assignGuest]);

  const handleAutoLayout = useCallback((preset) => {
    const positions = computeAutoLayout(preset, tables);
    for (const [tableId, pos] of Object.entries(positions)) {
      moveTable(tableId, pos.x, pos.y);
    }
    toast.success(`Applied ${preset} layout`);
  }, [tables, moveTable]);

  const handleClearAllGroups = useCallback(() => {
    // Remove groupId from all guests first
    for (const guest of guests) {
      if (guest.groupId) {
        setGuestGroup(guest.id, null);
      }
    }
    clearAllGroups();
  }, [guests, setGuestGroup, clearAllGroups]);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || !active) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type !== 'guest') return;

      const draggedGuest = activeData.guest;

      // Dropping on sidebar — unassign
      if (overData?.type === 'sidebar') {
        if (draggedGuest.tableId) {
          unassignGuest(draggedGuest.id);
          toast.success(`${draggedGuest.name} unassigned`);
        }
        return;
      }

      // Dropping on a seat
      if (overData?.type === 'seat') {
        const { tableId, seatIndex, currentGuest } = overData;

        if (currentGuest && currentGuest.id !== draggedGuest.id) {
          swapGuests(draggedGuest.id, currentGuest.id);
          toast.success(`Swapped ${draggedGuest.name} and ${currentGuest.name}`);
        } else if (!currentGuest) {
          assignGuest(draggedGuest.id, tableId, seatIndex);
          toast.success(`${draggedGuest.name} seated at ${tables.find((t) => t.id === tableId)?.label || 'table'}`);
        }
      }
    },
    [assignGuest, unassignGuest, swapGuests, tables]
  );

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
          },
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-wine" fill="#722f37" />
              <h1 className="font-serif text-xl font-bold text-wine">
                Seating Planner
              </h1>
            </div>
            <ExportImport
              guests={guests}
              tables={tables}
              groups={groups}
              onImport={handleImport}
            />
          </header>

          {/* Table Config Bar */}
          <TableConfig
            tables={tables}
            onAddTable={addTable}
            onUpdateTable={updateTable}
            onClearAssignments={clearAllAssignments}
            onAutoSeat={handleAutoSeat}
            onAutoLayout={handleAutoLayout}
            guestCount={guests.length}
            assignedCount={assigned.length}
            unassignedCount={unassigned.length}
          />

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            <GuestSidebar
              guests={guests}
              unassigned={unassigned}
              assigned={assigned}
              tables={tables}
              groups={groups}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              highlightedGuestIds={highlightedGuestIds}
              onAddGuest={handleAddGuest}
              onAddGuests={handleAddGuests}
              onRemoveGuest={handleRemoveGuest}
              onAddGroup={addGroup}
              onRemoveGroup={removeGroup}
              onUpdateGroup={updateGroup}
              onAutoGroup={handleAutoGroup}
              onSetGuestGroup={setGuestGroup}
              onClearGuestGroups={clearGuestGroups}
              onClearAllGroups={handleClearAllGroups}
              groupColors={GROUP_COLORS}
            />
            <TableCanvas
              tables={tables}
              guests={guests}
              highlightedGuestIds={highlightedGuestIds}
              onMoveTable={moveTable}
              onUpdateTable={updateTable}
              onRemoveTable={handleRemoveTable}
              onTableClick={handleTableClick}
            />
          </div>
        </div>

        <DragOverlay dropAnimation={null} />
      </DndContext>

      {selectedTableId && (
        <TableDetailModal
          table={tables.find((t) => t.id === selectedTableId)}
          guests={guests}
          allGuests={guests}
          groups={groups}
          onClose={() => setSelectedTableId(null)}
          onAssignGuest={assignGuest}
          onUnassignGuest={unassignGuest}
          onSwapGuests={swapGuests}
        />
      )}

      <PrintView tables={tables} guests={guests} groups={groups} />
    </>
  );
}
