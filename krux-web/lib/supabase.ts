import { createClient } from "@supabase/supabase-js";

const supabaseURL = process.env.NEXT_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_SUPBASE_KEY!

export const supabase = createClient(supabaseURL, supabaseAnonKey)

