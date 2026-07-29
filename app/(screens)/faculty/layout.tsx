"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import toast from "react-hot-toast";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { collegeEducationType, loading } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  const isBlockedPath = 
    pathname === "/faculty/clubs" || 
    pathname.startsWith("/faculty/clubs/") || 
    pathname === "/faculty/wellbeing" ||
    pathname.startsWith("/faculty/wellbeing/");

  useEffect(() => {
    if (loading) return;
    if (isSchool && isBlockedPath) {
      toast.error("Schools do not have access to this module.", {
        id: "school-feature-restricted",
      });
      router.replace("/faculty");
    }
  }, [isSchool, isBlockedPath, loading, router]);

  if (isBlockedPath && (loading || isSchool)) {
    return null;
  }

  return (
    <div className="flex">
      <div className="flex flex-col w-[100%]">
        <div className="h-auto bg-[#F4F4F4] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
