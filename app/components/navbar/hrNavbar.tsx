"use client";

import { useState, ReactNode, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  FolderOpen,
  Gear,
  House,
  Laptop,
  SignOut,
  SmileyIcon,
  X,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ConfirmLogoutModal from "../modals/logoutModal";
import { logoutUser } from "@/lib/helpers/logoutUser";
import toast from "react-hot-toast";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
};

type HrNavbarProps = {
  onClose?: () => void;
};

export default function HrNavbar({ onClose }: HrNavbarProps) {
  const pathname = usePathname();

  const [active, setActive] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const t = useTranslations("Navbars");

  const items: NavItem[] = [
    {
      icon: (isActive) => (
        <House size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Home"),
      path: "/hr",
    },
    {
      icon: (isActive) => (
        <Calendar size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Calendar"),
      path: "/hr/calendar",
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Attendance"),
      path: "/hr/attendance",
    },
    {
      icon: (isActive) => (
        <FolderOpen size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Drive"),
      path: "/hr/drive",
    },
    {
      icon: (isActive) => (
        <Laptop size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Meetings"),
      path: "/hr/meetings",
    },
    {
      icon: (isActive) => (
        <CheckCircle size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("My Attendance"),
      path: "/hr/MyAttendance",
    },
    {
      icon: (isActive) => <SmileyIcon size={18} weight={isActive ? "fill" : "regular"} />,
      label: t("Wellbeing"),
      path: `/hr/wellbeing`,
    },
    {
      icon: (isActive) => (
        <Gear size={18} weight={isActive ? "fill" : "regular"} />
      ),
      label: t("Settings"),
      path: "/hr/settings",
    },
  ];

  useEffect(() => {
    const current = items.find((item) => item.path === pathname);

    if (current) {
      setActive(current.label);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const timeout = setTimeout(() => {
        window.location.replace("/login");
      }, 3500);

      const res = await logoutUser();

      if (res.success) {
        clearTimeout(timeout);

        setShowLogoutModal(false);

        toast.success("Loggedout successfully");

        window.location.replace("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="lg:bg-[#43C17A] lg:flex flex flex-col items-center h-full w-[100%] lg:w-full rounded-tr-3xl shadow-md focus:outline-none">
        <div className="h-[10%] w-full flex items-center justify-center text-white font-bold text-lg">
          Logo
        </div>

        <div className="flex flex-col items-start w-full h-full lg:gap-[11px] pt-4 lg:pl-4 lg:pb-5 overflow-y-auto focus:outline-none">
          {items.map((item) => {
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
                <div
                  className={`${isActive ? "text-[#43C17A]" : "text-white"
                    }`}
                >
                  {item.icon(isActive)}
                </div>

                <p
                  className={`text-sm sm:text-sm md:text-base lg:text-sm font-medium ${isActive ? "text-[#43C17A]" : "text-white"
                    }`}
                >
                  {item.label}
                </p>
              </Link>
            );
          })}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex md:flex lg:hidden relative items-center gap-3 w-full pl-4 py-2 rounded-l-full cursor-pointer transition-all duration-300 text-white hover:bg-[#50D689]/30 focus:outline-none"
            disabled={isLoggingOut}
          >
            <div className="text-red-600">
              <SignOut size={18} />
            </div>

            <p className="text-sm sm:text-sm md:text-base lg:text-sm font-medium text-red-600">
              {isLoggingOut ? "Loggingout" : "Logout"}
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
