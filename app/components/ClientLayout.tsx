"use client";

import { usePathname } from "next/navigation";
import Header from "./header/header";
import { Toaster } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";

import StudentNavbar from "./navbar/studentNavbar";
import AdminNavbar from "./navbar/adminNavbar";
import ParentNavbar from "./navbar/parentNavbar";
import FacultyNavbar from "./navbar/facultyNavbar";
import SuperAdminNavbar from "./navbar/superAdminNavbar";
import FinanceNavbar from "./navbar/financeNavbar";
import CollegeAdminNavbar from "./navbar/collegeAdminNavbar";
import PlacementNavbar from "./navbar/placementNav";
import HrNavbar from "./navbar/hrNavbar";
import { useEffect, useState } from "react";
import TaskModal from "./modals/taskModal";
import { saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import { useFaculty } from "../utils/context/faculty/useFaculty";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role, facultyId } = useUser();
  const { subjectIds } = useFaculty();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const hideLayoutRoutes = [
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/construction",
  ];

  const shouldHideLayout = hideLayoutRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const renderNavbar = (onClose?: () => void) => {
    // Handle profile page - render navbar based on user's role
    if (pathname === "/profile" || pathname.startsWith("/profile?")) {
      switch (role) {
        case "Student":
          return <StudentNavbar />;
        case "Faculty":
          return <FacultyNavbar onClose={onClose} />;
        case "Admin":
          return <AdminNavbar />;
        case "CollegeHr":
          return <HrNavbar />;
        case "Finance":
          return <FinanceNavbar />;
        case "CollegeAdmin":
          return <CollegeAdminNavbar />;
        case "Parent":
          return <ParentNavbar />;
        case "SuperAdmin":
          return <SuperAdminNavbar />;
        case "Placement":
          return <PlacementNavbar />;
        default:
          return <StudentNavbar />;
      }
    }

    if (pathname.startsWith("/admin")) return <AdminNavbar />;
    if (pathname.startsWith("/faculty")) return <FacultyNavbar onClose={onClose} />;
    if (pathname.startsWith("/parent")) return <ParentNavbar />;
    if (pathname === "/placement" || pathname.startsWith("/placement/")) {
      return <PlacementNavbar />;
    }
    if (pathname.startsWith("/stu_dashboard")) return <StudentNavbar />;
    if (pathname.startsWith("/super-admin")) return <SuperAdminNavbar />;
    if (pathname.startsWith("/finance")) return <FinanceNavbar />;
    if (pathname.startsWith("/college-admin")) return <CollegeAdminNavbar />;
    if (pathname.startsWith("/hr")) return <HrNavbar />;
    return <StudentNavbar />;
  };

  const collegeSubjectId = subjectIds?.[0] ?? null;

  const handleSaveTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number,
  ) => {
    if (!facultyId || !subjectIds) {
      throw new Error("Faculty or college context not loaded");
    }

    const result = await saveFacultyTask({
      facultyTaskId: taskId,
      collegeSubjectId: collegeSubjectId,
      taskTitle: payload.title,
      description: payload.description,
      date: payload.dueDate,
      time: payload.dueTime,
    },
      facultyId,
    );

    if (!result.success) {
      throw new Error("Failed to save task");
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{ zIndex: 10000 }}
      />

      {shouldHideLayout ? (
        <>{children}</>
      ) : (
        <div className="flex h-screen w-screen overflow-hidden justify-between">
          <div className="hidden md:hidden lg:block w-0 md:w-0 lg:w-[17%] lg:h-full lg:bg-[#43C17A]">{renderNavbar()}</div>

          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div
                className="absolute inset-y-0 left-0 w-[50%] md:w-[35%] bg-[#43C17A]"
                onClick={(e) => e.stopPropagation()}
              >
                {renderNavbar(() => setIsSidebarOpen(false))}
              </div>
            </div>
          )}

          <div className="flex flex-col h-full w-[100%] md:w-[100%] lg:w-[83%]">
            <div className="h-[13%] flex justify-end bg-[#F4F4F4]">
              <Header
                onMenuClick={handleMenuClick}
                onAddTaskClick={() => setIsAddTaskOpen(true)}
              />
            </div>

            <div className="h-[87%] overflow-auto bg-[#F4F4F4] px-2">
              {children}
            </div>
          </div>
          {isAddTaskOpen && (
            <TaskModal
              open={isAddTaskOpen}
              onClose={() => setIsAddTaskOpen(false)}
              onSave={handleSaveTask}
              role="faculty"
              facultyId={facultyId!}
            />
          )}
        </div>
      )}
    </>
  );
}
