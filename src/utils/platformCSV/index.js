import Papa from 'papaparse';
import { detectPlatform, PLATFORMS } from './platforms.js';
import { PARSERS } from './parsers.js';
import { EXPORTERS } from './exporters.js';

export { PLATFORMS, detectPlatform } from './platforms.js';
export { splitName, joinName } from './nameUtils.js';

/**
 * Parse a CSV file for a given platform.
 * If platformId is 'auto', detect from headers.
 * @returns {Promise<{guests: object[], warnings: string[], detectedPlatform: string}>}
 */
export function parseForPlatform(platformId, file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const detected = platformId === 'auto' ? detectPlatform(headers) : platformId;
        const parser = PARSERS[detected] || PARSERS.generic;
        const { guests, warnings } = parser(results.data);
        resolve({ guests, warnings, detectedPlatform: detected });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Export guests to a CSV string for a given platform.
 * @returns {string} CSV content
 */
export function exportForPlatform(platformId, guests, tables) {
  const exporter = EXPORTERS[platformId] || EXPORTERS.generic;
  const { headers, rows } = exporter(guests, tables);
  return Papa.unparse({ fields: headers, data: rows });
}
