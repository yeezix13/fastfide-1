
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yfikzmfqvwzdphmhjhfg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaWt6bWZxdnd6ZHBobWhqaGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzQwNDcsImV4cCI6MjA2NTUxMDA0N30.DiM_GAQ-X5rixFuICTNumr_QflkQSi9kA8DYfkDpuWk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})
