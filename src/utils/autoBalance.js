/**
 * Auto-balance guests across tables to even out seat counts.
 * Redistributes unassigned guests to fill tables evenly.
 */
export function computeAutoBalance(guests, tables) {
  const nonSweetheartTables = tables.filter((t) => t.shape !== 'sweetheart');
  if (nonSweetheartTables.length === 0) return [];

  const unassigned = guests.filter((g) => !g.tableId);
  const totalSeats = nonSweetheartTables.reduce((s, t) => s + t.seats, 0);
  const totalGuests = guests.filter((g) => g.tableId && nonSweetheartTables.some((t) => t.id === g.tableId)).length + unassigned.length;

  if (totalGuests === 0 || totalSeats === 0) return [];

  // Target: even distribution
  const targetPerTable = Math.ceil(totalGuests / nonSweetheartTables.length);

  // Collect all assigned guests per table
  const tableAssignments = {};
  for (const t of nonSweetheartTables) {
    tableAssignments[t.id] = guests.filter((g) => g.tableId === t.id).slice();
  }

  // Find over-full and under-full tables
  const moves = [];
  const pool = [...unassigned];

  // Move excess from over-full tables to pool
  for (const t of nonSweetheartTables) {
    const assigned = tableAssignments[t.id];
    const cap = Math.min(t.seats, targetPerTable);
    while (assigned.length > cap) {
      const guest = assigned.pop();
      pool.push(guest);
      moves.push({ guestId: guest.id, tableId: null, seatIndex: null });
    }
  }

  // Fill under-full tables from pool
  for (const t of nonSweetheartTables) {
    const assigned = tableAssignments[t.id];
    const cap = Math.min(t.seats, targetPerTable);
    const occupiedSeats = new Set(assigned.map((g) => g.seatIndex));

    while (assigned.length < cap && pool.length > 0) {
      const guest = pool.shift();
      let seatIdx = 0;
      while (occupiedSeats.has(seatIdx)) seatIdx++;
      occupiedSeats.add(seatIdx);
      assigned.push(guest);
      moves.push({ guestId: guest.id, tableId: t.id, seatIndex: seatIdx });
    }
  }

  return moves;
}
