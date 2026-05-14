"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDots,
  CaretDown,
  ChartBarHorizontal,
  CheckCircle,
  FolderOpen,
  Gear,
  Headset,
  House,
  Laptop,
  PuzzlePiece,
  SignOut,
  Warning,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmLogoutModal from "../modals/logoutModal";
import { logoutUser } from "@/lib/helpers/logoutUser";
import toast from "react-hot-toast";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
  badge?: string;
};

type WellbeingExecutiveNavbarProps = {
  onClose?: () => void;
  basePath?: string;
  showExecutives?: boolean;
  showLeaveRequest?: boolean;
};

export default function WellbeingExecutiveNavbar({
  onClose,
  basePath = "/wellbeing-executive",
  showExecutives = false,
  showLeaveRequest = true,
}: WellbeingExecutiveNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = basePath;
  const iconSize = 18;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showExecutiveMenu, setShowExecutiveMenu] = useState(false);

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
          <Warning size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "New Issues",
        path: `${base}/new-issues`,
        badge: "12",
      },
      {
        icon: (isActive) => (
          <PuzzlePiece size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Categories",
        path: `${base}/categories`,
      },
      {
        icon: (isActive) => (
          <ChartBarHorizontal
            size={iconSize}
            weight={isActive ? "fill" : "regular"}
          />
        ),
        label: "Performance",
        path: `${base}/performance`,
      },
      {
        icon: (isActive) => (
          <CalendarDots size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Calendar",
        path: `${base}/calendar`,
      },
      ...(showLeaveRequest
        ? [
            {
              icon: (isActive: boolean) => (
                <CalendarCheck
                  size={iconSize}
                  weight={isActive ? "fill" : "regular"}
                />
              ),
              label: "Leave Request",
              path: `${base}/leave-request`,
            },
          ]
        : []),
      {
        icon: (isActive) => (
          <UsersThree size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Club",
        path: `${base}/club`,
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
          <Laptop size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Meetings",
        path: `${base}/meetings`,
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
          <Headset size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Well Being / Support",
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
    [base, showLeaveRequest],
  );

  const prefetchRoute = useCallback(
    (path: string) => {
      if (path !== pathname) {
        router.prefetch(path);
      }
    },
    [pathname, router],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      if (path !== pathname) {
        window.dispatchEvent(new Event("wellbeing-route-loading"));
      }
      onClose?.();
    },
    [onClose, pathname],
  );

  const isActivePath = (itemPath: string) => {
    if (itemPath === base) return pathname === base || pathname.startsWith("/profile");
    return pathname.startsWith(itemPath);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const timeout = setTimeout(() => {
        window.location.assign("/login");
      }, 3500);

      const res = await logoutUser();

      if (res.success) {
        clearTimeout(timeout);
        setShowLogoutModal(false);
        toast.success("Loggedout successfully");
        window.location.assign("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col bg-[#48C77D] text-white shadow-md lg:rounded-tr-3xl">
        <div className="flex h-[10%] min-h-[78px] w-full items-center justify-center rounded-br-3xl bg-[#48C77D] text-lg font-bold">
          Logo
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-start gap-[11px] overflow-y-auto pt-4 pl-4 pr-0 pb-5">
          {items.map((item) => {
            const active = isActivePath(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => handleNavigate(item.path)}
                onFocus={() => prefetchRoute(item.path)}
                onMouseEnter={() => prefetchRoute(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
                className={`group relative flex w-full items-center gap-3 rounded-l-full py-2 pl-4 text-sm font-medium transition-all duration-300 before:transition-all before:duration-300 after:transition-all after:duration-300 sm:text-sm md:text-base lg:text-sm ${
                  active
                    ? "activeNav bg-[#F4F4F4] text-[#43C17A] focus:outline-none"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                    active ? "text-[#43C17A]" : "text-white"
                  }`}
                >
                  {item.icon(active)}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="mr-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {showExecutives ? (
            <div className="w-full pr-4">
              <button
                type="button"
                onClick={() => setShowExecutiveMenu((prev) => !prev)}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-md bg-[#16395B] px-3 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[#12314F]"
              >
                <UsersThree size={18} weight="fill" />
                <span className="min-w-0 flex-1 truncate text-left">Executives</span>
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`transition-transform duration-200 ${
                    showExecutiveMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showExecutiveMenu ? (
                <Link
                  href={`${base}/executives`}
                  onClick={() => handleNavigate(`${base}/executives`)}
                  onFocus={() => prefetchRoute(`${base}/executives`)}
                  onMouseEnter={() => prefetchRoute(`${base}/executives`)}
                  onTouchStart={() => prefetchRoute(`${base}/executives`)}
                  className={`mt-1 flex min-h-[34px] w-full items-center rounded-md px-8 text-[13px] font-semibold transition-all duration-200 ${
                    pathname.startsWith(`${base}/executives`)
                      ? "bg-[#F4F4F4] text-[#43C17A]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  All Executives
                </Link>
              ) : null}
            </div>
          ) : null}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex min-h-[36px] items-center gap-2.5 rounded-l-full px-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-white/10 lg:hidden"
            disabled={isLoggingOut}
          >
            <SignOut size={16} />
            <span>{isLoggingOut ? "Loggingout" : "Logout"}</span>
          </button>

          <button
            className="mt-auto flex min-h-[36px] items-center gap-2.5 rounded-l-full px-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-white/10 lg:hidden"
            onClick={() => onClose?.()}
          >
            <X size={16} weight="bold" />
            <span>Close</span>
          </button>
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
