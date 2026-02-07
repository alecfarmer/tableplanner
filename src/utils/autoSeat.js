/**
 * Auto-seat algorithm that keeps group members together.
 *
 * Strategy:
 * 1. Collect all unassigned guests
 * 2. Build groups of guests (by groupId, plus "ungrouped" singles)
 * 3. For each group (largest first), find a table with enough empty seats
 * 4. Seat the group together at consecutive seats
 * 5. Fill remaining ungrouped guests into any available seats
 *
 * Returns an array of { guestId, tableId, seatIndex } assignments.
 */
export function computeAutoSeat(guests, tables, groups) {
  const unassigned = guests.filter((g) => !g.tableId);
  if (unassigned.length === 0 || tables.length === 0) return [];

  // Exclude sweetheart tables from auto-seating (bride/groom are placed manually)
  tables = tables.filter((t) => t.shape !== 'sweetheart');

  // Build a map of occupied seats per table
  const occupied = {};
  for (const table of tables) {
    occupied[table.id] = new Set();
  }
  for (const guest of guests) {
    if (guest.tableId && guest.seatIndex != null && occupied[guest.tableId]) {
      occupied[guest.tableId].add(guest.seatIndex);
    }
  }

  // Helper: get empty seat indices for a table
  function getEmptySeats(tableId) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return [];
    const empty = [];
    for (let i = 0; i < table.seats; i++) {
      if (!occupied[tableId].has(i)) {
        empty.push(i);
      }
    }
    return empty;
  }

  // Separate grouped and ungrouped unassigned guests
  const groupedGuests = {};
  const ungrouped = [];

  for (const guest of unassigned) {
    if (guest.groupId) {
      if (!groupedGuests[guest.groupId]) {
        groupedGuests[guest.groupId] = [];
      }
      groupedGuests[guest.groupId].push(guest);
    } else {
      ungrouped.push(guest);
    }
  }

  // Sort groups by size (largest first) so bigger groups get priority
  const sortedGroupIds = Object.keys(groupedGuests).sort(
    (a, b) => groupedGuests[b].length - groupedGuests[a].length
  );

  const assignments = [];

  // Phase 1: Seat groups together
  for (const groupId of sortedGroupIds) {
    const members = groupedGuests[groupId];
    let seated = false;

    // Try to find a table with enough empty seats for the whole group
    for (const table of tables) {
      const emptySeats = getEmptySeats(table.id);
      if (emptySeats.length >= members.length) {
        // Seat the whole group at this table
        for (let i = 0; i < members.length; i++) {
          const seatIndex = emptySeats[i];
          assignments.push({
            guestId: members[i].id,
            tableId: table.id,
            seatIndex,
          });
          occupied[table.id].add(seatIndex);
        }
        seated = true;
        break;
      }
    }

    // If no single table fits the whole group, split across tables
    if (!seated) {
      let remaining = [...members];
      for (const table of tables) {
        if (remaining.length === 0) break;
        const emptySeats = getEmptySeats(table.id);
        const toSeat = remaining.splice(0, emptySeats.length);
        for (let i = 0; i < toSeat.length; i++) {
          assignments.push({
            guestId: toSeat[i].id,
            tableId: table.id,
            seatIndex: emptySeats[i],
          });
          occupied[table.id].add(emptySeats[i]);
        }
      }
    }
  }

  // Phase 2: Seat ungrouped guests into remaining empty seats
  let ungroupedIndex = 0;
  for (const table of tables) {
    if (ungroupedIndex >= ungrouped.length) break;
    const emptySeats = getEmptySeats(table.id);
    for (const seatIndex of emptySeats) {
      if (ungroupedIndex >= ungrouped.length) break;
      assignments.push({
        guestId: ungrouped[ungroupedIndex].id,
        tableId: table.id,
        seatIndex,
      });
      occupied[table.id].add(seatIndex);
      ungroupedIndex++;
    }
  }

  return assignments;
}
