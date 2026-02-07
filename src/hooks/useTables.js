import { useState, useCallback } from 'react';

const DEFAULT_SEATS = 8;

export function useTables(initialTables = []) {
  const [tables, setTables] = useState(initialTables);

  const addTable = useCallback((overrides = {}) => {
    setTables((prev) => {
      const num = prev.length + 1;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          label: `Table ${num}`,
          seats: DEFAULT_SEATS,
          shape: 'round',
          x: 100 + (num % 4) * 250,
          y: 100 + Math.floor(num / 4) * 250,
          ...overrides,
        },
      ];
    });
  }, []);

  const removeTable = useCallback((tableId) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    return tableId;
  }, []);

  const updateTable = useCallback((tableId, updates) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t))
    );
  }, []);

  const moveTable = useCallback((tableId, x, y) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, x, y } : t))
    );
  }, []);

  return {
    tables,
    setTables,
    addTable,
    removeTable,
    updateTable,
    moveTable,
  };
}
