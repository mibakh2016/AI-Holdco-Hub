import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bmwllitfuhsnzvsvecoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtd2xsaXRmdWhzbnp2c3ZlY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzU1MjQsImV4cCI6MjA4Nzk1MTUyNH0.237Wr9z-FHFup0JduJWXvtPekGY_c4cbhCzKJ72-x2U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
