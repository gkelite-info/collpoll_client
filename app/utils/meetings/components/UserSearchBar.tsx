"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, UserCircle, X, CaretDown, CheckCircle } from "@phosphor-icons/react";
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";
import { dummyUsers } from "../meetingDummyData";

interface UserSearchBarProps {
    currentUser: SelectUser;
    onSelectUser: (user: SelectUser | null) => void;
    selectedUser: SelectUser | null;
}

export default function UserSearchBar({ currentUser, onSelectUser, selectedUser }: UserSearchBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    
    // For now, we will use static dummy users. We append "Me" (currentUser) to the results.
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter dummy users based on search
    const filteredUsers = dummyUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.userId.toString().includes(searchQuery)
    );

    const handleSelect = (user: SelectUser | null) => {
        onSelectUser(user);
        setIsOpen(false);
        setSearchQuery("");
    };

    const displayUser = selectedUser || currentUser;
    const isMe = !selectedUser || selectedUser.userId === currentUser.userId;

    return (
        <div className="relative w-full sm:w-[280px]" ref={containerRef}>
            <div 
                className={`flex items-center gap-2 px-3 h-10 rounded-xl border transition-all duration-200 cursor-text bg-white shadow-sm ${
                    isFocused || isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                    setIsFocused(true);
                    setIsOpen(true);
                }}
            >
                {/* Selected Pill or Search Icon */}
                {isOpen ? (
                    <MagnifyingGlass size={18} className="text-emerald-500 shrink-0" weight="bold" />
                ) : (
                    <div className="flex items-center gap-2 shrink-0">
                        {displayUser.avatar ? (
                            <img src={displayUser.avatar} alt={displayUser.name} className="w-6 h-6 rounded-full object-cover shadow-sm border border-gray-100" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                {displayUser.name.charAt(0)}
                            </div>
                        )}
                    </div>
                )}
                
                <input
                    type="text"
                    value={isOpen ? searchQuery : (isMe ? "My Calendar" : displayUser.name)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search users by name or ID..."
                    readOnly={!isOpen}
                    className={`flex-1 bg-transparent border-none outline-none text-[14px] font-medium placeholder:text-gray-500 placeholder:font-medium w-full truncate ${!isOpen ? 'cursor-pointer text-gray-800' : 'text-emerald-950'}`}
                />
                
                {isOpen && searchQuery && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors cursor-pointer"
                    >
                        <X size={14} weight="bold" />
                    </button>
                )}
                {!isOpen && (
                    <CaretDown size={14} className="text-gray-400 shrink-0" weight="bold" />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[9999]"
                    >
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                            
                            {/* "Me" Option (Always at top) */}
                            {(!searchQuery || "my calendar".includes(searchQuery.toLowerCase()) || currentUser.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
                                <div 
                                    onClick={() => handleSelect(null)}
                                    className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                                        isMe ? "bg-emerald-50/80" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {currentUser.avatar ? (
                                            <img src={currentUser.avatar} alt="Me" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                {currentUser.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-[14px] font-bold break-words ${isMe ? 'text-emerald-700' : 'text-gray-800'}`}>
                                                My Calendar (Me)
                                            </span>
                                            <span className="text-[12px] text-gray-500 font-medium break-words mt-0.5">
                                                ID: {currentUser.userId}
                                            </span>
                                            <span className="text-[12px] text-gray-500 font-medium break-words mt-0.5">
                                                {currentUser.subLabel || currentUser.name}
                                            </span>
                                        </div>
                                    </div>
                                    {isMe && <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />}
                                </div>
                            )}

                            {filteredUsers.length > 0 && <div className="h-px bg-gray-100 mx-2 my-1" />}

                            {/* Search Results */}
                            {filteredUsers.map((user) => {
                                const isSelected = selectedUser?.userId === user.userId;
                                return (
                                    <div 
                                        key={user.userId}
                                        onClick={() => handleSelect(user as any)}
                                        className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                            isSelected ? "bg-emerald-50/80" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-[14px] font-bold break-words ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
                                                    {user.name}
                                                </span>
                                                <span className="text-[12px] text-gray-500 font-medium break-words mt-0.5">
                                                    ID: {user.userId}
                                                </span>
                                                <span className="text-[12px] text-gray-500 font-medium break-words mt-0.5">
                                                    {user.subLabel}
                                                </span>
                                            </div>
                                        </div>
                                        {isSelected && <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />}
                                    </div>
                                );
                            })}

                            {filteredUsers.length === 0 && searchQuery && (
                                <div className="py-6 px-4 text-center">
                                    <UserCircle size={32} weight="light" className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-[14px] font-semibold text-gray-600">No users found</p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">Try searching with a different name or ID</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
