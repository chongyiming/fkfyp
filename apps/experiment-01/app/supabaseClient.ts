import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://velfmvmemrzurdweumyo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGZtdm1lbXJ6dXJkd2V1bXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NTc2ODUsImV4cCI6MjA0OTIzMzY4NX0.wYS5iKIce0cf_yxnh8XGOYmhl0xW8gND5abvYRZEU1o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
