"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export default function CollegeAdminClubGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { collegeEducationType, loading } = useCollegeAdmin();
    const isSchool = isSchoolEducation(collegeEducationType);

    useEffect(() => {
        if (!loading && isSchool) {
            toast.error("Schools do not have access to the Clubs module.");
            router.replace("/college-admin");
        }
    }, [loading, isSchool, router]);

    if (loading || isSchool) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}
