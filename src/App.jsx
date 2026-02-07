import { useCallback } from 'react';
import { DndContext, DragOverlay, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

import GuestSidebar from './components/GuestSidebar';
import TableCanvas from './components/TableCanvas';
import TableConfig from './components/TableConfig';
import ExportImport from './components/ExportImport';
import PrintView from './components/PrintView';
import { useGuests } from './hooks/useGuests';
import { useTables } from './hooks/useTables';
import { useSeatingPersistence } from './hooks/useSeatingPersistence';

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

  useSeatingPersistence(guests, tables, setGuests, setTables);

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
    },
    [setGuests, setTables]
  );

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
              onImport={handleImport}
            />
          </header>

          {/* Table Config Bar */}
          <TableConfig
            tables={tables}
            onAddTable={addTable}
            onClearAssignments={clearAllAssignments}
            guestCount={guests.length}
            assignedCount={assigned.length}
          />

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            <GuestSidebar
              guests={guests}
              unassigned={unassigned}
              assigned={assigned}
              tables={tables}
              onAddGuest={handleAddGuest}
              onAddGuests={handleAddGuests}
              onRemoveGuest={handleRemoveGuest}
            />
            <TableCanvas
              tables={tables}
              guests={guests}
              onMoveTable={moveTable}
              onUpdateTable={updateTable}
              onRemoveTable={handleRemoveTable}
            />
          </div>
        </div>

        <DragOverlay dropAnimation={null} />
      </DndContext>

      <PrintView tables={tables} guests={guests} />
    </>
  );
}
