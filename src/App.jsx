import { useState, useCallback, useMemo, useEffect } from 'react';
import { DndContext, DragOverlay, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Heart, Undo2, Redo2, Share2, Check, Moon, Sun, Clock, Search as SearchIcon, PieChart } from 'lucide-react';

import GuestSidebar from './components/GuestSidebar';
import TableCanvas from './components/TableCanvas';
import TableConfig from './components/TableConfig';
import TableDetailModal from './components/TableDetailModal';
import ExportImport from './components/ExportImport';
import PrintView from './components/PrintView';
import FindMySeat from './components/FindMySeat';
import StatsPanel from './components/StatsPanel';
import VersionManager from './components/VersionManager';
import { useGuests } from './hooks/useGuests';
import { useTables } from './hooks/useTables';
import { useGroups } from './hooks/useGroups';
import { useRelationships } from './hooks/useRelationships';
import { useVenueElements } from './hooks/useVenueElements';
import { useHistory } from './hooks/useHistory';
import { useVersions } from './hooks/useVersions';
import { useSeatingPersistence } from './hooks/useSeatingPersistence';
import { computeAutoSeat } from './utils/autoSeat';
import { computeAutoLayout } from './utils/autoLayout';
import { computeAutoBalance } from './utils/autoBalance';
import { applyTemplate } from './utils/templates';
import { generateShareUrl, loadFromShareUrl, clearShareHash } from './utils/shareLink';

