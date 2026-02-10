/**
 * Split a full name into first and last parts.
 * Handles "First Last", "First Middle Last", and single names.
 */
export function splitName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Join first and last name into a single string.
 */
export function joinName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}
