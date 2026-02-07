import { useState, useCallback } from 'react';

const GROUP_COLORS = [
  '#e8b4b8', // rose
  '#b7c4a1', // sage
  '#c9a84c', // gold
  '#a8c8e8', // sky
  '#d4a8d4', // lavender
  '#e8c8a0', // peach
  '#8bb8a8', // teal
  '#c8a8b8', // mauve
  '#b8c898', // moss
  '#d8a888', // terracotta
];

export function useGroups(initialGroups = []) {
  const [groups, setGroups] = useState(initialGroups);

  const addGroup = useCallback((name, color) => {
    const id = crypto.randomUUID();
    setGroups((prev) => [
      ...prev,
      {
        id,
        name: name.trim(),
        color: color || GROUP_COLORS[prev.length % GROUP_COLORS.length],
      },
    ]);
    return id;
  }, []);

  const removeGroup = useCallback((groupId) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    return groupId;
  }, []);

  const updateGroup = useCallback((groupId, updates) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  }, []);

  const autoGroupByLastName = useCallback((guests) => {
    const lastNameMap = {};

    for (const guest of guests) {
      const parts = guest.name.trim().split(/\s+/);
      const lastName = parts.length > 1
        ? parts[parts.length - 1]
        : null;
      if (lastName) {
        const key = lastName.toLowerCase();
        if (!lastNameMap[key]) {
          lastNameMap[key] = { displayName: lastName, guestIds: [] };
        }
        lastNameMap[key].guestIds.push(guest.id);
      }
    }

    // Only create groups for last names shared by 2+ guests
    const newGroups = [];
    const guestGroupAssignments = {};

    const familyEntries = Object.values(lastNameMap).filter(
      (entry) => entry.guestIds.length >= 2
    );

    setGroups((prev) => {
      const updated = [...prev];
      for (const entry of familyEntries) {
        const groupName = `${entry.displayName} Family`;
        // Skip if group with this name already exists
        if (updated.some((g) => g.name.toLowerCase() === groupName.toLowerCase())) {
          const existing = updated.find(
            (g) => g.name.toLowerCase() === groupName.toLowerCase()
          );
          for (const guestId of entry.guestIds) {
            guestGroupAssignments[guestId] = existing.id;
          }
          continue;
        }
        const id = crypto.randomUUID();
        const color = GROUP_COLORS[updated.length % GROUP_COLORS.length];
        updated.push({ id, name: groupName, color });
        newGroups.push({ id, name: groupName, color });
        for (const guestId of entry.guestIds) {
          guestGroupAssignments[guestId] = id;
        }
      }
      return updated;
    });

    return { newGroups, guestGroupAssignments };
  }, []);

  return {
    groups,
    setGroups,
    addGroup,
    removeGroup,
    updateGroup,
    autoGroupByLastName,
    GROUP_COLORS,
  };
}
