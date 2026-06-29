"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import type { StaffAttendanceRecord } from "../data";
import GroundStaffMembersScreen from "./list/GroundStaffMembersScreen";
import StaffAttendanceListScreen from "./list/StaffAttendanceListScreen";
import StaffProfileScreen from "./profile/StaffProfileScreen";
import {
  fetchGroundStaffMembers,
  type GroundStaffMemberListItem,
} from "@/lib/helpers/wellbeing/wellbeingExecutiveAPI";

type ProfileSection = "profile" | "history";

const STAFF_ATTENDANCE_PATH = "/wellbeing-executive/staff-attendance";

const getProfileSection = (value: string | null): ProfileSection =>
  value === "history" ? "history" : "profile";

const normalizeCategoryName = (categoryName: string | null | undefined) =>
  categoryName?.toLowerCase().replace(/[^a-z]/g, "") ?? "";

const isSafetyAndSecurityCategory = (categoryName: string | null | undefined) => {
  const normalizedCategory = normalizeCategoryName(categoryName);
  return normalizedCategory === "safetyandsecurity" || normalizedCategory === "safetysecurity";
};

const isStaffAttendanceCategory = (categoryName: string | null | undefined) =>
  isSafetyAndSecurityCategory(categoryName) ||
  normalizeCategoryName(categoryName) === "infrastructure";

const formatJoiningDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const mapGroundStaffToAttendanceRecord = (
  staff: GroundStaffMemberListItem,
  index: number,
): StaffAttendanceRecord => ({
  id: staff.groundStaffId,
  staffId: staff.staffId,
  name: staff.name,
  role: "Ground Staff",
  status: "not_marked",
  designation: staff.designation,
  department: "Safety and Security",
  shift: "Morning Shift",
  joiningDate: formatJoiningDate(staff.dateOfJoining),
  reportingTo: "Safety Executive",
  phone: staff.phone,
  email: staff.email,
  address: "Campus",
  totalWorkingDays: 0,
  presentDays: 0,
  absentDays: 0,
  lateDays: 0,
  attendanceRate: 0,
  imageSeed: (index % 70) + 1,
  image: staff.image,
  history: [],
});

export default function StaffAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, collegeId, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const canViewStaffAttendance = [wellBeingCategoryName, ...wellBeingCategoryNames].some(
    isStaffAttendanceCategory,
  );

  useEffect(() => {
    if (!loading && !canViewStaffAttendance) {
      router.replace("/wellbeing-executive");
    }
  }, [canViewStaffAttendance, loading, router]);

  useEffect(() => {
    if (loading || !canViewStaffAttendance || !collegeId) {
      return;
    }

    let cancelled = false;

    fetchGroundStaffMembers(collegeId)
      .then((groundStaff) => {
        if (cancelled) return;

        if (groundStaff.length) {
          setRecords(groundStaff.map(mapGroundStaffToAttendanceRecord));
        }
      })
      .catch((error) => {
        console.error("Ground staff fetch failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [canViewStaffAttendance, collegeId, loading]);

  const selectedStaffId = Number(searchParams.get("staffId") ?? records[0]?.id);
  const selectedStaff = useMemo(
    () => records.find((record) => record.id === selectedStaffId) ?? records[0],
    [records, selectedStaffId],
  );
  const view = searchParams.get("view");
  const profileSection = getProfileSection(searchParams.get("section"));

  if (loading || !canViewStaffAttendance) {
    return null;
  }

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
