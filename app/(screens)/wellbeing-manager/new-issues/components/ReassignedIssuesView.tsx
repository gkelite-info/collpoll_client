"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CaretDown, ExclamationMarkIcon, Export, EyeIcon, FunnelSimpleIcon, RepeatIcon, Tray } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { downloadCSV } from "@/app/utils/downloadCSV";
import { MdPendingActions } from "react-icons/md";
import { MdOutlineFlag } from "react-icons/md";
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import TicketDetailsView from "./TicketDetailsView";
import ReassignTicketModal from "../../components/ReassignTicketModal";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";

type CategoryRelation =
    | { categoryName?: string | null }
    | { categoryName?: string | null }[]
    | null;

type SupportIssueRow = {
    wellbeingSupportIssueId: number;
    fullName: string;
    email: string;
    issueTitle: string;
    description: string;
    categoryId: number;
    priority: "high" | "medium" | "low";
    issueRaisedRole: string;
    createdBy: number;
    createdAt: string | null;
    wellbeing_categories: CategoryRelation;
};

type IssueJobRow = {
    wellbeingIssueJobId: number;
    wellbeingSupportIssueId: number;
    wellBeingId: number;
    status: "inprogress" | "completed" | "cancelled";
    updatedAt: string | null;
};

type WellBeingRow = {
    wellBeingId: number;
    userId: number;
};

type UserNameRow = {
    userId: number;
    fullName: string | null;
};

type ReassignedIssueRow = {
    supportIssueId: number;
    ticketId: string;
    fullName: string;
    email: string;
    profileUrl: string | null;
    categoryId: number;
    category: string;
    issueTitle: string;
    description: string;
    assignedTo: string;
    priority: "high" | "medium" | "low";
    issueRaisedRole: string;
    createdBy: number;
    createdAt: string | null;
};

type CategoryFilter = "all" | `${number}`;
type PriorityFilter = "all" | ReassignedIssueRow["priority"];

type DropdownOption<T extends string> = {
    label: string;
    value: T;
};

const getCategoryName = (category: CategoryRelation) => {
    if (Array.isArray(category)) {
        return category[0]?.categoryName || "-";
    }

    return category?.categoryName || "-";
};

const formatCount = (count: number) => String(count).padStart(2, "0");

const priorityOptions: DropdownOption<PriorityFilter>[] = [
    { label: "Priority: All", value: "all" },
    { label: "Priority: High", value: "high" },
    { label: "Priority: Medium", value: "medium" },
    { label: "Priority: Low", value: "low" },
];

