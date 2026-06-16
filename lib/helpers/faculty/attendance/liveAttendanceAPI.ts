"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAttendanceRealtime(
  calendarEventId: number | null,
  onAttendanceMarked: (payload: any) => void
) {
  useEffect(() => {
    if (!calendarEventId) return;

    // Subscribe to INSERT or UPDATE on attendance_record for this specific class
    const channel = supabase
      .channel(`public:attendance_record:eventId=${calendarEventId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT and UPDATE
          schema: "public",
          table: "attendance_record",
          filter: `calendarEventId=eq.${calendarEventId}`,
        },
        (payload) => {
          onAttendanceMarked(payload);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Realtime subscription error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [calendarEventId, onAttendanceMarked]);
}
