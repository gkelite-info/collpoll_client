"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import SelectionModalShimmer from "../shimmers/SelectionModalShimmer";
import { Avatar } from "@/app/utils/Avatar";

export interface SelectionItem {
    id: number;
    name: string;
    image?: string;
}

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    selectedItems: SelectionItem[];
    onSelectionChange: (items: SelectionItem[]) => void;
    fetchItems: (searchQuery: string, page: number) => Promise<{ data: SelectionItem[], hasMore: boolean }>;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
    isOpen,
    onClose,
    title,
    selectedItems,
    onSelectionChange,
    fetchItems
}) => {
    const [localSelectedItems, setLocalSelectedItems] = useState<SelectionItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    const [items, setItems] = useState<SelectionItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalSelectedItems(selectedItems);
            setSearchQuery("");
            setDebouncedSearch("");
            setItems([]);
            setPage(1);
        }
    }, [isOpen, selectedItems]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!isOpen) return;
        
        let isMounted = true;
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const result = await fetchItems(debouncedSearch, 1);
                if (isMounted) {
                    setItems(result.data);
                    setHasMore(result.hasMore);
                    setPage(1);
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        
        loadInitialData();
        return () => { isMounted = false; };
    }, [isOpen, debouncedSearch, fetchItems]);

    const loadMore = useCallback(async () => {
        if (isFetchingMore || !hasMore || isLoading) return;
        
        setIsFetchingMore(true);
        try {
            const nextPage = page + 1;
            const result = await fetchItems(debouncedSearch, nextPage);
            setItems(prev => {
                const newItems = result.data.filter(newItem => !prev.some(existing => existing.id === newItem.id));
                return [...prev, ...newItems];
            });
            setHasMore(result.hasMore);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to load more data", error);
        } finally {
            setIsFetchingMore(false);
        }
    }, [page, hasMore, debouncedSearch, fetchItems, isFetchingMore, isLoading]);

    const lastElementRef = useCallback((node: any) => {
        if (isLoading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingMore, hasMore, loadMore]);

    if (!isOpen) return null;

    const handleSelectAll = () => {
        const allLoadedSelected = items.length > 0 && items.every(item => localSelectedItems.some(i => i.id === item.id));
        if (allLoadedSelected) {
            const loadedIds = items.map(item => item.id);
            setLocalSelectedItems(localSelectedItems.filter(i => !loadedIds.includes(i.id)));
        } else {
            const newItems = [...localSelectedItems];
            items.forEach(item => {
                if (!newItems.some(i => i.id === item.id)) {
                    newItems.push(item);
                }
            });
            setLocalSelectedItems(newItems);
        }
    };

    const toggleItem = (item: SelectionItem) => {
        if (localSelectedItems.some(i => i.id === item.id)) {
            setLocalSelectedItems(localSelectedItems.filter(i => i.id !== item.id));
        } else {
            setLocalSelectedItems([...localSelectedItems, item]);
        }
    };

    const handleConfirm = () => {
        onSelectionChange(localSelectedItems);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 p-1 cursor-pointer transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-4 bg-white border-b">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-[#282828] pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all"
                        />
                    </div>
                </div>

                <div className="px-4 py-3 bg-white border-b hover:bg-gray-50 transition-colors">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">Select All <span className="text-blue-500 font-medium text-xs ml-1">(This page participants only)</span></span>
                            <span className="text-[10px] text-gray-500">
                                {debouncedSearch ? `Matches: ${items.length}` : `Total: ${items.length}`}
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#43C17A] cursor-pointer"
                            checked={items.length > 0 && items.every(item => localSelectedItems.some(i => i.id === item.id))}
                            onChange={handleSelectAll}
                        />
                    </label>
                </div>

                <div className="p-2 flex-1 overflow-y-auto custom-scrollbar min-h-[250px]">
                    <div className="grid grid-cols-1 gap-1">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => <SelectionModalShimmer key={i} />)
                        ) : items.length > 0 ? (
                            <>
                                {items.map((item, index) => (
                                    <label 
                                        key={item.id} 
                                        ref={index === items.length - 1 ? lastElementRef : null}
                                        className="flex items-center justify-between p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar src={item.image} alt={item.name} size={40} />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                                                {item.name}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-[#43C17A] cursor-pointer"
                                            checked={localSelectedItems.some(i => i.id === item.id)}
                                            onChange={() => toggleItem(item)}
                                        />
                                    </label>
                                ))}
                                {isFetchingMore && (
                                    Array.from({ length: 3 }).map((_, i) => <SelectionModalShimmer key={`more-${i}`} />)
                                )}
                            </>
                        ) : (
                            <div className="py-10 text-center text-gray-400 text-sm">No results found.</div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-[#43C17A] hover:bg-[#36a365] text-white py-2.5 rounded-lg font-bold shadow-md cursor-pointer transition-all active:scale-[0.98]"
                    >
                        Confirm ({localSelectedItems.length} Selected)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionModal;