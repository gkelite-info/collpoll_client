"use client";

import { useState, ReactNode, useEffect, useMemo } from "react";
import {
  BuildingApartment as BuildingApartmentIcon,
  Calendar,
  CheckCircle,
  ClipboardText,
  FolderOpen,
  Gear,
  GraduationCap,
  House,
  PlusCircle,
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
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

type CollegeAdminNavbarProps = {
  onClose?: () => void;
};

export default function CollegeAdminNavbar({ onClose }: CollegeAdminNavbarProps) {
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Navbars");

  const { collegeCode } = useUser();
  const { collegeEducationType, loading: contextLoading } = useCollegeAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);
  const basePath = isSchool ? "/school-admin" : "/college-admin";

  const items: NavItem[] = useMemo(() => {
    const isAdmissionsAllowed = ["bcca", "bcpgc", "bjcg"].includes(collegeCode?.toLowerCase() || "");

    const allItems = [
      {
        icon: (isActive: boolean) => (
          <House size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Home"),
        path: basePath,
      },
      {
        icon: (isActive: boolean) => (
          <GraduationCap size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Admissions"),
        path: `${basePath}/admissions`,
      },
      {
        icon: (isActive: boolean) => (
          <BuildingApartmentIcon
            size={18}
            weight={isActive ? "fill" : "regular"}
          />
        ),
        label: isSchool ? "School Management" : t("Institution Management"),
        path: isSchool ? `${basePath}/school-management` : `${basePath}/institution-management`,
      },
      {
        icon: (isActive: boolean) => (
          <PlusCircle size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Add Admin"),
        path: `${basePath}/add-admin`,
      },
      {
        icon: (isActive: boolean) => (
          <Calendar size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Calendar"),
        path: `${basePath}/calendar`,
      },
      {
        icon: (isActive: boolean) => (
          <UsersThreeIcon size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Club"),
        path: `${basePath}/clubs`,
      },
      {
        icon: (isActive: boolean) => (
          <ClipboardText size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Leave Requests",
        path: `${basePath}/leave-request`,
      },
      {
        icon: (isActive: boolean) => (
          <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Drive"),
        path: `${basePath}/drive`,
      },
      {
        icon: (isActive: boolean) => (
          <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("My Attendance"),
        path: `${basePath}/my-attendance`,
      },
      {
        icon: (isActive: boolean) => <SmileyIcon size={18} weight={isActive ? "fill" : "regular"} />,
        label: t("Wellbeing"),
        path: `${basePath}/wellbeing`,
      },
      {
        icon: (isActive: boolean) => (
          <Gear size={18} weight={isActive ? "fill" : "regular"} />
        ),
        label: t("Settings"),
        path: `${basePath}/settings`,
      },
    ];

    return allItems.filter(item => {
      if (item.label === t("Admissions") && !isAdmissionsAllowed) return false;
      if (item.path === `${basePath}/clubs` && (isSchool || contextLoading)) return false;
      return true;
    });
  }, [t, collegeCode, isSchool, contextLoading, basePath]);

  useEffect(() => {
    let current = items.find((item) => item.path === pathname);
    if (!current) {
      const sortedItems = [...items].sort((a, b) => b.path.length - a.path.length);
      current = sortedItems.find((item) => {
        if (item.path === basePath) {
          return pathname === basePath;
        }
        return pathname.startsWith(item.path);
      });
    }
    if (current && !contextLoading) setActive(current.label);
  }, [pathname, items, contextLoading]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setIsLoggingOut(true);

      const timeout = setTimeout(() => {
        window.location.replace("/login");
      }, 3500);

      const res = await logoutUser();

      if (res.success) {
        clearTimeout(timeout);
        setShowLogoutModal(false);
        toast.success("Logged out successfully");
        window.location.replace("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch {
      toast.error("Failed to logout")
    } finally {
      setLoading(false);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="lg:bg-[#43C17A] lg:flex flex flex-col items-center h-full w-[100%] lg:w-full rounded-tr-3xl shadow-md focus:outline-none">
        <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
          Logo
        </div>

        <div className="flex flex-col items-start w-full h-full lg:gap-[11px] pt-4 lg:pl-4 lg:pb-5 overflow-y-auto focus:outline-none custom-scrollbar">
          {contextLoading ? (
            <div className="flex flex-col gap-[11px] w-full pr-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
              {loading ? "Logging out..." : "Logout"}
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
