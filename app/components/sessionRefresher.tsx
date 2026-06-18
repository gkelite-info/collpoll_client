'use client'
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function SessionRefresher() {
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible") {
                // --- TEMPORARILY COMMENTED OUT FOR PASSWORD HASHING MIGRATION ---
                // await supabase.auth.refreshSession();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return null;
}