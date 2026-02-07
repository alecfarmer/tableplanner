import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'wedding-seating-planner';

export function useSeatingPersistence(guests, tables, setGuests, setTables) {
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
      }
    } catch {
      // Ignore corrupted data
    }
  }, [setGuests, setTables]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!initialized.current) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ guests, tables, savedAt: new Date().toISOString() })
        );
      } catch {
        // Storage might be full
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [guests, tables]);
}

export function clearPersistedData() {
  localStorage.removeItem(STORAGE_KEY);
}
