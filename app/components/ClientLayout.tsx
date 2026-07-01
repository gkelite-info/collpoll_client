"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "./header/header";
import { Toaster } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import StudentNavbar from "./navbar/studentNavbar";
import AdminNavbar from "./navbar/adminNavbar";
import ParentNavbar from "./navbar/parentNavbar";
import FacultyNavbar from "./navbar/facultyNavbar";
import SuperAdminNavbar from "./navbar/superAdminNavbar";
import FinanceNavbar from "./navbar/financeNavbar";
import FinanceManagerNavbar from "./navbar/financeManagerNavbar";
import AccountantNavbar from "./navbar/accountantNavbar";
import CollegeAdminNavbar from "./navbar/collegeAdminNavbar";
import PlacementNavbar from "./navbar/placementNav";
import HrNavbar from "./navbar/hrNavbar";
import WellbeingExecutiveNavbar from "./navbar/wellbeingExecutiveNavbar";
import WellbeingManagerNavbar from "./navbar/wellbeingManagerNavbar";
import { useCallback, useEffect, useMemo, useState } from "react";
import TaskModal from "./modals/taskModal";
import { saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import { useFaculty } from "../utils/context/faculty/useFaculty";
import AddUserModal from "../(screens)/admin/(dashboard)/components/modal/addUserModal";
import { saveStudentTask } from "@/lib/helpers/student/studentTaskAPI";
import TaskPanelModal from "../utils/taskPanelModal";
import { supabase } from "@/lib/supabaseClient";
import {
  getLandingPageForRole,
  isAuthProtectedRoute,
  isAuthOnlyRoute,
  isExemptedRoute,
  isLegacyStudentRoute,
  isPublicRoute,
  normalizeRole,
} from "@/lib/constants/routes";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, facultyId, studentId, refreshUserContext } = useUser();
  const { subjectIds } = useFaculty();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [openTaskPanelModal, setOpenTaskPanelModal] = useState(false);
  const [isWellbeingRouteLoading, setIsWellbeingRouteLoading] = useState(false);

  const matchesRouteSegment = useCallback(
    (route: string) => pathname === route || pathname.startsWith(route + "/"),
    [pathname],
  );

  const handleMenuClick = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsSidebarOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    const showWellbeingRouteLoading = () => {
      setIsWellbeingRouteLoading(true);
    };

    window.addEventListener(
      "wellbeing-route-loading",
      showWellbeingRouteLoading,
    );

    return () => {
      window.removeEventListener(
        "wellbeing-route-loading",
        showWellbeingRouteLoading,
      );
    };
  }, []);

  useEffect(() => {
    if (!isWellbeingRouteLoading) return;

    const timeout = window.setTimeout(() => {
      setIsWellbeingRouteLoading(false);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [isWellbeingRouteLoading, pathname]);

  const hideLayoutRoutes = [
    "/landing_page",
    "/privacy-policy",
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/construction",
  ];

  const shouldHideLayout = hideLayoutRoutes.some((route) =>
    matchesRouteSegment(route),
  );

  useEffect(() => {
    let isMounted = true;

    const resolveRoleDashboard = (rawRole: string | null) => {
      const normalizedRole = normalizeRole(rawRole);
      return normalizedRole ? getLandingPageForRole(normalizedRole) : null;
    };

    const redirectForAuthState = async () => {
      if (isExemptedRoute(pathname)) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        if (!isPublicRoute(pathname)) {
          router.replace("/login");
          router.refresh();
        }
        return;
      }

      if (isAuthOnlyRoute(pathname) || pathname === "/") {
        let dashboardPath = resolveRoleDashboard(role);

        if (!dashboardPath) {
          await refreshUserContext();
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .maybeSingle();

          if (!isMounted) return;

          dashboardPath = resolveRoleDashboard(profile?.role ?? null);
        }

        if (dashboardPath && pathname !== dashboardPath) {
          router.replace(dashboardPath);
          router.refresh();
        }
        return;
      }

      if (!isPublicRoute(pathname) && !isAuthProtectedRoute(pathname)) {
        let dashboardPath = resolveRoleDashboard(role);

        if (!dashboardPath) {
          await refreshUserContext();
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .maybeSingle();

          if (!isMounted) return;

          dashboardPath = resolveRoleDashboard(profile?.role ?? null);
        }

        const isStudentLegacyPath =
          dashboardPath === "/stu_dashboard" && isLegacyStudentRoute(pathname);

        if (
          dashboardPath &&
          !matchesRouteSegment(dashboardPath) &&
          !isStudentLegacyPath
        ) {
          router.replace(dashboardPath);
          router.refresh();
        }
      }
    };

    const handlePageShow = () => {
      redirectForAuthState();
    };

    const handleFocus = () => {
      redirectForAuthState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        redirectForAuthState();
      }
    };

    redirectForAuthState();
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [matchesRouteSegment, pathname, refreshUserContext, role, router]);

  useEffect(() => {
    let isMounted = true;

    const resolveRoleDashboard = (rawRole: string | null) => {
      const normalizedRole = normalizeRole(rawRole);
      return normalizedRole ? getLandingPageForRole(normalizedRole) : null;
    };

    const redirectForAuthState = async () => {
      if (isExemptedRoute(pathname)) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        if (!isPublicRoute(pathname)) {
          router.replace("/login");
          router.refresh();
        }
        return;
      }

      if (isAuthOnlyRoute(pathname) || pathname === "/") {
        let dashboardPath = resolveRoleDashboard(role);

        if (!dashboardPath) {
          await refreshUserContext();
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .maybeSingle();

          if (!isMounted) return;

          dashboardPath = resolveRoleDashboard(profile?.role ?? null);
        }

        if (dashboardPath && pathname !== dashboardPath) {
          router.replace(dashboardPath);
          router.refresh();
        }
        return;
      }

      if (!isPublicRoute(pathname) && !isAuthProtectedRoute(pathname)) {
        let dashboardPath = resolveRoleDashboard(role);

        if (!dashboardPath) {
          await refreshUserContext();
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .maybeSingle();

          if (!isMounted) return;

          dashboardPath = resolveRoleDashboard(profile?.role ?? null);
        }

        const isStudentLegacyPath =
          dashboardPath === "/stu_dashboard" && isLegacyStudentRoute(pathname);

        if (
          dashboardPath &&
          !matchesRouteSegment(dashboardPath) &&
          !isStudentLegacyPath
        ) {
          router.replace(dashboardPath);
          router.refresh();
        }
      }
    };

    const handlePageShow = () => {
      redirectForAuthState();
    };

    const handleFocus = () => {
      redirectForAuthState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        redirectForAuthState();
      }
    };

    redirectForAuthState();
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [matchesRouteSegment, pathname, refreshUserContext, role, router]);

  // const wellbeingRouteShimmer = useMemo(() => {
  //   if (pathname.startsWith("/wellbeing-manager")) {
  //     return <WellbeingManagerDashboardShimmer />;
  //   }

  //   if (pathname.startsWith("/wellbeing-executive")) {
  //     return <WellbeingExecutiveDashboardShimmer />;
  //   }

  //   return null;
  // }, [pathname]);

  const renderNavbar = useCallback(
    (onClose?: () => void) => {
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
          case "Accountant":
            return <AccountantNavbar onClose={onClose} />;
          case "FinanceManager":
            return <FinanceManagerNavbar onClose={onClose} />;
          case "CollegeAdmin":
            return <CollegeAdminNavbar />;
          case "Parent":
            return <ParentNavbar />;
          case "SuperAdmin":
            return <SuperAdminNavbar />;
          case "Placement":
            return <PlacementNavbar />;
          case "WellbeingExecutive":
            return <WellbeingExecutiveNavbar onClose={onClose} />;
          case "WellbeingManager":
            return <WellbeingManagerNavbar onClose={onClose} />;
          default:
            return <StudentNavbar />;
        }
      }

      if (pathname.startsWith("/admin"))
        return <AdminNavbar onClose={onClose} />;
      if (pathname.startsWith("/faculty"))
        return <FacultyNavbar onClose={onClose} />;
      if (pathname.startsWith("/parent")) return <ParentNavbar />;
      if (pathname === "/placement" || pathname.startsWith("/placement/")) {
        return <PlacementNavbar />;
      }
      if (pathname.startsWith("/stu_dashboard"))
        return <StudentNavbar onClose={onClose} />;
      if (pathname.startsWith("/super-admin")) return <SuperAdminNavbar />;
      if (pathname.startsWith("/finance-manager"))
        return <FinanceManagerNavbar onClose={onClose} />;
      if (pathname.startsWith("/accountant"))
        return <AccountantNavbar onClose={onClose} />;
      if (pathname.startsWith("/finance")) return <FinanceNavbar />;
      if (pathname.startsWith("/college-admin"))
        return <CollegeAdminNavbar onClose={onClose} />;
      if (pathname.startsWith("/hr")) return <HrNavbar onClose={onClose} />;
      if (pathname.startsWith("/wellbeing-executive")) {
        return <WellbeingExecutiveNavbar onClose={onClose} />;
      }
      if (pathname.startsWith("/wellbeing-manager")) {
        return <WellbeingManagerNavbar onClose={onClose} />;
      }
      return <StudentNavbar />;
    },
    [pathname, role],
  );

  const desktopNavbar = useMemo(() => renderNavbar(), [renderNavbar]);

  const collegeSubjectId = subjectIds?.[0] ?? null;

  const handleSaveTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number,
  ) => {
    if (!facultyId || !subjectIds) {
      throw new Error("Faculty or college context not loaded");
    }

    const result = await saveFacultyTask(
      {
        facultyTaskId: taskId,
        collegeSubjectId: collegeSubjectId,
        taskTitle: payload.title,
        description: payload.description,
        date: payload.dueDate,
        time: payload.dueTime,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSectionsId: payload.collegeSectionsId,
      },
      facultyId,
    );

    if (!result.success) {
      throw new Error("Failed to save task");
    }
  };

  const handleSaveStudentTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number,
  ) => {
    if (!studentId) {
      throw new Error("Student context not loaded");
    }

    const result = await saveStudentTask(
      {
        studentTaskId: taskId,
        taskTitle: payload.title,
        description: payload.description,
        date: payload.dueDate,
        time: payload.dueTime,
      },
      studentId,
    );

    if (!result.success) {
      throw new Error("Failed to save student task");
    }
  };

  const handleAddTaskClick = useCallback(() => {
    if (role === "Student") {
      setOpenTaskPanelModal(true);
    } else {
      setIsAddTaskOpen(true);
    }
  }, [role]);

  const handleAddUserClick = useCallback(() => {
    setIsAddUserOpen(true);
  }, []);

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
        // <div className="flex h-screen w-screen overflow-hidden justify-between">
        <div className="flex h-screen w-screen overflow-hidden justify-between">
          <div className="hidden md:hidden lg:block w-0 md:w-0 lg:w-[17%] lg:h-full lg:bg-[#43C17A]">
            {desktopNavbar}
          </div>

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

          {/* <div className="bg-yellow-00 flex flex-col h-full w-[100%] md:w-[100%] lg:w-[83%]"> */}
          <div className="flex h-screen min-h-0 flex-col w-full lg:w-[83%]">
            {/* <div className="bg-red-00 h-[100px] landscape:h-[110px] md:h-[120px] md:landscape:h-[120px] lg:h-[13%] lg:landscape:h-[13%] flex justify-end bg-[#F4F4F4]"> */}
            <div className="shrink-0 h-auto w-full lg:h-[92px] flex justify-end bg-[#F4F4F4] z-40">
              <Header
                onMenuClick={handleMenuClick}
                onAddTaskClick={handleAddTaskClick}
                onAddUserClick={handleAddUserClick}
              />
            </div>

            {/* <div className="h-full lg:h-[87%] overflow-auto bg-[#F4F4F4] px-2"> */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F4F4F4] px-2 overscroll-contain custom-scrollbar max-md:scrollbar-hide">
              {children}
            </div>
          </div>
          {isAddTaskOpen && (
            <TaskModal
              open={isAddTaskOpen}
              onClose={() => setIsAddTaskOpen(false)}
              // onSave={handleSaveTask}
              onSave={
                role === "Student" ? handleSaveStudentTask : handleSaveTask
              }
              // role="faculty"
              // facultyId={facultyId!}
              role={role === "Student" ? "student" : "faculty"}
              facultyId={role === "Faculty" ? facultyId! : undefined}
              studentId={role === "Student" ? studentId! : undefined}
            />
          )}

          <TaskPanelModal
            open={openTaskPanelModal}
            onClose={() => {
              setOpenTaskPanelModal(false);
            }}
            role={role === "Faculty" ? "faculty" : "student"}
            studentId={studentId ?? undefined}
            facultyId={facultyId ?? undefined}
            onSaveTask={
              role === "Faculty" ? handleSaveTask : handleSaveStudentTask
            }
          />

          {isAddUserOpen && (
            <AddUserModal
              isOpen={isAddUserOpen}
              onClose={() => setIsAddUserOpen(false)}
            />
          )}
        </div>
      )}
    </>
  );
}
