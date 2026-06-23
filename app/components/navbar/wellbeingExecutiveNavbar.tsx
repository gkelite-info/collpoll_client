"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDots,
  Car,
  ChartBarHorizontal,
  CheckCircle,
  Book,
  Cube,
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
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchWellbeingExecutiveNewIssueCounts,
  fetchWellbeingManagerNewIssueCount,
} from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";

type NavItem = {
  icon: (isActive: boolean) => ReactNode;
  label: string;
  path: string;
  badge?: string;
  hidden?: boolean;
};

type WellbeingExecutiveNavbarProps = {
  onClose?: () => void;
  basePath?: string;
  showExecutives?: boolean;
  showLeaveRequest?: boolean;
  showStaffAttendance?: boolean;
  newIssueCountMode?: "executive" | "manager";
};

const normalizeCategoryName = (categoryName: string | null | undefined) =>
  categoryName?.toLowerCase().replace(/[^a-z]/g, "") ?? "";

const isSafetyAndSecurityCategory = (categoryName: string | null | undefined) => {
  const normalizedCategory = normalizeCategoryName(categoryName);
  return normalizedCategory === "safetyandsecurity" || normalizedCategory === "safetysecurity";
};

const isSportsCategory = (categoryName: string | null | undefined) =>
  normalizeCategoryName(categoryName) === "sports";

const isInfrastructureCategory = (categoryName: string | null | undefined) =>
  normalizeCategoryName(categoryName) === "infrastructure";

const isAdministrationCategory = (categoryName: string | null | undefined) => {
  const category = normalizeCategoryName(categoryName);
  return category === "administration" || category === "admin";
};

