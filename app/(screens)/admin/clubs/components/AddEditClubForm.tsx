"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";
import { Avatar } from "@/app/utils/Avatar";
import CustomDropdown from "./CustomDropdown";
import { Trash, X } from "@phosphor-icons/react";

const USERS = [
    { id: "1", name: "Rohith Sharma", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: "2", name: "Ayaan Reddy", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: "3", name: "Ananya Sharma", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: "4", name: "Sharmila Reddy", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: "5", name: "Aarav Rathod", avatar: "https://i.pravatar.cc/150?u=5" },
    { id: "6", name: "Poojith Goud", avatar: "https://i.pravatar.cc/150?u=6" },
];

const MOCK_CLUB_DATA = {
    id: "1",
    title: "All Stars Sports Club",
    president: USERS[0],
    vicePresident: USERS[1],
    mentors: [USERS[0], USERS[2], USERS[3]],
    faculty: USERS[2],
    logo: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=200&auto=format&fit=crop"
};

export default function AddEditClubForm({ editId }: { editId: string | null }) {
    const router = useRouter();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        president: null as typeof USERS[0] | null,
        vicePresident: null as typeof USERS[0] | null,
        mentors: [] as typeof USERS,
        faculty: null as typeof USERS[0] | null,
    });

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        if (editId === "1") {
            setFormData({
                title: MOCK_CLUB_DATA.title,
                president: MOCK_CLUB_DATA.president,
                vicePresident: MOCK_CLUB_DATA.vicePresident,
                mentors: MOCK_CLUB_DATA.mentors,
                faculty: MOCK_CLUB_DATA.faculty
            });
            setLogoPreview(MOCK_CLUB_DATA.logo);
        } else {
            setFormData({ title: "", president: null, vicePresident: null, mentors: [], faculty: null });
            setLogoPreview(null);
        }
    }, [editId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest('.custom-dropdown-container')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDeleteConfirm = () => {
        setDeleteModalOpen(false);
        router.push("/admin/clubs?tab=view");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setLogoPreview(imageUrl);
        }
    };

    return (
        <div className="relative max-w-4xl mx-auto pb-4">
            <style>{`
                .strict-heights > div > *:not(label):not(.absolute),
                .strict-heights > div > div.relative > *:not(.absolute) {
                    height: 45px !important;
                    min-height: 45px !important;
                }
            `}</style>

            {editId && (
                <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="absolute -right-4 -top-4 w-10 h-10 cursor-pointer bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                    <Trash size={24} weight="fill" />
                </button>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />

            <div className="flex justify-center mb-8 mt-2">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-38 h-38 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all ${logoPreview
                        ? "border-4 border-white shadow-md overflow-hidden relative"
                        : "border-2 border-dashed border-[#003618] bg-green-50/50"
                        }`}
                >
                    {logoPreview ? (
                        <img src={logoPreview} alt="Club Logo" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <span className="text-6xl font-light text-[#003618] mb-1">+</span>
                            <span className="text-[15px] font-semibold text-[#282828]">Upload Logo</span>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[15px] font-semibold text-[#282828] mb-2">Club Title</label>
                    <input
                        type="text"
                        placeholder="Enter club title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-[45px] border border-[#CCCCCC] rounded-lg px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 strict-heights">
                    <CustomDropdown
                        label="President"
                        options={USERS}
                        value={formData.president}
                        isOpen={activeDropdown === "president"}
                        onToggle={() => setActiveDropdown(activeDropdown === "president" ? null : "president")}
                        onSelect={(user) => {
                            setFormData({ ...formData, president: user });
                            setActiveDropdown(null);
                        }}
                    />
                    <CustomDropdown
                        label="Vice President"
                        options={USERS}
                        value={formData.vicePresident}
                        isOpen={activeDropdown === "vicePresident"}
                        onToggle={() => setActiveDropdown(activeDropdown === "vicePresident" ? null : "vicePresident")}
                        onSelect={(user) => {
                            setFormData({ ...formData, vicePresident: user });
                            setActiveDropdown(null);
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 items-start pt-2 strict-heights">
                    <div className="custom-dropdown-container relative w-full">
                        <label className="block text-[15px] font-semibold text-[#282828] mb-2">Mentors</label>
                        <div
                            className="w-full h-[45px] border border-[#CCCCCC] rounded-lg px-3 flex items-center justify-between cursor-pointer bg-white overflow-hidden"
                            onClick={() => setActiveDropdown(activeDropdown === "mentors" ? null : "mentors")}
                        >
                            <div className="flex flex-nowrap gap-2 flex-1 items-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {formData.mentors.length === 0 ? (
                                    <span className="text-gray-400 text-sm px-1">Select mentors</span>
                                ) : (
                                    formData.mentors.map(mentor => (
                                        <span key={mentor.id} className="bg-[#e2e8f0] text-[#1a2b4c] text-[13px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
                                            {mentor.name}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, mentors: formData.mentors.filter(m => m.id !== mentor.id) });
                                                }}
                                                className="hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-gray-600 focus:outline-none transition-colors"
                                            >
                                                <X className="cursor-pointer" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                            <div className="pl-2 bg-white flex-shrink-0">
                                <svg className={`w-5 h-5 text-gray-600 transition-transform ${activeDropdown === "mentors" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {activeDropdown === "mentors" && (
                            <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                <div
                                    className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 sticky top-0 bg-white z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (formData.mentors.length === USERS.length) {
                                            setFormData({ ...formData, mentors: [] });
                                        } else {
                                            setFormData({ ...formData, mentors: [...USERS] });
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.mentors.length === USERS.length && USERS.length > 0}
                                        readOnly
                                        className="w-4 h-4 text-[#1a2b4c] rounded border-gray-300 cursor-pointer pointer-events-none"
                                    />
                                    <span className="text-sm font-semibold text-gray-800">Select All</span>
                                </div>

                                {USERS.map((user) => {
                                    const isSelected = formData.mentors.some(m => m.id === user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isSelected) {
                                                    setFormData({ ...formData, mentors: formData.mentors.filter(m => m.id !== user.id) });
                                                } else {
                                                    setFormData({ ...formData, mentors: [...formData.mentors, user] });
                                                }
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="w-4 h-4 text-[#1a2b4c] rounded border-gray-300 cursor-pointer pointer-events-none"
                                            />
                                            <Avatar src={user.avatar} alt={user.name} size={32} />
                                            <span className="text-sm font-medium text-[#1a2b4c]">{user.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <CustomDropdown
                        label="Responsible Faculty"
                        options={USERS}
                        value={formData.faculty}
                        direction="up"
                        isOpen={activeDropdown === "faculty"}
                        onToggle={() => setActiveDropdown(activeDropdown === "faculty" ? null : "faculty")}
                        onSelect={(user) => {
                            setFormData({ ...formData, faculty: user });
                            setActiveDropdown(null);
                        }}
                    />
                </div>

                <div className="flex justify-center mt-6 pt-4">
                    <button className="bg-[#1a2b4c] text-white cursor-pointer rounded-lg px-8 py-3.5 text-[15px] font-semibold hover:bg-[#121e36] transition-colors w-[400px] shadow-sm">
                        {editId ? "Create Club" : "Create Club"}
                    </button>
                </div>
            </div>

            <ConfirmDeleteModal
                open={isDeleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                name="club"
            />
        </div>
    );
}