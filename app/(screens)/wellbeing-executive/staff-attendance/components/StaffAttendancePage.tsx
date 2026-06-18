"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { staffAttendanceRecords, type StaffAttendanceRecord } from "../data";
import GroundStaffMembersScreen from "./list/GroundStaffMembersScreen";
import StaffAttendanceListScreen from "./list/StaffAttendanceListScreen";
import StaffProfileScreen from "./profile/StaffProfileScreen";

type ProfileSection = "profile" | "history";

const STAFF_ATTENDANCE_PATH = "/wellbeing-executive/staff-attendance";

const getProfileSection = (value: string | null): ProfileSection =>
  value === "history" ? "history" : "profile";

export default function StaffAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<StaffAttendanceRecord[]>(staffAttendanceRecords);

  const selectedStaffId = Number(searchParams.get("staffId") ?? records[0]?.id);
  const selectedStaff = useMemo(
    () => records.find((record) => record.id === selectedStaffId) ?? records[0],
    [records, selectedStaffId],
  );
  const view = searchParams.get("view");
  const profileSection = getProfileSection(searchParams.get("section"));

  const openDirectory = (status?: StaffAttendanceRecord["status"]) => {
    const params = new URLSearchParams({ view: "directory" });

    if (status) {
      params.set("status", status);
    }

    router.push(`${STAFF_ATTENDANCE_PATH}?${params.toString()}`);
  };

  const openProfile = (record: StaffAttendanceRecord, section: ProfileSection) => {
    const params = new URLSearchParams({
      view: "profile",
      staffId: String(record.id),
      section,
    });

    router.push(`${STAFF_ATTENDANCE_PATH}?${params.toString()}`);
  };

  if (view === "directory") {
    return (
      <GroundStaffMembersScreen
        records={records}
        onBack={() => router.push(STAFF_ATTENDANCE_PATH)}
        onViewProfile={(record) => openProfile(record, "profile")}
      />
    );
  }

  if (view === "profile" && selectedStaff) {
    return (
      <StaffProfileScreen
        staff={selectedStaff}
        activeSection={profileSection}
        onBack={() => router.push(STAFF_ATTENDANCE_PATH)}
      />
    );
  }

  return (
    <StaffAttendanceListScreen
      records={records}
      setRecords={setRecords}
      onViewProfile={(record) => openProfile(record, "profile")}
      onViewHistory={(record) => openProfile(record, "history")}
      onViewAllStaff={() => openDirectory()}
      onViewStatusStaff={(status) => openDirectory(status)}
    />
  );
}
