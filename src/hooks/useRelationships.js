import { useState, useCallback } from 'react';

/**
 * Manages guest seating rules:
 * - type: 'together' — guests should be at the same table
 * - type: 'apart' — guests must NOT be at the same table
 *
 * Each relationship: { id, guestId1, guestId2, type }
 */
export function useRelationships(initial = []) {
  const [relationships, setRelationships] = useState(initial);

  const addRelationship = useCallback((guestId1, guestId2, type) => {
    setRelationships((prev) => {
      // Don't duplicate
      const exists = prev.some(
        (r) =>
          (r.guestId1 === guestId1 && r.guestId2 === guestId2) ||
          (r.guestId1 === guestId2 && r.guestId2 === guestId1)
      );
      if (exists) return prev;
      return [
        ...prev,
        { id: crypto.randomUUID(), guestId1, guestId2, type },
      ];
    });
  }, []);

  const removeRelationship = useCallback((relId) => {
    setRelationships((prev) => prev.filter((r) => r.id !== relId));
  }, []);

  const clearRelationships = useCallback(() => {
    setRelationships([]);
  }, []);

  /**
   * Check for conflicts on a given table.
   * Returns array of { relationship, guest1, guest2 } objects representing violations.
   */
  const getTableConflicts = useCallback(
    (tableId, guests) => {
      const tableGuests = guests.filter((g) => g.tableId === tableId);
      const tableGuestIds = new Set(tableGuests.map((g) => g.id));
      const conflicts = [];

      for (const rel of relationships) {
        if (rel.type === 'apart') {
          // Both at the same table = conflict
          if (tableGuestIds.has(rel.guestId1) && tableGuestIds.has(rel.guestId2)) {
            conflicts.push({
              relationship: rel,
              guest1: tableGuests.find((g) => g.id === rel.guestId1),
              guest2: tableGuests.find((g) => g.id === rel.guestId2),
            });
          }
        }
      }
      return conflicts;
    },
    [relationships]
  );

  /**
   * Get all conflicts across all tables.
   * Returns a Map of tableId → conflicts[].
   */
  const getAllConflicts = useCallback(
    (guests, tables) => {
      const conflictMap = new Map();
      for (const table of tables) {
        const conflicts = getTableConflicts(table.id, guests);
        if (conflicts.length > 0) {
          conflictMap.set(table.id, conflicts);
        }
      }
      return conflictMap;
    },
    [getTableConflicts]
  );

  /**
   * Get relationships involving a specific guest.
   */
  const getGuestRelationships = useCallback(
    (guestId) => {
      return relationships.filter(
        (r) => r.guestId1 === guestId || r.guestId2 === guestId
      );
    },
    [relationships]
  );

  return {
    relationships,
    setRelationships,
    addRelationship,
    removeRelationship,
    clearRelationships,
    getTableConflicts,
    getAllConflicts,
    getGuestRelationships,
  };
}
