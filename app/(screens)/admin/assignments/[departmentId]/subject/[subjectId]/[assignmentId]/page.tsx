"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CaretLeft, UserCircle, UsersThree } from "@phosphor-icons/react";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AssignmentTable from "./components/assignmentTable";
import CardComponent, { CardProps } from "./components/cardComponent";

function formatDate(value: number | string) {
  if (!value) return "";
  const str = value.toString();
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`;
  }
  return str.includes("/") ? str : str;
}

export default function AdminAssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();

  const assignmentId = Array.isArray(params?.assignmentId)
    ? Number(params.assignmentId[0])
    : Number(params?.assignmentId);

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
        .eq("is_deleted", false)
        .single();

      if (error) throw error;

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
    } finally {
      setLoading(false);
    }
  }

  const cardData: CardProps[] = assignment
    ? [
        {
          value: assignment.submissionDeadlineInt
            ? formatDate(assignment.submissionDeadlineInt)
            : "—",
          label: "Deadline",
          bgColor: "bg-[#E2DAFF]",
          icon: <UsersThree />,
          iconBgColor: "bg-[#714EF2]",
          iconColor: "text-white",
        },
        {
          value: assignment.marks || "—",
          label: "Total Marks",
          bgColor: "bg-[#FFEDDA]",
          icon: <UsersThree />,
          iconBgColor: "bg-[#FFBF79]",
          iconColor: "text-white",
        },
        {
          value: `${assignment.totalSubmitted}`,
          label: "Total Submissions",
          bgColor: "bg-[#E6FBEA]",
          icon: <UserCircle />,
          iconBgColor: "bg-[#43C17A]",
          iconColor: "text-white",
        },
      ]
    : [];

  return (
    <main className="px-4 py-4 min-h-screen bg-[#F3F6F9]">
      <section className="flex mb-4 items-center justify-between">
        <div className="flex text-black items-start gap-2">
          <button
            onClick={() => router.back()}
            className="mt-1 text-gray-600 cursor-pointer hover:text-black"
          >
            <CaretLeft size={25} weight="bold" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-sm text-gray-500 mt-1">
              Reviewing submission stats and evaluating student work.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-row items-stretch gap-4 w-full mb-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 bg-white border border-gray-100 rounded-md shadow-sm p-3 flex flex-col gap-6 h-[130px] animate-pulse"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-200"></div>
                <div>
                  <div className="h-6 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </>
        ) : assignment ? (
          cardData.map((item, index) => (
            <div key={index} className="flex-1">
              <CardComponent {...item} />
            </div>
          ))
        ) : (
          <div className="flex-1 text-gray-400 text-sm py-4">
            No assignment data found.
          </div>
        )}

        <div className="flex-[1.6]">
          <WorkWeekCalendar style="h-full" />
        </div>
      </section>

      <section>
        <AssignmentTable assignmentId={assignmentId.toString()} />
      </section>
    </main>
  );
}
