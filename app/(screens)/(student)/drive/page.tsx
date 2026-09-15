"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import DriveClient from "@/app/components/SharedDrive/DriveClient";
import { Suspense } from "react";

export default function StudentDrive() {
  const { collegeEducationType, loading } = useStudent();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isSchoolEducation(collegeEducationType)) {
      router.replace("/stu_dashboard");
    }
  }, [loading, collegeEducationType, router]);

  if (loading || isSchoolEducation(collegeEducationType)) {
    return null;
  }

  return (
    <Suspense fallback={<div className="p-4">Loading drive...</div>}>
      <div className="w-full h-full">
        <DriveClient />
      </div>
    </Suspense>
  );
}
