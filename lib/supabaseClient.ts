// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        cookieOptions: {
            // This allows cookies to work on mrecw.tektoncampus.com AND tektoncampus.com
            domain: process.env.NODE_ENV === 'production' ? '.tektoncampus.com' : 'localhost',
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        }
    }
)