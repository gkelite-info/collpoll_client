'use client'
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function SessionRefresher() {
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible") {
                await supabase.auth.refreshSession();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return null;
}