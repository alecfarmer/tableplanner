import { splitName, joinName } from './nameUtils.js';

function makeGuest(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    party: '',
    dietary: '',
    notes: '',
    rsvp: 'pending',
    meal: '',
    role: '',
    tags: [],
    groupId: null,
    tableId: null,
    seatIndex: null,
    ...overrides,
  };
}

// ── Zola ──────────────────────────────────────────────────────────────
export function parseZola(rows) {
  const guests = [];
  const warnings = [];
  let householdCount = 0;

  for (const row of rows) {
    householdCount++;
    const primaryName = (row['name'] || row['first name'] || '').trim();
    if (!primaryName) continue;

    const lastName = (row['last name'] || '').trim();
    const party = joinName(primaryName, lastName);

    // Primary guest
    guests.push(makeGuest({
      name: joinName(primaryName, lastName),
      party,
      rsvp: normalizeRsvp(row['rsvp'] || row['rsvp status']),
      meal: (row['meal'] || row['meal choice'] || '').trim(),
      notes: (row['notes'] || '').trim(),
    }));

    // Partner
    const partnerFirst = (row['partner first name'] || row['partner name'] || '').trim();
    const partnerLast = (row['partner last name'] || '').trim();
    if (partnerFirst) {
      guests.push(makeGuest({
        name: joinName(partnerFirst, partnerLast || lastName),
        party,
        rsvp: normalizeRsvp(row['partner rsvp'] || row['rsvp'] || row['rsvp status']),
      }));
    }

    // "And Guest?" handling
    const andGuest = (row['and guest?'] || row['and guest'] || '').trim().toLowerCase();
    if ((andGuest === 'y' || andGuest === 'yes') && !partnerFirst) {
      guests.push(makeGuest({
        name: `${joinName(primaryName, lastName)}'s Guest`,
        party,
        role: 'Plus One',
        rsvp: 'pending',
      }));
    }

    // Children (up to 5 columns: child 1 name, child 2 name, etc.)
    for (let i = 1; i <= 5; i++) {
      const childName = (row[`child ${i} name`] || row[`child ${i}`] || '').trim();
      if (childName) {
        guests.push(makeGuest({
          name: childName,
          party,
          role: 'Child',
        }));
      }
    }
  }

  if (householdCount !== guests.length) {
    warnings.push(`${householdCount} households expanded into ${guests.length} individual guests.`);
  }

  return { guests, warnings };
}

// ── Joy ───────────────────────────────────────────────────────────────
export function parseJoy(rows) {
  const guests = [];
  const warnings = [];

  for (const row of rows) {
    const firstName = (row['first name'] || '').trim();
    const lastName = (row['last name'] || '').trim();
    const name = joinName(firstName, lastName) || (row['name on envelope'] || '').trim();
    if (!name) continue;

    const tagsRaw = (row['tags'] || '').trim();
    const tags = tagsRaw ? tagsRaw.split('|').map((t) => t.trim()).filter(Boolean) : [];

    guests.push(makeGuest({
      name,
      party: (row['party'] || row['group'] || '').trim(),
      rsvp: normalizeRsvp(row['rsvp'] || row['rsvp status']),
      meal: (row['meal'] || row['meal choice'] || '').trim(),
      dietary: (row['dietary'] || row['dietary restrictions'] || '').trim(),
      notes: (row['notes'] || '').trim(),
      tags,
    }));
  }

  return { guests, warnings };
}

// ── The Knot ──────────────────────────────────────────────────────────
export function parseTheKnot(rows) {
  const guests = [];
  const warnings = [];

  for (const row of rows) {
    const firstName = (row['first name'] || '').trim();
    const lastName = (row['last name'] || '').trim();
    const name = joinName(firstName, lastName);
    if (!name) continue;

    guests.push(makeGuest({
      name,
      party: (row['group/event'] || row['group'] || row['party'] || '').trim(),
      rsvp: normalizeRsvp(row['rsvp status'] || row['rsvp']),
      meal: (row['meal'] || row['meal choice'] || row['entree'] || '').trim(),
      notes: (row['notes'] || row['comments'] || '').trim(),
    }));
  }

  return { guests, warnings };
}

