"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserCircle, UsersThree } from "@phosphor-icons/react";

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
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    if (assignmentId) fetchAssignmentDetails();
  }, [assignmentId]);

  async function fetchAssignmentDetails() {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("assignmentId", assignmentId)
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
    }
  }

  if (!assignment)
    return <div className="p-6 text-gray-500">Loading Summary...</div>;

  const cardData: CardProps[] = [
    {
      value: assignment.submissionDeadlineInt
        ? formatDate(assignment.submissionDeadlineInt)
        : "—",
      label: "Due Date",
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
      value: `${assignment.totalSubmitted} `,
      label: "Total Submissions",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#43C17A]",
      iconColor: "text-white",
    },
  ];

  return (
    <main className="px-4 py-4 min-h-screen bg-[#F3F6F9]">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reviewing submission stats and evaluating student work.
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" />
      </section>

      <section className="flex flex-row items-stretch gap-4 w-full mb-3">
        {cardData.map((item, index) => (
          <div key={index} className="flex-1">
            <CardComponent {...item} />
          </div>
        ))}
        <div className="flex-[1.6]">
          <WorkWeekCalendar style="h-full" />
        </div>
      </section>

      <section>
        <AssignmentTable assignmentId={assignmentId as string} />
      </section>
    </main>
  );
}
