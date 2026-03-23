"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import TabNavigation from "./tabNavigation";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { FilterDropdown, MOCK_COURSES, MOCK_DEPTS } from "./filterDropdown";


export default function DiscussionForumBasic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const dept = searchParams.get("dept");
  const year = searchParams.get("year");

  const [yearFilter, setYearFilter] = useState("2nd Year");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "All"];
  const generalOptions = ["All"];

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col m-4">
      <TabNavigation />

      {!dept ? (
        <>
          <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
            <FilterDropdown
              label="Year"
              value={yearFilter}
              options={yearOptions}
              onChange={setYearFilter}
            />
            <FilterDropdown
              label="Section"
              value={sectionFilter}
              options={generalOptions}
              onChange={setSectionFilter}
            />
            <FilterDropdown
              label="Sem"
              value={semFilter}
              options={generalOptions}
              onChange={setSemFilter}
            />
            <FilterDropdown
              label="Subject"
              value={subjectFilter}
              options={generalOptions}
              onChange={setSubjectFilter}
            />
          </div>

          <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
              {MOCK_DEPTS.filter(
                (d) =>
                  (yearFilter === "All" || d.year === yearFilter.charAt(0))
              ).map((deptCard, idx) => (
                <DiscussionDeptCard key={idx} {...deptCard} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[calc(100vh-200px)] rounded-xl flex flex-col">
            <div className="flex items-center gap-1 mb-6">
              <button
                onClick={handleBack}
                className="flex cursor-pointer items-center justify-center p-2 pl-0"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                B.Tech {dept} - Year {year}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
              {MOCK_COURSES.map((course) => (
                <DiscussionCourseCard key={course.id} {...course} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}