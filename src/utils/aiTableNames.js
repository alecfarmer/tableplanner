import { supabase } from '../lib/supabase';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://kcpzkiejpvetaftrfihl.supabase.co'}/functions/v1/ai-table-names`;

async function callAiFunction(body) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcHpraWVqcHZldGFmdHJmaWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDg5MTYsImV4cCI6MjA4NjIyNDkxNn0.mmpfpBBmEFj2Ve-U0AAc8msr8QRfqvM7zSJT4ujI8w4',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'AI request failed' }));
    throw new Error(err.error || 'AI request failed');
  }

  return res.json();
}

/**
 * Generate creative table names for all tables at once.
 */
export async function generateTableNames(theme, count) {
  const data = await callAiFunction({ theme, count });
  if (!data.names || !Array.isArray(data.names) || data.names.length === 0) {
    throw new Error('AI returned empty or invalid names');
  }
  return data.names;
}

/**
 * Generate a single new table name that doesn't duplicate existing ones.
 */
export async function generateSingleTableName(theme, existingNames) {
  const data = await callAiFunction({ theme, existingNames });
  if (!data.name) throw new Error('AI returned empty name');
  return data.name;
}
