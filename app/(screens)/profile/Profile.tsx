"use client";
import { useSearchParams } from "next/navigation";
import AcademicAchievements from "./AcademicAchievements";
import Accomplishments from "./Accomplishments/Accomplishments";
import CompetetiveExams from "./CompetetiveExams";
import EducationSection from "./Education/Education";
import Employment from "./Employment/Employment";
import Internships from "./Interships/internships";
import KeySkills from "./KeySkills/keySkills";
import Languages from "./languages";
import PersonalDetails from "./personalDetails";
import ProfileSteps from "./profileSteps";
import ProfileSummary from "./ProfileSummary";
import ProjectsForm from "./Projects/ProjectsForm";

export default function ProfileClient() {
    const searchParams = useSearchParams();
    const query = searchParams.toString().replace("=", "") ?? "personal-details";
    return (
        <div className="flex flex-col flex-1 h-[85vh] p-2">
            <div><ProfileSteps /></div>
            <p className="mt-3 mb-1 text-[#282828] font-normal"><span className="text-[#43C17A] font-medium">Profile /</span> Resume</p>
            <div className="flex-1">
                {query === "personal-details" && <PersonalDetails />}
                {query === "education" && <EducationSection />}
                {query === "key-skills" && <KeySkills />}
                {query === "languages" && <Languages />}
                {query === "internships" && <Internships />}
                {query === "projects" && <ProjectsForm />}
                {query === "profile-summary" && <ProfileSummary />}
                {query === "accomplishments" && <Accomplishments />}
                {query === "competitive-exams" && <CompetetiveExams />}
                {query === "employment" && <Employment />}
                {query === "academic-achievements" && <AcademicAchievements />}
            </div>
        </div>
    )
}