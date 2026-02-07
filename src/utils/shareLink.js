/**
 * Encode/decode seating state to/from a shareable URL hash.
 * Uses JSON → base64 encoding. No server needed.
 */

export function encodeStateToHash(state) {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch {
    return null;
  }
}

export function decodeStateFromHash(hash) {
  try {
    const decoded = decodeURIComponent(escape(atob(hash)));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function generateShareUrl(state) {
  const hash = encodeStateToHash(state);
  if (!hash) return null;
  return `${window.location.origin}${window.location.pathname}#share=${hash}`;
}

export function loadFromShareUrl() {
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;
  const encoded = hash.slice(7);
  return decodeStateFromHash(encoded);
}

export function clearShareHash() {
  if (window.location.hash.startsWith('#share=')) {
    history.replaceState(null, '', window.location.pathname);
  }
}
