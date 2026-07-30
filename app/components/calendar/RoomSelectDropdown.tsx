import { useState, useEffect, useRef, UIEvent } from "react";
import { CaretLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { fetchCollegeRooms, CollegeRoom } from "@/lib/helpers/rooms/roomHelper";
import { RoomDropdownShimmer } from "../shimmers/RoomDropdownShimmer";
import { useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface RoomSelectDropdownProps {
  value: string;
  onChange: (roomNo: string, collegeRoomId: number) => void;
  collegeId: number;
  placeholder?: string;
  isSchool?: boolean;
}

export default function RoomSelectDropdown({
  value,
  onChange,
  collegeId,
  placeholder,
  isSchool = false,
}: RoomSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError
  } = useInfiniteQuery({
    queryKey: ["collegeRooms", collegeId, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      return await fetchCollegeRooms({
        collegeId,
        search: debouncedSearch,
        page: pageParam as number,
        limit: 10,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!collegeId && isOpen,
  });

  useEffect(() => {
    if (isError) {
      toast.error(`Unable to load ${isSchool ? "school" : "college"} rooms. Please try again.`);
    }
  }, [isError, isSchool]);

  const rooms = data?.pages.flatMap((page) => page.data) ?? [];
  const loading = isFetching && !isFetchingNextPage;
  const loadingMore = isFetchingNextPage;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isCloseToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 30;

    if (isCloseToBottom && hasNextPage && !loadingMore) {
      fetchNextPage();
    }
  };

  const selectRoom = (room: CollegeRoom) => {
    onChange(room.roomNo, room.collegeRoomId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 h-11 outline-none transition-all text-gray-700 bg-white cursor-pointer select-none ${
          isOpen
            ? "border-emerald-500 ring-1 ring-emerald-500"
            : "border-[#C9C9C9] focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500"
        }`}
      >
        <span className={`block truncate min-w-0 mr-2 flex-1 text-left ${value ? "text-gray-900" : "text-gray-400"}`}>
          {value || placeholder || `Select ${isSchool ? "School" : "College"} Room No. / Name`}
        </span>
        <CaretLeft
          size={18}
          weight="bold"
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-90" : "-rotate-90"
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full left-0 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-[300px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <MagnifyingGlass size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms..."
              autoFocus
              className="w-full text-sm outline-none border-none text-gray-700 placeholder-gray-400 bg-transparent py-1"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-gray-400 hover:text-gray-600 px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-1 max-h-[220px] py-1"
          >
            {loading ? (
              <RoomDropdownShimmer />
            ) : (
              <>
                {rooms.map((room) => {
                  const isSelected = value === room.roomNo;
                  return (
                    <div
                      key={room.collegeRoomId}
                      onClick={() => selectRoom(room)}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors flex flex-col ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{room.roomNo}</span>
                        {room.roomType && (
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-normal ${
                            isSelected ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                          }`}>
                            {room.roomType}
                          </span>
                        )}
                      </div>
                      {(room.building || room.floor) && (
                        <span className={`text-xs mt-0.5 font-normal ${isSelected ? "text-emerald-600/80" : "text-gray-400"}`}>
                          {room.building || ""}{room.building && room.floor ? ", " : ""}{room.floor ? `Floor ${room.floor}` : ""}
                        </span>
                      )}
                    </div>
                  );
                })}

                {rooms.length === 0 && !loading && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    {search.trim() ? "No matching rooms found." : `No ${isSchool ? "school" : "college"} rooms configured.`}
                  </div>
                )}

                {loadingMore && (
                  <div className="py-2 flex items-center justify-center">
                    <span className="text-xs text-gray-400 animate-pulse">Loading more...</span>
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
