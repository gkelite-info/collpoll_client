"use client";

import { useEffect, useState } from "react";
import { fetchAdminEducationTypes } from "@/lib/helpers/admin/adminEducationTypesAPI";

export function useAssignedAdminEducationTypes(
  adminId: number | null | undefined,
  fallback = "",
) {
  const [assignedEducationTypes, setAssignedEducationTypes] = useState("");

  useEffect(() => {
    if (!adminId) return;
    let isMounted = true;

    const loadAssignedEducations = async () => {
      const assignedEducations = await fetchAdminEducationTypes(Number(adminId));
      const educationTypes = Array.from(
        new Set(
          assignedEducations
            .map((education) => education.collegeEducationType?.trim())
            .filter((education): education is string => Boolean(education)),
        ),
      );

      if (isMounted) setAssignedEducationTypes(educationTypes.join(", "));
    };

    void loadAssignedEducations();
    return () => {
      isMounted = false;
    };
  }, [adminId]);

  return assignedEducationTypes || fallback;
}
