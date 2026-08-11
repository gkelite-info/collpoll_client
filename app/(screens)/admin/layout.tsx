"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation, isStrictlySchoolAssigned, isStrictlySchoolOrInterAssigned, getRestrictedPlacementsToastMessage } from "@/lib/helpers/admin/academicSetup/schoolHelper";
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
  const hideClubs = isStrictlySchoolAssigned(collegeEducationType);
  const hidePlacements = isStrictlySchoolOrInterAssigned(collegeEducationType);

  const isClubsPath = pathname === "/admin/clubs" || pathname.startsWith("/admin/clubs/");
  const isPlacementsPath = pathname === "/admin/placements" || pathname.startsWith("/admin/placements/");
  const isWellbeingPath = pathname === "/admin/wellbeing" || pathname.startsWith("/admin/wellbeing/");

  useEffect(() => {
    if (loading) return;
    
    if (hideClubs && isClubsPath) {
      toast.error("Schools do not have access to this module.", { id: "school-feature-restricted" });
      router.replace("/admin");
    } else if (hidePlacements && isPlacementsPath) {
      toast.error(getRestrictedPlacementsToastMessage(collegeEducationType), { id: "placement-feature-restricted" });
      router.replace("/admin");
    } else if (isSchool && isWellbeingPath) {
      toast.error("Schools do not have access to this module.", { id: "school-feature-restricted" });
      router.replace("/admin");
    }
  }, [isSchool, hideClubs, hidePlacements, isClubsPath, isPlacementsPath, isWellbeingPath, loading, router, collegeEducationType]);

  if (loading || (hideClubs && isClubsPath) || (hidePlacements && isPlacementsPath) || (isSchool && isWellbeingPath)) {
    return null;
  }

  return (
    <div className="flex">
      <div className="flex flex-col w-[100%]">
        <div className="h-auto bg-[#F4F4F4] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
