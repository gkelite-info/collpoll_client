"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserCircle, UsersThree, CaretLeft } from "@phosphor-icons/react";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AssignmentTable from "./components/assignmentTable";
import CardComponent from "@/app/utils/card";
import { supabase } from "@/lib/supabaseClient";

function formatDate(value: number | string) {
  if (!value) return "";
  const str = value.toString();
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`;
  }
  return str.includes("/") ? str : str;
}

export default function AdminAssignmentDetailPage() {
  const { assignmentId } = useParams();
  const router = useRouter();

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) fetchAssignmentDetails();
  }, [assignmentId]);

  async function fetchAssignmentDetails() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("assignmentId", assignmentId)
        .single();

      if (error) {
        setAssignment(null);
        return;
      }

      const { count: submittedCount } = await supabase
        .from("student_assignments_submission")
        .select("*", { count: "exact", head: true })
        .eq("assignmentId", assignmentId);

      let expectedQuery = supabase
        .from("students")
        .select(
          "studentId, student_academic_history!inner(collegeAcademicYearId, collegeSectionsId)",
          { count: "exact", head: true }
        )
        .eq("isActive", true)
        .is("deletedAt", null);

      if (data.collegeAcademicYearId) {
        expectedQuery = expectedQuery.eq(
          "student_academic_history.collegeAcademicYearId",
          data.collegeAcademicYearId
        );
      }

      if (data.collegeSectionsId) {
        expectedQuery = expectedQuery.eq(
          "student_academic_history.collegeSectionsId",
          data.collegeSectionsId
        );
      }

      if (data.collegeBranchId && Number(data.collegeBranchId) > 0) {
        expectedQuery = expectedQuery.eq(
          "collegeBranchId",
          data.collegeBranchId
        );
      }

      expectedQuery = expectedQuery
        .eq("student_academic_history.isCurrent", true)
        .is("student_academic_history.deletedAt", null);

      const { count: expectedCount } = await expectedQuery;

      setAssignment({
        ...data,
        totalSubmitted: submittedCount || 0,
        totalSubmissionsExpected: expectedCount || 0,
      });
    } catch (err) {
      console.error("Error fetching detail stats:", err);
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }

  const cardData = [
    {
      value: assignment?.submissionDeadlineInt
        ? formatDate(assignment.submissionDeadlineInt)
        : "—",
      label: "Due Date",
      bgColor: "bg-[#E2DAFF]",
      icon: <UsersThree size={20} weight="fill" className="text-white" />,
      iconBgColor: "#714EF2",
    },
    {
      value: assignment?.marks ? String(assignment.marks) : "—",
      label: "Total Marks",
      bgColor: "bg-[#FFEDDA]",
      icon: <UsersThree size={20} weight="fill" className="text-white" />,
      iconBgColor: "#FFBF79",
    },
    {
      value: assignment ? `${assignment.totalSubmitted}` : "—",
      label: "Total Submissions",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle size={20} weight="fill" className="text-white" />,
      iconBgColor: "#43C17A",
    },
  ];

  return (
    <main className="px-4 py-4 max-md:pb-20 min-h-screen">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.back()}
              className="hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
              title="Back"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Assignments</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Reviewing submission stats and evaluating student work.
          </p>
        </div>
        <div className="hidden lg:block">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </div>
      </section>

      <section className="flex flex-col lg:flex-row items-start gap-4 w-full mb-3">
        <div className="flex flex-col md:flex-row gap-4 flex-[1.8] min-w-0 w-full md:h-40">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-[120px] md:h-40 bg-gray-200 rounded-2xl relative overflow-hidden animate-pulse"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              ))}
            </>
          ) : (
            cardData.map((item, index) => (
              <div key={index} className="flex-1 min-w-0 h-full">
                <CardComponent
                  icon={item.icon}
                  value={item.value}
                  label={item.label}
                  iconBgColor={item.iconBgColor}
                  style={`${item.bgColor} w-full !h-40 !rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm`}
                  textSize="whitespace-nowrap"
                  iconStyle="w-10 h-10 rounded-xl"
                />
              </div>
            ))
          )}
        </div>
        <div className="hidden lg:block flex-[1.2] min-w-0 h-40">
          <WorkWeekCalendar style="!h-40 w-full !max-w-none" />
        </div>
      </section>

      <section className="w-full pb-2">
        <AssignmentTable
          assignmentId={assignmentId as string}
          parentLoading={loading}
          assignmentExists={!!assignment}
          totalMarks={Number(assignment?.marks) || 0}
        />
      </section>
    </main>
  );
}
