"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

const hasSchoolCookie = () =>
  typeof document !== "undefined" &&
  document.cookie.split("; ").some((cookie) => cookie === "isSchool=true");

const subscribeToCookieSnapshot = () => () => undefined;
const getServerSchoolSnapshot = () => false;

export function useInstitutionTerminology() {
  const { collegeEducationType } = useUser();
  const schoolCookie = useSyncExternalStore(
    subscribeToCookieSnapshot,
    hasSchoolCookie,
    getServerSchoolSnapshot,
  );

  const isSchool = useMemo(
    () =>
      schoolCookie ||
      (collegeEducationType
        ?.split(",")
        .some((type) => isSchoolEducation(type.trim())) ??
        false),
    [collegeEducationType, schoolCookie],
  );

  return {
    isSchool,
    institutionLabel: isSchool ? "School" : "College",
    institutionLabelLower: isSchool ? "school" : "college",
    academicBranchLabel: isSchool ? "Year" : "Branch",
  };
}
