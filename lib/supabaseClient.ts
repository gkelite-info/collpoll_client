// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // {
    //     cookieOptions: {
    //         domain:
    //             process.env.NODE_ENV === "production"
    //                 ? ".tektoncampus.com"
    //                 : undefined,
    //         path: "/",
    //         sameSite: "lax",
    //         secure: process.env.NODE_ENV === "production",
    //     },
    // }
);