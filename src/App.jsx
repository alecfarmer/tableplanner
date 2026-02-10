import { useState, useCallback, useMemo, useEffect } from 'react';
import { DndContext, DragOverlay, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Heart, GripVertical, Download, Upload, Printer, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

import GuestSidebar from './components/GuestSidebar';
import TableCanvas from './components/TableCanvas';
import FloatingToolbar from './components/FloatingToolbar';
import TableDetailModal from './components/TableDetailModal';
import GuestDetailModal from './components/GuestDetailModal';
import TableNameGenerator from './components/TableNameGenerator';
import ExportImport from './components/ExportImport';
import PrintView from './components/PrintView';
import FindMySeat from './components/FindMySeat';
import StatsPanel from './components/StatsPanel';
import VersionManager from './components/VersionManager';
import ConfirmDialog from './components/ConfirmDialog';
import { useGuests } from './hooks/useGuests';
import { useTables } from './hooks/useTables';
import { useGroups } from './hooks/useGroups';
import { useRelationships } from './hooks/useRelationships';
import { useVenueElements } from './hooks/useVenueElements';
import { useHistory } from './hooks/useHistory';
import { useVersions } from './hooks/useVersions';
import { useSeatingPersistence } from './hooks/useSeatingPersistence';
import { useSupabasePersistence } from './hooks/useSupabasePersistence';
import { useAuth } from './hooks/useAuth';
import { computeAutoSeat } from './utils/autoSeat';
import { computeAutoLayout } from './utils/autoLayout';
import { computeAutoBalance } from './utils/autoBalance';
import { applyTemplate } from './utils/templates';
import { generateShareUrl, loadFromShareUrl, clearShareHash } from './utils/shareLink';
import { generateSingleTableName } from './utils/aiTableNames';

export default function App({ eventId = null }) {
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
      return localStorage.getItem('tp-dark-mode') === 'true';
    }
    return false;
  });
  const [gridSnap, setGridSnap] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showFindMySeat, setShowFindMySeat] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showAiNames, setShowAiNames] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [aiTheme, setAiTheme] = useState(() =>
    localStorage.getItem('tp-ai-theme') || ''
  );
  const [activeDragGuest, setActiveDragGuest] = useState(null);
  const [dragPointer, setDragPointer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Track pointer position during drag for custom overlay
  useEffect(() => {
    if (!activeDragGuest) {
      setDragPointer(null);
      return;
    }
    const onPointerMove = (e) => setDragPointer({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [activeDragGuest]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('tp-dark-mode', darkMode);
  }, [darkMode]);

  const { user } = useAuth();

  // Dual-mode persistence: localStorage for anonymous, Supabase for logged-in with eventId
  useSeatingPersistence(
    !eventId ? guests : [], !eventId ? tables : [], !eventId ? groups : [],
    !eventId ? setGuests : () => {}, !eventId ? setTables : () => {}, !eventId ? setGroups : () => {},
    !eventId ? relationships : [], !eventId ? setRelationships : () => {},
    !eventId ? venueElements : [], !eventId ? setVenueElements : () => {}
  );
  useSupabasePersistence(
    eventId,
    guests, tables, groups, relationships, venueElements,
    setGuests, setTables, setGroups, setRelationships, setVenueElements
  );

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
        setShowAiNames(false);
        setEditingGuestId(null);
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
      const table = tables.find((t) => t.id === tableId);
      const tableGuests = guests.filter((g) => g.tableId === tableId);
      setConfirmAction({
        title: `Delete ${table?.label || 'table'}?`,
        message: tableGuests.length > 0
          ? `This will also unassign ${tableGuests.length} guest${tableGuests.length > 1 ? 's' : ''}.`
          : 'This table will be permanently removed.',
        confirmLabel: 'Delete',
        action: () => {
          saveSnapshot();
          for (const g of tableGuests) {
            unassignGuest(g.id);
          }
          removeTable(tableId);
          toast.success('Table removed');
        },
      });
    },
    [guests, tables, unassignGuest, removeTable, saveSnapshot]
  );

  const handleSaveAiTheme = useCallback((theme) => {
    setAiTheme(theme);
    localStorage.setItem('tp-ai-theme', theme);
  }, []);

  // Auto-generate an AI name for a newly added table
  const autoNameTable = useCallback(async (tableId, currentTables) => {
    const existingNames = currentTables.map((t) => t.label);
    try {
      const name = await generateSingleTableName(aiTheme, existingNames);
      updateTable(tableId, { label: name });
    } catch {
      // Silently fall back to default name
    }
  }, [aiTheme, updateTable]);

  const handleDuplicateTable = useCallback(
    (tableId) => {
      saveSnapshot();
      const newId = duplicateTable(tableId);
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

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (active.data.current?.type === 'guest') {
      setActiveDragGuest(active.data.current.guest);
      if (event.activatorEvent) {
        setDragPointer({ x: event.activatorEvent.clientX, y: event.activatorEvent.clientY });
      }
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragGuest(null);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      setActiveDragGuest(null);
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col h-screen">
          {/* Minimal Top Bar */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-5 py-2 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-teal" fill="#0d9488" />
              <h1 className="font-serif text-lg font-bold text-navy">
                Seating Planner
              </h1>
              <div className="hidden sm:flex items-center gap-2 ml-3 text-[11px]">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{rsvpStats.accepted} accepted</span>
                <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{rsvpStats.pending} pending</span>
                {rsvpStats.declined > 0 && (
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{rsvpStats.declined} declined</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!user && !eventId && guests.length > 0 && (
                <Link
                  to="/auth?redirect=/app"
                  className="hidden sm:flex items-center gap-1.5 text-xs text-teal font-medium hover:text-teal-dark transition-colors"
                >
                  <LogIn size={14} />
                  Save progress
                </Link>
              )}
              {user && !eventId && (
                <Link
                  to="/events"
                  className="text-xs text-teal font-medium hover:text-teal-dark transition-colors"
                >
                  My Events
                </Link>
              )}
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

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden relative">
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
              onEditGuest={setEditingGuestId}
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
            <FloatingToolbar
              tables={tables}
              onAddTable={(overrides) => {
                saveSnapshot();
                const newId = addTable(overrides);
                if (aiTheme && overrides?.shape !== 'sweetheart') {
                  autoNameTable(newId, tables);
                }
              }}
              onClearAssignments={() => setConfirmAction({
                title: 'Clear all assignments?',
                message: 'This will unassign every guest from their seat. You can undo this action.',
                confirmLabel: 'Clear All',
                action: () => { saveSnapshot(); clearAllAssignments(); },
              })}
              onAutoSeat={handleAutoSeat}
              onAutoLayout={handleAutoLayout}
              onAutoBalance={handleAutoBalance}
              onAddVenueElement={(typeId) => { saveSnapshot(); addVenueElement(typeId); }}
              onApplyTemplate={handleApplyTemplate}
              onShowStats={() => setShowStats(true)}
              onShowFindMySeat={() => setShowFindMySeat(true)}
              onShowVersions={() => setShowVersions(true)}
              onShowAiNames={() => setShowAiNames(true)}
              aiThemeActive={!!aiTheme}
              guestCount={guests.length}
              assignedCount={assigned.length}
              unassignedCount={unassigned.length}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              darkMode={darkMode}
              onToggleDark={() => setDarkMode(!darkMode)}
              onShare={handleShare}
              shareUrl={shareUrl}
            />
          </div>
        </div>

        <DragOverlay dropAnimation={null} />
      </DndContext>

      {/* Custom pointer-following drag overlay — bypasses dnd-kit positioning issues */}
      {activeDragGuest && dragPointer && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: dragPointer.x,
            top: dragPointer.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="guest-card flex items-center gap-2 shadow-xl ring-2 ring-teal bg-white w-56">
            <GripVertical size={14} className="text-gray-400 shrink-0" />
            <span className="font-medium truncate">{activeDragGuest.name}</span>
          </div>
        </div>
      )}

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

      {editingGuestId && (() => {
        const guest = guests.find((g) => g.id === editingGuestId);
        if (!guest) return null;
        return (
          <GuestDetailModal
            guest={guest}
            guests={guests}
            groups={groups}
            tables={tables}
            onUpdate={handleUpdateGuest}
            onRemove={handleRemoveGuest}
            onClose={() => setEditingGuestId(null)}
          />
        );
      })()}

      {showAiNames && (
        <TableNameGenerator
          tables={tables}
          onUpdateTable={updateTable}
          onClose={() => setShowAiNames(false)}
          savedTheme={aiTheme}
          onSaveTheme={handleSaveAiTheme}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onConfirm={() => { confirmAction.action(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <PrintView tables={tables} guests={guests} groups={groups} />
    </>
  );
}
