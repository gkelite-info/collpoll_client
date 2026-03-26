"use client";
import { PencilSimple, FilePdf, CalendarDotsIcon, Trash, } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";
import { deactivateDiscussionForum } from "@/lib/helpers/discussionForum/discussionForumAPI";
import toast from "react-hot-toast";

const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export default function AdminDiscussionCard({ data, discussionView = "active", onDeleteSuccess }: { data: any, discussionView?: "active" | "completed", onDeleteSuccess?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // const handleViewSubmissions = () => {
    //     const params = new URLSearchParams(searchParams.toString());
    //     params.set("action", "viewSubmissions");
    //     params.set("discussionId", String(data.discussionId));
    //     router.push(`${pathname}?${params.toString()}`);
    // };

    const handleViewSubmissions = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "viewSubmissions");
        params.set("discussionId", data.discussionId.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEdit = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "editDiscussion");
        params.set("discussionId", String(data.discussionId));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deactivateDiscussionForum(data.discussionId);

            if (result.success) {
                setShowDeleteModal(false);
                toast.success("Discussion deleted successfully!");
                onDeleteSuccess?.();

            } else {
                console.error("Failed to delete discussion");
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 overflow-auto shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-1">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 w-fit">
                    <h3 className="text-lg font-bold text-[#282828]">{data.title}</h3>
                    <p className="text-sm text-[#111827] whitespace-pre-line leading-relaxed">{data.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    {discussionView === "active" && (
                        <>
                            <button
                                onClick={handleEdit}
                                className="bg-[#16284F38] cursor-pointer p-2.5 rounded-full text-gray-600"
                            >
                                <PencilSimple size={18} weight="fill" className="text-[#16284F]" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-[#FF000020] cursor-pointer p-2.5 rounded-full"
                            >
                                <Trash size={18} weight="fill" className="text-red-500" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleViewSubmissions}
                        className="bg-[#43C17A] cursor-pointer text-[#EFEFEF] px-5 py-2.5 rounded-md text-sm font-bold">
                        View Submissions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[1.3fr_1.5fr] gap-6 pt-4 border-t border-gray-50">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-full bg-[#43C07A24]">
                            <CalendarDotsIcon size={18} className="text-[#43C17A]" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828] text-sm">Uploaded On :</span>
                        <span className="text-gray-600">{data.createdAt ? formatDate(data.createdAt) : "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-full bg-[#43C07A24]">
                            <CalendarDotsIcon size={18} className="text-red-500" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828] text-sm">Deadline :</span>
                        <span className="text-gray-600">{data.deadline}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                    <span className="font-bold text-[#282828] text-sm">Attachments</span>
                    <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
                        {(data.discussion_file_uploads ?? []).map((file: { fileUrl: string; displayFileName?: string }, idx: number) => (
                            <a
                                key={idx}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center cursor-pointer gap-2 bg-[#16284F38] text-[#16284F] px-3 py-1 rounded-md text-xs font-medium flex-shrink-0">
                                <div className="bg-[#16284F] rounded-full p-1 flex items-center justify-center mx-auto">
                                    <FilePdf size={16} weight="fill" className="text-white" />
                                </div>
                                {file.displayFileName || file.fileUrl}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <ConfirmDeleteModal
                open={showDeleteModal}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                isDeleting={isDeleting}
                name="discussion"
            />
        </div>
    );
}