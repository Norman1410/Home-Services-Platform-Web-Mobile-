// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szdzajxzxrgmxebhgrjm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZHphanh6eHJnbXhlYmhncmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzY3MzQsImV4cCI6MjA2NDUxMjczNH0.dBas4_6UGFYBLxR45t3GEij20keDBr4S9rps_lriFbI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
