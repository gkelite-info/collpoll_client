"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Eye,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/app/utils/context/UserContext";
import { getClassResultDetails } from "@/lib/helpers/faculty/results/getClassResultDetails";
import {
  isStrictlySchoolAssigned,
  isStrictlySchoolOrInterAssigned,
} from "@/lib/helpers/admin/academicSetup/schoolHelper";

export default function ClassResultDetails() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year = searchParams.get("year") || "3rd Year";
  const section = searchParams.get("section") || "A";
  const totalStudents = Number(searchParams.get("students")) || 0;
  const branch = searchParams.get("branch") || "N/A";
  const subject = searchParams.get("subject") || "N/A";
  const sectionId = Number(searchParams.get("sectionId"));
  const academicYearId = Number(searchParams.get("academicYearId"));
  const semesterId = Number(searchParams.get("semesterId")) || 1;
  const scheduleIdParam = searchParams.get("collegeExamScheduleId");
  const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    sections: facultySections,
  } = useFaculty();

  const { collegeEducationType } = useUser();

  const targetSubjectId = facultySections?.find(
    (s) => s.faculty_subject?.subjectName === subject && s.collegeSectionsId === sectionId
  )?.collegeSubjectId;

  const isSchool = isStrictlySchoolAssigned(collegeEducationType);
  const isSchoolOrInter = isStrictlySchoolOrInterAssigned(collegeEducationType);
  const isInter = isSchoolOrInter && !isSchool; // Only Inter

  const { data, isLoading } = useQuery({
    queryKey: [
      "classResultDetails",
      collegeId,
      collegeEducationId,
      collegeBranchId,
      sectionId,
      academicYearId,
      year,
      subject,
      semesterId,
      scheduleId,
      currentPage,
    ],
    queryFn: () =>
      getClassResultDetails(
        collegeId!,
        collegeEducationId!,
        collegeBranchId || null,
        sectionId,
        academicYearId,
        year,
        subject,
        null, // Force backend to resolve exactly like upload
        semesterId,
        isSchool,
        scheduleId,
        currentPage,
        itemsPerPage
      ),
    enabled: !!collegeId && !!collegeEducationId && !!sectionId && !!academicYearId,
  });

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("year");
    params.delete("section");
    params.delete("students");
    params.delete("branch");
    params.delete("subject");
    params.delete("sectionId");
    params.delete("academicYearId");
    params.delete("collegeExamScheduleId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleViewResult = (row: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "grades");
    params.set("examType", row.examType);
    params.set("semester", row.semester);
    params.set("semesterId", String(row.semesterId));
    params.set("collegeExamScheduleId", row.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Table Shimmer implementation matching the exact table columns
  const renderShimmer = () => {
    return Array.from({ length: 4 }).map((_, idx) => (
      <tr key={`shimmer-${idx}`} className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="h-4 bg-gray-200 rounded w-4 mx-auto"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-left">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        {!isSchoolOrInter && (
          <td className="px-6 py-4 whitespace-nowrap text-center">
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </td>
        )}
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="h-8 bg-gray-200 rounded-lg w-24 mx-auto"></div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div>
          <h1 className="text-[#282828] text-2xl font-bold">Class Result Details</h1>
          <p className="text-gray-600 text-sm mt-1">
            View and manage all result uploads for the selected class.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-6">
        <div className="bg-[#E6FBEA] text-[#43C17A] p-4 rounded-full self-start md:self-center mx-auto">
          <GraduationCap size={32} weight="fill" />
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Class Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-1">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Subject</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{subject}</p>
            </div>
            
            {!isSchool && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  {isInter ? "Group" : "Branch"}
                </p>
                <p className="text-sm font-bold text-gray-800 mt-1">{branch}</p>
              </div>
            )}
            
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Year</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{year}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Section</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{section}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Students</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-[#43C17A]">
          Previous Uploads History
        </h2>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[500px] min-h-[300px] custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA] sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Examination Type
                </th>
                
                {!isSchoolOrInter && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                )}
                
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Uploaded On
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {isLoading ? (
                renderShimmer()
              ) : data && data.items.length > 0 ? (
                data.items.map((row: any, index: number) => {
                  const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">
                        {absoluteIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-xs md:text-sm font-semibold text-gray-800">
                        {row.examType}
                      </td>
                      
                      {!isSchoolOrInter && (
                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-600">
                          {row.semester}
                        </td>
                      )}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-600">
                        {row.uploadedOn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-gray-600">
                        {row.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {row.status === "Published" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
                            <CheckCircle size={12} weight="fill" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFFDE6] text-[#E5B800]">
                            <WarningCircle size={12} weight="fill" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewResult(row)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white transition-colors shadow-sm cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>View Result</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isSchoolOrInter ? 6 : 7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No history found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
