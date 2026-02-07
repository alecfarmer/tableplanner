export function exportToJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seating-arrangement-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.guests || !data.tables) {
          reject(new Error('Invalid seating arrangement file'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function generatePrintHTML(tables, guests) {
  const assignedByTable = {};
  for (const guest of guests) {
    if (guest.tableId) {
      if (!assignedByTable[guest.tableId]) {
        assignedByTable[guest.tableId] = [];
      }
      assignedByTable[guest.tableId].push(guest);
    }
  }

  let html = '';
  for (const table of tables) {
    const tableGuests = assignedByTable[table.id] || [];
    tableGuests.sort((a, b) => (a.seatIndex ?? 0) - (b.seatIndex ?? 0));
    html += `<div style="break-inside:avoid;margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">`;
    html += `<h3 style="font-family:Georgia,serif;font-size:18px;margin:0 0 12px 0;color:#722f37;">${table.label}</h3>`;
    html += `<p style="font-size:12px;color:#6b7280;margin:0 0 8px 0;">${table.shape === 'round' ? 'Round' : 'Rectangular'} \u2022 ${table.seats} seats</p>`;
    if (tableGuests.length === 0) {
      html += `<p style="color:#9ca3af;font-style:italic;">No guests assigned</p>`;
    } else {
      html += `<ol style="margin:0;padding-left:20px;">`;
      for (const g of tableGuests) {
        html += `<li style="margin-bottom:4px;">${g.name}`;
        if (g.dietary) html += ` <span style="color:#b08d2e;font-size:12px;">(${g.dietary})</span>`;
        html += `</li>`;
      }
      html += `</ol>`;
    }
    html += `</div>`;
  }
  return html;
}
