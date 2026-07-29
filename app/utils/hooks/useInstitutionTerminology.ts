"use client";

import { useMemo } from "react";

import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

const hasSchoolCookie = () =>
  typeof document !== "undefined" &&
  document.cookie.split("; ").some((cookie) => cookie === "isSchool=true");

export function useInstitutionTerminology() {
  const { collegeEducationType } = useUser();

  const isSchool = useMemo(
    () =>
      hasSchoolCookie() ||
      (collegeEducationType
        ?.split(",")
        .some((type) => isSchoolEducation(type.trim())) ??
        false),
    [collegeEducationType],
  );

  return {
    isSchool,
    institutionLabel: isSchool ? "School" : "College",
    institutionLabelLower: isSchool ? "school" : "college",
    academicBranchLabel: isSchool ? "Year" : "Branch",
  };
}
