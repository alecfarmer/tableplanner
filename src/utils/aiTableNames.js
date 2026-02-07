import Anthropic from '@anthropic-ai/sdk';

const API_KEY_STORAGE = 'wedding-planner-anthropic-key';

/**
 * Resolve the API key with priority:
 * 1. VITE_ANTHROPIC_API_KEY environment variable
 * 2. Manually stored key in localStorage
 */
export function getEffectiveApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem(API_KEY_STORAGE) || '';
}

export function hasEnvApiKey() {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
}

export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

/**
 * Generate creative table names using Claude API.
 * Uses VITE_ANTHROPIC_API_KEY env var if set, otherwise falls back to the provided key.
 * @param {string} theme - The theme/topic for table names (e.g., "flowers", "Italian cities", "love songs")
 * @param {number} count - Number of names to generate
 * @param {string} apiKey - Anthropic API key (fallback if env var not set)
 * @returns {Promise<string[]>} Array of generated table names
 */
export async function generateTableNames(theme, count, apiKey) {
  const effectiveKey = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey;
  if (!effectiveKey) {
    throw new Error('No API key available. Set VITE_ANTHROPIC_API_KEY in .env or enter one manually.');
  }

  const client = new Anthropic({
    apiKey: effectiveKey,
    dangerouslyAllowBrowser: true,
  });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate exactly ${count} creative table names for a wedding seating chart based on this theme: "${theme}".

Requirements:
- Each name should be short (1-3 words max)
- Names should be elegant and wedding-appropriate
- Names should be distinct from each other
- Names should clearly relate to the theme

Respond with ONLY a JSON array of strings, no other text. Example: ["Rose", "Lily", "Dahlia"]`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  // Parse the JSON array from the response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error('Could not parse table names from AI response');
  }
  const names = JSON.parse(match[0]);
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('AI returned empty or invalid names');
  }
  return names.slice(0, count);
}
