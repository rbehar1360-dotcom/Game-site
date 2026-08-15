const SUPABASE_URL = "https://phhgxragcckkpvrizjkl.supabase.co";
const SUPABASE_KEY = "sb_publishable_l65dWlIhwMdxQE0fPVIOeg_IenefLar";

const supabaseClient = window.supabase.createClient(
    "https://phhgxragcckkpvrizjkl.supabase.co",
    "sb_publishable_l65dWlIhwMdxQE0fPVIOeg_IenefLar"
);

console.log("Supabase connected:", supabaseClient);