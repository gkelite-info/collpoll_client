"use client";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import {
    WarningCircle,
    Warning,
    ClockCountdown,
    ListChecks,
    ListDashes,
    Plus,
    CaretDown,
    CalendarIcon,
    X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/app/utils/Avatar";
import WellbeingRight from "../../components/WellbeingRight";
import AddExecutiveModal from "../../components/AddExecutiveModal";
import { useRouter } from "next/navigation";
import AlertExecutiveModal from "../../components/AlertExecutiveModal";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type ManagerIssueSummaryRow = {
    wellbeingSupportIssueId: number;
    categoryId: number;
    appliesTo: IssueScope | "both";
    priority: "high" | "medium" | "low";
    issueVisibilityRole?: string | null;
};

type ManagerIssueTableRow = ManagerIssueSummaryRow & {
    fullName: string;
    email: string;
    issueTitle: string;
    description: string;
    createdBy: number;
};

type ManagerIssueTableItem = {
    id: number;
    student: string;
    email: string;
    requesterRole: string;
    profileUrl: string | null;
    title: string;
    description: string;
    category: string;
    priority: string;
    executiveName: string;
    jobStatus: string;
};

type IssueJobRow = {
    wellbeingIssueJobId: number;
    wellbeingSupportIssueId: number;
    wellBeingId: number;
    status: "inprogress" | "completed" | "cancelled";
    updatedAt: string | null;
};

type IssueScope = "all" | "college" | "hostel";
type IssueRoleFilter =
    | "all"
    | "Student"
    | "CollegeAdmin"
    | "Admin"
    | "Faculty"
    | "Finance"
    | "CollegeHr"
    | "PlacementOfficer"
    | "WellbeingExecutive"
    | "WellbeingManager"
    | "FinanceManager";

type CategoryFilter = "all" | `${number}`;

type CategoryOption = {
    label: string;
    value: CategoryFilter;
};

type DropdownOption<T extends string> = {
    label: string;
    value: T;
};

type IssueSummaryCards = {
    totalIssues: number;
    highPriorityIssues: number;
    totalCategories: number;
    highestCategoryName: string;
    highestCategoryCount: number;
};

const defaultSummaryCards: IssueSummaryCards = {
    totalIssues: 0,
    highPriorityIssues: 0,
    totalCategories: 0,
    highestCategoryName: "No Issues",
    highestCategoryCount: 0,
};

const ITEMS_PER_PAGE = 10;

const getTodayDateKey = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDateKey = (dateKey: string) =>
    new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB");

const getDateBounds = (dateKey: string) => {
    const startDate = new Date(`${dateKey}T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    return {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
    };
};

const formatCount = (count: number) => String(count).padStart(2, "0");

const formatPriority = (priority: ManagerIssueSummaryRow["priority"]) =>
    priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low";

const formatJobStatus = (status: IssueJobRow["status"]) =>
    status === "inprogress"
        ? "In Progress"
        : status === "completed"
            ? "Completed"
            : "Cancelled";

const formatRequesterRole = (role?: string | null) => {
    const normalizedRole = role?.trim();
    const roleLabels: Record<string, string> = {
        Student: "Student",
        SuperAdmin: "Super Admin",
        "Super-Admin": "Super Admin",
        CollegeAdmin: "College Admin",
        "College-Admin": "College Admin",
        Admin: "Admin",
        Faculty: "Faculty",
        Finance: "Finance",
        CollegeHr: "College HR",
        HR: "College HR",
        PlacementOfficer: "Placement Officer",
        Placement: "Placement Officer",
        WellbeingExecutive: "Wellbeing Executive",
        WellbeingManager: "Wellbeing Manager",
        FinanceManager: "Finance Manager",
        GroundStaff: "Ground Staff",
    };

    return normalizedRole ? roleLabels[normalizedRole] ?? normalizedRole : "Requester";
};

const getLatestJobByIssueId = (jobs: IssueJobRow[]) => {
    const jobByIssueId = new Map<number, IssueJobRow>();
    jobs.forEach((job) => {
        if (!jobByIssueId.has(job.wellbeingSupportIssueId)) {
            jobByIssueId.set(job.wellbeingSupportIssueId, job);
        }
    });

    return jobByIssueId;
};

const logSupabaseError = (label: string, error: unknown) => {
    if (error && typeof error === "object") {
        const err = error as {
            code?: string;
            message?: string;
            details?: string | null;
            hint?: string | null;
        };
        console.error(label, {
            code: err.code,
            message: err.message,
            details: err.details,
            hint: err.hint,
        });
        return;
    }

    console.error(label, error);
};

const fetchCategoryNameMap = async (categoryIds: number[]) => {
    const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)));

    if (!uniqueCategoryIds.length) {
        return new Map<number, string>();
    }

    const { data, error } = await supabase
        .from("wellbeing_categories")
        .select("categoryId, categoryName")
        .in("categoryId", uniqueCategoryIds);

    if (error) throw error;

    return new Map(
        ((data ?? []) as { categoryId: number; categoryName: string | null }[]).map(
            (category) => [category.categoryId, category.categoryName?.trim() || "Not specified"],
        ),
    );
};

const getExecutiveBadgeClass = (name: string) =>
    name === "-"
        ? "bg-gray-100 text-[#6B7280]"
        : "bg-[#E8F8EF] text-[#009B55]";

const getStatusBadgeClass = (status: string) => {
    if (status === "Cancelled") return "bg-[#FFF2F2] text-[#FF2A2A]";
    if (status === "Completed") return "bg-[#E8F8EF] text-[#009B55]";
    if (status === "In Progress") return "bg-[#FFF4EB] text-[#D97706]";
    return "bg-gray-100 text-[#6B7280]";
};

const scopeOptions: DropdownOption<IssueScope>[] = [
    { label: "All", value: "all" },
    { label: "College", value: "college" },
    { label: "Hostel", value: "hostel" },
];

const issueRoleOptions: DropdownOption<IssueRoleFilter>[] = [
    { label: "All", value: "all" },
    { label: "Student", value: "Student" },
    { label: "College Admin", value: "CollegeAdmin" },
    { label: "Admin", value: "Admin" },
    { label: "Faculty", value: "Faculty" },
    { label: "Finance", value: "Finance" },
    { label: "College HR", value: "CollegeHr" },
    { label: "Placement Officer", value: "PlacementOfficer" },
    { label: "Wellbeing Executive", value: "WellbeingExecutive" },
    { label: "Wellbeing Manager", value: "WellbeingManager" },
    { label: "Finance Manager", value: "FinanceManager" },
];

function DropdownPill<T extends string>({
    value,
    options,
    onChange,
    minWidth,
    variant = "dark",
}: {
    value: T;
    options: DropdownOption<T>[];
    onChange: (value: T) => void;
    minWidth: string;
    variant?: "dark" | "light";
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedLabel =
        options.find((option) => option.value === value)?.label ?? value;
    const buttonClass =
        variant === "dark"
            ? "bg-[#16284F] text-white hover:bg-[#102044]"
            : "border border-[#D7D7D7] bg-white text-[#282828] hover:border-gray-400";

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div ref={dropdownRef} className="relative z-30">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`flex h-8 ${minWidth} cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-[13px] font-bold shadow-sm transition-colors ${buttonClass}`}
            >
                <span className="truncate">{selectedLabel}</span>
                <CaretDown
                    size={15}
                    weight="bold"
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open ? (
                <div className="custom-scrollbar absolute left-0 top-full z-40 mt-1 max-h-80 w-full min-w-full overflow-y-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
                    {options.map((option) => {
                        const selected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`block w-full cursor-pointer px-6 py-3 text-left text-[14px] font-medium transition-colors ${selected
                                        ? "bg-[#2166D1] text-white"
                                        : "bg-white text-[#16284F] hover:bg-[#E8E8E8]"
                                    }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

export default function NewIssuesPageContent() {
    const router = useRouter()
    const { collegeId } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedScope, setSelectedScope] = useState<IssueScope>("all");
    const [selectedRole, setSelectedRole] = useState<IssueRoleFilter>("all");
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([
        { label: "All", value: "all" },
    ]);
    const [summaryCards, setSummaryCards] =
        useState<IssueSummaryCards>(defaultSummaryCards);
    const [issueRows, setIssueRows] = useState<ManagerIssueTableItem[]>([]);
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [selectedDateKey, selectedScope, selectedRole, selectedCategory]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(issueRows.length / ITEMS_PER_PAGE));
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [issueRows.length, page]);

    const loadCategories = useCallback(async () => {
        if (!collegeId) {
            setCategoryOptions([{ label: "All", value: "all" }]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("wellbeing_categories")
                .select("categoryId, categoryName")
                .eq("collegeId", collegeId)
                .eq("isActive", true)
                .eq("is_deleted", false)
                .is("deletedAt", null)
                .order("categoryName", { ascending: true });

            if (error) throw error;

            setCategoryOptions([
                { label: "All", value: "all" },
                ...((data ?? []) as { categoryId: number; categoryName: string }[]).map(
                    (category) => ({
                        label: category.categoryName,
                        value: String(category.categoryId) as CategoryFilter,
                    }),
                ),
            ]);
        } catch (error) {
            console.error("load wellbeing manager categories error:", error);
            setCategoryOptions([{ label: "All", value: "all" }]);
        }
    }, [collegeId]);

    const loadIssueSummaryCards = useCallback(async () => {
        if (!collegeId) {
            setSummaryCards(defaultSummaryCards);
            return;
        }

        const { start, end } = getDateBounds(selectedDateKey);

        try {
            const { data, error } = await supabase
                .from("wellbeing_support_issues")
                .select(
                    `
                    wellbeingSupportIssueId,
                    categoryId,
                    appliesTo,
                    priority,
                    issueVisibilityRole
                `,
                )
                .eq("collegeId", collegeId)
                .eq("IssueStatus", "pending")
                .eq("isActive", true)
                .eq("is_deleted", false)
                .gte("createdAt", start)
                .lt("createdAt", end);

            if (error) throw error;

            const rows = ((data ?? []) as ManagerIssueSummaryRow[]).filter((issue) => {
                const matchesVisibility =
                    issue.issueVisibilityRole === "wellbeingmanager" ||
                    issue.issueVisibilityRole === "both";
                const matchesScope =
                    selectedScope === "all" ||
                    issue.appliesTo === selectedScope ||
                    issue.appliesTo === "both";
                const matchesRole = true;
                const matchesCategory =
                    selectedCategory === "all" ||
                    issue.categoryId === Number(selectedCategory);

                return matchesVisibility && matchesScope && matchesRole && matchesCategory;
            });
            const issueIds = rows.map((issue) => issue.wellbeingSupportIssueId);
            const { data: jobsData, error: jobsError } = issueIds.length
                ? await supabase
                    .from("wellbeing_issue_jobs")
                    .select("wellbeingIssueJobId, wellbeingSupportIssueId, wellBeingId, status, updatedAt")
                    .in("wellbeingSupportIssueId", issueIds)
                    .eq("isActive", true)
                    .eq("is_deleted", false)
                    .is("deletedAt", null)
                    .order("updatedAt", { ascending: false })
                : { data: [], error: null };

            if (jobsError) throw jobsError;

            const latestJobByIssueId = getLatestJobByIssueId(
                (jobsData ?? []) as IssueJobRow[],
            );
            const openIssueRows = rows.filter((issue) => {
                const latestJob = latestJobByIssueId.get(issue.wellbeingSupportIssueId);
                return latestJob?.status !== "completed";
            });
            const categoryNameById = await fetchCategoryNameMap(
                openIssueRows.map((issue) => issue.categoryId),
            );
            const categoryCounts = new Map<
                number,
                { name: string; count: number }
            >();

            openIssueRows.forEach((issue) => {
                const current = categoryCounts.get(issue.categoryId) ?? {
                    name: categoryNameById.get(issue.categoryId) || "Not specified",
                    count: 0,
                };
                categoryCounts.set(issue.categoryId, {
                    ...current,
                    count: current.count + 1,
                });
            });

            const highestCategory = Array.from(categoryCounts.values()).sort(
                (a, b) => b.count - a.count,
            )[0];

            setSummaryCards({
                totalIssues: openIssueRows.length,
                highPriorityIssues: openIssueRows.filter((issue) => issue.priority === "high")
                    .length,
                totalCategories: categoryCounts.size,
                highestCategoryName: highestCategory?.name ?? "No Issues",
                highestCategoryCount: highestCategory?.count ?? 0,
            });
        } catch (error) {
            logSupabaseError("load wellbeing manager issue summary error:", error);
            setSummaryCards(defaultSummaryCards);
        }
    }, [collegeId, selectedCategory, selectedDateKey, selectedScope]);

    const loadIssueTableRows = useCallback(async () => {
        if (!collegeId) {
            setIssueRows([]);
            setIssuesLoading(false);
            return;
        }

        setIssuesLoading(true);
        const { start, end } = getDateBounds(selectedDateKey);

        try {
            const { data, error } = await supabase
                .from("wellbeing_support_issues")
                .select(
                    `
                    wellbeingSupportIssueId,
                    fullName,
                    email,
                    issueTitle,
                    description,
                    createdBy,
                    categoryId,
                    appliesTo,
                    priority,
                    issueVisibilityRole
                `,
                )
                .eq("collegeId", collegeId)
                .eq("IssueStatus", "pending")
                .eq("isActive", true)
                .eq("is_deleted", false)
                .gte("createdAt", start)
                .lt("createdAt", end)
                .order("createdAt", { ascending: false });

            if (error) throw error;

            const filteredIssues = ((data ?? []) as ManagerIssueTableRow[]).filter(
                (issue) => {
                    const matchesVisibility =
                        issue.issueVisibilityRole === "wellbeingmanager" ||
                        issue.issueVisibilityRole === "both";
                    const matchesScope =
                        selectedScope === "all" ||
                        issue.appliesTo === selectedScope ||
                        issue.appliesTo === "both";
                    const matchesRole = true;
                    const matchesCategory =
                        selectedCategory === "all" ||
                        issue.categoryId === Number(selectedCategory);

                    return matchesVisibility && matchesScope && matchesRole && matchesCategory;
                },
            );
            const issueIds = filteredIssues.map((issue) => issue.wellbeingSupportIssueId);

            const { data: jobsData, error: jobsError } = issueIds.length
                ? await supabase
                    .from("wellbeing_issue_jobs")
                    .select(
                        "wellbeingIssueJobId, wellbeingSupportIssueId, wellBeingId, status, updatedAt",
                    )
                    .in("wellbeingSupportIssueId", issueIds)
                    .eq("isActive", true)
                    .eq("is_deleted", false)
                    .is("deletedAt", null)
                    .order("updatedAt", { ascending: false })
                : { data: [], error: null };

            if (jobsError) throw jobsError;

            const jobByIssueId = getLatestJobByIssueId((jobsData ?? []) as IssueJobRow[]);
            const openIssueRows = filteredIssues;

            const wellBeingIds = Array.from(
                new Set(
                    openIssueRows
                        .map((issue) => jobByIssueId.get(issue.wellbeingSupportIssueId))
                        .filter((job): job is IssueJobRow => Boolean(job))
                        .map((job) => job.wellBeingId),
                ),
            );
            const { data: wellBeingsData, error: wellBeingsError } = wellBeingIds.length
                ? await supabase
                    .from("well_beings")
                    .select("wellBeingId, userId")
                    .in("wellBeingId", wellBeingIds)
                : { data: [], error: null };

            if (wellBeingsError) throw wellBeingsError;

            const userIdByWellBeingId = new Map(
                ((wellBeingsData ?? []) as { wellBeingId: number; userId: number }[]).map(
                    (wellBeing) => [wellBeing.wellBeingId, wellBeing.userId],
                ),
            );
            const requesterUserIds = Array.from(
                new Set(openIssueRows.map((issue) => issue.createdBy).filter(Boolean)),
            );
            const userIds = Array.from(
                new Set([...Array.from(userIdByWellBeingId.values()), ...requesterUserIds]),
            );
            const { data: usersData, error: usersError } = userIds.length
                ? await supabase
                    .from("users")
                    .select("userId, fullName, role")
                    .in("userId", userIds)
                : { data: [], error: null };

            if (usersError) throw usersError;

            const users = (usersData ?? []) as {
                userId: number;
                fullName: string | null;
                role: string | null;
            }[];
            const fullNameByUserId = new Map(
                users.map((user) => [
                    user.userId,
                    user.fullName || "-",
                ]),
            );
            const roleByUserId = new Map(
                users.map((user) => [
                    user.userId,
                    formatRequesterRole(user.role),
                ]),
            );
            const { data: profilesData, error: profilesError } = requesterUserIds.length
                ? await supabase
                    .from("user_profile")
                    .select("userId, profileUrl")
                    .in("userId", requesterUserIds)
                    .eq("is_deleted", false)
                    .is("deletedAt", null)
                : { data: [], error: null };

            if (profilesError) throw profilesError;

            const profileUrlByUserId = new Map(
                ((profilesData ?? []) as { userId: number; profileUrl: string | null }[])
                    .filter((profile) => Boolean(profile.profileUrl))
                    .map((profile) => [profile.userId, profile.profileUrl as string]),
            );
            const categoryNameById = await fetchCategoryNameMap(
                openIssueRows.map((issue) => issue.categoryId),
            );

            setIssueRows(
                openIssueRows.map((issue) => {
                    const job = jobByIssueId.get(issue.wellbeingSupportIssueId);
                    const executiveUserId = job
                        ? userIdByWellBeingId.get(job.wellBeingId)
                        : undefined;
                    const executiveName = executiveUserId
                        ? fullNameByUserId.get(executiveUserId) || "-"
                        : "-";
                    const hasValidExecutiveAssignment = Boolean(executiveUserId) && executiveName !== "-";

                    return {
                        id: issue.wellbeingSupportIssueId,
                        student: issue.fullName,
                        email: issue.email,
                        requesterRole: roleByUserId.get(issue.createdBy) || "Requester",
                        profileUrl: profileUrlByUserId.get(issue.createdBy) || null,
                        title: issue.issueTitle,
                        description: issue.description,
                        category: categoryNameById.get(issue.categoryId) || "Not specified",
                        priority: formatPriority(issue.priority),
                        executiveName,
                        jobStatus: hasValidExecutiveAssignment && job ? formatJobStatus(job.status) : "-",
                    };
                }),
            );
        } catch (error) {
            logSupabaseError("load wellbeing manager issue table error:", error);
            setIssueRows([]);
        } finally {
            setIssuesLoading(false);
        }
    }, [collegeId, selectedCategory, selectedDateKey, selectedScope]);

    useEffect(() => {
        loadIssueSummaryCards();
    }, [loadIssueSummaryCards]);

    useEffect(() => {
        loadIssueTableRows();
    }, [loadIssueTableRows]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        if (!collegeId) return;

        const channel = supabase
            .channel(`wellbeing_manager_new_issues_cards_${collegeId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "wellbeing_support_issues",
                    filter: `collegeId=eq.${collegeId}`,
                },
                () => {
                    loadIssueSummaryCards();
                    loadIssueTableRows();
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
                    loadIssueSummaryCards();
                    loadIssueTableRows();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [collegeId, loadIssueSummaryCards, loadIssueTableRows]);

    const displayDate = useMemo(
        () => formatDateKey(selectedDateKey),
        [selectedDateKey],
    );

    const cardData = [
        {
            id: "TOTAL_ISSUES",
            style: "bg-[#E6E0FF] border border-black/5 hover:shadow-md transition-all h-[130px]",
            icon: <ListChecks size={22} weight="fill" color="#6C20CA" />,
            value: formatCount(summaryCards.totalIssues),
            label: "Total Issues Today",
        },
        {
            id: "HIGHEST_CATEGORY",
            style: "bg-[#FFEDDA] border border-black/5 hover:shadow-md transition-all h-[130px]",
            icon: <Warning size={22} weight="fill" color="#F59E0B" />,
            value: (
                <span className="flex flex-col md:flex-row gap-1">
                    <span
                        className="truncate text-[9px] sm:text-xs md:text-sm"
                        title={summaryCards.highestCategoryName}
                    >
                        {summaryCards.highestCategoryName}
                    </span>
                    <span className="text-[18px]">
                        ({summaryCards.highestCategoryCount})
                    </span>
                </span>
            ),
            label: "Highest Category",
        },
        {
            id: "HIGH_PRIORITY",
            style: "bg-[#FFE4E4] border border-black/5 hover:shadow-md transition-all h-[130px]",
            icon: <ClockCountdown size={22} weight="fill" color="#EF4444" />,
            value: formatCount(summaryCards.highPriorityIssues),
            label: "High Priority Issues",
        },
        {
            id: "TOTAL_CATEGORIES",
            style: "bg-[#E5F9EA] border border-black/5 hover:shadow-md transition-all h-[130px]",
            icon: <WarningCircle size={22} weight="fill" color="#10B981" />,
            value: formatCount(summaryCards.totalCategories),
            label: "Total Categories",
        },
    ];

    /* const issues = [
        {
            id: 1,
            student: "Shreya Patel",
            details: "B.Tech CSE • ID-28939",
            image: "https://i.pravatar.cc/150?img=45",
            issueTitle: "Projector not working in CR-2",
            issueDesc: "The project has not been working since",
            category: "Infrastructure",
            priority: "Medium",
        },
        {
            id: 2,
            student: "Shreya Patel",
            details: "B.Tech CSE • ID-28939",
            image: "https://i.pravatar.cc/150?img=47",
            issueTitle: "WiFi not working in Hostel Floor 3",
            issueDesc: "Internet connectivity is very poor or un...",
            category: "Infrastructure",
            priority: "Medium",
        },
        {
            id: 3,
            student: "Rahul Sharma",
            details: "B.Tech CSE • ID-28939",
            image: "https://i.pravatar.cc/150?img=11",
            issueTitle: "Ground maintenance required",
            issueDesc: "Football field has uneven surface.",
            category: "Sports",
            priority: "Medium",
        },
        {
            id: 4,
            student: "Sameer Rathod",
            details: "B.Tech CSE • ID-28939",
            image: "https://i.pravatar.cc/150?img=12",
            issueTitle: "Ground maintenance required",
            issueDesc: "Football field has uneven surface.",
            category: "Sports",
            priority: "Medium",
        },
        {
            id: 5,
            student: "Shreya Patel",
            details: "B.Tech CSE • ID-28939",
            image: "https://i.pravatar.cc/150?img=20",
            issueTitle: "Projector not working in CR-2",
            issueDesc: "The project has not been working since",
            category: "Infrastructure",
            priority: "Medium",
        },
        {
            id: 6,
            student: "Shreya Patel",
            details: "B.Tech CSE • ID-28939",
            image: "https://i.pravatar.cc/150?img=26",
            issueTitle: "WiFi not working in Hostel Floor 3",
            issueDesc: "Internet connectivity is very poor or un...",
            category: "Hostel",
            priority: "Medium",
        },
    ]; */

    const columns = [
        { title: selectedRole === "Student" ? "Student" : "Name", key: "student" },
        { title: "Issue", key: "issue" },
        { title: "Category", key: "category" },
        { title: "Priority", key: "priority" },
        { title: "Executive", key: "executive" },
        { title: "Status", key: "status" },
    ];

    const tableData = issueRows.map((issue) => ({
        student: (
            <div className="flex min-w-[260px] max-w-[280px] items-center gap-3 text-left">
                <Avatar src={issue.profileUrl} alt={issue.student} size={42} />
                <div className="flex min-w-0 flex-col">
                    <p className="text-[14px] font-bold text-[#16284F] truncate">{issue.student}</p>
                    <p className="text-[11px] font-bold text-[#43C17A] truncate mt-0.5">{issue.requesterRole}</p>
                    <p className="text-[12px] text-gray-500 font-medium truncate mt-0.5">{issue.email}</p>
                </div>
            </div>
        ),
        issue: (
            <div className="mx-auto flex w-[360px] flex-col text-center">
                <p className="w-full truncate text-[14px] font-bold text-[#16284F]">{issue.title}</p>
                <p className="mt-0.5 w-full truncate text-[13px] text-gray-500">{issue.description}</p>
            </div>
        ),
        category: (
            <span className="inline-flex min-w-[150px] justify-center rounded-full bg-[#EDF3FF] px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#4E88FF]">
                {issue.category}
            </span>
        ),
        priority: (
            <span className="inline-flex min-w-[105px] justify-center rounded-full bg-[#FFF4ED] px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#FF9E4E]">
                {issue.priority}
            </span>
        ),
        executive: (
            <span
                className={`inline-flex min-w-[130px] justify-center rounded-full px-3.5 py-1.5 text-[12px] font-bold ${getExecutiveBadgeClass(issue.executiveName)}`}
            >
                {issue.executiveName}
            </span>
        ),
        status: (
            <span
                className={`inline-flex min-w-[110px] justify-center rounded-full px-3.5 py-1.5 text-[12px] font-bold ${getStatusBadgeClass(issue.jobStatus)}`}
            >
                {issue.jobStatus}
            </span>
        ),
    }));
    const paginatedTableData = tableData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
    );

    return (
        <main className="flex flex-col lg:flex-row w-full min-h-screen pb-5">
            <div className="w-full lg:w-[68%] p-2 md:p-2 lg:p-2 flex flex-col gap-6 lg:gap-8 lg:h-screen">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-base font-bold leading-tight select-none md:text-[22px]">
                            <h1 className="text-[#43C17A] cursor-pointer">New Issues</h1>
                            <span className="font-bold text-[#43C17A]">/</span>
                            <h1
                                onClick={() => router.push("?tab=reassigned")}
                                className="text-[#16284F] cursor-pointer transition-colors"
                            >
                                Reassigned Issues
                            </h1>
                        </div>
                        <p className="text-[#16284F] text-[12px] md:text-[13px] font-medium">
                            View all new issues received across categories
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownPill
                            value={selectedScope}
                            options={scopeOptions}
                            onChange={setSelectedScope}
                            minWidth="min-w-[132px]"
                        />
                        <DropdownPill
                            value={selectedRole}
                            options={issueRoleOptions}
                            onChange={setSelectedRole}
                            minWidth="min-w-[148px]"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex lg:hidden items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(67,193,122,0.25)] active:scale-95 group shrink-0"
                    >
                        <div className="flex items-center justify-center border-2 border-white rounded-full group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={12} weight="bold" />
                        </div>
                        Add Executive
                    </button>
                </div>
                <div className="lg:overflow-y-auto custom-scrollbar pr-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full mb-3">
                        {cardData.map((item, index) => (
                            <CardComponent
                                key={index}
                                style={item.style}
                                icon={item.icon}
                                iconBgColor="#ffffff"
                                value={<span className="text-[20px] md:text-base font-extrabold text-[#16284F] leading-none block pt-2 truncate">{item.value}</span>}
                                label={item.label}
                                textSize="text-[12px] md:text-[13px] text-[#4D6285] font-semibold"
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="text-[#16284F] text-[12px] md:text-[13px] font-bold whitespace-nowrap">
                            Category :
                        </span>
                        <DropdownPill
                            value={selectedCategory}
                            options={categoryOptions}
                            onChange={setSelectedCategory}
                            minWidth="min-w-[180px]"
                            variant="light"
                        />
                    </div>

                    <div className="flex flex-col gap-4 mt-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-[#16284F] text-base font-bold">Issues Received Today</h2>
                            {!isDatePickerOpen ? (
                                <button
                                    type="button"
                                    onClick={() => setIsDatePickerOpen(true)}
                                    className="inline-flex h-[36px] min-w-[132px] cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-[#DFF1E8] px-2.5 text-[14px] font-extrabold text-[#43C17A]"
                                    title="Select date"
                                >
                                    <CalendarIcon size={15} weight="fill" />
                                    {displayDate}
                                </button>
                            ) : (
                                <div className="flex h-[38px] min-w-[210px] items-center gap-2 rounded-2xl border border-[#43C17A] bg-white px-2.5 text-[#43C17A] shadow-sm">
                                    <CalendarIcon size={17} weight="fill" />
                                    <input
                                        type="date"
                                        value={selectedDateKey}
                                        onChange={(event) => {
                                            setSelectedDateKey(event.target.value || getTodayDateKey());
                                            setIsDatePickerOpen(false);
                                        }}
                                        className="h-7 w-[135px] rounded-xl border border-[#D7D7D7] px-2 text-center text-[13px] font-medium text-[#282828] outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsDatePickerOpen(false)}
                                        className="cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                        title="Close"
                                    >
                                        <X size={15} weight="bold" />
                                    </button>
                                </div>
                            )}
                            {/* <button
                                onClick={() => setIsAlertModalOpen(true)}
                                className="bg-[#FF0000] text-[#FFFFFF] px-4 py-1.5 rounded-sm cursor-pointer"
                            >
                                Send Alert
                            </button> */}
                        </div>
                        <div className="bg-white -mt-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden">
                            <div className="flex items-center gap-3 p-5 -mb-6 border-b border-gray-50">
                                <div className="bg-[#E8F8EF] p-2 rounded-full">
                                    <ListDashes size={20} color="#43C17A" weight="fill" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#282828]">Recent Issues</h3>
                                    <p className="text-sm text-[#282828] font-medium">Latest reported complaints across campus</p>
                                </div>
                            </div>
                            <div className="p-2 sm:p-4">
                                <TableComponent
                                    columns={columns}
                                    tableData={paginatedTableData}
                                    height="620px"
                                    isLoading={issuesLoading}
                                    tableClassName="min-w-[1280px]"
                                />
                            </div>
                            <Pagination
                                currentPage={page}
                                totalItems={issueRows.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setPage}
                                roundedBottom="rounded-b-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <WellbeingRight button={true} onHeaderActionClick={() => setIsModalOpen(true)} />
            <AddExecutiveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <AlertExecutiveModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
            />
        </main>
    );
}
