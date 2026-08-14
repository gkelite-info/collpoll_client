"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CourseCard from "../components/courseCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { fetchAdminSubjectDetails } from "@/lib/helpers/admin/assignments/fetchAdminSubjectDetails";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { DiscussionDeptCardSkeleton } from "../components/shimmers/DiscussionDeptCardSkeleton";
import { DiscussionCourseCardSkeleton } from "../components/shimmers/courseCardSkeleton";
import { useUser } from "@/app/utils/context/UserContext";
import { FilterDropdown } from "../../academics/components/filterDropdown";

const ITEMS_PER_PAGE = 12;

const DepartmentSubjectPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId } = useUser();

  const departmentId = decodeURIComponent(params.departmentId as string);
  const year = searchParams.get("year") || "1";
  const educationIdParam = searchParams.get("educationId");
  const educationId = educationIdParam ? Number(educationIdParam) : undefined;
  const savedPage = Number(searchParams.get("detailsPage"));

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    Number.isInteger(savedPage) && savedPage > 0 ? savedPage : 1,
  );
  const [totalCount, setTotalCount] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState(
    searchParams.get("subject") || "All",
  );
  const [facultyFilter, setFacultyFilter] = useState(
    searchParams.get("faculty") || "All",
  );
  const [subjectOptions, setSubjectOptions] = useState<string[]>(["All"]);
  const [facultyOptions, setFacultyOptions] = useState<string[]>(["All"]);

  const persistFilters = (
    subject: string,
    faculty: string,
    page: number,
  ) => {
    const query = new URLSearchParams(searchParams.toString());
    if (subject === "All") query.delete("subject");
    else query.set("subject", subject);
    if (faculty === "All") query.delete("faculty");
    else query.set("faculty", faculty);
    if (page === 1) query.delete("detailsPage");
    else query.set("detailsPage", page.toString());
    router.replace(
      `/admin/assignments/${encodeURIComponent(departmentId)}?${query.toString()}`,
      { scroll: false },
    );
  };

  useEffect(() => {
    if (!userId) return;
    const loadData = async () => {
      try {
        setLoading(true);

        const adminCtx = await fetchAdminContext(userId);

        const { data, count, subjectOptions, facultyOptions } =
          await fetchAdminSubjectDetails(
          adminCtx.collegeId,
          departmentId,
          year,
          currentPage,
          ITEMS_PER_PAGE,
          educationId,
          subjectFilter,
          facultyFilter,
        );

        setCourses(data || []);
        setTotalCount(count || 0);
        setSubjectOptions(subjectOptions || ["All"]);
        setFacultyOptions(facultyOptions || ["All"]);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [departmentId, year, currentPage, userId, educationId, subjectFilter, facultyFilter]);

  return (
    <div className="flex flex-col m-4 relative min-h-[calc(100vh-120px)]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1">
            <CaretLeftIcon
              size={20}
              className="text-[#282828] cursor-pointer -ml-1 active:scale-90 transition-colors"
              onClick={() => router.back()}
            />
            <h1 className="text-xl font-bold text-[#282828]">
              {departmentId} — {year} Overview
            </h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Detailed view of faculty assignments and subject progress.
          </p>
        </div>
        <div className="w-80">
          <CourseScheduleCard
            department={departmentId}
            year={year}
            isVisibile={false}
          />
        </div>
      </div>

      <div className="mb-5 flex justify-end">
        <div className="flex flex-wrap gap-4 rounded-xl border border-gray-100 bg-white px-4 py-2 shadow-sm">
          <FilterDropdown
            label="Subject"
            value={subjectFilter}
            onChange={(value) => {
              setSubjectFilter(value);
              setFacultyFilter("All");
              setCurrentPage(1);
              persistFilters(value, "All", 1);
            }}
            options={subjectOptions}
          />
          <FilterDropdown
            label="Faculty"
            value={facultyFilter}
            onChange={(value) => {
              setFacultyFilter(value);
              setCurrentPage(1);
              persistFilters(subjectFilter, value, 1);
            }}
            options={facultyOptions}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <DiscussionCourseCardSkeleton />
            <DiscussionCourseCardSkeleton />
            <DiscussionCourseCardSkeleton />
            <DiscussionCourseCardSkeleton />
            <DiscussionCourseCardSkeleton />
            <DiscussionCourseCardSkeleton />
          </div>
        ) : (
          <>
            {courses.length === 0 ? (
              <div className="bg-white p-20 rounded-xl text-center text-gray-400 border border-dashed">
                No active subjects found for this class or branch and year.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {courses.map((course) => (
                    <CourseCard key={course.uniqueId} {...course} />
                  ))}
                </div>

                {totalCount > 0 && (
                  <div className="mt-auto pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalCount}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        persistFilters(subjectFilter, facultyFilter, page);
                      }}
                      alwaysShow
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentSubjectPage;
