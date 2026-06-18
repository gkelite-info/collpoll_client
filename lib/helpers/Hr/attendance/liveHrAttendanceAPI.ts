"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useHrAttendanceRealtime(
  onAttendanceMarked: (payload: any) => void
) {
  const callbackRef = useRef(onAttendanceMarked);

  useEffect(() => {
    callbackRef.current = onAttendanceMarked;
  }, [onAttendanceMarked]);

  useEffect(() => {
    // Subscribe to INSERT or UPDATE on attendance_daily
    const dailyChannel = supabase
      .channel(`public:attendance_daily:hr`, {
        config: { broadcast: { self: false, ack: false } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_daily",
        },
        (payload) => {
          callbackRef.current(payload);
        }
      )
      .on("broadcast", { event: "new_daily_attendance" }, ({ payload }) => {
        callbackRef.current({ new: payload });
      })
      .subscribe((status, err) => {
        if (err) {
          console.error("HR Realtime subscription error (attendance_daily):", err);
        }
      });

    return () => {
      supabase.removeChannel(dailyChannel);
    };
  }, []);
}
