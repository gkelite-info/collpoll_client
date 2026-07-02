"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { collegeCode, loading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    const isAdmissionsAllowed = ["bcca", "bcpgc", "bjcg"].includes(collegeCode?.toLowerCase() || "");
    
    if (!isAdmissionsAllowed) {
      toast.error("Admissions portal is not available for this college.", { id: "unauthorized-admissions" });
      router.replace("/college-admin");
    } else {
      setIsAuthorized(true);
    }
  }, [collegeCode, loading, router]);

  if (loading || !isAuthorized) {
    return <Loader />;
  }

  return <>{children}</>;
}
