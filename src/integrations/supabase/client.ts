import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jvonjijucihbbuyfffos.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b25qaWp1Y2loYmJ1eWZmZm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDIzODcsImV4cCI6MjA5MDQ3ODM4N30.QE1eFLfUqTIntE1qzUgdLEqBo6j2zlxjLwteIN09PpE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