export default function WellbeingExecutiveNavbar({
  onClose,
  basePath = "/wellbeing-executive",
  showExecutives = false,
  showLeaveRequest = true,
  showStaffAttendance = true,
  newIssueCountMode = "executive",
}: WellbeingExecutiveNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = basePath;
  const iconSize = 18;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    collegeId,
    wellBeingCategoryId,
    wellBeingCategoryIds,
    wellBeingCategoryName,
    wellBeingCategoryNames,
  } = useUser();
  const [newIssuesCount, setNewIssuesCount] = useState(0);
  const executiveCategories = [wellBeingCategoryName, ...wellBeingCategoryNames];
  const canViewSafetyFeatures = executiveCategories.some(
    isSafetyAndSecurityCategory,
  );
  const canViewInfrastructureFeatures = executiveCategories.some(isInfrastructureCategory);
  const canViewStaffAttendance = canViewSafetyFeatures || canViewInfrastructureFeatures;
  const canViewSportsFeatures = executiveCategories.some(isSportsCategory);
  const canViewAdministrationFeatures = executiveCategories.some(isAdministrationCategory);
  const canViewInventory = executiveCategories.some(
    (category) =>
      isSportsCategory(category) ||
      isSafetyAndSecurityCategory(category) ||
      isAdministrationCategory(category) ||
      isInfrastructureCategory(category),
  );

  const loadNewIssueCount = useCallback(async () => {
    if (!collegeId) return;

    try {
      if (newIssueCountMode === "manager") {
        const count = await fetchWellbeingManagerNewIssueCount(collegeId);
        setNewIssuesCount(count);
        return;
      }

      const counts = await fetchWellbeingExecutiveNewIssueCounts(
        collegeId,
        wellBeingCategoryIds.length ? wellBeingCategoryIds : wellBeingCategoryId,
      );
      setNewIssuesCount(counts.my);
    } catch {
      setNewIssuesCount(0);
    }
  }, [collegeId, newIssueCountMode, wellBeingCategoryId, wellBeingCategoryIds]);

  useEffect(() => {
    loadNewIssueCount();
  }, [loadNewIssueCount]);

  useEffect(() => {
    const refreshNewIssueCount = () => {
      loadNewIssueCount();
    };

    const refreshNewIssueCountOnFocus = () => {
      if (document.visibilityState === "visible") {
        loadNewIssueCount();
      }
    };

    window.addEventListener("wellbeing-issue-created", refreshNewIssueCount);
    window.addEventListener("focus", refreshNewIssueCount);
    document.addEventListener("visibilitychange", refreshNewIssueCountOnFocus);

    return () => {
      window.removeEventListener("wellbeing-issue-created", refreshNewIssueCount);
      window.removeEventListener("focus", refreshNewIssueCount);
      document.removeEventListener("visibilitychange", refreshNewIssueCountOnFocus);
    };
  }, [loadNewIssueCount]);

  useEffect(() => {
    if (!collegeId) return;

    const channel = supabase
      .channel(
        `wellbeing_${newIssueCountMode}_new_issues_nav_${collegeId}_${wellBeingCategoryId ?? "all"}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wellbeing_support_issues",
          filter: `collegeId=eq.${collegeId}`,
        },
        () => {
          loadNewIssueCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wellbeing_issue_jobs",
        },
        () => {
          loadNewIssueCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collegeId, loadNewIssueCount, newIssueCountMode, wellBeingCategoryId]);

  const items: NavItem[] = useMemo(() => {
    const navItems: NavItem[] = [
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
        badge: String(newIssuesCount),
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
      {
        icon: (isActive: boolean) => (
          <CalendarCheck
            size={iconSize}
            weight={isActive ? "fill" : "regular"}
          />
        ),
        label: "Leave Request",
        path: `${base}/leaveRequests`,
        hidden: !showLeaveRequest,
      },
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
          <Cube size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Inventory",
        path: `${base}/inventory`,
        hidden: !canViewInventory,
      },
      {
        icon: (isActive) => (
          <Book size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Visitors Log",
        path: `${base}/visitors-log`,
        hidden:
          !canViewAdministrationFeatures ||
          canViewSportsFeatures ||
          canViewSafetyFeatures,
      },
      {
        icon: (isActive) => (
          <Book size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Visitors Log",
        path: `${base}/visitors-log`,
        hidden: !canViewSportsFeatures,
      },
      {
        icon: (isActive) => (
          <CheckCircle size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Staff Attendance",
        path: `${base}/staff-attendance`,
        hidden:
          !canViewStaffAttendance ||
          (base !== "/wellbeing-executive" && !showStaffAttendance),
      },
      {
        icon: (isActive) => (
          <Book size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Visitors Log",
        path: `${base}/visitors-log`,
        hidden:
          !canViewSafetyFeatures ||
          canViewSportsFeatures ||
          (base !== "/wellbeing-executive" && !showStaffAttendance),
      },
      {
        icon: (isActive) => (
          <Car size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Vehicle Log",
        path: `${base}/vehicle-log`,
        hidden:
          !canViewSafetyFeatures ||
          canViewSportsFeatures ||
          (base !== "/wellbeing-executive" && !showStaffAttendance),
      },
      {
        icon: (isActive) => (
          <Gear size={iconSize} weight={isActive ? "fill" : "regular"} />
        ),
        label: "Settings",
        path: `${base}/settings`,
      },
    ];

    return navItems.filter((item) => !item.hidden);
  }, [base, canViewAdministrationFeatures, canViewInventory, canViewSafetyFeatures, canViewSportsFeatures, canViewStaffAttendance, newIssuesCount, showLeaveRequest, showStaffAttendance]);

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
                className={`group relative grid w-full grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 rounded-l-full py-2 pl-4 text-sm font-medium transition-colors duration-300 sm:text-sm md:text-base lg:text-sm ${active
                    ? "activeNav bg-[#F4F4F4] text-[#43C17A] focus:outline-none"
                    : "text-white hover:bg-white/10"
                  }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center ${active ? "text-[#43C17A]" : "text-white"
                    }`}
                >
                  {item.icon(active)}
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="mr-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {showExecutives ? (
            <Link
              href={`${base}/executives`}
              onClick={() => handleNavigate(`${base}/executives`)}
              onFocus={() => prefetchRoute(`${base}/executives`)}
              onMouseEnter={() => prefetchRoute(`${base}/executives`)}
              onTouchStart={() => prefetchRoute(`${base}/executives`)}
              className={`group relative flex w-full cursor-pointer items-center gap-3  py-2 pl-4 text-sm font-medium transition-all duration-300 before:transition-all before:duration-300 after:transition-all after:duration-300 sm:text-sm md:text-base lg:text-sm ${
                pathname.startsWith(`${base}/executives`)
                  ? "activeNav bg-[#F4F4F4] text-[#43C17A] focus:outline-none rounded-l-full"
                  : "bg-[#16395B] text-white hover:bg-[#12314F] max-w-[95%] py-2.5 rounded-sm"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                  pathname.startsWith(`${base}/executives`)
                    ? "text-[#43C17A]"
                    : "text-white"
                }`}
              >
                <UsersThree size={18} weight="fill" />
              </span>
              <span className="min-w-0 flex-1 truncate">Executives</span>
            </Link>
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
