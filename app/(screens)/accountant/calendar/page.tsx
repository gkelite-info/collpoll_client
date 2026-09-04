"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarMeetingsScreen,
  MeetingDetailsScreen,
  ScheduleMeetingScreen,
} from "./components/CalendarMeetingsScreen";
import CalendarTabsClient from "@/app/(screens)/college-admin/calendar/CalendarTabsClient";
import MeetingsClient from "@/app/utils/meetings/MeetingsClient";
import { dummyMeetings } from "@/app/utils/meetings/meetingDummyData";

function AccountantCalendarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isScheduleScreen =
    searchParams.get("view") === "scheduleMeeting" ||
    searchParams.get("modal") === "scheduleMeeting";
  const isMeetingDetailsScreen = searchParams.get("view") === "meetingDetails";

  const setScheduleScreenOpen = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (open) {
      params.set("view", "scheduleMeeting");
      params.delete("modal");
    } else {
      params.delete("view");
      params.delete("modal");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const setMeetingDetailsOpen = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (open) {
      params.set("view", "meetingDetails");
      params.delete("modal");
    } else {
      params.delete("view");
      params.delete("modal");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (isScheduleScreen) {
    return <ScheduleMeetingScreen onBack={() => setScheduleScreenOpen(false)} />;
  }

  if (isMeetingDetailsScreen) {
    return (
      <MeetingDetailsScreen
        onBack={() => setMeetingDetailsOpen(false)}
        onEdit={() => setScheduleScreenOpen(true)}
      />
    );
  }

  return (
    <CalendarMeetingsScreen
      onOpenSchedule={() => setScheduleScreenOpen(true)}
      onViewMeetingDetails={() => setMeetingDetailsOpen(true)}
    />
  );
}

// Legacy Accountant calendar remains here intact for future reuse if needed.
function LegacyAccountantCalendarPage() {
  return (
    <Suspense fallback={null}>
      <AccountantCalendarContent />
    </Suspense>
  );
}

export default function AccountantCalendarPage() {
  return (
    <CalendarTabsClient basePath="/accountant">
      <MeetingsClient initialMeetings={dummyMeetings} />
    </CalendarTabsClient>
  );
}
