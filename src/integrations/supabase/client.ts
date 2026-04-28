// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ENV VARIABLES
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// DEBUG (remove later)
console.log("🔍 SUPABASE_URL =", SUPABASE_URL);
console.log("🔍 SUPABASE_KEY EXISTS =", !!SUPABASE_PUBLISHABLE_KEY);

// SAFETY CHECK
if (!SUPABASE_URL) {
  throw new Error("❌ Missing VITE_SUPABASE_URL");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("❌ Missing VITE_SUPABASE_PUBLISHABLE_KEY");
}

// CREATE CLIENT
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);