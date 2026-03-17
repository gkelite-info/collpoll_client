"use client";

import { usePathname } from "next/navigation";
import Header from "./header/page";
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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role } = useUser();

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

  const renderNavbar = () => {
    // Handle profile page - render navbar based on user's role
    if (pathname === "/profile" || pathname.startsWith("/profile?")) {
      switch (role) {
        case "Student":
          return <StudentNavbar />;
        case "Faculty":
          return <FacultyNavbar />;
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
    if (pathname.startsWith("/faculty")) return <FacultyNavbar />;
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
          <div className="w-[17%] h-full bg-[#43C17A]">{renderNavbar()}</div>

          <div className="flex flex-col w-[83%] h-full">
            <div className="h-[13%] flex justify-end bg-[#F4F4F4]">
              <Header />
            </div>

            <div className="h-[87%] overflow-auto bg-[#F4F4F4] px-2">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
