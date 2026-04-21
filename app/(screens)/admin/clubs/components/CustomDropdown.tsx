'use client'

import { Avatar } from "@/app/utils/Avatar";
import { getSearchableUsers, SearchableUser } from "@/lib/helpers/clubActivity/adminClubsAPI";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
interface SearchableDropdownProps {
    label: string;
    isOpen: boolean;
    onToggle: () => void;
    value: any;
    onSelect: (user: any) => void;
    onRemove?: (userId: string) => void;
    isMulti?: boolean;
    direction?: "up" | "down";
    collegeId: number | null;
    roleGroup: "student" | "faculty";
}

const globalFetchCache = new Map<string, Promise<{ users: SearchableUser[], hasMore: boolean }>>();

export function SearchableUserDropdown({
    label,
    isOpen,
    onToggle,
    value,
    onSelect,
    onRemove,
    isMulti = false,
    direction = "down",
    collegeId,
    roleGroup
}: SearchableDropdownProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [items, setItems] = useState<SearchableUser[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        if (isOpen && !hasOpenedOnce) {
            setHasOpenedOnce(true);
        }
    }, [isOpen, hasOpenedOnce]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!hasOpenedOnce || !collegeId) return;
        let isMounted = true;
        const fetchUsers = async () => {
            setLoading(true);
            const cacheKey = `${collegeId}-${roleGroup}-${debouncedQuery}-${page}`;
            try {
                let fetchPromise = globalFetchCache.get(cacheKey);
                if (!fetchPromise) {
                    fetchPromise = getSearchableUsers(
                        collegeId,
                        roleGroup,
                        debouncedQuery,
                        page,
                        ITEMS_PER_PAGE
                    );
                    globalFetchCache.set(cacheKey, fetchPromise);
                }
                const { users, hasMore: moreAvailable } = await fetchPromise;
                if (isMounted) {
                    if (page === 1) {
                        setItems(users);
                    } else {
                        setItems(prev => {
                            const existingIds = new Set(prev.map(u => u.id));
                            const uniqueNewUsers = users.filter(u => !existingIds.has(u.id));
                            return [...prev, ...uniqueNewUsers];
                        });
                    }
                    setHasMore(moreAvailable);
                }
            } catch (error) {
                console.error("Failed to fetch users");
                globalFetchCache.delete(cacheKey);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery, page, hasOpenedOnce, collegeId, roleGroup]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const selectedArray = isMulti ? (value || []) : (value ? [value] : []);
    const isSelected = (id: string) => selectedArray.some((u: any) => u.id === id);

    return (
        <div className={`custom-dropdown-container relative w-full ${isOpen ? "z-50" : "z-10"}`}>
            <label className="block text-[15px] font-semibold text-[#282828] mb-2">{label} <span className="text-red-500">*</span></label>
            <div
                className="w-full min-h-[45px] border border-[#CCCCCC] rounded-lg px-3 flex items-center justify-between cursor-pointer bg-white transition-colors"
                onClick={onToggle}
            >
                <div className="flex flex-nowrap gap-2 flex-1 items-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
                    {isMulti ? (
                        selectedArray.length === 0 ? (
                            <span className="text-gray-400 text-sm px-1">Select {label.toLowerCase()}</span>
                        ) : (
                            selectedArray.map((user: any) => (
                                <span key={user.id} className="bg-[#e2e8f0] text-[#1a2b4c] text-[13px] font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
                                    {user.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove?.(user.id);
                                        }}
                                        className="hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-gray-600 focus:outline-none transition-colors"
                                    >
                                        <X size={12} weight="bold" />
                                    </button>
                                </span>
                            ))
                        )
                    ) : (
                        value ? (
                            <div className="flex items-center gap-2 px-1">
                                <Avatar src={value.avatar} alt={value.name} size={24} />
                                <span className="text-sm font-medium text-gray-800">{value.name}</span>
                            </div>
                        ) : (
                            <span className="text-sm px-1 font-medium text-gray-400">
                                Select {label.toLowerCase()}
                            </span>
                        )
                    )}
                </div>
                <div className="pl-2 bg-white flex-shrink-0">
                    <svg className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {isOpen && (
                <div className={`absolute z-50 w-full bg-white border border-[#CCCCCC] rounded-lg shadow-lg flex flex-col overflow-hidden ${direction === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}>
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 shrink-0">
                        <div className="relative">
                            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[38px] pl-9 pr-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                        {loading && page === 1 ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={`shimmer-${i}`} className="px-4 py-3 flex items-center gap-3 animate-pulse border-b border-gray-50 last:border-0">
                                    {isMulti && <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>}
                                    <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="h-3.5 bg-gray-200 rounded w-[60%]"></div>
                                        <div className="h-2.5 bg-gray-200 rounded w-[40%]"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {items.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">No users found.</div>
                                ) : (
                                    items.map((user, index) => {
                                        const selected = isSelected(user.id);
                                        const isLast = items.length === index + 1;
                                        return (
                                            <div
                                                key={user.id}
                                                ref={isLast ? lastElementRef : null}
                                                className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#F4F4F4] transition-colors border-b border-gray-50 last:border-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelect(user);
                                                    if (!isMulti) onToggle();
                                                }}
                                            >
                                                {isMulti && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        readOnly
                                                        className="w-4 h-4 text-[#1a2b4c] rounded border-gray-300 cursor-pointer pointer-events-none shrink-0"
                                                    />
                                                )}
                                                <Avatar src={user.avatar} alt={user.name} size={40} />
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-bold text-[#1a2b4c] truncate">{user.name}</span>
                                                    <span className="text-[12px] font-medium text-gray-500 truncate mt-0.5">{user.education}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {loading && page > 1 && (
                                    <div key={`shimmer-${1}`} className="px-4 py-3 flex items-center gap-3 animate-pulse border-b border-gray-50 last:border-0">
                                        {isMulti && <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>}
                                        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="h-3.5 bg-gray-200 rounded w-[60%]"></div>
                                            <div className="h-2.5 bg-gray-200 rounded w-[40%]"></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}