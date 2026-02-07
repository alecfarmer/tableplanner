import Papa from 'papaparse';

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const guests = results.data
          .filter((row) => {
            const name = row.name || row.guest || row['guest name'] || row['full name'];
            return name && name.trim();
          })
          .map((row) => ({
            id: crypto.randomUUID(),
            name: (row.name || row.guest || row['guest name'] || row['full name']).trim(),
            party: (row.party || row.group || row['party name'] || '').trim(),
            dietary: (row.dietary || row['dietary restrictions'] || row.diet || '').trim(),
            notes: (row.notes || row.note || row.comments || '').trim(),
            groupId: null,
            tableId: null,
            seatIndex: null,
          }));
        resolve(guests);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export function parseBulkText(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((name) => ({
      id: crypto.randomUUID(),
      name,
      party: '',
      dietary: '',
      notes: '',
      groupId: null,
      tableId: null,
      seatIndex: null,
    }));
}
