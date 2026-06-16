"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { staffAttendanceRecords, type StaffAttendanceRecord } from "../data";
import GroundStaffMembersScreen from "./list/GroundStaffMembersScreen";
import StaffAttendanceListScreen from "./list/StaffAttendanceListScreen";
import StaffProfileScreen from "./profile/StaffProfileScreen";
import type { StaffAttendanceStatus } from "../data";

type StaffMembersFilter = "all" | StaffAttendanceStatus;
type ProfileReturnView = "attendance" | "members";

const STAFF_ATTENDANCE_PATH = "/wellbeing-executive/staff-attendance";
const staffStatuses: StaffAttendanceStatus[] = ["present", "absent", "late"];

const getValidStatusFilter = (status: string | null): StaffMembersFilter => {
  if (status && staffStatuses.includes(status as StaffAttendanceStatus)) {
    return status as StaffAttendanceStatus;
  }

  return "all";
};

export default function StaffAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] =
    useState<StaffAttendanceRecord[]>(staffAttendanceRecords);

  const handleViewMembers = (filter: StaffMembersFilter) => {
    router.push(`${STAFF_ATTENDANCE_PATH}?view=members&status=${filter}`);
  };

  const handleViewProfile = (
    record: StaffAttendanceRecord,
    returnView: ProfileReturnView,
  ) => {
    const params = new URLSearchParams({
      view: "profile",
      staffId: String(record.id),
      return: returnView,
    });

    if (returnView === "members") {
      params.set("status", getValidStatusFilter(searchParams.get("status")));
    }

    router.push(`${STAFF_ATTENDANCE_PATH}?${params.toString()}`);
  };

  const view = searchParams.get("view");
  const membersFilter = getValidStatusFilter(searchParams.get("status"));
  const selectedStaffId = Number(searchParams.get("staffId"));
  const selectedStaff = records.find((record) => record.id === selectedStaffId);

  if (selectedStaff) {
    const returnView = searchParams.get("return");
    const backPath =
      returnView === "members"
        ? `${STAFF_ATTENDANCE_PATH}?view=members&status=${membersFilter}`
        : STAFF_ATTENDANCE_PATH;

    return (
      <StaffProfileScreen
        staff={selectedStaff}
        onBack={() => router.push(backPath)}
      />
    );
  }

  if (view === "members") {
    const memberRecords =
      membersFilter === "all"
        ? records
        : records.filter((record) => record.status === membersFilter);

    return (
      <GroundStaffMembersScreen
        records={memberRecords}
        activeFilter={membersFilter}
        onBack={() => router.push(STAFF_ATTENDANCE_PATH)}
        onViewProfile={(record) => handleViewProfile(record, "members")}
      />
    );
  }

  return (
    <StaffAttendanceListScreen
      records={records}
      setRecords={setRecords}
      onViewProfile={(record) => handleViewProfile(record, "attendance")}
      onViewAllStaff={() => handleViewMembers("all")}
      onViewStaffByStatus={handleViewMembers}
    />
  );
}
