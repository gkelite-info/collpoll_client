"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import toast from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { collegeEducationType, loading } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  useEffect(() => {
    if (loading) return;
    if (isSchool) {
      if (pathname === "/admin/clubs" || pathname === "/admin/placements" || pathname.startsWith("/admin/clubs/") || pathname.startsWith("/admin/placements/")) {
        toast.error("This feature is not available for schools", {
          id: "school-feature-restricted",
        });
        router.replace("/admin");
      }
    }
  }, [pathname, isSchool, loading, router]);

  return (
    <div className="flex">
      <div className="flex flex-col w-[100%]">
        <div className="h-auto bg-[#F4F4F4] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
