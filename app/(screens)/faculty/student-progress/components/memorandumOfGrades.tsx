"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useUser } from "@/app/utils/context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { getMemorandumOfGrades } from "@/lib/helpers/faculty/results/getMemorandumOfGrades";
import {
  isStrictlySchoolAssigned,
  isStrictlySchoolOrInterAssigned,
} from "@/lib/helpers/admin/academicSetup/schoolHelper";

export default function MemorandumOfGrades() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const examType = searchParams.get("examType") || "Mid Term";
  const semester = searchParams.get("semester") || "I Semester";
  const subjectParam = searchParams.get("subject") || "N/A";
  const yearParam = searchParams.get("year") || "N/A";
  const [collegeName, setCollegeName] = useState("");
  const [bannerUrl, setBannerUrl] = useState("/college_banner.png");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const collegeAbbreviation = useMemo(() => {
    if (!collegeName) return "CO";
    return collegeName
      .split(/\s+/)
      .map(w => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [collegeName]);

  const subtitleText = useMemo(() => {
    if (!semester || semester.toLowerCase() === "general" || semester.toUpperCase() === "N/A" || semester === "null" || semester === "-") {
      return `Previewing results data for ${examType}`;
    }
    return `Previewing results data for ${semester} (${examType})`;
  }, [semester, examType]);

  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    college_branch,
    sections: facultySections,
  } = useFaculty();

  const { collegeEducationType: userEducationType } = useUser();

  const sectionId = Number(searchParams.get("sectionId"));
  
  const targetSection = facultySections?.find(
    (s) => s.faculty_subject?.subjectName === subjectParam && s.collegeSectionsId === sectionId
  );
  
  const targetSubjectId = targetSection?.collegeSubjectId;

  const currentEducationType = targetSection?.faculty_edu_type?.collegeEducationType || userEducationType;
  
  const isSchool = isStrictlySchoolAssigned(currentEducationType);
  const isSchoolOrInter = isStrictlySchoolOrInterAssigned(currentEducationType);
  const isInter = isSchoolOrInter && !isSchool; // Only Inter

  const branchParam = searchParams.get("branch") || targetSection?.college_branch?.collegeBranchCode || college_branch || "N/A";

  const academicYearId = Number(searchParams.get("academicYearId"));
  const semesterIdNum = Number(searchParams.get("semesterId") || 1);
  const scheduleIdParam = searchParams.get("collegeExamScheduleId");
  const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Header data fetch can stay client side since it's just static UI images
  useEffect(() => {
    if (!collegeId) return;
    async function loadHeader() {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: colData } = await supabase
        .from("colleges")
        .select("collegeName")
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .maybeSingle();
      if (colData?.collegeName) {
        setCollegeName(colData.collegeName);
      }

      const { data: mediaData } = await supabase
        .from("college_media")
        .select("bannerUrl, logoUrl")
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .maybeSingle();
      if (mediaData) {
        if (mediaData.bannerUrl) setBannerUrl(mediaData.bannerUrl);
        if (mediaData.logoUrl) setLogoUrl(mediaData.logoUrl);
      }
    }
    loadHeader();
  }, [collegeId]);


  const { data, isLoading } = useQuery({
    queryKey: [
      "memorandumOfGrades",
      collegeId,
      collegeEducationId,
      collegeBranchId,
      sectionId,
      academicYearId,
      semesterIdNum,
      subjectParam,
      scheduleId,
      currentPage,
    ],
    queryFn: () =>
      getMemorandumOfGrades(
        collegeId!,
        collegeEducationId!,
        collegeBranchId || null,
        sectionId,
        academicYearId,
        semesterIdNum,
        subjectParam,
        null, // Force backend to resolve exactly like upload
        scheduleId,
        facultySections,
        currentPage,
        itemsPerPage,
        isSchool
      ),
    enabled: !!collegeId && !!collegeEducationId && !!sectionId && !!academicYearId,
  });

  const tableColumns = [
    { title: "Student ID", key: "studentId" },
    { title: "Student Name", key: "studentName" },
    { title: "Subject Code", key: "subjectCode" },
    { title: "Grade Secured", key: "gradeSecured" },
    { title: "Grade Points", key: "gradePoints" },
    { title: "Results", key: "results" },
    { title: "Credits", key: "credits" },
  ];

  const shimmerData = Array.from({ length: 5 }).map((_, i) => ({
    studentId: <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mx-auto" />,
    studentName: <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mx-auto" />,
    subjectCode: <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mx-auto" />,
    gradeSecured: <div className="h-4 bg-gray-200 rounded w-6 animate-pulse mx-auto" />,
    gradePoints: <div className="h-4 bg-gray-200 rounded w-6 animate-pulse mx-auto" />,
    results: <div className="h-5 bg-gray-200 rounded-full w-8 animate-pulse mx-auto" />,
    credits: <div className="h-4 bg-gray-200 rounded w-6 animate-pulse mx-auto" />,
  }));

  const tableDataFormatted = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((row: any) => {
      let gradeColor = "text-gray-700";
      if (row.gradeSecured === "A+" || row.gradeSecured === "A") {
        gradeColor = "text-[#43C17A] font-bold";
      } else if (row.gradeSecured === "F") {
        gradeColor = "text-[#FF3B30] font-bold";
      } else if (row.gradeSecured !== "N/A") {
        gradeColor = "text-blue-700 font-bold";
      }

      const resultBadge =
        row.results === "P" ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
            P
          </span>
        ) : row.results === "F" ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFE0E0] text-[#FF3B30]">
            F
          </span>
        ) : (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
            -
          </span>
        );

      return {
        studentId: (
          <button className="text-[#43C17A] font-bold hover:underline cursor-pointer">
            {row.studentId}
          </button>
        ),
        studentName: (
          <span className="text-gray-800 font-medium">{row.studentName}</span>
        ),
        subjectCode: (
          <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded text-xs font-semibold">
            {row.subjectCode}
          </span>
        ),
        gradeSecured: (
          <span className={gradeColor}>{row.gradeSecured}</span>
        ),
        gradePoints: (
          <span className={`font-semibold ${row.gradeSecured === "F" ? "text-red-600" : "text-gray-700"}`}>
            {row.gradePoints}
          </span>
        ),
        results: resultBadge,
        credits: <span className="text-[#43C17A] font-bold">{row.credits}</span>,
      };
    });
  }, [data]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "details");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full space-y-6">
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm bg-gray-100">
        <Image
          src={bannerUrl}
          alt="College Campus Banner"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="border-[4px] border-[#43C17A] rounded-[18px] bg-black/30 w-16 h-16 flex items-center justify-center text-white font-extrabold text-xl shrink-0 overflow-hidden relative">
              {logoUrl && !logoError ? (
                <Image
                  src={logoUrl}
                  alt="College Logo"
                  fill
                  className="object-contain p-0.5"
                  onError={() => setLogoError(true)}
                  unoptimized
                />
              ) : (
                collegeAbbreviation
              )}
            </div>
            <div className="text-white">
              <h2 className="text-lg md:text-2xl font-extrabold tracking-wide leading-tight">
                {collegeName}
              </h2>
              <p className="text-xs md:text-sm text-green-300 font-medium mt-1">
                Faculty of {subjectParam}
                {isSchool ? (
                  <span>
                    {" "}• {yearParam}
                  </span>
                ) : (
                  <span>
                    {" "}• {isInter ? "Group" : "Branch"} of {branchParam}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
          >
            <ArrowLeft size={24} weight="bold" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#43C17A]">
              Memorandum of Grades
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              {subtitleText}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
            <span className="text-xs md:text-sm font-bold text-gray-700">
              Showing {data?.totalCount || 0} Students
            </span>
          </div>
        </div>

        <div className="px-4 pb-5 pt-3">
          <TableComponent
            columns={tableColumns}
            tableData={isLoading ? shimmerData : tableDataFormatted}
            stickyHeader={true}
          />
          {!isLoading && data?.items.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
                No students found matching the criteria.
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={data?.totalCount || 0}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          roundedBottom="rounded-b-2xl"
          alwaysShow={true}
        />
      </div>
    </div>
  );
}
