"use client";

import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { getCollegeUsers } from "@/lib/helpers/Hr/meetings/getCollegeUsers";
import { X, MagnifyingGlass } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";


export default function SelectFacultyModal({
    isOpen,
    onClose,
    onSelect,
    title = "Select Faculties",
    roleName = "Faculty",
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (f: any[]) => void;
    title?: string;
    roleName?: "Admin" | "Faculty" | "Finance";
}) {
    const { collegeId } = useCollegeHr();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            if (!collegeId) return;

            setIsLoadingUsers(true);

            try {
                const data = await getCollegeUsers(roleName, collegeId);
                setFacultyList(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        if (isOpen) loadUsers();
    }, [collegeId, roleName, isOpen]);

    const filteredFaculty = facultyList.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected =
        filteredFaculty.length > 0 &&
        filteredFaculty.every((f) =>
            selectedIds.includes(f.id)
        );

    const handleSelectAll = () => {
        const filteredIds = filteredFaculty.map(
            (f) => f.id
        );

        if (isAllSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !filteredIds.includes(id))
            );
        } else {
            const newSelections = Array.from(
                new Set([...selectedIds, ...filteredIds])
            );
            setSelectedIds(newSelections);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const handleConfirmSelection = async () => {

        setIsSelecting(true);
        toast.loading("Selecting participants...", { id: "select-loading" });

        try {

            const selectedObjects = facultyList.filter((f) =>
                selectedIds.includes(f.id)
            );

            onSelect(selectedObjects);

            toast.success("Participants selected", { id: "select-loading" });

            setSelectedIds([]); 
            onClose();

        } catch (err) {

            console.error(err);
            toast.error("Failed to select participants", { id: "select-loading" });

        } finally {

            setIsSelecting(false);

        }
    };

    useEffect(() => {
        if (!isOpen) setSearchQuery("");
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl w-full max-w-md h-[90vh] p-6 shadow-xl flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-[20px] font-bold text-[#282828]">
                                {title}
                            </h3>

                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={handleSelectAll}
                                    className="bg-[#16284F] text-white text-xs px-4 py-2 rounded-md font-medium hover:bg-[#111e3b] cursor-pointer"
                                >
                                    {isAllSelected ? "Unselect All" : "Select All"}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                                >
                                    <X size={20} className="text-[#555555]" />
                                </button>
                            </div>
                        </div>
                        <div className="relative mb-4 shrink-0">
                            <MagnifyingGlass
                                className="absolute left-3 top-2.5 text-gray-400"
                                size={18}
                            />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name"
                                className="w-full pl-11 pr-4 py-2 bg-[#F6F6F6] rounded-full text-sm text-gray-900 outline-none placeholder:text-[#9CA3AF]"
                            />
                        </div>
                        <div className="space-y-4 h-[450px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {isLoadingUsers ? (

                                <div className="flex items-center justify-center h-[200px]">
                                    <span className="w-8 h-8 border-4 border-[#16284F] border-t-transparent rounded-full animate-spin"></span>
                                </div>

                            ) : filteredFaculty.length > 0 ? (
                                filteredFaculty.map((f) => {
                                    const id = f.id;
                                    return (
                                        <div
                                            key={id}
                                            className="flex items-center justify-between hover:bg-gray-50 p-1 -mx-1 rounded-md cursor-pointer"
                                            onClick={() => toggleSelection(id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`https://i.pravatar.cc/150?u=${f.userId}`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />

                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">
                                                        {f.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {f.subLabel}
                                                    </p>
                                                </div>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(id)}
                                                onChange={() => toggleSelection(id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-5 h-5 accent-[#16284F] cursor-pointer"
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-4">
                                    No {roleName.toLowerCase()} found.
                                </p>
                            )}
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-1.5 bg-gray-200 rounded-md text-black cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmSelection}
                                disabled={isSelecting}
                                className={`flex-1 py-1.5 rounded-md text-white font-medium transition
    ${isSelecting
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#43C17A] hover:bg-[#38a869] cursor-pointer"
                                    }`}
                            >
                                {isSelecting ? "Selecting..." : "Select"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}