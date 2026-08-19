"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation, isStrictlySchoolAssigned, isStrictlySchoolOrInterAssigned, getRestrictedPlacementsToastMessage } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import toast from "react-hot-toast";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { collegeEducationType, loading } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);
  const hideClubs = isStrictlySchoolAssigned(collegeEducationType);
  const hidePlacements = isStrictlySchoolOrInterAssigned(collegeEducationType);

  const isClubsPath = pathname === "/faculty/clubs" || pathname.startsWith("/faculty/clubs/");
  const isPlacementsPath = pathname === "/faculty/placements" || pathname.startsWith("/faculty/placements/");
  const isWellbeingPath = pathname === "/faculty/wellbeing" || pathname.startsWith("/faculty/wellbeing/");

  useEffect(() => {
    if (loading) return;
    
    if (hideClubs && isClubsPath) {
      toast.error("Schools do not have access to this module.", { id: "school-feature-restricted" });
      router.replace("/faculty");
    } else if (hidePlacements && isPlacementsPath) {
      toast.error(getRestrictedPlacementsToastMessage(collegeEducationType), { id: "placement-feature-restricted" });
      router.replace("/faculty");
    } else if (isSchool && isWellbeingPath) {
      toast.error("Schools do not have access to this module.", { id: "school-feature-restricted" });
      router.replace("/faculty");
    }
  }, [isSchool, hideClubs, hidePlacements, isClubsPath, isPlacementsPath, isWellbeingPath, loading, router, collegeEducationType]);

  // We only block rendering (return null) if we are certain the user is restricted.
  // During loading, we allow children to mount so they can display their localized shimmer skeletons!
  if (!loading && ((hideClubs && isClubsPath) || (hidePlacements && isPlacementsPath) || (isSchool && isWellbeingPath))) {
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
