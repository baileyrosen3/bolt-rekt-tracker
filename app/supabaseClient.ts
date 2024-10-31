import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and Anon Key
const SUPABASE_URL = "https://lsnmvskwmvqggisitukw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzbm12c2t3bXZxZ2dpc2l0dWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM3NjMxMzQsImV4cCI6MjAzOTMzOTEzNH0.FqBoMkNQxA1Nz7LmB67cWdA4X780yAYqmSexHUUk7pk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
