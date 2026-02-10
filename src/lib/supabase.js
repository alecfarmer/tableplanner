import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kcpzkiejpvetaftrfihl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcHpraWVqcHZldGFmdHJmaWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDg5MTYsImV4cCI6MjA4NjIyNDkxNn0.mmpfpBBmEFj2Ve-U0AAc8msr8QRfqvM7zSJT4ujI8w4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
