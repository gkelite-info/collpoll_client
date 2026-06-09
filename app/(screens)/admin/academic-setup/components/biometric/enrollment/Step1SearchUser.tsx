"use client";

import { useState, useRef, useCallback } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { searchUsersForEnrollment } from "@/lib/helpers/devices/userDeviceCredentialAPI";
import UserListShimmer from "../shimmers/UserListShimmer";
import { UserSearchResult } from "./types";

interface Step1SearchUserProps {
  collegeId: number;
  onSelectUser: (user: UserSearchResult) => void;
}

export default function Step1SearchUser({
  collegeId,
  onSelectUser,
}: Step1SearchUserProps) {
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserSearch = useCallback(
    (value: string) => {
      setUserSearch(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!value.trim() || value.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const res = await searchUsersForEnrollment(collegeId, value);
        if (res.success) setSearchResults(res.data as UserSearchResult[]);
        setIsSearching(false);
      }, 400);
    },
    [collegeId],
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative mb-4">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name, email, or mobile..."
          value={userSearch}
          onChange={(e) => handleUserSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748]"
          autoFocus
        />
      </div>

      {isSearching && <UserListShimmer />}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {searchResults.map((u) => (
            <button
              key={u.userId}
              onClick={() => onSelectUser(u)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#43C17A] hover:bg-[#E6F4EA]/30 transition-all cursor-pointer bg-white outline-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#16284F]">{u.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {u.email} · {u.mobile}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    u.role === "Student"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-violet-50 text-violet-700"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!isSearching && userSearch.length >= 2 && searchResults.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">
          No users found matching &quot;{userSearch}&quot;
        </p>
      )}
    </div>
  );
}
