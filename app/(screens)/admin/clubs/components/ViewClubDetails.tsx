"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";
import { decryptId } from "@/app/utils/encryption";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import TableComponent from "@/app/utils/table/table";
import { motion } from "framer-motion";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import ViewClubDetailsShimmer from "../shimmers/ViewClubDetailsShimmer";

import {
    getAdminClubMembersAPI,
    getAdminClubTitleAPI,
    removeAdminClubMembersAPI
} from "@/lib/helpers/clubActivity/adminClubMembersAPI";
import { fetchAcademicYears, fetchBranches, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";

interface ViewClubDetailsProps {
    clubId: string;
}

const ITEMS_PER_PAGE = 10;

export default function ViewClubDetails({ clubId }: ViewClubDetailsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { collegeId, adminId, loading: userLoading } = useUser();

    const rawClubId = useMemo(() => decryptId(clubId), [clubId]);

    const status = searchParams.get("status") || "active";

    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [eduOptions, setEduOptions] = useState<any[]>([]);
    const [branchOptions, setBranchOptions] = useState<any[]>([]);
    const [yearOptions, setYearOptions] = useState<any[]>([]);

    const [selectedEduId, setSelectedEduId] = useState<number | null>(null);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

    const [selectedEduLabel, setSelectedEduLabel] = useState<string | null>(null);
    const [selectedBranchLabel, setSelectedBranchLabel] = useState<string | null>(null);
    const [selectedYearLabel, setSelectedYearLabel] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [modalConfig, setModalConfig] = useState<{ open: boolean; target: "single" | "multiple"; item: any | null }>({ open: false, target: "single", item: null });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== searchInput) {
                setSearchQuery(searchInput);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
        setSearchInput("");
        setSearchQuery("");
    }, [status]);

    useEffect(() => {
        if (!collegeId) return;
        fetchEducations(parseInt(collegeId.toString(), 10)).then(setEduOptions).catch(console.error);
    }, [collegeId]);

    useEffect(() => {
        if (!collegeId || !selectedEduId) {
            setBranchOptions([]);
            setSelectedBranchId(null);
            setSelectedBranchLabel(null);
            return;
        }
        fetchBranches(parseInt(collegeId.toString(), 10), selectedEduId).then(setBranchOptions).catch(console.error);
    }, [collegeId, selectedEduId]);

    useEffect(() => {
        if (!collegeId || !selectedEduId || !selectedBranchId) {
            setYearOptions([]);
            setSelectedYearId(null);
            setSelectedYearLabel(null);
            return;
        }
        fetchAcademicYears(parseInt(collegeId.toString(), 10), selectedEduId, selectedBranchId).then(setYearOptions).catch(console.error);
    }, [collegeId, selectedEduId, selectedBranchId]);

    const { data: titleData } = useQuery({
        queryKey: ['admin-club-title', rawClubId],
        queryFn: () => getAdminClubTitleAPI(parseInt(rawClubId!, 10)),
        enabled: !!rawClubId,
        staleTime: Infinity
    });

    const { data: membersData, isFetching: isFetchingMembers, isLoading: isInitialLoadQuery } = useQuery({
        queryKey: ['admin-club-members', rawClubId, status, currentPage, ITEMS_PER_PAGE, searchQuery, selectedEduId, selectedBranchId, selectedYearId],
        queryFn: () => getAdminClubMembersAPI(
            parseInt(rawClubId!, 10),
            status,
            currentPage,
            ITEMS_PER_PAGE,
            searchQuery,
            { eduId: selectedEduId || undefined, branchId: selectedBranchId || undefined, yearId: selectedYearId || undefined }
        ),
        enabled: !!rawClubId && !!collegeId,
        placeholderData: keepPreviousData,
    });

    const members = membersData?.members || [];
    const totalItems = membersData?.totalCount || 0; // Filtered count for pagination
    const overallTotalCount = membersData?.overallCount || 0; // Constant count for header
    const clubName = titleData || "Loading...";
    const isLoading = isFetchingMembers;
    const isInitialLoad = isInitialLoadQuery;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.filter-dropdown')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateFilters = (newStatus: string) => {
        router.push(`/admin/clubs?tab=view&viewClubId=${clubId}&status=${newStatus}`);
    };

    const toggleSelectAll = () => {
        const selectableMembers = members.filter(m => !m.isOfficial);
        if (selectedIds.length === selectableMembers.length && selectableMembers.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(selectableMembers.map(m => m.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const openActionModal = (target: "single" | "multiple", item: any = null) => {
        setModalConfig({ open: true, target, item });
    };

    const closeActionModal = () => {
        setModalConfig({ open: false, target: "single", item: null });
    };

    const removeMutation = useMutation({
        mutationFn: (studentsData: any[]) => removeAdminClubMembersAPI(studentsData, adminId!),
        onSuccess: () => {
            toast.success(`Successfully removed!`);
            setSelectedIds([]);
            closeActionModal();
            queryClient.invalidateQueries({ queryKey: ['admin-club-members', rawClubId] });
            queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
        },
        onError: () => {
            toast.error("Failed to remove members. Please try again later.", { id: "admin-remove-error" });
        }
    });

    const handleExecuteRemove = () => {
        if (!adminId || !rawClubId) return toast.error("Admin authentication missing. Please log in.", { id: "admin-auth-err" });

        const processingItems = modalConfig.target === "single" ? [modalConfig.item] : members.filter(req => selectedIds.includes(req.id));
        const studentsData = processingItems.map(req => ({
            clubId: parseInt(rawClubId, 10),
            studentId: req.studentId
        }));

        removeMutation.mutate(studentsData);
    };

    const isActionLoading = removeMutation.isPending;

    const isInactive = status === "inactive";
    const themeColor = isInactive ? "text-red-500" : "text-[#43C17A]";
    const headerStatusText = `${isInactive ? "Inactive" : "Active"} Members`;
    const totalText = `Total ${isInactive ? "Inactive" : "Active"} Members :`;

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "President":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">President 👑</span>;
            case "Vice President":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Vice President</span>;
            case "Responsible Faculty":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Responsible Faculty</span>;
            case "Mentor":
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Mentor</span>;
            default:
                return null;
        }
    };

    const columns = [
        { title: "User Name", key: "name" },
        { title: "User ID", key: "pinNumber" },
        { title: "Role", key: "role" },
        { title: "Education Type", key: "edu" },
        { title: "Branch", key: "branch" },
        { title: "Year", key: "year" },
        { title: "Joined Date", key: "date" },
        { title: "Action", key: "action" },
    ];

    const tableData = members.map((row) => ({
        name: (
            <div className="flex items-center gap-3">
                {!row.isOfficial && (
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        disabled={isActionLoading}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#16284F] focus:ring-[#16284F] disabled:opacity-50"
                    />
                )}
                <Avatar src={row.avatar} alt={row.name} size={36} />
                <span className="font-medium text-gray-800">{row.name}</span>
            </div>
        ),
        pinNumber: <span className="font-semibold text-gray-600">{row.pinNumber}</span>,
        role: (
            <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-gray-600 capitalize">{row.baseRole?.toLowerCase()}</span>
                {row.isOfficial && getRoleBadge(row.role)}
            </div>
        ),
        edu: row.edu,
        branch: row.branch,
        year: row.year,
        date: row.date,
        action: row.isOfficial ? (
            <span className="text-xs text-gray-400 font-medium italic">Official</span>
        ) : (
            <button
                onClick={() => openActionModal("single", row)}
                disabled={isActionLoading}
                className="bg-[#16284F] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#121e36] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Remove
            </button>
        )
    }));

    if (userLoading || isInitialLoad) return <ViewClubDetailsShimmer />;

    return (
        <div className="w-full flex flex-col items-center relative">
            <div className="w-full flex justify-start mb-2">
                <button
                    onClick={() => router.push("/admin/clubs?tab=view")}
                    className="flex items-center gap-2 text-[#16284F] hover:text-[#43C17A] font-semibold transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} weight="bold" />
                    Back
                </button>
            </div>

            <div className="bg-[#E9E9E9] p-2 rounded-full inline-flex gap-2 mx-auto self-center mb-8 relative">
                {['active', 'inactive'].map((s) => {
                    const isActive = status === s;
                    const activeBgColor = s === 'inactive' ? 'bg-red-500' : 'bg-[#43C17A]';

                    return (
                        <button
                            key={s}
                            onClick={() => updateFilters(s)}
                            className={`relative cursor-pointer w-36 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "text-white" : "text-[#282828]"}`}
                        >
                            <span className="relative z-20">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="status-toggle-pill"
                                    className={`absolute inset-0 rounded-full shadow-sm z-10 ${activeBgColor}`}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {!isActive && (
                                <div className="absolute inset-0 rounded-full bg-[#DEDEDE] shadow-sm z-0" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="w-full bg-white min-h-[70vh] rounded-2xl shadow-sm border border-gray-100 p-8 pt-8 relative z-0">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">
                        <span className={themeColor}>{headerStatusText}</span>
                        <span className="text-[#16284F]"> – {clubName}</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        {selectedIds.length > 0 && (
                            <button
                                disabled={isActionLoading}
                                onClick={() => openActionModal("multiple")}
                                className="rounded-md cursor-pointer bg-[#16284F] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50 animate-in fade-in">
                                Remove Selected ({selectedIds.length})
                            </button>
                        )}
                        <div className="text-lg font-bold text-[#16284F]">
                            {totalText} <span className={themeColor}>({overallTotalCount})</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row items-start xl:items-end gap-4 xl:gap-6 mb-6 w-full">
                    <div className="relative w-full xl:w-[380px] shrink-0">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search Club Member....."
                            className="w-full bg-[#EAEAEA] border border-transparent rounded-full py-3 pl-6 pr-12 text-[15px] text-[#282828] focus:outline-none focus:border-[#43C17A]"
                        />
                        <button className="absolute right-5 top-1/2 -translate-y-1/2 text-[#43C17A]">
                            <MagnifyingGlass size={25} weight="bold" />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 filter-dropdown w-full xl:w-auto">
                        <CustomDropdown
                            id="edu"
                            label="Education Type"
                            options={eduOptions.map((e: any) => ({ value: e.collegeEducationType, label: e.collegeEducationType }))}
                            value={selectedEduLabel || "All"}
                            widthClassName="w-40"
                            onChange={(val) => {
                                const match = eduOptions.find((e: any) => e.collegeEducationType === val);
                                setSelectedEduLabel(val === "All" ? null : String(val));
                                setSelectedEduId(match?.collegeEducationId || null);
                                // Cascade reset
                                setSelectedBranchLabel(null);
                                setSelectedBranchId(null);
                                setSelectedYearLabel(null);
                                setSelectedYearId(null);
                                setCurrentPage(1);
                            }}
                            theme="always-green"
                            includeAll={true}
                        />
                        <CustomDropdown
                            id="branch"
                            label="Branch"
                            options={branchOptions.map((b: any) => ({ value: b.collegeBranchCode, label: b.collegeBranchCode }))}
                            value={selectedBranchLabel || "All"}
                            widthClassName="w-40"
                            onChange={(val) => {
                                const match = branchOptions.find((b: any) => b.collegeBranchCode === val);
                                setSelectedBranchLabel(val === "All" ? null : String(val));
                                setSelectedBranchId(match?.collegeBranchId || null);
                                // Cascade reset
                                setSelectedYearLabel(null);
                                setSelectedYearId(null);
                                setCurrentPage(1);
                            }}
                            disabled={!selectedEduLabel || selectedEduLabel === "All"}
                            theme="always-green"
                            includeAll={true}
                        />
                        <CustomDropdown
                            id="year"
                            label="Year"
                            options={yearOptions.map((y: any) => ({ value: y.collegeAcademicYear, label: y.collegeAcademicYear }))}
                            value={selectedYearLabel || "All"}
                            widthClassName="w-40"
                            onChange={(val) => {
                                const match = yearOptions.find((y: any) => y.collegeAcademicYear === val);
                                setSelectedYearLabel(val === "All" ? null : String(val));
                                setSelectedYearId(match?.collegeAcademicYearId || null);
                                setCurrentPage(1);
                            }}
                            disabled={!selectedBranchLabel || selectedBranchLabel === "All"}
                            theme="always-green"
                            includeAll={true}
                        />
                    </div>
                </div>

                {members.length > 0 && (
                    <div className="mb-3 flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg w-fit">
                        <input
                            type="checkbox"
                            checked={selectedIds.length === members.filter(m => !m.isOfficial).length && members.filter(m => !m.isOfficial).length > 0}
                            onChange={toggleSelectAll}
                            disabled={isActionLoading}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#16284F] focus:ring-[#16284F] disabled:opacity-50"
                        />
                        <span className="text-sm font-medium text-[#282828]">Select All on Page</span>
                    </div>
                )}

                <TableComponent
                    columns={columns}
                    tableData={tableData}
                    height="65vh"
                    isLoading={isLoading}
                />

                <div className="w-full mt-auto pt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={(page) => setCurrentPage(page)}
                        alwaysShow={true}
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                open={modalConfig.open}
                onConfirm={handleExecuteRemove}
                onCancel={closeActionModal}
                isDeleting={isActionLoading}
                title="Remove Member"
                confirmText="Yes, Remove"
                loadingText="Removing..."
                name={modalConfig.target === "multiple" ? `${selectedIds.length} selected students` : modalConfig.item?.name}
            />
        </div>
    );
}