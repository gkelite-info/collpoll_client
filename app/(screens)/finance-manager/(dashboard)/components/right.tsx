"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchFinanceDashboardAnnouncements,
  type FinanceDashboardAnnouncement,
} from "@/lib/helpers/finance-manager/dashboard/FetchFinanceDashboardAnnouncements";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useRef, useState } from "react";

export default function FinanceManagerDashRight() {
  const { userId, role } = useUser();
  const { collegeId, loading: financeContextLoading } = useFinanceManager();
  const [announcements, setAnnouncements] = useState<
    FinanceDashboardAnnouncement[]
  >([]);
  const [view, setView] = useState<"my" | "others">("others");
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAnnouncements = useCallback(async () => {
    if (financeContextLoading) return;

    if (!collegeId || !userId || !role) {
      setAnnouncements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchFinanceDashboardAnnouncements({
        collegeId,
        userId,
        role,
        view,
      });
      setAnnouncements(result);
    } catch {
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, financeContextLoading, role, userId, view]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  useEffect(() => {
    if (financeContextLoading || !collegeId) return;

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        loadAnnouncements();
      }, 300);
    };

    const channel = supabase
      .channel(`finance_dashboard_announcements_${collegeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "college_announcements",
          filter: `collegeId=eq.${collegeId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "college_announcements_roles",
        },
        scheduleRefresh,
      );

    channel.subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [collegeId, financeContextLoading, loadAnnouncements]);

  return (
    <aside className="bg-yellow-00 md:[35%] lg:w-[32%] p-2 lg:p-2 lg:pr-0 hidden min-h-0 landscape:hidden md:flex landscape:md:flex md:flex-col lg:flex lg:flex-col">
      <div className="grid grid-cols-2 gap-4 w-full items-center">
        <div />
        <CourseScheduleCard isVisibile={false} fullWidth={true} />
      </div>

      <WorkWeekCalendar style="mt-3 max-w-full" />
      <AnnouncementsCard
        announceCard={announcements}
        height="80vh"
        currentView={view}
        isLoading={isLoading}
        onViewChange={setView}
        refreshAnnouncements={loadAnnouncements}
      />
    </aside>
  );
}
