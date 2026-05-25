"use client";

import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchFinancePendingAlerts,
  type FinancePendingAlert,
} from "@/lib/helpers/finance-manager/dashboard/FetchPendingAlerts";
import { Warning } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

const realtimeTables = [
  "student_fee_obligation",
  "student_fee_collection",
  "student_payment_transaction",
  "student_fee_ledger",
  "students",
  "student_academic_history",
];

export default function PendingAlertsPanel() {
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [alerts, setAlerts] = useState<FinancePendingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAlerts = useCallback(async () => {
    if (contextLoading || !collegeId || !collegeEducationId) return;

    setLoading(true);
    try {
      const result = await fetchFinancePendingAlerts(
        collegeId,
        collegeEducationId,
      );
      setAlerts(result);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [collegeEducationId, collegeId, contextLoading]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (contextLoading || !collegeId || !collegeEducationId) return;

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        loadAlerts();
      }, 300);
    };

    const channel = supabase.channel(
      `finance_pending_alerts_${collegeId}_${collegeEducationId}`,
    );

    realtimeTables.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        scheduleRefresh,
      );
    });

    channel.subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [collegeEducationId, collegeId, contextLoading, loadAlerts]);

  return (
    <div className="flex h-90 min-h-0 flex-col rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-md font-semibold text-[#282828]">Pending Alerts</h2>
      <div className="custom-scrollbar mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start justify-between gap-3">
              <div className="flex flex-1 items-start gap-2">
                <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-full bg-[#F2F2F2]" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-full animate-pulse rounded bg-[#F2F2F2]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#F2F2F2]" />
                </div>
              </div>
              <div className="h-4 w-16 shrink-0 animate-pulse rounded bg-[#F2F2F2]" />
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#525252]">
            No pending alerts available
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Warning
                  size={18}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-[#FFB020]"
                />
                <p className="text-sm leading-relaxed text-[#282828]">
                  {alert.message}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-[#282828]">
                {alert.timeLabel}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
