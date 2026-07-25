"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import toast from "react-hot-toast";

export default function FacultyClubRedirectPage() {
  const router = useRouter();
  const { collegeEducationType, loading } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  useEffect(() => {
    if (loading) return;

    if (isSchool) {
      toast.error("Schools do not have access to this module.", {
        id: "school-feature-restricted",
      });
      router.replace("/faculty");
      return;
    }

    router.replace("/faculty/clubs");
  }, [isSchool, loading, router]);

  return null;
}
