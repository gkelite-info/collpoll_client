"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";
import { decryptId } from "@/app/utils/encryption";
import { useMemo, useState, useEffect } from "react";
import TableComponent from "@/app/utils/table/table";
import { motion } from "framer-motion";
import { FilterDropdown } from "./FilterDropdown";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";

interface ViewClubDetailsProps {
    clubId: string;
}

const MOCK_DATA = [
    { id: "541954", name: "Rohan Patel", type: "Vice President", edu: "B.Tech", branch: "CSE", year: "1st Year", date: "04/20/2026", avatar: "/avatar1.png" },
    { id: "999475", name: "Aarav Mehta", type: "President", edu: "B.Tech", branch: "ECE", year: "2nd Year", date: "04/20/2026", avatar: "/avatar2.png" },
    { id: "541955", name: "Karthik Reddy", type: "Member", edu: "M.Tech", branch: "CSE", year: "1st Year", date: "04/20/2026", avatar: "/avatar3.png" },
    { id: "541956", name: "Sneha Reddy", type: "Member", edu: "B.Tech", branch: "MECH", year: "3rd Year", date: "04/20/2026", avatar: "/avatar4.png" },
    { id: "752872", name: "Ananya Sharma", type: "Member", edu: "B.Tech", branch: "CSE", year: "1st Year", date: "04/20/2026", avatar: "/avatar5.png" },
    { id: "965877", name: "Neha Sinha", type: "Member", edu: "MBA", branch: "Finance", year: "1st Year", date: "04/20/2026", avatar: "/avatar6.png" },
    { id: "541958", name: "Arjun Rao", type: "Member", edu: "B.Tech", branch: "CSE", year: "4th Year", date: "04/20/2026", avatar: "/avatar7.png" },
];

