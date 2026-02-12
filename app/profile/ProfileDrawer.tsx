"use client";
import { CaretRight, CaretDown, SignOut, ArrowLeft, PencilSimple, EnvelopeSimple, Phone, Headset, Key, Palette, ClipboardText } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "../utils/context/UserContext";
import ConfirmLogoutModal from "../components/modals/logoutModal";
import { logoutUser } from "@/lib/helpers/logoutUser";
import toast from "react-hot-toast";
import { extractAcademicYearNumber } from "../utils/academicYear";
import { useFaculty } from "../utils/context/faculty/useFaculty";
import { useAdmin } from "../utils/context/admin/useAdmin";
import { useFinanceManager } from "../utils/context/financeManager/useFinanceManager";
import { useCollegeAdmin } from "../utils/context/college-admin/useCollegeAdmin";

type Props = {
    open: boolean;
    onClose: () => void;
    onOpenTerms: () => void;
    onOpenQuickMenu: () => void;
};

interface ProfileOptions {
    id: string;
    name: string;
    icon: React.ReactNode;
    onClick?: () => void;
}


export default function ProfileDrawer({ open, onClose, onOpenTerms, onOpenQuickMenu, }: Props) {
    const [showThemes, setShowThemes] = useState<boolean>(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter()
    const { studentId, fullName, mobile, email, role, collegeEducationType, collegeBranchCode, collegeAcademicYear } = useUser();
    const { financeManagerId } = useFinanceManager();
    const { facultyId, college_branch, faculty_edu_type } = useFaculty();
    const { adminId } = useAdmin();
    const { collegeAdminId } = useCollegeAdmin();

    const academicYear = extractAcademicYearNumber(collegeAcademicYear);

    const profileOptions: ProfileOptions[] = [
        { id: "terms", name: "Terms And Conditions", icon: <ClipboardText size={30} className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5" />, onClick: onOpenTerms, },
        { id: "support", name: "Digi Campus Support", icon: <Headset size={30} className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5" /> },
        {
            id: "change-password", name: "Change Password", icon: <Key size={30} className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5" />, onClick: () => {
                onClose();
                router.push("/settings?current-password");
            },
        },
        { id: "colour-themes", name: "Colour Themes", icon: <Palette size={30} className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5" /> },
    ]

    if (!open) return null;

    const handleLogout = async () => {
        const res = await logoutUser();

        if (res.success) {
            setShowLogoutModal(false);
            onClose();
            toast.success("Loggedout successfully");
            router.replace("/login");
        } else {
            toast.error("Logout failed. Please try again.")
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 z-120"
                onClick={onClose}
            />

            <div className="fixed top-0 right-0 h-full w-[33%] bg-white z-150 shadow-xl flex flex-col">
                <div className="flex justify-between items-center gap-3 px-4 py-4">
                    <button onClick={onClose} className="cursor-pointer text-[#282828]">
                        <ArrowLeft size={22} />
                    </button>
                    {/* <button className="cursor-pointer text-[#282828]">
                        <PencilSimple size={22} />
                    </button> */}
                </div>
                <h2 className="text-base font-medium pl-4 text-[#282828]">Profile</h2>
                <div className="m-4 p-4 rounded-xl bg-[#43C17A26] flex gap-3 items-center">
                    <img
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="profile"
                        className="w-14 h-14 rounded-full object-cover"
                    />

                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-md text-[#282828]">{fullName}</p>
                            <div className="flex gap-2 items-center">
                                {role === "Student" && (
                                    <span className="text-xs text-[#282828]">ID - {studentId}</span>
                                )}
                                {role === "Faculty" && (
                                    <span className="text-xs text-[#282828]">ID - {facultyId}</span>
                                )}
                                {role === "Admin" && (
                                    <span className="text-xs text-[#282828]">ID - {adminId}</span>
                                )}
                                {role === "Finance" && (
                                    <span className="text-xs text-[#282828]">ID - {financeManagerId}</span>
                                )}
                                {role === "CollegeAdmin" && (
                                    <span className="text-xs text-[#282828]">ID - {collegeAdminId}</span>
                                )}
                                {role === "Student" && (
                                    <CaretRight size={20} className="text-[#000000] cursor-pointer" onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenQuickMenu();
                                    }} />
                                )}
                            </div>
                        </div>
                        {role === "Student" && (
                            <>
                                <p className="text-xs text-[#282828] font-medium">{collegeEducationType ? `${collegeEducationType}` : "—"} {collegeBranchCode ? `${collegeBranchCode}` : "—"} - {academicYear ? `${academicYear}` : "—"}</p>
                            </>
                        )}
                        {role === "Faculty" && (
                            <>
                                <p className="text-xs text-[#282828] font-medium">{faculty_edu_type ? `${faculty_edu_type}` : "—"} {college_branch ? `${college_branch}` : "—"}</p>
                            </>
                        )}
                        {role === "Finance" && (
                            <p className="text-xs text-[#282828] font-medium">
                                Finance
                            </p>
                        )}
                        <div className="flex gap-3 flex-wrap">
                            <div className="flex items-center gap-2 mt-2">
                                <EnvelopeSimple size={22} className="bg-[#43C17A] rounded-full p-1 text-white" />
                                <span className="text-xs text-[#282828]">{email}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Phone size={22} className="bg-[#43C17A] rounded-full p-1 text-white" />
                                <span className="text-xs text-[#282828]">{mobile}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-2 flex-1">
                    {profileOptions.map((item) =>
                        item.id === "colour-themes" ? (
                            <div key={item.id}>
                                <div
                                    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setShowThemes(!showThemes)}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        <span className="text-sm text-[#282828] font-medium">
                                            {item.name}
                                        </span>
                                    </div>

                                    {showThemes ? (
                                        <CaretDown size={18} className="text-gray-400" />
                                    ) : (
                                        <CaretRight size={18} className="text-gray-400" />
                                    )}
                                </div>
                                {showThemes && (
                                    <div className="px-6 pb-3 mt-2 ml-8">
                                        <div className="flex gap-2 bg-[#43C17A36] w-fit px-3 py-2 rounded-sm justify-center items-center">
                                            {["#6C63FF", "#FFA726", "#29B6F6", "#43C17A"].map((c) => (
                                                <div
                                                    key={c}
                                                    className="w-8 h-8 rounded-md cursor-pointer"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                key={item.id}
                                onClick={item.onClick}
                                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span className="text-sm text-[#282828] font-medium">
                                        {item.name}
                                    </span>
                                </div>
                                <CaretRight size={18} className="text-gray-400" />
                            </div>
                        )
                    )}

                    <div className="px-4.5 py-4">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center gap-2 text-[#EB0000] font-medium cursor-pointer text-sm"
                        >
                            <SignOut size={30} className="rounded-full bg-[#EB00001A] text-[#EB0000] p-1.5" />
                            Log Out
                        </button>
                    </div>
                </div>
                {showLogoutModal && (
                    <ConfirmLogoutModal
                        onCancel={() => setShowLogoutModal(false)}
                        onConfirm={() => {
                            handleLogout();
                        }}
                    />
                )}

            </div>
        </>
    );
}
