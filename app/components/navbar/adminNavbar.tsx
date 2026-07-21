"use client";
import { useState, ReactNode, useEffect, useMemo } from "react";
import {
  BookOpenText,
  BuildingOffice,
  Calendar,
  CalendarCheck,
  CheckCircle,
  ClipboardText,
  FileText,
  FolderOpen,
  Gear,
  GraduationCap,
  House,
  Laptop,
  Note,
  Student,
  UsersThreeIcon,
  X,
  SignOut,
  SmileyIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ConfirmLogoutModal from "../modals/logoutModal";
import { logoutUser } from "@/lib/helpers/logoutUser";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

type AdminNavbarProps = {
  onClose?: () => void;
};

export default function AdminNavbar({ onClose }: AdminNavbarProps) {
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations("Navbars");
  const [loading, setLoading] = useState(false);

  const { collegeEducationType, loading: contextLoading } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  const items: NavItem[] = useMemo(() => {
    const allItems = [
      {
        icon: (isActive: boolean) => <House size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Home"),
        path: "/admin",
      },
      {
        icon: (isActive: boolean) => <Calendar size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Calendar"),
        path: "/admin/calendar",
      },
      {
        icon: (isActive: boolean) => <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Attendance"),
        path: "/admin/attendance",
      },
      {
        icon: (isActive: boolean) => <Note size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Assignments"),
        path: "/admin/assignments",
      },
      {
        icon: (isActive: boolean) => <GraduationCap size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Academics"),
        path: "/admin/academics",
      },
      {
        icon: (isActive: boolean) => <Student size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Student Progress"),
        path: "/admin/student-progress",
      },
      {
        icon: (isActive: boolean) => <ClipboardText size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Projects"),
        path: "/admin/projects",
      },
      {
        icon: (isActive: boolean) => <BookOpenText size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Academic Setup"),
        path: "/admin/academic-setup",
      },
      {
        icon: (isActive: boolean) => <CalendarCheck size={18} weight={isActive ? "fill" : "regular"} />,
        label: "Leave Request",
        path: "/admin/leave-request",
      },
      {
        icon: (isActive: boolean) => <BuildingOffice size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Placements"),
        path: "/admin/placements",
      },
      {
        icon: (isActive: boolean) => <UsersThreeIcon size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Club"),
        path: "/admin/clubs",
      },
      {
        icon: (isActive: boolean) => <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Drive"),
        path: "/admin/drive",
      },
      {
        icon: (isActive: boolean) => <Laptop size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Meetings"),
        path: "/admin/meetings",
      },
      {
        icon: (isActive: boolean) => <FileText size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Exams"),
        path: "/admin/exams",
      },
      {
        icon: (isActive: boolean) => <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("My Attendance"),
        path: "/admin/my-attendance",
      },
      {
        icon: (isActive: boolean) => <SmileyIcon size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Wellbeing"),
        path: "/admin/wellbeing",
      },
      {
        icon: (isActive: boolean) => <Gear size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Settings"),
        path: "/admin/settings",
      },
    ];
    
    return allItems.filter(item => {
      if ((item.path === "/admin/clubs" || item.path === "/admin/placements" || item.path === "/admin/wellbeing") && (isSchool || contextLoading)) return false;
      return true;
    });
  }, [t, isSchool, contextLoading]);

  useEffect(() => {
    const current = items.find((item) => item.path === pathname);
    if (current && !contextLoading) setActive(current.label);
  }, [pathname, items, contextLoading]);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const timeout = setTimeout(() => {
        window.location.replace("/login");
      }, 3500);

      const res = await logoutUser();

      if (res.success) {
        clearTimeout(timeout);
        setShowLogoutModal(false);
        // onClose();
        toast.success("Loggedout successfully");
        // router.replace("/login");
        window.location.replace("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <>
      <div className="lg:bg-[#43C17A] lg:flex flex flex-col items-center h-full w-[100%] lg:w-full rounded-tr-3xl shadow-md focus:outline-none">
        <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
          Logo
        </div>

        <div className="flex flex-col items-start w-full h-full lg:gap-[11px] pt-4 lg:pl-4 lg:pb-5 overflow-y-auto focus:outline-none">
          {contextLoading ? (
            <div className="flex flex-col gap-[11px] w-full pr-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="flex relative items-center gap-3 w-full pl-4 py-2">
                  <div className="h-[18px] w-[18px] bg-white/20 rounded-full animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            items.map((item) => {
              const isActive = active === item.label;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => onClose?.()}
                  className={`flex relative items-center gap-3 w-full pl-4 py-2 rounded-l-full cursor-pointer transition-all duration-300
                    before:transition-all before:duration-300
                    after:transition-all after:duration-300
                    ${isActive
                      ? "bg-[#F4F4F4] text-[#43C17A] activeNav focus:outline-none"
                      : "text-white hover:bg-[#50D689]/30 focus:outline-none"
                    }
                  `}
                >
                  <div className={`${isActive ? "text-[#43C17A]" : "text-white"}`}>
                    {item.icon(isActive)}
                  </div>

                  <p className={`text-sm sm:text-sm md:text-base lg:text-sm font-medium ${isActive ? "text-[#43C17A]" : "text-white"}`}>
                    {item.label}
                  </p>
                </Link>
              );
            })
          )}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex md:flex lg:hidden relative items-center gap-3 w-full pl-4 py-2 rounded-l-full cursor-pointer transition-all duration-300 text-white hover:bg-[#50D689]/30 focus:outline-none"
            disabled={loading}
          >
            <div className="text-red-600">
              <SignOut size={18} />
            </div>
            <p className="text-sm sm:text-sm md:text-base lg:text-sm font-medium text-red-600">
              {loading ? "Loggingout" : "Logout"}
            </p>
          </button>

          <div className="flex md:flex lg:hidden items-center gap-3 w-full pl-4 py-2 mt-auto border-t border-white/20 pt-4">
            <button
              className="flex items-center gap-2 text-white text-sm font-medium"
              onClick={() => onClose?.()}
            >
              <X size={18} weight="bold" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <ConfirmLogoutModal
          loading={isLoggingOut}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}
