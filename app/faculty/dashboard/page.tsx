"use client";

import { useState } from "react";
import FacultyDashLeft from "./components/left";
import FacultyDashRight from "./components/right";
import StudentPerformancePage from "./components/studentPerformancePage";

export default function DashboardPage() {
  const [showStudentTable, setShowStudentTable] = useState(false);

  const handleViewChange = (showTable: boolean) => {
    setShowStudentTable(showTable);
  };

  return (
    <>
      {showStudentTable ? (
        <StudentPerformancePage onGoBack={() => handleViewChange(false)} />
      ) : (
        <main className="flex w-full min-h-screen">
          <FacultyDashLeft onShowStudentTable={() => handleViewChange(true)} />
          <FacultyDashRight />
        </main>
      )}
    </>
  );
}
