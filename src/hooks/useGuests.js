import { useState, useCallback } from 'react';

const INITIAL_GUESTS = [];

export function useGuests(initialGuests = INITIAL_GUESTS) {
  const [guests, setGuests] = useState(initialGuests);

  const addGuest = useCallback((guest) => {
    setGuests((prev) => [
      ...prev,
      {
        id: guest.id || crypto.randomUUID(),
        name: guest.name,
        party: guest.party || '',
        dietary: guest.dietary || '',
        notes: guest.notes || '',
        groupId: guest.groupId || null,
        rsvp: guest.rsvp || 'pending',
        meal: guest.meal || '',
        tags: guest.tags || [],
        role: guest.role || '',
        plusOneOf: guest.plusOneOf || null,
        tableId: null,
        seatIndex: null,
      },
    ]);
  }, []);

  const addGuests = useCallback((newGuests) => {
    setGuests((prev) => [...prev, ...newGuests]);
  }, []);

  const removeGuest = useCallback((guestId) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, []);

  const updateGuest = useCallback((guestId, updates) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, ...updates } : g))
    );
  }, []);

  const assignGuest = useCallback((guestId, tableId, seatIndex) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, tableId, seatIndex } : g
      )
    );
  }, []);

  const unassignGuest = useCallback((guestId) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, tableId: null, seatIndex: null } : g
      )
    );
  }, []);

  const swapGuests = useCallback((guestId1, guestId2) => {
    setGuests((prev) => {
      const g1 = prev.find((g) => g.id === guestId1);
      const g2 = prev.find((g) => g.id === guestId2);
      if (!g1 || !g2) return prev;
      return prev.map((g) => {
        if (g.id === guestId1) {
          return { ...g, tableId: g2.tableId, seatIndex: g2.seatIndex };
        }
        if (g.id === guestId2) {
          return { ...g, tableId: g1.tableId, seatIndex: g1.seatIndex };
        }
        return g;
      });
    });
  }, []);

  const clearAllAssignments = useCallback(() => {
    setGuests((prev) =>
      prev.map((g) => ({ ...g, tableId: null, seatIndex: null }))
    );
  }, []);

  const setGuestGroup = useCallback((guestId, groupId) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, groupId } : g))
    );
  }, []);

  const setGuestsGroup = useCallback((guestIds, groupId) => {
    const idSet = new Set(guestIds);
    setGuests((prev) =>
      prev.map((g) => (idSet.has(g.id) ? { ...g, groupId } : g))
    );
  }, []);

  const clearGuestGroups = useCallback((groupId) => {
    setGuests((prev) =>
      prev.map((g) => (g.groupId === groupId ? { ...g, groupId: null } : g))
    );
  }, []);

  const unassigned = guests.filter((g) => !g.tableId);
  const assigned = guests.filter((g) => g.tableId);

  return {
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
    setGuestsGroup,
    clearGuestGroups,
    unassigned,
    assigned,
  };
}
