"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { requestsData } from "./mock-data";
import { RequestsCardsShimmer } from "@/app/(screens)/faculty/clubs/shimmers/RequestsListShimmer";

const ITEMS_PER_PAGE = 10;

export default function RequestsList({ currentFilter }: { currentFilter: string }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);

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
        setSearchInput("");
        setSearchQuery("");
    }, [currentFilter]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            let filtered = requestsData;
            if (currentFilter !== "all") {
                filtered = filtered.filter(req => req.status === currentFilter);
            }
            if (searchQuery) {
                filtered = filtered.filter(req => req.name.toLowerCase().includes(searchQuery.toLowerCase()));
            }
            setTotalItems(filtered.length);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            setRequests(filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE));
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentFilter, currentPage, searchQuery]);

    const handleAction = (id: string, action: string) => {
        toast.success(`Request ${action}ed successfully (Static Demo)`);
    };

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
            </div>

            {isLoading ? (
                <RequestsCardsShimmer />
            ) : requests.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md border border-gray-50">
                            <div className="flex items-center gap-4">
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
                                            onClick={() => handleAction(req.id, "reject")}
                                            className="rounded-md bg-[#FF2A2A] cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, "accept")}
                                            className="rounded-md bg-[#43C17A] cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500">
                                            Accept
                                        </button>
                                    </>
                                ) : req.status === "accepted" ? (
                                    <button
                                        onClick={() => handleAction(req.id, "remove")}
                                        className="rounded-md bg-[#16284F] cursor-pointer px-5 py-2 text-sm font-semibold text-white hover:bg-opacity-90">
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
        </div>
    );
}
