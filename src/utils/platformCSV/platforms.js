export const PLATFORMS = [
  { id: 'auto', label: 'Auto-detect', description: 'Automatically detect the platform from CSV headers' },
  { id: 'zola', label: 'Zola', description: 'Household-based guest list with partner & children' },
  { id: 'joy', label: 'Joy', description: 'Individual guests with party grouping and tags' },
  { id: 'theknot', label: 'The Knot', description: 'First/last name with RSVP status and groups' },
  { id: 'minted', label: 'Minted', description: 'Single name field with address info' },
  { id: 'weddingwire', label: 'WeddingWire', description: 'Basic guest info with phone and email' },
  { id: 'generic', label: 'Generic CSV', description: 'Flexible column matching for any CSV format' },
];

/**
 * Detect the platform from CSV column headers.
 * @param {string[]} headers - lowercased, trimmed header names
 * @returns {string} platform id
 */
export function detectPlatform(headers) {
  const h = headers.map((s) => s.toLowerCase().trim());
  const has = (term) => h.some((col) => col.includes(term));
  const exact = (term) => h.includes(term);

  if (has('and guest?') || exact('and guest?'))
    return 'zola';

  if (has('name on envelope') && has('tags'))
    return 'joy';

  if (has('name line 1'))
    return 'theknot';

  if (h[0] === 'name' && h.length <= 6)
    return 'minted';

  if (has('telephone') && has('mobile number'))
    return 'weddingwire';

  return 'generic';
}
