"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProfileSteps from "./profileSteps";
import ProfilePersonalDetails from "./profilePersonalDetails";
import PersonalDetails from "./resume/personalDetails";
import ProfileEducationSection from "./profileEducation/Education";
import EducationSection from "./resume/Education/Education";
import KeySkillsWithModal from "./resume/KeySkills/keySkills";
import Languages from "./resume/languages";
import Internships from "./resume/Internships/internships";
import ProjectsForm from "./resume/Projects/ProjectsForm";
import ProfileSummary from "./resume/ProfileSummary";
import Accomplishments from "./resume/Accomplishments/Accomplishments";
import CompetetiveExams from "./resume/CompetetiveExams";
import Employment from "./resume/Employment/Employment";
import AcademicAchievements from "./resume/AcademicAchievements";
import ResumeSteps from "./resumeSteps";
import { useUser } from "../utils/context/UserContext";
import { useEffect } from "react";
import { canAccessResume } from "@/lib/helpers/profile/profileRouteConfig";

export default function ProfileClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isProfileMode = searchParams.has("profile");
  const currentView = isProfileMode ? "profile" : "resume";
  const currentStep = searchParams.get(currentView) || "personal-details";

  const { role } = useUser();
  const showResumeTabs = canAccessResume(role as any);

  useEffect(() => {
    // If page loads without query params and user can access resume, default to resume
    // Otherwise, if no resume access, allow profile mode to be the default
    const hasQueryParams = searchParams.toString().length > 0;
    if (!hasQueryParams && showResumeTabs && role) {
      const params = new URLSearchParams();
      params.set("resume", "personal-details");
      router.push(`${pathname}?${params.toString()}&Step=1`);
    }
  }, [role, showResumeTabs, pathname, router])

  const handleViewToggle = (targetView: string) => {
    const params = new URLSearchParams();

    params.set(targetView, "personal-details");
    router.push(`${pathname}?${params.toString()}&Step=1`);
  };

  const renderContent = () => {
    switch (currentStep) {
      case "personal-details":
        return isProfileMode ? <ProfilePersonalDetails /> : <PersonalDetails />;

      case "education":
        return isProfileMode ? <ProfileEducationSection /> : <EducationSection />;

      case "key-skills":
        return <KeySkillsWithModal />;

      case "languages":
        return <Languages />;

      case "internships":
        return <Internships />;

      case "projects":
        return <ProjectsForm />;

      case "profile-summary":
        return <ProfileSummary />;

      case "accomplishments":
        return <Accomplishments />;

      case "competitive-exams":
        return <CompetetiveExams />;

      case "employment":
        return <Employment />;

      case "academic-achievements":
        return <AcademicAchievements />;

      default:
        return isProfileMode ? <ProfilePersonalDetails /> : <PersonalDetails />;
    }
  };

  if (!role) return null;

  return (
    <div className="flex flex-col flex-1 h-[85vh] p-2">
      <div className="flex-none mb-4">
        {isProfileMode ? (
          <ProfileSteps key="profile-stepper" />
        ) : (
          <ResumeSteps key="resume-stepper" />
        )}
      </div>
      <p className="mt-3 mb-1 text-[#282828] font-normal">
        <span
          onClick={() => handleViewToggle("profile")}
          className={`cursor-pointer transition-colors ${isProfileMode
            ? "text-[#43C17A] font-medium"
            : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Profile
        </span>
        {showResumeTabs && (
          <>
            <span className="mx-1 text-gray-400"> / </span>
            <span
              onClick={() => handleViewToggle("resume")}
              className={`cursor-pointer transition-colors ${!isProfileMode
                ? "text-[#43C17A] font-medium"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Resume
            </span>
          </>
        )}

      </p>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
        {renderContent()}
      </div>
    </div>
  );
}