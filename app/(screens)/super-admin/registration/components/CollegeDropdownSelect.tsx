"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { CollegeDropdown, fetchCollegesForAdmin } from "@/lib/helpers/superadmin/collegeHelper";

interface CollegeDropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const DropdownShimmer = () => {
  return (
    <div className="w-full flex flex-col gap-2 p-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-8 w-full bg-gray-200 animate-pulse rounded-md"
        ></div>
      ))}
    </div>
  );
};

export const CollegeDropdownSelect: React.FC<CollegeDropdownSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [colleges, setColleges] = useState<CollegeDropdown[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialSelectedName, setInitialSelectedName] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadColleges = useCallback(async (currentPage: number, search: string, append: boolean = false) => {
    setLoading(true);
    const res = await fetchCollegesForAdmin(currentPage, 10, search);
    
    if (res.success) {
      setColleges((prev) => {
        const newData = append ? [...prev, ...res.data] : res.data;
        // Optional: filter out duplicates if React double invokes or something
        const uniqueData = Array.from(new Map(newData.map(item => [item.collegeId, item])).values());
        return uniqueData;
      });
      setHasMore(res.hasMore ?? false);
      
      // If we have a value but it's not in our list, we might want to fetch its name 
      // (not strictly necessary if form state is cleared on mount, but good for edit forms)
    }
    setLoading(false);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    if (!isOpen) return; // Only fetch when open

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      loadColleges(1, searchTerm, false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, loadColleges, isOpen]);

  // Infinite Scroll Handler
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadColleges(nextPage, searchTerm, true);
      }
    }
  };

  const handleSelect = (collegeId: string, collegeName: string) => {
    onChange(collegeId);
    setInitialSelectedName(collegeName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedCollege = colleges.find((c) => c.collegeId.toString() === value);
  const displayValue = selectedCollege ? selectedCollege.collegeName : (initialSelectedName || "Select college");

  return (
    <div className="flex flex-col w-full" ref={dropdownRef}>
      <label className="text-[#333] font-semibold text-[15px] mb-1.5">
        College <span className="text-red-500">*</span>
      </label>
      
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#49C77F] bg-white cursor-pointer shadow-sm transition-all`}
        >
          <span className={value ? "text-[#282828]" : "text-gray-500"}>
            {displayValue}
          </span>
          <CaretDown
            size={18}
            className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-[#49C77F]"
                />
              </div>
            </div>

            <ul
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-60 overflow-y-auto w-full flex flex-col"
            >
              {colleges.length > 0 ? (
                colleges.map((college) => {
                  const isSelected = value === college.collegeId.toString();
                  return (
                    <li
                      key={college.collegeId}
                      onClick={() => handleSelect(college.collegeId.toString(), college.collegeName)}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-[#49C77F]/10 text-[#49C77F] font-bold" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {college.collegeName}
                    </li>
                  )
                })
              ) : (
                !loading && (
                  <li className="px-4 py-4 text-sm text-gray-500 text-center">
                    No colleges found
                  </li>
                )
              )}

              {loading && <DropdownShimmer />}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
