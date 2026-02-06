import { createClient } from '@supabase/supabase-js';

// Note: This must use process.env directly, not through a wrapper that might hide it
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase Admin Keys in .env.local');
}

export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false, // Admin actions shouldn't save sessions
    },
  });
}