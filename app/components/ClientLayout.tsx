"use client";

import { usePathname } from "next/navigation";
import Header from "./header/page";
import { Toaster } from "react-hot-toast";

import StudentNavbar from "./navbar/studentNavbar";
import AdminNavbar from "./navbar/adminNavbar";
import ParentNavbar from "./navbar/parentNavbar";
import FacultyNavbar from "./navbar/facultyNavbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideLayoutRoutes = [
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ];

  const shouldHideLayout = hideLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const renderNavbar = () => {
    if (pathname.startsWith("/admin")) return <AdminNavbar />;
    if (pathname.startsWith("/parent")) return <ParentNavbar />;
    if (pathname.startsWith("/faculty")) return <FacultyNavbar />;
    return <StudentNavbar />;
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {shouldHideLayout ? (
        <>{children}</>
      ) : (
        <div className="flex h-screen w-screen overflow-hidden justify-between">
          <div className="w-[17%] h-full bg-[#43C17A]">
            {renderNavbar()}
          </div>

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
