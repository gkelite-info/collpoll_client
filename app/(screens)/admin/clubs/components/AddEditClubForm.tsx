"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";
import { Trash } from "@phosphor-icons/react";
import { SearchableUserDropdown } from "./CustomDropdown";
import { useUser } from "@/app/utils/context/UserContext";
import { createClub, deleteClubAPI, getClubByIdAPI, SearchableUser, updateClub } from "@/lib/helpers/clubActivity/adminClubsAPI";
import toast from "react-hot-toast";
import Image from "next/image";
import { DeletePhotoModal } from "@/app/profile/DeletePhotoModal";
import { decryptId } from "@/app/utils/encryption";
import AddEditClubFormShimmer from "../shimmers/AddEditClubFormShimmer";

export default function AddEditClubForm({ editId }: { editId: string | null }) {
    const router = useRouter();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageDeleteModalOpen, setIsImageDeleteModalOpen] = useState(false);
    const [isRemovingImage, setIsRemovingImage] = useState(false);
    const [isFetching, setIsFetching] = useState(!!editId);

    const [formData, setFormData] = useState({
        title: "",
        president: null as SearchableUser | null,
        vicePresident: null as SearchableUser | null,
        mentors: [] as SearchableUser[],
        faculty: null as SearchableUser | null,
    });

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const { collegeId, adminId } = useUser()

    const rawEditId = useMemo(() => {
        return editId ? decryptId(editId) : null;
    }, [editId]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Please upload an image in JPG, PNG, SVG, or WEBP format.");
                e.target.value = '';
                return;
            }
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error("Image size must be less than 5MB.");
                e.target.value = '';
                return;
            }
            const imageUrl = URL.createObjectURL(file);
            setLogoPreview(imageUrl);
        }
    };

    const handleSubmit = async () => {
        if (!logoPreview) { toast.error("Please upload club logo."); return; }
        if (!formData.title?.trim()) { toast.error("Please enter club title."); return; }
        if (!formData.president) { toast.error("Please select President."); return; }
        if (!formData.vicePresident) { toast.error("Please select Vice President."); return; }
        if (formData.mentors.length === 0) { toast.error("Please select at least one Mentor."); return; }
        if (!formData.faculty) { toast.error("Please select Responsible Faculty."); return; }
        setIsSubmitting(true);
        try {
            const isNewFile = fileInputRef.current?.files?.[0];
            const retainedUrl = isNewFile ? null : logoPreview;
            const payload = {
                title: formData.title.trim(),
                presidentStudentId: parseInt(formData.president!.roleId, 10),
                vicePresidentStudentId: parseInt(formData.vicePresident!.roleId, 10),
                responsibleFacultyId: parseInt(formData.faculty!.roleId, 10),
                mentorFacultyIds: formData.mentors.map(m => parseInt(m.roleId, 10)),
                collegeId: parseInt(collegeId!.toString(), 10),
                createdBy: parseInt(adminId!.toString(), 10)
            };

            if (rawEditId) {
                await updateClub(parseInt(rawEditId, 10),
                    payload,
                    isNewFile,
                    retainedUrl,
                    originalLogoUrl);
                toast.success("Club updated successfully!");
            } else {
                await createClub(payload, isNewFile);
                toast.success("Club created successfully!");
                setFormData({
                    title: "",
                    president: null,
                    vicePresident: null,
                    mentors: [],
                    faculty: null,
                });
                setLogoPreview(null);
                setOriginalLogoUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }

            router.push("/admin/clubs?tab=view");
        } catch (error: any) {
            toast.error(error.message || "Failed to save club");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (editId && !rawEditId) {
            toast.error("Invalid Club URL.");
            router.push("/admin/clubs?tab=view");
            return;
        }
        if (!rawEditId) {
            setFormData({ title: "", president: null, vicePresident: null, mentors: [], faculty: null });
            setLogoPreview(null);
            setOriginalLogoUrl(null);
            setIsFetching(false);
            return;
        }

        const fetchEditData = async () => {
            setIsFetching(true);
            try {
                const clubData = await getClubByIdAPI(rawEditId);
                setFormData({
                    title: clubData.title,
                    president: clubData.president,
                    vicePresident: clubData.vicePresident,
                    mentors: clubData.mentors,
                    faculty: clubData.faculty
                });
                setLogoPreview(clubData.logoUrl);
                setOriginalLogoUrl(clubData.logoUrl);
            } catch (error) {
                toast.error("Failed to fetch club data.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchEditData();
    }, [editId, rawEditId, router]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest('.custom-dropdown-container')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDeleteConfirm = async () => {
        if (!rawEditId) return;
        setIsDeleting(true);
        try {
            await deleteClubAPI(parseInt(rawEditId, 10));
            toast.success("Club deleted successfully.");
            setDeleteModalOpen(false);
            router.push("/admin/clubs?tab=view");
        } catch (error) {
            toast.error("Failed to delete club.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmRemoveImage = async () => {
        setIsRemovingImage(true);
        try {
            setLogoPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            toast.success("Club logo removed successfully.");
            setIsImageDeleteModalOpen(false);
        } catch (error) {
            toast.error("Failed to remove logo");
        } finally {
            setIsRemovingImage(false);
        }
    };

    if (isFetching) {
        return <AddEditClubFormShimmer />;
    }

    return (
        <div className="relative max-w-3xl mx-auto pb-4">
            <style>{`
                .strict-heights > div > *:not(label):not(.absolute),
                .strict-heights > div > div.relative > *:not(.absolute) {
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
                accept=".jpg,.jpeg,.png,.svg,.webp"
                className="hidden"
            />

            <div className="flex justify-center mb-8 mt-2">
                <div className="relative group">
                    <div
                        onClick={() => {
                            if (logoPreview) {
                                setIsImageDeleteModalOpen(true);
                            } else {
                                fileInputRef.current?.click();
                            }
                        }}
                        className={`w-38 h-38 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all ${logoPreview
                            ? "border-4 border-white shadow-md overflow-hidden relative"
                            : "border-2 border-dashed border-[#003618] bg-green-50/50"
                            }`}
                    >
                        {logoPreview ? (
                            <Image
                                src={logoPreview}
                                alt="Club Logo"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <>
                                <span className="text-6xl font-light text-[#003618] mb-1">+</span>
                                <span className="text-[15px] font-semibold text-[#282828]">Upload Logo</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[15px] font-semibold text-[#282828] mb-2">Club Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="Enter club title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-[45px] border border-[#CCCCCC] rounded-lg px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 strict-heights">
                    <SearchableUserDropdown
                        label="President"
                        value={formData.president}
                        isOpen={activeDropdown === "president"}
                        onToggle={() => setActiveDropdown(activeDropdown === "president" ? null : "president")}
                        onSelect={(user) => setFormData({ ...formData, president: user })}
                        direction="down"
                        collegeId={collegeId}
                        roleGroup="student"
                    />
                    <SearchableUserDropdown
                        label="Vice President"
                        value={formData.vicePresident}
                        isOpen={activeDropdown === "vicePresident"}
                        onToggle={() => setActiveDropdown(activeDropdown === "vicePresident" ? null : "vicePresident")}
                        onSelect={(user) => setFormData({ ...formData, vicePresident: user })}
                        direction="down"
                        collegeId={collegeId}
                        roleGroup="student"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 items-start pt-2 strict-heights">
                    <SearchableUserDropdown
                        label="Responsible Faculty"
                        value={formData.faculty}
                        isOpen={activeDropdown === "faculty"}
                        onToggle={() => setActiveDropdown(activeDropdown === "faculty" ? null : "faculty")}
                        onSelect={(user) => setFormData({ ...formData, faculty: user })}
                        direction="up"
                        collegeId={collegeId}
                        roleGroup="faculty"
                    />

                    <SearchableUserDropdown
                        label="Mentors"
                        isMulti={true}
                        value={formData.mentors}
                        isOpen={activeDropdown === "mentors"}
                        onToggle={() => setActiveDropdown(activeDropdown === "mentors" ? null : "mentors")}
                        onSelect={(user) => {
                            const exists = formData.mentors.some(m => m.id === user.id);
                            if (exists) {
                                setFormData({ ...formData, mentors: formData.mentors.filter(m => m.id !== user.id) });
                            } else {
                                setFormData({ ...formData, mentors: [...formData.mentors, user] });
                            }
                        }}
                        onRemove={(userId) => {
                            setFormData({ ...formData, mentors: formData.mentors.filter(m => m.id !== userId) });
                        }}
                        direction="up"
                        collegeId={collegeId}
                        roleGroup="faculty"
                    />
                    
                </div>

                <div className="flex justify-center mt-6 pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#1a2b4c] disabled:cursor-not-allowed text-white cursor-pointer rounded-lg px-8 py-3.5 text-[15px] font-semibold hover:bg-[#121e36] transition-colors w-[300px] shadow-sm">
                        {isSubmitting
                            ? (editId ? "Updating..." : "Creating...")
                            : (editId ? "Update Club" : "Create Club")}
                    </button>
                </div>
            </div>

            <ConfirmDeleteModal
                open={isDeleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                isDeleting={isDeleting}
                name="club"
                itemName={formData.title || "Club"}
                customDescription={
                    <>
                        Are you sure you want to delete the <span className="font-semibold text-gray-700">{formData.title || "Club"}</span>?
                        <div className="mt-2 block">
                            This action will permanently remove the club, its members, and all announcements.
                        </div>
                    </>
                }
            />

            <DeletePhotoModal
                isOpen={isImageDeleteModalOpen}
                onClose={() => setIsImageDeleteModalOpen(false)}
                onConfirm={handleConfirmRemoveImage}
                isLoading={isRemovingImage}
            />
        </div>
    );
}