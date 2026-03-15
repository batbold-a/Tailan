import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://zkljsychjcnzcgsxfzeo.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprbGpzeWNoamNuemNnc3hmemVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzA4MjMsImV4cCI6MjA4ODEwNjgyM30.2S2emeM5pfn--jHht5lBog1Xk49QMBqj557TLngoBKg';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

