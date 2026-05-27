"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserCircle, UsersThree, CaretLeft } from "@phosphor-icons/react";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AssignmentTable from "./components/assignmentTable";
import CardComponent, {
  CardProps,
} from "@/app/(screens)/admin/assignments/[departmentId]/subject/[subjectId]/[assignmentId]/components/cardComponent";
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

      const { count: expectedCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("collegeBranchId", data.collegeBranchId)
        .eq("collegeAcademicYearId", data.collegeAcademicYearId)
        .eq("isActive", true);

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

  const cardData: CardProps[] = [
    {
      value: assignment?.submissionDeadlineInt
        ? formatDate(assignment.submissionDeadlineInt)
        : "—",
      label: "Due Date",
      bgColor: "bg-[#E2DAFF]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#714EF2]",
      iconColor: "text-white",
    },
    {
      value: assignment?.marks ? String(assignment.marks) : "—",
      label: "Total Marks",
      bgColor: "bg-[#FFEDDA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#FFBF79]",
      iconColor: "text-white",
    },
    {
      value: assignment ? `${assignment.totalSubmitted}` : "—",
      label: "Total Submissions",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#43C17A]",
      iconColor: "text-white",
    },
  ];

  return (
    <main className="px-4 py-4 max-md:pb-20 min-h-screen bg-[#F3F6F9]">
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

      <section className="flex flex-col lg:flex-row items-stretch gap-4 w-full mb-3">
        <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-[100px] md:h-[142px] bg-gray-200 rounded-xl relative overflow-hidden animate-pulse"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              ))}
            </>
          ) : (
            cardData.map((item, index) => (
              <div key={index} className="flex-1 w-full">
                <CardComponent {...item} />
              </div>
            ))
          )}
        </div>
        <div className="hidden lg:block flex-[1.6]">
          <WorkWeekCalendar style="h-full" />
        </div>
      </section>

      <section className="w-full overflow-x-auto scrollbar-hide pb-2">
        <AssignmentTable
          assignmentId={assignmentId as string}
          parentLoading={loading}
          assignmentExists={!!assignment}
        />
      </section>
    </main>
  );
}