// ── Minted ────────────────────────────────────────────────────────────
export function parseMinted(rows) {
  const guests = [];
  const warnings = [];

  for (const row of rows) {
    const rawName = (row['name'] || '').trim();
    if (!rawName) continue;

    // Handle "John and Jane Smith" → 2 guests
    const andMatch = rawName.match(/^(.+?)\s+and\s+(.+)$/i);
    if (andMatch) {
      const parts = andMatch[2].trim().split(/\s+/);
      let secondFirst, sharedLast;
      if (parts.length === 1) {
        // "John and Jane Smith" — need last name from first part
        const firstParts = andMatch[1].trim().split(/\s+/);
        if (firstParts.length > 1) {
          sharedLast = firstParts[firstParts.length - 1];
          secondFirst = parts[0];
        } else {
          sharedLast = '';
          secondFirst = parts[0];
        }
      } else {
        secondFirst = parts[0];
        sharedLast = parts.slice(1).join(' ');
      }

      const firstPersonFirst = andMatch[1].trim().split(/\s+/)[0];
      const party = rawName;

      guests.push(makeGuest({
        name: joinName(firstPersonFirst, sharedLast),
        party,
      }));
      guests.push(makeGuest({
        name: joinName(secondFirst, sharedLast),
        party,
      }));
    } else {
      // Single person or "The Smith Family"
      guests.push(makeGuest({ name: rawName, party: rawName }));
    }
  }

  return { guests, warnings };
}

// ── WeddingWire ───────────────────────────────────────────────────────
export function parseWeddingWire(rows) {
  const guests = [];
  const warnings = ['WeddingWire CSV does not include address or dietary data.'];

  for (const row of rows) {
    const firstName = (row['first name'] || '').trim();
    const lastName = (row['last name'] || '').trim();
    const name = joinName(firstName, lastName);
    if (!name) continue;

    guests.push(makeGuest({
      name,
      notes: [row['email'], row['telephone'], row['mobile number']]
        .filter(Boolean)
        .join(', '),
      rsvp: normalizeRsvp(row['rsvp'] || row['rsvp status']),
    }));
  }

  return { guests, warnings };
}

// ── Generic ───────────────────────────────────────────────────────────
export function parseGeneric(rows) {
  const guests = [];
  const warnings = [];

  for (const row of rows) {
    const name = (
      row['name'] || row['guest'] || row['guest name'] || row['full name'] || ''
    ).trim();
    if (!name) continue;

    const tagsRaw = (row['tags'] || '').trim();
    const tags = tagsRaw ? tagsRaw.split('|').map((t) => t.trim()).filter(Boolean) : [];

    guests.push(makeGuest({
      name,
      party: (row['party'] || row['group'] || row['party name'] || '').trim(),
      dietary: (row['dietary'] || row['dietary restrictions'] || row['diet'] || '').trim(),
      notes: (row['notes'] || row['note'] || row['comments'] || '').trim(),
      rsvp: normalizeRsvp(row['rsvp'] || row['status']),
      meal: (row['meal'] || row['meal choice'] || row['meal preference'] || '').trim(),
      role: (row['role'] || '').trim(),
      tags,
    }));
  }

  return { guests, warnings };
}

// ── Helpers ───────────────────────────────────────────────────────────
function normalizeRsvp(value) {
  if (!value) return 'pending';
  const v = value.trim().toLowerCase();
  if (['accepted', 'attending', 'yes', 'confirmed', 'y'].includes(v)) return 'accepted';
  if (['declined', 'not attending', 'no', 'n'].includes(v)) return 'declined';
  if (['invited', 'sent'].includes(v)) return 'invited';
  return 'pending';
}

export const PARSERS = {
  zola: parseZola,
  joy: parseJoy,
  theknot: parseTheKnot,
  minted: parseMinted,
  weddingwire: parseWeddingWire,
  generic: parseGeneric,
};
