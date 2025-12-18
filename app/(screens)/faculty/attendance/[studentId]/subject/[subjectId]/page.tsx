"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import SubjectAttendanceCards from "../../../components/subjectAttendanceCards";
import SubjectAttendanceTable from "../../../components/subjectAttendanceTable";
import { students } from "../../../data";

export default function SubjectDetailPage() {
  const { studentId, subjectId } = useParams<{
    studentId: string;
    subjectId: string;
  }>();

  const [filter, setFilter] = useState<"ALL" | "Present" | "Absent" | "Leave">(
    "ALL"
  );

  const student = useMemo(
    () => students.find((s) => s.id === studentId),
    [studentId]
  );

  const subject = useMemo(
    () => student?.subjects.find((s) => s.subjectId === subjectId),
    [student, subjectId]
  );

  if (!student || !subject) {
    return (
      <div className="p-6 text-sm text-red-500">Invalid student or subject</div>
    );
  }

  const filteredRecords =
    filter === "ALL"
      ? subject.records
      : subject.records.filter((r) => r.status === filter);

  return (
    <main className="p-6 space-y-4 text-black">
      <SubjectAttendanceCards
        summary={subject.summary}
        active={filter}
        onChange={setFilter}
      />

      <div className="text-sm text-gray-600">
        Subject: <span className="font-medium">{subject.subjectName}</span> |
        Faculty: <span className="font-medium">{subject.facultyName}</span>
      </div>

      <SubjectAttendanceTable records={filteredRecords} />
    </main>
  );
}
