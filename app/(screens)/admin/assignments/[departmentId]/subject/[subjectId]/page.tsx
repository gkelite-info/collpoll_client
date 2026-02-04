// import AssignmentsLeft from "./components/left";
// import AssignmentsRight from "./components/right";

// export default function Page() {
//   return (
//     <main className="flex w-full min-h-screen">
//       <AssignmentsLeft />
//       <AssignmentsRight />
//     </main>
//   );
// }

"use client";

import { useParams, useSearchParams } from "next/navigation";
import AssignmentsLeft from "./components/left";
import AssignmentsRight from "./components/right";

export default function AdminSubjectAssignmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract IDs from URL
  const subjectId = Number(params.subjectId);
  const facultyId = Number(searchParams.get("facultyId")); // Pass this from the CourseCard

  return (
    <main className="flex w-full min-h-screen bg-[#F3F6F9]">
      <AssignmentsLeft
        subjectId={subjectId}
        facultyId={facultyId}
        isAdminView={true}
      />
      <AssignmentsRight />
    </main>
  );
}