export default function ViewClubDetails({ clubId }: ViewClubDetailsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const rawClubId = useMemo(() => decryptId(clubId), [clubId]);

    const status = searchParams.get("status") || "active";
    const group = searchParams.get("group") || "members";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEdu, setSelectedEdu] = useState<string | null>("B.Tech");
    const [selectedBranch, setSelectedBranch] = useState<string | null>("CSE");
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<{ id: string, name: string } | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemoveClick = (id: string, name: string) => {
        setSelectedMember({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        setIsRemoving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Removed member:", selectedMember?.id);
        setIsRemoving(false);
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.filter-dropdown')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateFilters = (newStatus: string, newGroup: string) => {
        router.push(`/admin/clubs?tab=view&viewClubId=${clubId}&status=${newStatus}&group=${newGroup}`);
    };

    const isInactive = status === "inactive";
    const isMentors = group === "mentors";

    const headerStatusText = `${isInactive ? "Inactive" : "Active"} ${isMentors ? "Mentors" : "Members"}`;
    const clubName = "All Stars Sports Club";

    const themeColor = isInactive ? "text-red-500" : "text-[#43C17A]";
    const headerTitle = `${isInactive ? "Inactive" : "Active"} ${isMentors ? "Mentors" : "Members"} – All Stars Sports Club`;
    const totalText = `Total ${isInactive ? "Inactive" : "Active"} ${isMentors ? "Mentors" : "Members"} :`;

    const columns = [
        { title: isMentors ? "Mentor Name" : "Student Name", key: "name" },
        { title: "ID", key: "id" },
        { title: "Member Type", key: "type" },
        { title: "Education Type", key: "edu" },
        { title: "Branch", key: "branch" },
        ...(!isMentors ? [{ title: "Year", key: "year" }] : []),
        { title: "Joined Date", key: "date" },
        { title: "Action", key: "action" },
    ];

    const filteredData = useMemo(() => {
        return MOCK_DATA.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.includes(searchQuery);
            const matchesEdu = selectedEdu ? item.edu === selectedEdu : true;
            const matchesBranch = selectedBranch ? item.branch === selectedBranch : true;
            const matchesYear = (selectedYear && !isMentors) ? item.year === selectedYear : true;

            return matchesSearch && matchesEdu && matchesBranch && matchesYear;
        });
    }, [searchQuery, selectedEdu, selectedBranch, selectedYear, isMentors]);

    const tableData = filteredData.map((row) => ({
        name: (
            <div className="flex items-center gap-3">
                <Avatar src={row.avatar} alt={row.name} size={36} />
                <span className="font-medium text-gray-800">{row.name}</span>
            </div>
        ),
        id: row.id,
        type: row.type,
        edu: row.edu,
        branch: row.branch,
        ...(!isMentors && { year: row.year }),
        date: row.date,
        action: (
            <button
                onClick={() => handleRemoveClick(row.id, row.name)}
                className="bg-[#16284F] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#121e36] transition-colors shadow-sm">
                Remove
            </button>
        )
    }));

    return (
        <div className="w-full flex flex-col items-center">

            <div className="bg-[#E9E9E9] p-2 rounded-full inline-flex gap-2 mx-auto self-center mb-8 relative">
                {['active', 'inactive'].map((s) => {
                    const isActive = status === s;
                    const activeBgColor = s === 'inactive' ? 'bg-red-500' : 'bg-[#43C17A]';

                    return (
                        <button
                            key={s}
                            onClick={() => updateFilters(s, group)}
                            className={`relative cursor-pointer w-36 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "text-white" : "text-[#282828]"
                                }`}
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

            <div className="w-full flex gap-2 mb-3">
                <button
                    onClick={() => updateFilters(status, "members")}
                    className={`px-6 py-2.5 rounded-lg text-[15px] cursor-pointer font-semibold transition-colors ${!isMentors
                        ? "bg-[#43C17A] text-[#EFEFEF] shadow-sm"
                        : "bg-[#E5E3E3] text-[#282828]"
                        }`}
                >
                    Members
                </button>
                <button
                    onClick={() => updateFilters(status, "mentors")}
                    className={`px-6 py-2.5 rounded-lg text-[15px] cursor-pointer font-semibold transition-colors ${isMentors
                        ? "bg-[#43C17A] text-[#EFEFEF] shadow-sm"
                        : "bg-[#E5E3E3] text-[#282828]"
                        }`}
                >
                    Mentors / Responsible Faculty
                </button>
            </div>

            <div className="w-full bg-white min-h-[70vh] rounded-2xl shadow-sm border border-gray-100 p-8 pt-8 relative z-0">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">
                        <span className={themeColor}>{headerStatusText}</span>
                        <span className="text-[#16284F]"> – {clubName}</span>
                    </h2>
                    <div className="text-lg font-bold text-[#16284F]">
                        {totalText} <span className={themeColor}>({filteredData.length})</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="relative w-[380px]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${isMentors ? "Mentor Name" : "Club Member"}.....`}
                            className="w-full bg-[#EAEAEA] border border-transparent rounded-full py-3 pl-6 pr-12 text-[15px] text-[#282828] focus:outline-none focus:border-[#43C17A]"
                        />
                        <button className="absolute right-5 top-1/2 -translate-y-1/2 text-[#43C17A]">
                            <MagnifyingGlass size={25} weight="bold" />
                        </button>
                    </div>

                    <div className="flex items-center gap-5 ">
                        <FilterDropdown
                            id="edu"
                            label="Education Type"
                            options={["B.Tech", "M.Tech", "MBA"]}
                            value={selectedEdu}
                            isOpen={openDropdown === "edu"}
                            onToggle={setOpenDropdown}
                            onChange={setSelectedEdu}
                        />
                        <FilterDropdown
                            id="branch"
                            label="Branch"
                            options={["CSE", "ECE", "MECH", "Finance"]}
                            value={selectedBranch}
                            isOpen={openDropdown === "branch"}
                            onToggle={setOpenDropdown}
                            onChange={setSelectedBranch}
                        />
                        {!isMentors && (
                            <FilterDropdown
                                id="year"
                                label="Year"
                                options={["1st Year", "2nd Year", "3rd Year", "4th Year"]}
                                value={selectedYear}
                                isOpen={openDropdown === "year"}
                                onToggle={setOpenDropdown}
                                onChange={setSelectedYear}
                            />
                        )}
                    </div>
                </div>

                <TableComponent
                    columns={columns}
                    tableData={tableData}
                    height="55vh"
                />

            </div>

            <ConfirmDeleteModal
                open={isDeleteModalOpen}
                onConfirm={handleConfirmRemove}
                onCancel={() => setIsDeleteModalOpen(false)}
                isDeleting={isRemoving}
                title="Remove"
                confirmText="Remove"
                loadingText="Removing..."
                name="Member"
                customDescription={
                    <>
                        Are you sure you want to remove <span className="font-bold text-gray-800">{selectedMember?.name}</span> from the club?
                    </>
                }
            />
        </div>
    );
}