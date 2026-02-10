import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'tp-seating-planner';

export function useSeatingPersistence(
  guests, tables, groups, setGuests, setTables, setGroups,
  relationships, setRelationships,
  venueElements, setVenueElements
) {
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
        if (data.relationships && Array.isArray(data.relationships) && setRelationships) {
          setRelationships(data.relationships);
        }
        if (data.venueElements && Array.isArray(data.venueElements) && setVenueElements) {
          setVenueElements(data.venueElements);
        }
      }
    } catch {
      // Ignore corrupted data
    }
  }, [setGuests, setTables, setGroups, setRelationships, setVenueElements]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!initialized.current) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            guests, tables, groups,
            relationships: relationships || [],
            venueElements: venueElements || [],
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Storage might be full
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [guests, tables, groups, relationships, venueElements]);
}

export function clearPersistedData() {
  localStorage.removeItem(STORAGE_KEY);
}
