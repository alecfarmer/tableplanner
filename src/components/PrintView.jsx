export default function PrintView({ tables, guests, groups = [] }) {
  const groupMap = {};
  for (const g of groups) {
    groupMap[g.id] = g;
  }
  const assignedByTable = {};
  for (const guest of guests) {
    if (guest.tableId) {
      if (!assignedByTable[guest.tableId]) {
        assignedByTable[guest.tableId] = [];
      }
      assignedByTable[guest.tableId].push(guest);
    }
  }

  const unassigned = guests.filter((g) => !g.tableId);

  return (
    <div className="hidden print-only p-8" style={{ display: 'none' }}>
      <h1 className="font-serif text-3xl text-wine mb-2">Seating Arrangement</h1>
      <p className="text-sm text-gray-500 mb-6">
        {guests.length} guests &middot; {tables.length} tables
      </p>

      <div className="grid grid-cols-2 gap-4">
        {tables.map((table) => {
          const tableGuests = (assignedByTable[table.id] || []).sort(
            (a, b) => (a.seatIndex ?? 0) - (b.seatIndex ?? 0)
          );
          return (
            <div key={table.id} className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-serif font-semibold text-wine">{table.label}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {table.shape === 'round' ? 'Round' : 'Rectangular'} &middot; {table.seats} seats
              </p>
              {tableGuests.length > 0 ? (
                <ol className="text-sm space-y-0.5 pl-4">
                  {tableGuests.map((g) => (
                    <li key={g.id}>
                      {g.name}
                      {g.groupId && groupMap[g.groupId] && (
                        <span
                          className="text-xs ml-1 px-1 rounded"
                          style={{ backgroundColor: groupMap[g.groupId].color + '30' }}
                        >
                          {groupMap[g.groupId].name}
                        </span>
                      )}
                      {g.dietary && (
                        <span className="text-gold text-xs ml-1">({g.dietary})</span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-400 italic">No guests assigned</p>
              )}
            </div>
          );
        })}
      </div>

      {unassigned.length > 0 && (
        <div className="mt-6">
          <h3 className="font-serif font-semibold text-wine mb-2">
            Unassigned Guests ({unassigned.length})
          </h3>
          <ul className="text-sm columns-2 space-y-0.5">
            {unassigned.map((g) => (
              <li key={g.id}>{g.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
