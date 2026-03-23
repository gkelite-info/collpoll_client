"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CourseCard from "../components/courseCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { fetchAdminSubjectDetails } from "@/lib/helpers/admin/assignments/fetchAdminSubjectDetails";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/faculty/assignments/components/pagination";

const ITEMS_PER_PAGE = 10;

const DepartmentSubjectPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const departmentId = decodeURIComponent(params.departmentId as string);
  const year = searchParams.get("year") || "1";

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (currentPage === 1 && courses.length === 0) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }

        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;

        const { data: userRecord } = await supabase
          .from("users")
          .select("userId")
          .eq("auth_id", auth.user.id)
          .single();

        if (!userRecord) return;

        const adminCtx = await fetchAdminContext(userRecord.userId);

        const { data, count } = await fetchAdminSubjectDetails(
          adminCtx.collegeId,
          departmentId,
          year,
          currentPage,
          ITEMS_PER_PAGE,
        );

        setCourses(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };

    loadData();
  }, [departmentId, year, currentPage]);

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader />
      </div>
    );

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
          <CourseScheduleCard department={departmentId} year={year} isVisibile={false} />
        </div>
      </div>

      <div className="flex flex-col flex-1 relative">
        {isFetchingMore && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
            <div className="w-8 h-8 border-4 border-[#43C17A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white p-20 rounded-xl text-center text-gray-400 border border-dashed">
            No active subjects found for this branch and year.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {courses.map((course) => (
                <CourseCard key={course.uniqueId} {...course} />
              ))}
            </div>

            {totalCount > ITEMS_PER_PAGE && (
              <div className="mt-auto pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentSubjectPage;
