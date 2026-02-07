import { useState, useCallback, useEffect, useRef } from 'react';

const MAX_HISTORY = 50;

/**
 * Undo/redo hook that snapshots the full app state.
 * Call `snapshot()` before any user action to save the current state.
 */
export function useHistory() {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const stateRef = useRef(null);

  const snapshot = useCallback((state) => {
    if (!state) return;
    setPast((prev) => {
      const next = [...prev, JSON.parse(JSON.stringify(state))];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
    setFuture([]);
    stateRef.current = state;
  }, []);

  const undo = useCallback((currentState, restore) => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [...f, JSON.parse(JSON.stringify(currentState))]);
    restore(previous);
  }, [past]);

  const redo = useCallback((currentState, restore) => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setPast((p) => [...p, JSON.parse(JSON.stringify(currentState))]);
    restore(next);
  }, [future]);

  return {
    snapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
