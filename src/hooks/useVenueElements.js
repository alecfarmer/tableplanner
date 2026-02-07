import { useState, useCallback } from 'react';

export const VENUE_ELEMENT_TYPES = [
  { id: 'dance-floor', label: 'Dance Floor', icon: '💃', defaultW: 200, defaultH: 200 },
  { id: 'stage', label: 'Stage', icon: '🎤', defaultW: 300, defaultH: 100 },
  { id: 'dj-booth', label: 'DJ Booth', icon: '🎵', defaultW: 120, defaultH: 80 },
  { id: 'bar', label: 'Bar', icon: '🍸', defaultW: 200, defaultH: 60 },
  { id: 'buffet', label: 'Buffet', icon: '🍽️', defaultW: 260, defaultH: 70 },
  { id: 'cake-table', label: 'Cake Table', icon: '🎂', defaultW: 100, defaultH: 100 },
  { id: 'gift-table', label: 'Gift Table', icon: '🎁', defaultW: 160, defaultH: 70 },
  { id: 'photo-booth', label: 'Photo Booth', icon: '📸', defaultW: 120, defaultH: 120 },
  { id: 'entrance', label: 'Entrance', icon: '🚪', defaultW: 100, defaultH: 40 },
];

export function useVenueElements(initial = []) {
  const [elements, setElements] = useState(initial);

  const addElement = useCallback((typeId) => {
    const type = VENUE_ELEMENT_TYPES.find((t) => t.id === typeId);
    if (!type) return;
    setElements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: typeId,
        label: type.label,
        x: 100 + (prev.length % 3) * 220,
        y: 400 + Math.floor(prev.length / 3) * 150,
        width: type.defaultW,
        height: type.defaultH,
      },
    ]);
  }, []);

  const removeElement = useCallback((elementId) => {
    setElements((prev) => prev.filter((e) => e.id !== elementId));
  }, []);

  const moveElement = useCallback((elementId, x, y) => {
    setElements((prev) =>
      prev.map((e) => (e.id === elementId ? { ...e, x, y } : e))
    );
  }, []);

  const updateElement = useCallback((elementId, updates) => {
    setElements((prev) =>
      prev.map((e) => (e.id === elementId ? { ...e, ...updates } : e))
    );
  }, []);

  return {
    elements,
    setElements,
    addElement,
    removeElement,
    moveElement,
    updateElement,
  };
}
