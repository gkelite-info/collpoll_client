'use client'
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { getFacultyClubMembersAPI, getFacultyClubRequestsAPI, processClubRequestsAPI, removeClubMembersAPI } from "@/lib/helpers/clubActivity/facultyRequestsAPI";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RequestsListShimmer, { RequestsCardsShimmer } from "../shimmers/RequestsListShimmer";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";

const ITEMS_PER_PAGE = 10;

export default function RequestsList({ clubId, currentFilter }: { clubId: any, currentFilter: string }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { facultyId } = useUser();

    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        type: "accept" | "reject" | "remove" | null;
        target: "single" | "multiple";
        item: any | null;
    }>({ open: false, type: null, target: "single", item: null });

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
    }, [currentFilter]);

    useEffect(() => {
        if (!clubId) return;

        let ignore = false;
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                let response;

                if (currentFilter === "accepted") {
                    response = await getFacultyClubMembersAPI(parseInt(clubId, 10), currentPage, ITEMS_PER_PAGE, searchQuery);
                } else {
                    response = await getFacultyClubRequestsAPI(parseInt(clubId, 10), currentFilter, currentPage, ITEMS_PER_PAGE, searchQuery);
                }

                if (!ignore) {
                    setRequests(response.requests);
                    setTotalItems(response.totalCount);
                }
            } catch (error) {
                if (!ignore) toast.error("Failed to load data.");
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                    setIsInitialLoad(false);
                }
            }
        };

        fetchRequests();

        return () => { ignore = true; };
    }, [clubId, currentFilter, currentPage, searchQuery]);

    const openActionModal = (type: "accept" | "reject" | "remove", target: "single" | "multiple", item: any = null) => {
        setModalConfig({ open: true, type, target, item });
    };

    const closeActionModal = () => {
        setModalConfig({ open: false, type: null, target: "single", item: null });
    };

    const handleExecuteAction = async () => {
        if (!facultyId) return toast.error("User not authenticated");

        setIsActionLoading(true);
        try {
            const processingIds = modalConfig.target === "single" ? [modalConfig.item.id] : selectedIds;
            const processingItems = modalConfig.target === "single" ? [modalConfig.item] : requests.filter(req => selectedIds.includes(req.id));
            const numericIds = processingIds.map(id => parseInt(id, 10));

            const studentsData = processingItems.map(req => ({
                clubId: parseInt(clubId, 10),
                studentId: req.studentId
            }));

            if (modalConfig.type === "remove") {
                await removeClubMembersAPI(studentsData, facultyId);
            } else {
                await processClubRequestsAPI(modalConfig.type as "accept" | "reject", numericIds, studentsData, facultyId);
            }

            toast.success(`Successfully ${modalConfig.type}ed!`);
            setSelectedIds([]);
            closeActionModal();

            setIsLoading(true);
            const response = currentFilter === "accepted" 
                ? await getFacultyClubMembersAPI(parseInt(clubId, 10), currentPage, ITEMS_PER_PAGE, searchQuery)
                : await getFacultyClubRequestsAPI(parseInt(clubId, 10), currentFilter, currentPage, ITEMS_PER_PAGE, searchQuery);
            setRequests(response.requests);
            setTotalItems(response.totalCount);

        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsActionLoading(false);
            setIsLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === requests.length && requests.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(requests.map(req => req.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    if (isInitialLoad) return <RequestsListShimmer />;

    return (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-[#ffffff] shadow-2xl p-6 min-h-[600px] flex flex-col">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-3">
                    {["all", "pending", "accepted"].map((filter) => (
                        <Link
                            key={filter}
                            scroll={false}
                            href={`?tab=requests&filter=${filter}`}
                            className={`rounded-full px-6 py-2 text-sm font-semibold capitalize transition-all ${currentFilter === filter
                                ? "bg-[#16284F] text-white"
                                : "bg-[#E7E7E7] text-[#000000]"
                                }`}
                        >
                            {filter}
                        </Link>
                    ))}
                </div>

                <div className="flex w-full max-w-sm items-center rounded-full bg-[#EAEAEA] px-4 py-2.5 transition-shadow focus-within:ring-2 focus-within:ring-[#98eabc]">
                    <input
                        type="text"
                        placeholder="Search Club Member....."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#282828] placeholder:text-gray-500 focus:outline-none"
                    />
                    <MagnifyingGlassIcon size={26} className="text-[#43C17A]" />
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500">
                    {totalItems} {currentFilter === 'all' ? 'Total' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Requests
                </h3>

                {selectedIds.length > 0 && currentFilter !== "all" && (
                    <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                        {currentFilter === "pending" && (
                            <>
                                <button
                                    disabled={isActionLoading}
                                    onClick={() => openActionModal("reject", "multiple")}
                                    className="rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#FF2A2A] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 shadow-sm">
                                    Reject Selected ({selectedIds.length})
                                </button>
                                <button
                                    disabled={isActionLoading}
                                    onClick={() => openActionModal("accept", "multiple")}
                                    className="rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#43C17A] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-500 shadow-sm">
                                    Accept Selected ({selectedIds.length})
                                </button>
                            </>
                        )}
                        {currentFilter === "accepted" && (
                            <button
                                disabled={isActionLoading}
                                onClick={() => openActionModal("remove", "multiple")}
                                className="rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-[#16284F] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90">
                                Remove Selected ({selectedIds.length})
                            </button>
                        )}
                    </div>
                )}
            </div>

            {currentFilter !== "all" && requests.length > 0 && (
                <div className="mb-3 flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        checked={selectedIds.length === requests.length && requests.length > 0}
                        onChange={toggleSelectAll}
                        disabled={isActionLoading}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#16284F] focus:ring-[#16284F] disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-[#282828]">Select All on Page</span>
                </div>
            )}

            {isLoading ? (
                <RequestsCardsShimmer />
            ) : requests.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {requests.map((req, index) => (
                        <div key={req.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md border border-gray-50">
                            <div className="flex items-center gap-4">
                                {currentFilter !== "all" && (
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(req.id)}
                                        onChange={() => toggleSelect(req.id)}
                                        disabled={isActionLoading}
                                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#16284F] focus:ring-[#16284F] disabled:opacity-50"
                                    />
                                )}
                                <Avatar src={req.avatar} alt={req.name} size={40} />
                                <div>
                                    <h4 className="font-bold text-gray-900">{req.name}</h4>
                                    <p className="text-xs text-gray-500">{req.details}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {req.status === "pending" ? (
                                    <>
                                        <button
                                            disabled={isActionLoading}
                                            onClick={() => openActionModal("reject", "single", req)}
                                            className="rounded-md bg-[#FF2A2A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                                            Reject
                                        </button>
                                        <button
                                            disabled={isActionLoading}
                                            onClick={() => openActionModal("accept", "single", req)}
                                            className="rounded-md bg-[#43C17A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500">
                                            Accept
                                        </button>
                                    </>
                                ) : req.status === "accepted" ? (
                                    <button
                                        disabled={isActionLoading}
                                        onClick={() => openActionModal("remove", "single", req)}
                                        className="rounded-md bg-[#16284F] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-5 py-2 text-sm font-semibold text-white hover:bg-opacity-90">
                                        Remove
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12">
                    No requests found {searchInput ? "matching your search" : "in this category"}.
                </div>
            )}

            {totalItems > 0 && (
                <div className="w-full mt-auto pt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}

            <ConfirmDeleteModal
                open={modalConfig.open}
                isDeleting={isActionLoading}
                actionType={modalConfig.type} 
                onConfirm={handleExecuteAction}
                onCancel={closeActionModal}
                title={modalConfig.type === "accept" ? "Accept" : modalConfig.type === "reject" ? "Reject" : "Remove"}
                confirmText={modalConfig.type === "accept" ? "Yes, Accept" : modalConfig.type === "reject" ? "Yes, Reject" : "Yes, Remove"}
                loadingText={modalConfig.type === "accept" ? "Accepting..." : modalConfig.type === "reject" ? "Rejecting..." : "Removing..."}
                name={modalConfig.target === "multiple" ? `${selectedIds.length} selected students` : modalConfig.item?.name}
            />
        </div >
    );
}