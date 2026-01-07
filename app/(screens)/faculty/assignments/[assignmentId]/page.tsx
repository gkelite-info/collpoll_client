"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { ChartLineDown, UserCircle, UsersThree } from "@phosphor-icons/react";
import AssignmentTable from "./components/assignmentTable";
import CardComponent, {
  CardProps,
} from "../../attendance/components/stuAttendanceCard";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

function formatDate(value: number | string) {
  if (!value) return "";

  const str = value.toString();

  // Case: YYYYMMDD
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`;
  }

  // Case: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split("-");
    return `${day}/${month}/${year}`;
  }

  // Case: Already DD/MM/YYYY
  if (str.includes("/")) return str;

  return str;
}

export default function Page() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    if (assignmentId) fetchAssignmentDetails();
  }, [assignmentId]);

  async function fetchAssignmentDetails() {
    // 1. Fetch assignment from faculty_assignments
    const { data, error } = await supabase
      .from("faculty_assignments")
      .select("*")
      .eq("assignmentId", assignmentId)
      .single();

    if (error) {
      console.error("Error fetching assignment:", error);
      return;
    }

    // 2. Count how many submissions
    const { count: submittedCount } = await supabase
      .from("student_submissions")
      .select("*", { count: "exact", head: true })
      .eq("assignmentId", assignmentId);

    // 3. Merge the count into assignment object
    setAssignment({
      ...data,
      totalSubmitted: submittedCount || 0,
    });
  }


  // While loading data
  if (!assignment) {
    return <p className="p-6 text-gray-600">Loading assignment...</p>;
  }

  // Build card data AFTER assignment is loaded
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
      value: assignment.totalMarks || "—",
      label: "Total Marks",
      bgColor: "bg-[#FFEDDA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#FFBF79]",
      iconColor: "text-white",
    },
    {
      value: `${assignment.totalSubmitted || 0}/${assignment.totalSubmissionsExpected || 0}`,
      label: "Total Submissions",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#43C17A]",
      iconColor: "text-white",
    },
  ];

  return (
    <main className="px-4 py-4 min-h-screen">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and evaluate assignments for your students efficiently
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" />
      </section>
      <section className=" flex flex-row items-stretch gap-4 w-full mb-3">
        {cardData.map((item, index) => (
          <div key={index} className="flex-1">
            <CardComponent {...item} />
          </div>
        ))}
        <div className="bg-green-400 flex-[1.6]">
          <WorkWeekCalendar style="h-full" />
        </div>
      </section>

      <section>
        <AssignmentTable />
      </section>
    </main>
  );
}
