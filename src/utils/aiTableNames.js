import OpenAI from 'openai';

const STORAGE_PREFIX = 'wedding-planner-ai';

/**
 * Environment variables (set in .env):
 *   VITE_OPENAI_API_KEY   — API key (required)
 *   VITE_OPENAI_BASE_URL  — Base URL for any OpenAI-compatible endpoint (optional, defaults to OpenAI)
 *   VITE_OPENAI_MODEL     — Model name (optional, defaults to gpt-4o-mini)
 */

// --- Key management ---

export function getEffectiveApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem(`${STORAGE_PREFIX}-key`) || '';
}

export function hasEnvApiKey() {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

export function getStoredApiKey() {
  return localStorage.getItem(`${STORAGE_PREFIX}-key`) || '';
}

export function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem(`${STORAGE_PREFIX}-key`, key);
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}-key`);
  }
}

// --- Base URL management ---

export function getEffectiveBaseUrl() {
  return import.meta.env.VITE_OPENAI_BASE_URL || localStorage.getItem(`${STORAGE_PREFIX}-base-url`) || '';
}

export function hasEnvBaseUrl() {
  return !!import.meta.env.VITE_OPENAI_BASE_URL;
}

export function getStoredBaseUrl() {
  return localStorage.getItem(`${STORAGE_PREFIX}-base-url`) || '';
}

export function setStoredBaseUrl(url) {
  if (url) {
    localStorage.setItem(`${STORAGE_PREFIX}-base-url`, url);
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}-base-url`);
  }
}

// --- Model management ---

export function getEffectiveModel() {
  return import.meta.env.VITE_OPENAI_MODEL || localStorage.getItem(`${STORAGE_PREFIX}-model`) || 'gpt-4o-mini';
}

export function getStoredModel() {
  return localStorage.getItem(`${STORAGE_PREFIX}-model`) || '';
}

export function setStoredModel(model) {
  if (model) {
    localStorage.setItem(`${STORAGE_PREFIX}-model`, model);
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}-model`);
  }
}

/**
 * Generate creative table names using any OpenAI-compatible API.
 * @param {string} theme - The theme/topic for table names
 * @param {number} count - Number of names to generate
 * @param {object} overrides - Optional { apiKey, baseUrl, model } overrides
 * @returns {Promise<string[]>} Array of generated table names
 */
export async function generateTableNames(theme, count, overrides = {}) {
  const apiKey = overrides.apiKey || getEffectiveApiKey();
  if (!apiKey) {
    throw new Error('No API key available. Set VITE_OPENAI_API_KEY in .env or enter one manually.');
  }

  const baseURL = overrides.baseUrl || getEffectiveBaseUrl() || undefined;
  const model = overrides.model || getEffectiveModel();

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: 'You generate creative names for wedding seating tables. Respond with ONLY a JSON array of strings, no other text.',
      },
      {
        role: 'user',
        content: `Generate exactly ${count} creative table names for a wedding seating chart based on this theme: "${theme}".

Requirements:
- Each name should be short (1-3 words max)
- Names should be elegant and wedding-appropriate
- Names should be distinct from each other
- Names should clearly relate to the theme

Example response format: ["Rose", "Lily", "Dahlia"]`,
      },
    ],
  });

  const text = (response.choices[0]?.message?.content || '').trim();
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
