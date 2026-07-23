"use client";

import {
  Alarm,
  CalendarCheck,
  CalendarDots,
  ChartLine,
  CheckCircle,
  FileText,
  FolderOpen,
  Gear,
  Headset,
  House,
  Receipt,
  Wallet,
  SignOut,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { logoutUser } from "@/lib/helpers/logoutUser";

import ConfirmLogoutModal from "../modals/logoutModal";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
  activePaths?: string[];
};

type AccountantNavbarProps = {
  onClose?: () => void;
};

export default function AccountantNavbar({ onClose }: AccountantNavbarProps) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const base = "/accountant";
  const iconSize = 18;

  const items: NavItem[] = useMemo(
    () => [
      {
        icon: (isActive) => (
          <House size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Home",
        path: base,
      },
      {
        icon: (isActive) => (
          <CalendarDots size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Expense Categories",
        path: `${base}/expense-categories`,
      },
      {
        icon: (isActive) => (
          <ChartLine size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Analytics",
        path: `${base}/analytics`,
      },
      {
        icon: (isActive) => (
          <CalendarDots size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Calendar / Meeting",
        path: `${base}/calendar`,
        activePaths: [`${base}/calendar`, `${base}/meetings`],
      },
      {
        icon: (isActive) => (
          <Alarm size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Reminder",
        path: `${base}/reminder`,
      },
      {
        icon: (isActive) => (
          <FileText size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Certificates",
        path: `${base}/certificates?type=bonafides`,
        activePaths: [`${base}/certificates`],
      },
      {
        icon: (isActive) => (
          <CalendarCheck size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Leave Request",
        path: `${base}/leave-request`,
      },
      {
        icon: (isActive) => (
          <FolderOpen size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Drive",
        path: `${base}/drive`,
      },
      {
        icon: (isActive) => (
          <CheckCircle size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "My Attendance",
        path: `${base}/my-attendance`,
      },
      {
        icon: (isActive) => (
          <Wallet size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Payroll",
        path: `${base}/payroll`,
      },
      {
        icon: (isActive) => (
          <Receipt size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Reimbursement",
        path: `${base}/reimbursement`,
      },
      {
        icon: (isActive) => (
          <Headset size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Well being / Support",
        path: `${base}/wellbeing-support`,
      },
      {
        icon: (isActive) => (
          <Gear size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Settings",
        path: `${base}/settings`,
      },
    ],
    [],
  );

  const isActivePath = (item: NavItem) => {
    if (item.path === base) return pathname === base || pathname.startsWith("/profile");
    if (item.activePaths) {
      return item.activePaths.some((activePath) => pathname === activePath || pathname.startsWith(`${activePath}/`));
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

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
        toast.success("Loggedout successfully");
        window.location.replace("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col items-center overflow-y-auto rounded-tr-3xl bg-[#43C17A] shadow-md focus:outline-none lg:pt-5">
        <div className="flex h-[10%] w-full items-center justify-center text-lg font-bold text-white">
          Logo
        </div>

        <div className="flex h-full w-full flex-col items-start overflow-y-auto pt-4 pl-4 focus:outline-none lg:gap-[11px] lg:pb-5">
          {items.map((item) => {
            const active = isActivePath(item);
            const canWrap =
              item.label === "Well being / Support" ||
              item.label === "Calendar / Meeting";

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => onClose?.()}
                className={`relative flex w-full cursor-pointer items-center gap-3 rounded-l-full py-2 pl-4 transition-all duration-300
                  ${
                    active
                      ? "activeNav bg-[#F4F4F4] text-[#43C17A] focus:outline-none"
                      : "text-white hover:bg-[#50D689]/30 focus:outline-none"
                  }
                  ${canWrap ? "pr-4" : ""}
                `}
              >
                <div
                  className={`shrink-0 ${
                    active ? "text-[#43C17A]" : "text-white"
                  }`}
                >
                  {item.icon(active)}
                </div>

                <p
                  className={`min-w-0 text-sm font-medium sm:text-sm md:text-base lg:text-sm ${
                    active ? "text-[#43C17A]" : "text-white"
                  } ${canWrap ? "whitespace-normal leading-tight" : "truncate"}`}
                >
                  {item.label}
                </p>
              </Link>
            );
          })}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="relative flex w-full cursor-pointer items-center gap-3 rounded-l-full py-2 pl-4 text-white transition-all duration-300 hover:bg-[#50D689]/30 focus:outline-none md:flex lg:hidden"
            disabled={loading}
          >
            <div className="text-red-600">
              <SignOut size={18} />
            </div>
            <p className="text-sm font-medium text-red-600 sm:text-sm md:text-base lg:text-sm">
              {loading ? "Loggingout" : "Logout"}
            </p>
          </button>

          <div className="mt-auto flex w-full items-center gap-3 border-t border-white/20 py-2 pl-4 pt-4 md:flex lg:hidden">
            <button
              className="flex items-center gap-2 text-sm font-medium text-white"
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
          loading={loading}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}
