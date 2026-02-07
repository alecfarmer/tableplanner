import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'wedding-seating-planner';

export function useSeatingPersistence(guests, tables, groups, setGuests, setTables, setGroups) {
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.guests && Array.isArray(data.guests)) {
          setGuests(data.guests);
        }
        if (data.tables && Array.isArray(data.tables)) {
          setTables(data.tables);
        }
        if (data.groups && Array.isArray(data.groups)) {
          setGroups(data.groups);
        }
      }
    } catch {
      // Ignore corrupted data
    }
  }, [setGuests, setTables, setGroups]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!initialized.current) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ guests, tables, groups, savedAt: new Date().toISOString() })
        );
      } catch {
        // Storage might be full
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [guests, tables, groups]);
}

export function clearPersistedData() {
  localStorage.removeItem(STORAGE_KEY);
}
