import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jfvzefjxhuqytwchwalo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmdnplZmp4aHVxeXR3Y2h3YWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTc0NDIsImV4cCI6MjA3MTQzMzQ0Mn0.n7SLEuA2k4STfSPRxSSD-0-SMREtl25wpm0L9ftPeBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);