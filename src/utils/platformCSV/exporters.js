import { splitName } from './nameUtils.js';

function findTable(tables, tableId) {
  return tables.find((t) => t.id === tableId);
}

function rsvpToDisplay(rsvp) {
  switch (rsvp) {
    case 'accepted': return 'Attending';
    case 'declined': return 'Not Attending';
    case 'invited': return 'Invited';
    default: return 'No Reply';
  }
}

// ── Zola ──────────────────────────────────────────────────────────────
export function exportZola(guests, tables) {
  const headers = [
    'Name', 'Last Name', 'Partner First Name', 'Partner Last Name',
    'And Guest?', 'RSVP', 'Meal', 'Notes',
  ];

  // Group by party
  const parties = {};
  for (const g of guests) {
    const key = g.party || g.name;
    if (!parties[key]) parties[key] = [];
    parties[key].push(g);
  }

  const rows = [];
  for (const [, members] of Object.entries(parties)) {
    const primary = members[0];
    const partner = members.find((m, i) => i > 0 && m.role !== 'Child' && m.role !== 'Plus One');
    const plusOne = members.find((m) => m.role === 'Plus One');
    const { firstName, lastName } = splitName(primary.name);
    const partnerName = partner ? splitName(partner.name) : { firstName: '', lastName: '' };

    rows.push([
      firstName,
      lastName,
      partnerName.firstName,
      partnerName.lastName,
      plusOne ? 'Y' : 'N',
      rsvpToDisplay(primary.rsvp),
      primary.meal || '',
      primary.notes || '',
    ]);
  }

  return { headers, rows };
}

// ── Joy ───────────────────────────────────────────────────────────────
export function exportJoy(guests, tables) {
  const headers = [
    'First Name', 'Last Name', 'Party', 'RSVP Status',
    'Meal', 'Dietary', 'Tags', 'Notes',
  ];

  const rows = guests.map((g) => {
    const { firstName, lastName } = splitName(g.name);
    return [
      firstName,
      lastName,
      g.party || '',
      rsvpToDisplay(g.rsvp),
      g.meal || '',
      g.dietary || '',
      (g.tags || []).join('|'),
      g.notes || '',
    ];
  });

  return { headers, rows };
}

// ── The Knot ──────────────────────────────────────────────────────────
export function exportTheKnot(guests, tables) {
  const headers = [
    'First Name', 'Last Name', 'RSVP Status', 'Group/Event',
    'Meal', 'Notes',
  ];

  const rows = guests.map((g) => {
    const { firstName, lastName } = splitName(g.name);
    return [
      firstName,
      lastName,
      rsvpToDisplay(g.rsvp),
      g.party || '',
      g.meal || '',
      g.notes || '',
    ];
  });

  return { headers, rows };
}

// ── Minted ────────────────────────────────────────────────────────────
export function exportMinted(guests, tables) {
  const headers = ['Name', 'Address', 'City', 'State', 'Zip'];

  const rows = guests.map((g) => [g.name, '', '', '', '']);

  return { headers, rows };
}

// ── WeddingWire ───────────────────────────────────────────────────────
export function exportWeddingWire(guests, tables) {
  const headers = ['First Name', 'Last Name', 'Email', 'Telephone', 'Mobile Number', 'Postal Code'];

  const rows = guests.map((g) => {
    const { firstName, lastName } = splitName(g.name);
    return [firstName, lastName, '', '', '', ''];
  });

  return { headers, rows };
}

// ── Generic ───────────────────────────────────────────────────────────
export function exportGeneric(guests, tables) {
  const headers = [
    'Name', 'Party', 'RSVP', 'Meal', 'Dietary', 'Notes', 'Role', 'Tags', 'Table', 'Seat',
  ];

  const rows = guests.map((g) => {
    const table = g.tableId ? findTable(tables, g.tableId) : null;
    return [
      g.name,
      g.party || '',
      g.rsvp || 'pending',
      g.meal || '',
      g.dietary || '',
      g.notes || '',
      g.role || '',
      (g.tags || []).join('|'),
      table ? table.label : '',
      g.seatIndex != null ? String(g.seatIndex + 1) : '',
    ];
  });

  return { headers, rows };
}

export const EXPORTERS = {
  zola: exportZola,
  joy: exportJoy,
  theknot: exportTheKnot,
  minted: exportMinted,
  weddingwire: exportWeddingWire,
  generic: exportGeneric,
};
