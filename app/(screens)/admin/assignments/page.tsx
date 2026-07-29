"use client";
import {
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchAdminAllEducationStats,
  fetchAdminDepartmentStats,
} from "@/lib/helpers/admin/assignments/fetchAdminDepartmentStats";
import AssignmentCard from "./components/assignmentCard";
import QuizBasic from "./components/quizBasic";
import DiscussionForumBasic from "./components/discussionForumBasic";
import AdminLabBasic from "./components/adminLabBasic";
import TabNavigation from "./components/tabNavigation";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { Loader } from "../../(student)/calendar/right/timetable";
import { DiscussionCourseCardSkeleton } from "./components/shimmers/courseCardSkeleton";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

import { AssignmentPageShimmer } from "./components/shimmers/AssignmentPageShimmer";
import { Pagination } from "../academic-setup/components/pagination";
import { FilterDropdown } from "../academics/components/filterDropdown";

// FilterDropdown removed as we will use inline selects matching Calendar UI
let rememberedEducationId = "All";

const AssignmentPage = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "assignments";

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const { collegeId, collegeEducationType: defaultEducationType } = useAdmin();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [uniqueDepts, setUniqueDepts] = useState<string[]>(["All"]);
  const [uniqueYears, setUniqueYears] = useState<string[]>(["All"]);
  const cardsPerPage = 9;
  const { userId } = useUser();

  const [educations, setEducations] = useState<any[]>([]);
  const [educationFilter, setEducationFilter] = useState(
    rememberedEducationId,
  );

  useEffect(() => {
    if (!collegeId) return;
    let isMounted = true;
    fetchEducations(collegeId)
      .then((res) => {
        if (isMounted && res) setEducations(res);
      })
      .catch(console.error);
    return () => {
      isMounted = false;
    };
  }, [collegeId]);

  const activeEducation =
    educationFilter === "All"
      ? null
      : educations.find(
          (education) =>
            education.collegeEducationId.toString() === educationFilter,
        );
  const currentEducationId = activeEducation?.collegeEducationId ?? null;
  const currentEducationType =
    activeEducation?.collegeEducationType ??
    (educationFilter === "All" ? "" : defaultEducationType);
  const isSchool = isSchoolEducation(currentEducationType);
  const isInter = currentEducationType === "Inter";
  const isWaitingForEducation =
    !userId || !collegeId || educations.length === 0;
  const showShimmer = isWaitingForEducation || loading;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, deptFilter, yearFilter, educationFilter]);

  useEffect(() => {
    if (!userId || !collegeId || educations.length === 0) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        if (!isMounted) return;

        const res =
          educationFilter === "All"
            ? await fetchAdminAllEducationStats(
                collegeId,
                educations.map((education) => education.collegeEducationId),
                currentPage,
                cardsPerPage,
                debouncedSearch,
                deptFilter,
                yearFilter,
              )
            : await fetchAdminDepartmentStats(
                collegeId,
                currentEducationId!,
                currentPage,
                cardsPerPage,
                debouncedSearch,
                deptFilter,
                yearFilter,
              );

        if (isMounted) {
          setDataList(res.data || []);
          setTotalRecords(res.totalCount || 0);

          if (res.uniqueDepts) setUniqueDepts(res.uniqueDepts);
          if (res.uniqueYears) setUniqueYears(res.uniqueYears);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [userId, currentPage, debouncedSearch, deptFilter, yearFilter, currentEducationId, collegeId, educationFilter, educations]);

  const totalPages = Math.ceil(totalRecords / cardsPerPage);

  if (activeTab === "quiz") {
    return <QuizBasic />;
  }

  if (activeTab === "discussion") {
    return <DiscussionForumBasic />;
  }

  if (activeTab === "lab") {
    return <AdminLabBasic />;
  }

  if (isWaitingForEducation && dataList.length === 0) {
    return (
      <div className="flex flex-col m-4 h-[calc(100vh-100px)]">
        <TabNavigation />
        <AssignmentPageShimmer />
      </div>
    );
  }

  return (
    <div className="flex flex-col m-4 h-[calc(100vh-100px)]">
      <TabNavigation />

      <div className="mt-0 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-[50%]">
          <input
            type="text"
            placeholder="Search here......"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-black h-11 pl-5 pr-12 rounded-full bg-[#EAEAEA] text-sm outline-none"
          />
          <MagnifyingGlass
            size={22}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E]"
            weight="bold"
          />
        </div>

        <div className="bg-white rounded-xl p-2 px-4 shadow-sm flex flex-wrap gap-4 border border-gray-100">
          <FilterDropdown
            label="Education Type"
            value={educationFilter}
            onChange={(val) => {
              rememberedEducationId = val;
              setEducationFilter(val);
              setDeptFilter("All");
              setYearFilter("All");
            }}
            options={["All", ...educations.map((e) => e.collegeEducationId.toString())]}
            displayModifier={(val) => {
              if (val === "All") return "All";
              const edu = educations.find((e) => e.collegeEducationId.toString() === val);
              return edu ? edu.collegeEducationType : val;
            }}
          />

          {!isSchool && (
            <FilterDropdown
              label={isInter ? "Group" : "Branch"}
              value={deptFilter}
              onChange={setDeptFilter}
              options={uniqueDepts}
            />
          )}

          <FilterDropdown
            label={isSchool ? "Class" : "Year"}
            value={yearFilter}
            onChange={setYearFilter}
            options={uniqueYears}
          />
        </div>
      </div>

      <div className="flex-1 rounded-xl flex flex-col p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {showShimmer ? (
            <>
              <DiscussionCourseCardSkeleton />
              <DiscussionCourseCardSkeleton />
              <DiscussionCourseCardSkeleton />
              <DiscussionCourseCardSkeleton />
              <DiscussionCourseCardSkeleton />
              <DiscussionCourseCardSkeleton />
            </>
          ) : (
            dataList.map((dept) => (
              <AssignmentCard key={dept.id} {...dept} />
            ))
          )}
        </div>

        {!showShimmer && totalPages > 0 && (
          <div className="mt-auto pt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalItems={totalRecords}
              itemsPerPage={cardsPerPage}
              onPageChange={setCurrentPage}
              alwaysShow={true}
            />
          </div>
        )}
        {!showShimmer && dataList.length === 0 && (
          <div className="flex justify-center py-20 text-gray-400">
            No matching records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-full text-center py-10">
          <Loader />
        </div>
      }
    >
      <AssignmentPage />
    </Suspense>
  );
}
