"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import ProfileSteps from "./profileSteps";
import ProfileInfo from "./profileInfo";
import ProfilePersonalDetails from "./profilePersonalDetails";
import PersonalDetails from "./resume/personalDetails";
import ProfileEducationSection from "./profileEducation/Education";
import EducationSection from "./resume/Education/Education";
import ProfileKeySkills from "./profileKeySkills/keySkills";
import KeySkillsWithModal from "./resume/KeySkills/keySkills";
import ProfileLanguages from "./profileLanguages";
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
import { Loader } from "../(screens)/(student)/calendar/right/timetable";
import StudentProfileSummary from "./studentProfileSummary";

export default function ProfileClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isProfileMode = searchParams.has("profile");
  const currentView = isProfileMode ? "profile" : "resume";
  const currentStep = searchParams.get(currentView) || "personal-details";

  const { role } = useUser();
  const showResumeTabs = canAccessResume(role as any);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (role !== undefined) {
      setRoleChecked(true);
    }
  }, [role]);

  useEffect(() => {
    if (!roleChecked || role === undefined) return;
    const resumeParam = searchParams.get("resume");
    
    const isStudent = role === "Student";
    if (resumeParam && !isStudent) {
      const params = new URLSearchParams();
      params.set("profile", "personal-details");
      router.push(`${pathname}?${params.toString()}&Step=1`);
    }
  }, [roleChecked, role, pathname, router, searchParams.get("resume")]);

  useEffect(() => {
    if (!roleChecked || role === undefined) return;
    const hasQueryParams = searchParams.toString().length > 0;
    if (!hasQueryParams) {
      const isStudent = role === "Student";
      const defaultMode = isStudent ? "resume" : "profile";
      const defaultStep = defaultMode === "profile" ? "profile" : "personal-details";
      const params = new URLSearchParams();
      params.set(defaultMode, defaultStep);
      params.set("Step", defaultMode === "profile" ? "1" : "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [roleChecked, role, pathname, router, searchParams.toString()]);

  const handleViewToggle = (targetView: string) => {
    const params = new URLSearchParams();
    const defaultStep = targetView === "profile" ? "profile" : "personal-details";
    params.set(targetView, defaultStep);
    router.push(`${pathname}?${params.toString()}&Step=${targetView === "profile" ? "1" : "1"}`);
  };

  const renderContent = () => {
    switch (currentStep) {
      case "profile":
        return <ProfileInfo />;

      case "personal-details":
        return isProfileMode ? <ProfilePersonalDetails /> : <PersonalDetails />;

      case "education":
        return isProfileMode ? <ProfileEducationSection /> : <EducationSection />;

      case "key-skills":
        return isProfileMode ? <ProfileKeySkills /> : <KeySkillsWithModal />;

      case "languages":
        return isProfileMode ? <ProfileLanguages /> : <Languages />;

      case "internships":
        return <Internships />;

      case "projects":
        return <ProjectsForm />;

      case "profile-summary":
        return isProfileMode ? <StudentProfileSummary/> : <ProfileSummary /> 

      case "accomplishments":
        return <Accomplishments />;

      case "competitive-exams":
        return <CompetetiveExams />;

      case "employment":
        return <Employment />;

      case "academic-achievements":
        return <AcademicAchievements />;

      default:
        return isProfileMode ? <ProfileInfo /> : <PersonalDetails />;
    }
  };

  if (!roleChecked) {
    return (
      <div className="flex justify-center items-center h-[85vh]">
        <div className="text-center">
          <Loader />
        </div>
      </div>
    );
  }

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