export default function App() {
  const {
    guests,
    setGuests,
    addGuest,
    addGuests,
    removeGuest,
    updateGuest,
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
    duplicateTable,
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

  const {
    relationships,
    setRelationships,
    addRelationship,
    removeRelationship,
    getAllConflicts,
  } = useRelationships();

  const {
    elements: venueElements,
    setElements: setVenueElements,
    addElement: addVenueElement,
    removeElement: removeVenueElement,
    moveElement: moveVenueElement,
  } = useVenueElements();

  const { snapshot, undo, redo, canUndo, canRedo } = useHistory();
  const { versions, saveVersion, deleteVersion } = useVersions();

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareUrl, setShareUrl] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wedding-dark-mode') === 'true';
    }
    return false;
  });
  const [gridSnap, setGridSnap] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showFindMySeat, setShowFindMySeat] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('wedding-dark-mode', darkMode);
  }, [darkMode]);

  useSeatingPersistence(guests, tables, groups, setGuests, setTables, setGroups, relationships, setRelationships, venueElements, setVenueElements);

  // Load from share URL on mount
  useEffect(() => {
    const shared = loadFromShareUrl();
    if (shared) {
      if (shared.guests) setGuests(shared.guests);
      if (shared.tables) setTables(shared.tables);
      if (shared.groups) setGroups(shared.groups);
      if (shared.relationships) setRelationships(shared.relationships);
      if (shared.venueElements) setVenueElements(shared.venueElements);
      clearShareHash();
      toast.success('Loaded shared seating plan');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Snapshot helper — saves state before a user action
  const saveSnapshot = useCallback(() => {
    snapshot({ guests, tables, groups, relationships, venueElements });
  }, [snapshot, guests, tables, groups, relationships, venueElements]);

  const restoreState = useCallback((state) => {
    setGuests(state.guests);
    setTables(state.tables);
    setGroups(state.groups);
    if (state.relationships) setRelationships(state.relationships);
    if (state.venueElements) setVenueElements(state.venueElements);
  }, [setGuests, setTables, setGroups, setRelationships, setVenueElements]);

  const handleUndo = useCallback(() => {
    undo({ guests, tables, groups, relationships, venueElements }, restoreState);
  }, [undo, guests, tables, groups, relationships, venueElements, restoreState]);

  const handleRedo = useCallback(() => {
    redo({ guests, tables, groups, relationships, venueElements }, restoreState);
  }, [redo, guests, tables, groups, relationships, venueElements, restoreState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
      if (e.key === 'Escape') {
        setSelectedTableId(null);
        setShowFindMySeat(false);
        setShowStats(false);
        setShowVersions(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        // Don't prevent default - let browser handle it or open Find My Seat
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  // Compute highlighted guest IDs
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

  // Compute table conflicts
  const tableConflicts = useMemo(
    () => getAllConflicts(guests, tables),
    [getAllConflicts, guests, tables]
  );

  // RSVP stats
  const rsvpStats = useMemo(() => {
    const stats = { accepted: 0, declined: 0, pending: 0, invited: 0 };
    for (const g of guests) {
      const status = g.rsvp || 'pending';
      stats[status] = (stats[status] || 0) + 1;
    }
    return stats;
  }, [guests]);

  const handleTableClick = useCallback((tableId) => {
    setSelectedTableId(tableId);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleRemoveTable = useCallback(
    (tableId) => {
      saveSnapshot();
      const tableGuests = guests.filter((g) => g.tableId === tableId);
      for (const g of tableGuests) {
        unassignGuest(g.id);
      }
      removeTable(tableId);
      toast.success('Table removed');
    },
    [guests, unassignGuest, removeTable, saveSnapshot]
  );

  const handleDuplicateTable = useCallback(
    (tableId) => {
      saveSnapshot();
      duplicateTable(tableId);
      toast.success('Table duplicated');
    },
    [duplicateTable, saveSnapshot]
  );

  const handleAddGuest = useCallback(
    (guest) => {
      saveSnapshot();
      addGuest(guest);
      toast.success(`Added ${guest.name}`);
    },
    [addGuest, saveSnapshot]
  );

  const handleAddGuests = useCallback(
    (newGuests) => {
      saveSnapshot();
      addGuests(newGuests);
      toast.success(`Added ${newGuests.length} guests`);
    },
    [addGuests, saveSnapshot]
  );

  const handleRemoveGuest = useCallback(
    (guestId) => {
      saveSnapshot();
      const guest = guests.find((g) => g.id === guestId);
      removeGuest(guestId);
      if (guest) toast.success(`Removed ${guest.name}`);
    },
    [guests, removeGuest, saveSnapshot]
  );

  const handleUpdateGuest = useCallback(
    (id, updates) => {
      saveSnapshot();
      updateGuest(id, updates);
    },
    [updateGuest, saveSnapshot]
  );

  const handleImport = useCallback(
    (data) => {
      saveSnapshot();
      setGuests(data.guests);
      setTables(data.tables);
      if (data.groups) setGroups(data.groups);
      if (data.relationships) setRelationships(data.relationships);
      if (data.venueElements) setVenueElements(data.venueElements);
    },
    [setGuests, setTables, setGroups, setRelationships, setVenueElements, saveSnapshot]
  );

  const handleAutoGroup = useCallback(
    (guestList) => {
      saveSnapshot();
      const result = autoGroupByLastName(guestList);
      if (Object.keys(result.guestGroupAssignments).length > 0) {
        for (const [guestId, groupId] of Object.entries(result.guestGroupAssignments)) {
          setGuestGroup(guestId, groupId);
        }
      }
      return result;
    },
    [autoGroupByLastName, setGuestGroup, saveSnapshot]
  );

  const handleAutoSeat = useCallback(() => {
    saveSnapshot();
    const assignments = computeAutoSeat(guests, tables, groups);
    if (assignments.length === 0) {
      toast('No guests to seat or no available seats');
      return;
    }
    for (const { guestId, tableId, seatIndex } of assignments) {
      assignGuest(guestId, tableId, seatIndex);
    }
    toast.success(`Auto-seated ${assignments.length} guests (groups kept together)`);
  }, [guests, tables, groups, assignGuest, saveSnapshot]);

  const handleAutoLayout = useCallback((preset) => {
    saveSnapshot();
    const positions = computeAutoLayout(preset, tables);
    for (const [tableId, pos] of Object.entries(positions)) {
      moveTable(tableId, pos.x, pos.y);
    }
    toast.success(`Applied ${preset} layout`);
  }, [tables, moveTable, saveSnapshot]);

  const handleAutoBalance = useCallback(() => {
    saveSnapshot();
    const moves = computeAutoBalance(guests, tables);
    if (moves.length === 0) {
      toast('Nothing to balance');
      return;
    }
    for (const move of moves) {
      if (move.tableId === null) {
        unassignGuest(move.guestId);
      } else {
        assignGuest(move.guestId, move.tableId, move.seatIndex);
      }
    }
    toast.success(`Balanced ${moves.length} seat assignments`);
  }, [guests, tables, assignGuest, unassignGuest, saveSnapshot]);

  const handleApplyTemplate = useCallback((templateId) => {
    saveSnapshot();
    const newTables = applyTemplate(templateId);
    if (newTables) {
      setTables(newTables);
      toast.success('Template applied');
    }
  }, [setTables, saveSnapshot]);

  const handleClearAllGroups = useCallback(() => {
    saveSnapshot();
    for (const guest of guests) {
      if (guest.groupId) {
        setGuestGroup(guest.id, null);
      }
    }
    clearAllGroups();
  }, [guests, setGuestGroup, clearAllGroups, saveSnapshot]);

  const handleShare = useCallback(() => {
    const state = { guests, tables, groups, relationships, venueElements };
    const url = generateShareUrl(state);
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setShareUrl(url);
        toast.success('Share link copied to clipboard!');
        setTimeout(() => setShareUrl(null), 3000);
      }).catch(() => {
        setShareUrl(url);
        toast('Share link generated — copy from address bar');
      });
    } else {
      toast.error('Failed to generate share link');
    }
  }, [guests, tables, groups, relationships, venueElements]);

  const handleAddRelationship = useCallback(
    (g1, g2, type) => {
      saveSnapshot();
      addRelationship(g1, g2, type);
      toast.success(`Seating rule added`);
    },
    [addRelationship, saveSnapshot]
  );

  const handleSaveVersion = useCallback((name) => {
    saveVersion(name, { guests, tables, groups, relationships, venueElements });
    toast.success(`Version "${name}" saved`);
  }, [saveVersion, guests, tables, groups, relationships, venueElements]);

  const handleLoadVersion = useCallback((version) => {
    saveSnapshot();
    restoreState(version.state);
    toast.success(`Loaded version "${version.name}"`);
  }, [saveSnapshot, restoreState]);

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
          saveSnapshot();
          unassignGuest(draggedGuest.id);
          toast.success(`${draggedGuest.name} unassigned`);
        }
        return;
      }

      // Dropping on a seat
      if (overData?.type === 'seat') {
        const { tableId, seatIndex, currentGuest } = overData;
        saveSnapshot();

        if (currentGuest && currentGuest.id !== draggedGuest.id) {
          swapGuests(draggedGuest.id, currentGuest.id);
          toast.success(`Swapped ${draggedGuest.name} and ${currentGuest.name}`);
        } else if (!currentGuest) {
          assignGuest(draggedGuest.id, tableId, seatIndex);
          toast.success(`${draggedGuest.name} seated at ${tables.find((t) => t.id === tableId)?.label || 'table'}`);
        }
      }
    },
    [assignGuest, unassignGuest, swapGuests, tables, saveSnapshot]
  );

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: darkMode ? '#1f2937' : '#fff',
            color: darkMode ? '#e5e7eb' : '#333',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
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
              {/* RSVP Stats */}
              <div className="hidden sm:flex items-center gap-2 ml-4 text-[11px]">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{rsvpStats.accepted} accepted</span>
                <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{rsvpStats.pending} pending</span>
                {rsvpStats.declined > 0 && (
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{rsvpStats.declined} declined</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {/* Find My Seat */}
              <button
                onClick={() => setShowFindMySeat(true)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
                title="Find My Seat"
              >
                <SearchIcon size={16} />
              </button>
              {/* Versions */}
              <button
                onClick={() => setShowVersions(true)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
                title="Saved Versions"
              >
                <Clock size={16} />
              </button>
              {/* Undo/Redo */}
              <div className="flex items-center gap-0.5 mr-1">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={16} />
                </button>
              </div>
              {/* Share */}
              <button
                onClick={handleShare}
                className={`flex items-center gap-1 text-sm py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                  shareUrl
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
                title="Copy shareable link"
              >
                {shareUrl ? <Check size={14} /> : <Share2 size={14} />}
                {shareUrl ? 'Copied!' : 'Share'}
              </button>
              <ExportImport
                guests={guests}
                tables={tables}
                groups={groups}
                relationships={relationships}
                venueElements={venueElements}
                onImport={handleImport}
              />
            </div>
          </header>

          {/* Table Config Bar */}
          <TableConfig
            tables={tables}
            onAddTable={(overrides) => { saveSnapshot(); addTable(overrides); }}
            onUpdateTable={updateTable}
            onClearAssignments={() => { saveSnapshot(); clearAllAssignments(); }}
            onAutoSeat={handleAutoSeat}
            onAutoLayout={handleAutoLayout}
            onAutoBalance={handleAutoBalance}
            onAddVenueElement={(typeId) => { saveSnapshot(); addVenueElement(typeId); }}
            onApplyTemplate={handleApplyTemplate}
            onShowStats={() => setShowStats(true)}
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
              relationships={relationships}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              highlightedGuestIds={highlightedGuestIds}
              onAddGuest={handleAddGuest}
              onAddGuests={handleAddGuests}
              onRemoveGuest={handleRemoveGuest}
              onUpdateGuest={handleUpdateGuest}
              onAddGroup={addGroup}
              onRemoveGroup={removeGroup}
              onUpdateGroup={updateGroup}
              onAutoGroup={handleAutoGroup}
              onSetGuestGroup={setGuestGroup}
              onClearGuestGroups={clearGuestGroups}
              onClearAllGroups={handleClearAllGroups}
              onAddRelationship={handleAddRelationship}
              onRemoveRelationship={(id) => { saveSnapshot(); removeRelationship(id); }}
              groupColors={GROUP_COLORS}
            />
            <TableCanvas
              tables={tables}
              guests={guests}
              highlightedGuestIds={highlightedGuestIds}
              tableConflicts={tableConflicts}
              venueElements={venueElements}
              gridSnap={gridSnap}
              backgroundImage={backgroundImage}
              onMoveTable={moveTable}
              onUpdateTable={updateTable}
              onRemoveTable={handleRemoveTable}
              onDuplicateTable={handleDuplicateTable}
              onTableClick={handleTableClick}
              onMoveVenueElement={moveVenueElement}
              onRemoveVenueElement={removeVenueElement}
              onToggleGridSnap={() => setGridSnap(!gridSnap)}
              onSetBackgroundImage={setBackgroundImage}
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

      {showFindMySeat && (
        <FindMySeat
          tables={tables}
          guests={guests}
          groups={groups}
          onClose={() => setShowFindMySeat(false)}
        />
      )}

      {showStats && (
        <StatsPanel
          guests={guests}
          tables={tables}
          groups={groups}
          onClose={() => setShowStats(false)}
        />
      )}

      {showVersions && (
        <VersionManager
          versions={versions}
          onSave={handleSaveVersion}
          onLoad={handleLoadVersion}
          onDelete={deleteVersion}
          onClose={() => setShowVersions(false)}
        />
      )}

      <PrintView tables={tables} guests={guests} groups={groups} />
    </>
  );
}