function FilterDropdown<T extends string>({
    value,
    options,
    onChange,
    icon,
}: {
    value: T;
    options: DropdownOption<T>[];
    onChange: (value: T) => void;
    icon: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const selectedLabel = options.find((option) => option.value === value)?.label ?? "All";

    return (
        <div className="relative z-10" onMouseLeave={() => setOpen(false)}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="relative flex min-w-[210px] cursor-pointer items-center rounded-lg border border-[#BCCBB94D] bg-[#F3FCEF] px-3 py-2 transition-all hover:bg-[#EAF3EE]"
            >
                <span className="mr-2 shrink-0 text-[#3D4A3D]">{icon}</span>
                <span className="truncate pr-6 text-[#161D16] text-[12px] font-bold sm:text-[13px]">
                    {selectedLabel}
                </span>
                <CaretDown
                    size={14}
                    weight="bold"
                    className={`absolute right-3 text-[#2B3B30] transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open ? (
                <div className="custom-scrollbar absolute left-0 top-full z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
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
                                className={`block w-full cursor-pointer px-5 py-3 text-left text-[13px] font-semibold transition-colors ${selected
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


function ReassignedIssuesContent() {
    const router = useRouter();
    const { collegeId } = useUser();
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const searchParams = useSearchParams();
    const selectedTicketId = searchParams.get("ticketId");
    const [reassignModalTargetId, setReassignModalTargetId] = useState<string | null>(null);
    const [reassignedIssues, setReassignedIssues] = useState<ReassignedIssueRow[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<DropdownOption<CategoryFilter>[]>([
        { label: "All Source Categories", value: "all" },
    ]);
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
    const [selectedPriority, setSelectedPriority] = useState<PriorityFilter>("all");
    const [isLoading, setIsLoading] = useState(true);

    const loadCategories = useCallback(async () => {
        if (!collegeId) {
            setCategoryOptions([{ label: "All Source Categories", value: "all" }]);
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

            if (error) {
                throw error;
            }

            setCategoryOptions([
                { label: "All Source Categories", value: "all" },
                ...((data ?? []) as { categoryId: number; categoryName: string }[]).map((category) => ({
                    label: category.categoryName,
                    value: String(category.categoryId) as CategoryFilter,
                })),
            ]);
        } catch (error) {
            console.error("Failed to load reassigned issue categories:", error);
            setCategoryOptions([{ label: "All Source Categories", value: "all" }]);
        }
    }, [collegeId]);

    const loadReassignedIssues = useCallback(async () => {
        if (!collegeId) {
            setReassignedIssues([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data: issues, error: issuesError } = await supabase
                .from("wellbeing_support_issues")
                .select(`
                    wellbeingSupportIssueId,
                    fullName,
                    email,
                    issueTitle,
                    description,
                    categoryId,
                    priority,
                    issueRaisedRole,
                    createdBy,
                    createdAt,
                    wellbeing_categories(categoryName)
                `)
                .eq("collegeId", collegeId)
                .eq("IssueStatus", "pending")
                .eq("isActive", true)
                .eq("is_deleted", false)
                .is("deletedAt", null)
                .in("issueVisibilityRole", ["wellbeingmanager", "both"])
                .order("createdAt", { ascending: false });

            if (issuesError) {
                throw issuesError;
            }

            const issueRows = (issues || []) as SupportIssueRow[];
            const issueIds = issueRows
                .map((issue) => issue.wellbeingSupportIssueId)
                .filter((issueId): issueId is number => Boolean(issueId));

            if (issueIds.length === 0) {
                setReassignedIssues([]);
                return;
            }

            const { data: jobs, error: jobsError } = await supabase
                .from("wellbeing_issue_jobs")
                .select("wellbeingIssueJobId, wellbeingSupportIssueId, wellBeingId, status, updatedAt")
                .in("wellbeingSupportIssueId", issueIds)
                .eq("isActive", true)
                .eq("is_deleted", false)
                .is("deletedAt", null)
                .order("updatedAt", { ascending: false });

            if (jobsError) {
                throw jobsError;
            }

            const latestJobByIssueId = new Map<number, IssueJobRow>();
            (jobs || []).forEach((job) => {
                const typedJob = job as IssueJobRow;
                if (!latestJobByIssueId.has(typedJob.wellbeingSupportIssueId)) {
                    latestJobByIssueId.set(typedJob.wellbeingSupportIssueId, typedJob);
                }
            });

            const visibleIssueIds = issueIds.filter((issueId) => {
                const latestJob = latestJobByIssueId.get(issueId);
                return !latestJob || latestJob.status !== "completed";
            });

            const wellBeingIds = Array.from(new Set(
                visibleIssueIds
                    .map((issueId) => latestJobByIssueId.get(issueId))
                    .filter((job): job is IssueJobRow => Boolean(job))
                    .map((job) => job.wellBeingId)
            ));
            const { data: wellBeings, error: wellBeingsError } = wellBeingIds.length
                ? await supabase
                    .from("well_beings")
                    .select("wellBeingId, userId")
                    .in("wellBeingId", wellBeingIds)
                : { data: [], error: null };

            if (wellBeingsError) {
                throw wellBeingsError;
            }

            const userIds = Array.from(new Set(((wellBeings || []) as WellBeingRow[]).map((item) => item.userId)));
            const { data: users, error: usersError } = userIds.length
                ? await supabase
                    .from("users")
                    .select("userId, fullName")
                    .in("userId", userIds)
                : { data: [], error: null };

            if (usersError) {
                throw usersError;
            }

            const wellBeingById = new Map<number, WellBeingRow>(
                ((wellBeings || []) as WellBeingRow[]).map((item) => [item.wellBeingId, item])
            );
            const userNameById = new Map<number, string>(
                ((users || []) as UserNameRow[]).map((user) => [user.userId, user.fullName || "-"])
            );
            const issueById = new Map<number, SupportIssueRow>(
                issueRows.map((issue) => [issue.wellbeingSupportIssueId, issue])
            );
            const createdByIds = Array.from(
                new Set(
                    visibleIssueIds
                        .map((issueId) => issueById.get(issueId)?.createdBy)
                        .filter((userId): userId is number => Boolean(userId))
                )
            );
            const { data: profiles, error: profilesError } = createdByIds.length
                ? await supabase
                    .from("user_profile")
                    .select("userId, profileUrl")
                    .in("userId", createdByIds)
                    .eq("is_deleted", false)
                : { data: [], error: null };

            if (profilesError) {
                throw profilesError;
            }

            const profileUrlByUserId = new Map<number, string>(
                ((profiles || []) as { userId: number; profileUrl: string | null }[])
                    .filter((profile) => Boolean(profile.profileUrl))
                    .map((profile) => [profile.userId, profile.profileUrl as string])
            );

            const rows = visibleIssueIds.reduce<ReassignedIssueRow[]>((acc, issueId) => {
                const issue = issueById.get(issueId);
                const job = latestJobByIssueId.get(issueId);
                if (!issue) {
                    return acc;
                }

                const wellBeing = job ? wellBeingById.get(job.wellBeingId) : null;
                const assignedTo = wellBeing ? userNameById.get(wellBeing.userId) || "-" : "-";

                acc.push({
                    supportIssueId: issue.wellbeingSupportIssueId,
                    ticketId: `#TK-${issue.wellbeingSupportIssueId}`,
                    fullName: issue.fullName,
                    email: issue.email,
                    profileUrl: profileUrlByUserId.get(issue.createdBy) || null,
                    categoryId: issue.categoryId,
                    category: getCategoryName(issue.wellbeing_categories),
                    issueTitle: issue.issueTitle,
                    description: issue.description,
                    assignedTo,
                    priority: issue.priority,
                    issueRaisedRole: issue.issueRaisedRole,
                    createdBy: issue.createdBy,
                    createdAt: issue.createdAt,
                });

                return acc;
            }, []);

            setReassignedIssues(rows);
        } catch (error) {
            console.error("Failed to load reassigned issues:", error);
            setReassignedIssues([]);
        } finally {
            setIsLoading(false);
        }
    }, [collegeId]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        loadReassignedIssues();
    }, [loadReassignedIssues]);

    useEffect(() => {
        const channel = supabase
            .channel("manager-reassigned-issues")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "wellbeing_issue_jobs" },
                loadReassignedIssues
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "wellbeing_support_issues" },
                loadReassignedIssues
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadReassignedIssues]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, selectedPriority]);

    const filteredReassignedIssues = useMemo(
        () => reassignedIssues.filter((issue) => {
            const matchesCategory =
                selectedCategory === "all" || issue.categoryId === Number(selectedCategory);
            const matchesPriority =
                selectedPriority === "all" || issue.priority === selectedPriority;

            return matchesCategory && matchesPriority;
        }),
        [reassignedIssues, selectedCategory, selectedPriority]
    );

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredReassignedIssues.length / ITEMS_PER_PAGE));
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [filteredReassignedIssues.length, page]);

    const exportRows = useMemo(
        () => filteredReassignedIssues.map((row) => ({
            ticketId: row.ticketId,
            category: row.category,
            issueTitle: row.issueTitle,
            description: row.description,
            originallyAssignedTo: row.assignedTo,
            priority: row.priority,
        })),
        [filteredReassignedIssues]
    );

    const highPriorityCount = filteredReassignedIssues.filter((issue) => issue.priority === "high").length;

    const columns = [
        { title: "TICKET ID", key: "ticketId" },
        { title: "CATEGORY", key: "category" },
        { title: "ISSUE TITLE", key: "issueTitle" },
        { title: "DESCRIPTION", key: "description" },
        { title: "ORIGINALLY ASSIGNED TO", key: "assignedTo" },
        { title: "ACTION", key: "action" },
    ];

    const tableData = filteredReassignedIssues.map((row) => ({
        ticketId: <span className="text-emerald-600 font-bold text-[13px] min-w-[80px] block">{row.ticketId}</span>,
        category: <span className="text-gray-600 text-[13px] w-[150px] block truncate">{row.category}</span>,
        issueTitle: <span className="font-bold text-[#16284F] text-[13px] w-[240px] block truncate">{row.issueTitle}</span>,
        description: <span className="text-gray-500 text-[12px] w-[340px] block truncate leading-relaxed">{row.description}</span>,
        assignedTo: <span className="text-gray-600 text-[13px] w-[180px] block font-medium truncate">{row.assignedTo}</span>,
        action:
            <button className="text-gray-700 flex gap-2 hover:text-[#16284F] text-[13px] font-semibold underline decoration-gray-300">
                <span
                    onClick={() => router.push(`?tab=reassigned&ticketId=${encodeURIComponent(row.ticketId.toString().replace('#', ''))}`)}
                    className="bg-[#16284F] cursor-pointer text-[#ffffff] p-1.5 rounded-full">
                    <EyeIcon size={16} weight="fill" />
                </span>
                <span
                    onClick={() => setReassignModalTargetId(row.ticketId as string)}
                    className="bg-[#16284F] cursor-pointer text-[#ffffff] p-1.5 rounded-full">
                    <RepeatIcon size={16} weight="fill" />
                </span>
            </button>
    }));

    const totalItems = filteredReassignedIssues.length;
    const paginatedTableData = tableData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (selectedTicketId) {
        return (
            <TicketDetailsView
                ticketId={`#${selectedTicketId}`}
                onBack={() => router.push('?tab=reassigned')}
            />
        );
    }

    return (
        <main className="flex flex-col lg:flex-row w-full min-h-screen overflow-auto pb-5">
            <div className="w-full p-2 flex flex-col gap-2 lg:h-screen lg:overflow-y-auto custom-scrollbar">
                <div className="flex flex-col sm:flex-row justify-between gap-4   mt-1">
                    <div className="flex flex-col justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-lg md:text-[26px] font-bold leading-none select-none">
                            <span onClick={() => router.push("?tab=new")} className="text-[#16284F] cursor-pointer transition-colors">New Issues</span>
                            <span className="text-[#16284F] font-bold">/</span>
                            <span className="text-[#43C17A] cursor-pointer flex items-center gap-1.5">Reassigned Issues</span>
                        </div>
                        <p className="text-gray-500 text-[12px] sm:text-xs md:text-sm font-medium -mt-1">
                            Review and manage cases transferred to your department&apos;s oversight.
                        </p>
                    </div>

                    <button
                        onClick={() => downloadCSV(exportRows, "Reassigned_Campus_Issues_Report")}
                        className="flex items-center justify-center gap-2 bg-[#047857] text-white px-3 sm:px-4 py-2 md:py-1 rounded-md text-[12px] sm:text-sm font-semibold tracking-wide transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
                    >
                        <Export size={16} weight="bold" />
                        <span>Export Report</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full mt-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F0E4] shrink-0">
                            <Tray size={24} weight="bold" className="text-[#006E2F]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                Total Issues
                            </span>
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                {formatCount(totalItems)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFDDB8] shrink-0">
                            <MdPendingActions className="text-[#855300] h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                Pending Review
                            </span>
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                {formatCount(totalItems)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFDAD7] shrink-0">
                            <ExclamationMarkIcon size={24} weight="bold" className="text-[#B61722] font-extrabold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                Urgent Action
                            </span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-[#D32F2F] leading-none">
                                    {formatCount(highPriorityCount)}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-semibold text-[#D32F2F] mt-1 tracking-wide">
                                    High priority tickets
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden mt-1">
                    <div className="flex flex-row flex-wrap items-center gap-3 mt-4 mb-2 ml-5">
                        <FilterDropdown
                            value={selectedCategory}
                            options={categoryOptions}
                            onChange={setSelectedCategory}
                            icon={<FunnelSimpleIcon size={16} weight="bold" />}
                        />
                        <FilterDropdown
                            value={selectedPriority}
                            options={priorityOptions}
                            onChange={setSelectedPriority}
                            icon={<MdOutlineFlag className="h-4 w-4" />}
                        />
                    </div>
                    <div className="p-1 overflow-x-auto select-none">
                        <div className="min-w-[1180px] w-full px-2">
                            <TableComponent
                                columns={columns}
                                tableData={paginatedTableData}
                                isLoading={isLoading}
                                height="none"
                                stickyHeader={false}
                            />
                        </div>
                    </div>
                    {totalItems > 0 && (
                        <Pagination
                            currentPage={page}
                            totalItems={totalItems}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setPage}
                            roundedBottom="rounded-b-xl pb-4"
                        />
                    )}
                </div>
            </div>
            <ReassignTicketModal
                isOpen={reassignModalTargetId !== null}
                onClose={() => setReassignModalTargetId(null)}
                onReassigned={loadReassignedIssues}
                ticketId={reassignModalTargetId || undefined}
                issue={reassignedIssues.find((issue) => issue.ticketId === reassignModalTargetId)}
            />
        </main>
    );
}

export default function ReassignedIssuesView() {
    return (
        <Suspense fallback={<div className="w-full flex items-center justify-center p-10 font-medium">
            <Loader />
        </div>}>
            <ReassignedIssuesContent />
        </Suspense>
    );
}
