const SUPABASE_URL = "https://phhgxragcckkpvrizjkl.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaGd4cmFnY2Nra3B2cml6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MjIwMDUsImV4cCI6MjEwMjM5ODAwNX0.D7WUr9apBM-x3YOYtYO_D_q3kQBPbr0X-xGTCuyT3wA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;

console.log("Supabase connected:", supabaseClient);