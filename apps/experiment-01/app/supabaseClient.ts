import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://onroqajvamgdrnrjnzzu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucm9xYWp2YW1nZHJucmpuenp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjExNTksImV4cCI6MjA1NjkzNzE1OX0.2_O9ufR4G5hrP0i_gXOkeSr5KNKvZgnV9gyKtF8s3oY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
