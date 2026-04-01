import { getCollegeFromRequest } from "@/lib/college/getCollegeFromRequest";
import { notFound } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const college = await getCollegeFromRequest();
    if (!college) notFound();

    // Add this to prevent cross-portal access after login
    /*
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
       const profile = await getProfile(user.id);
       if (profile.collegeId !== college.collegeId) {
          // Force logout or redirect
       }
    }
    */

    return <>{children}</>;
}