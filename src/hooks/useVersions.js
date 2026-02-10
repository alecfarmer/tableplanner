import { useState, useCallback } from 'react';

const STORAGE_KEY = 'tp-seating-versions';

export function useVersions() {
  const [versions, setVersions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveVersion = useCallback((name, state) => {
    setVersions((prev) => {
      const next = [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          savedAt: new Date().toISOString(),
          state: JSON.parse(JSON.stringify(state)),
        },
      ];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* storage full */ }
      return next;
    });
  }, []);

  const deleteVersion = useCallback((versionId) => {
    setVersions((prev) => {
      const next = prev.filter((v) => v.id !== versionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renameVersion = useCallback((versionId, name) => {
    setVersions((prev) => {
      const next = prev.map((v) => (v.id === versionId ? { ...v, name } : v));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { versions, saveVersion, deleteVersion, renameVersion };
}
