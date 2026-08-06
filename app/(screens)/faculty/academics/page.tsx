"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SubjectCard from "./components/subjectCards";
import { useUser } from "@/app/utils/context/UserContext";
import { useState, useEffect } from "react";
import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";
import { getFacultySubjectsPaginated } from "@/lib/helpers/faculty/getFacultySubjectsPaginated";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import AcademicsSkeleton from "./components/academicsSkeleton";
import toast, { Toaster } from "react-hot-toast";

export default function Academics() {
  const { userId, collegeId, role, loading: userLoading } = useUser();

  // Filter + pagination state
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Load faculty context once with React Query
  const { 
    data: facultyCtx, 
    isLoading: isCtxLoading, 
    isError: isCtxError 
  } = useQuery({
    queryKey: ["facultyContext", userId],
    queryFn: () => fetchFacultyContext(userId!),
    enabled: !userLoading && userId !== null && collegeId !== null,
    staleTime: 5 * 60 * 1000,
  });

  const ctxLoading = userLoading || isCtxLoading;

  useEffect(() => {
    if (isCtxError) {
      toast.error("Faculty data missing. Please check your assignment.", { id: "faculty-ctx-error" });
    } else if (!ctxLoading && userId && !facultyCtx) {
      toast.error("Faculty data missing. Please check your assignment.", { id: "faculty-ctx-error" });
    }
  }, [isCtxError, ctxLoading, facultyCtx, userId]);

  // React Query for subjects with server-side pagination
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isFetching: subjectsFetching,
  } = useQuery({
    queryKey: [
      "facultySubjectsPaginated",
      collegeId,
      facultyCtx?.collegeEducationId,
      facultyCtx?.collegeBranchId,
      subjectId,
      sectionId,
      page,
      itemsPerPage,
    ],
    queryFn: () =>
      getFacultySubjectsPaginated({
        collegeId: collegeId!,
        facultyId: facultyCtx!.facultyId,
        collegeEducationId: facultyCtx!.collegeEducationId,
        collegeBranchId: facultyCtx!.collegeBranchId,
        academicYearIds: facultyCtx!.academicYearIds,
        subjectIds: facultyCtx!.subjectIds,
        sectionIds: facultyCtx!.sectionIds,
        subjectId,
        sectionId,
        page,
        limit: itemsPerPage,
      }),
    enabled: !!facultyCtx && !!collegeId && (facultyCtx.subjectIds?.length > 0),
    placeholderData: keepPreviousData,
  });

  const subjects = subjectsData?.data ?? [];
  const totalCount = subjectsData?.totalCount ?? 0;
  
  const shouldFetchSubjects = !!facultyCtx && !!collegeId && (facultyCtx.subjectIds?.length > 0);
  
  // Only show shimmer if we are strictly loading context OR if we should fetch data but don't have it yet.
  // This prevents the "No classes" text from flashing while React Query transitions states.
  const isLoading = ctxLoading || (shouldFetchSubjects && !subjectsData);
  const isDataFetching = subjectsFetching;

  // Reset page when filters change
  const handleSubjectChange = (val: number | null) => {
    setSubjectId(val);
    setSectionId(null);
    setPage(1);
  };

  const handleSectionChange = (val: number | null) => {
    setSectionId(val);
    setPage(1);
  };

  return (
    <div className="p-2 flex flex-col h-[calc(100vh-80px)] lg:pb-5">
      <div className="flex justify-between items-center mb-5 max-md:flex-col max-md:items-start max-md:mb-4">
        <div className="flex flex-col w-[50%] max-md:w-full">
          <h1 className="text-[#282828] font-semibold text-2xl max-md:text-[28px] max-md:font-bold mb-1">
            My Classes
          </h1>
          <p className="text-[#282828] text-sm hidden lg:block">
            Track progress, add lessons and manage course content across all
            your batches.
          </p>
          <p className="text-[#282828] text-sm lg:hidden">
            Track progress, add lessons and manage course content
          </p>
        </div>

        <div className="flex justify-end w-[32%] max-md:hidden">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 flex-1 overflow-y-auto pr-2">
          <AcademicsSkeleton />
        </div>
      ) : !facultyCtx || !facultyCtx.subjectIds?.length ? (
        <div className="mt-4 flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center">
            No classes assigned
          </p>
        </div>
      ) : (
        <div className="mt-4 flex-1 flex flex-col overflow-y-auto pr-2">
          <SubjectCard
            subjectProps={subjects}
            facultyCtx={facultyCtx}
            role={role}
            totalCount={totalCount}
            page={page}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            loadingData={isDataFetching}
            subjectId={subjectId}
            sectionId={sectionId}
            onSubjectChange={handleSubjectChange}
            onSectionChange={handleSectionChange}
          />
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
}