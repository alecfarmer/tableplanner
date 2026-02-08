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

  // Meal summary
  const mealCounts = {};
  for (const g of guests) {
    if (g.meal) {
      mealCounts[g.meal] = (mealCounts[g.meal] || 0) + 1;
    }
  }

  // Alphabetical directory
  const sortedGuests = [...guests].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="hidden print-only p-8" style={{ display: 'none' }}>
      <h1 className="font-serif text-3xl text-wine mb-2">Seating Arrangement</h1>
      <p className="text-sm text-gray-500 mb-2">
        {guests.length} guests &middot; {tables.length} tables
      </p>

      {/* Meal summary */}
      {Object.keys(mealCounts).length > 0 && (
        <div className="text-xs text-gray-600 mb-4 flex gap-3">
          <span className="font-semibold">Meal totals:</span>
          {Object.entries(mealCounts).map(([meal, count]) => (
            <span key={meal}>{meal}: {count}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {tables.map((table) => {
          const tableGuests = (assignedByTable[table.id] || []).sort(
            (a, b) => (a.seatIndex ?? 0) - (b.seatIndex ?? 0)
          );
          const tableMeals = {};
          for (const g of tableGuests) {
            if (g.meal) tableMeals[g.meal] = (tableMeals[g.meal] || 0) + 1;
          }
          return (
            <div key={table.id} className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-serif font-semibold text-wine">{table.label}</h3>
              <p className="text-xs text-gray-500 mb-1">
                {table.shape === 'sweetheart' ? 'Sweetheart' : table.shape === 'round' ? 'Round' : 'Rectangular'} &middot; {table.shape === 'sweetheart' ? 2 : table.seats} seats
              </p>
              {table.notes && (
                <p className="text-[10px] text-gray-400 mb-1 italic">{table.notes}</p>
              )}
              {Object.keys(tableMeals).length > 0 && (
                <p className="text-[10px] text-gray-500 mb-2">
                  Meals: {Object.entries(tableMeals).map(([m, c]) => `${m} (${c})`).join(', ')}
                </p>
              )}
              {tableGuests.length > 0 ? (
                <ol className="text-sm space-y-0.5 pl-4">
                  {tableGuests.map((g) => (
                    <li key={g.id}>
                      {g.name}
                      {g.role && (
                        <span className="text-xs text-wine ml-1">[{g.role}]</span>
                      )}
                      {g.groupId && groupMap[g.groupId] && (
                        <span
                          className="text-xs ml-1 px-1 rounded"
                          style={{ backgroundColor: groupMap[g.groupId].color + '30' }}
                        >
                          {groupMap[g.groupId].name}
                        </span>
                      )}
                      {g.meal && (
                        <span className="text-gray-500 text-xs ml-1">[{g.meal}]</span>
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

      {/* Alphabetical Guest Directory */}
      <div className="mt-8 page-break-before">
        <h2 className="font-serif text-xl font-semibold text-wine mb-3">Guest Directory</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-1 px-2">Name</th>
              <th className="text-left py-1 px-2">Table</th>
              <th className="text-left py-1 px-2">Seat</th>
              <th className="text-left py-1 px-2">Meal</th>
              <th className="text-left py-1 px-2">Dietary</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.map((g) => {
              const table = tables.find((t) => t.id === g.tableId);
              return (
                <tr key={g.id} className="border-b border-gray-200">
                  <td className="py-0.5 px-2 font-medium">{g.name}</td>
                  <td className="py-0.5 px-2">{table?.label || '-'}</td>
                  <td className="py-0.5 px-2">{g.seatIndex != null ? g.seatIndex + 1 : '-'}</td>
                  <td className="py-0.5 px-2">{g.meal || '-'}</td>
                  <td className="py-0.5 px-2 text-gold">{g.dietary || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Place Cards */}
      <div className="mt-8 page-break-before">
        <h2 className="font-serif text-xl font-semibold text-wine mb-3">Place Cards</h2>
        <div className="flex flex-wrap">
          {sortedGuests.filter((g) => g.tableId).map((g) => {
            const table = tables.find((t) => t.id === g.tableId);
            return (
              <div key={g.id} className="place-card">
                <p className="font-serif text-lg font-semibold">{g.name}</p>
                <p className="text-xs text-gray-500 mt-1">{table?.label}</p>
                {g.meal && <p className="text-[10px] text-gray-400 mt-0.5">{g.meal}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
