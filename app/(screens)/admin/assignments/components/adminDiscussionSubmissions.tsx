"use client";
import { CaretLeft, FilePdf, User } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminAddMarksModal from "./adminAddMarksModal";
import { fetchDiscussionUploads } from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
import SubmissionShimmer from "./shimmers/submissionShimmer";
import { formatFileName } from "@/app/utils/formatFileName";
import { fetchDiscussionById } from "@/lib/helpers/admin/facultyCountAPI";

interface Props {
    discussionId: string | null;
    discussionSectionId?: number;
    discussionTitle?: string;
    discussionDescription?: string;
}

export default function AdminDiscussionSubmissions({ discussionId: propDiscussionId,
    discussionSectionId,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [discussion, setDiscussion] = useState<{
        title: string;
        description: string;
    } | null>(null);

    const discussionId = propDiscussionId || searchParams.get("discussionId");

    useEffect(() => {
        if (!discussionId) return;

        fetchDiscussionById(Number(discussionId)).then((data) => {
            if (!data) return;

            setDiscussion({
                title: data.title,
                description: data.description,
            });
        });
    }, [discussionId]);

    useEffect(() => {
        if (!discussionId) return;

        setLoading(true);
        fetchDiscussionUploads(Number(discussionId), discussionSectionId)
            .then((data) => {
                setSubmissions(data)
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load submissions.");
            })
            .finally(() => setLoading(false));
    }, [discussionId, discussionSectionId]);

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const openMarksModal = (student: any) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col mx-auto h-full pb-10">
            <div className="flex items-center gap-1 mb-5 text-[#282828] hover:text-black transition-colors">
                <CaretLeft size={24} weight="bold" onClick={handleBack} className="cursor-pointer" />
                <h1 className="font-bold text-xl md:text-2xl">Create and manage project discussions for students.</h1>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex justify-between items-center mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-[#282828]">{discussion?.title || "Discussion"}</h2>
                    <p className="text-sm text-gray-600"> {discussion?.description || "—"}</p>
                </div>
                <div className="bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm">
                    Total Submissions : {loading ? "…" : submissions.length}
                </div>
            </div>

            {loading ? (
                <SubmissionShimmer />
            ) : error ? (
                <div className="text-center py-10 text-red-500 font-medium">
                    {error}
                </div>
            ) : submissions.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">
                    No submissions yet.
                </div>
            ) : (
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
                    {submissions.map((submission) => (
                        <div key={submission.studentDiscussionUploadId} className="bg-white overflow-x-auto rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-3">
                            <div className="flex-shrink-0 items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                    {submission.profiles?.avatar_url ? (
                                        <img
                                            src={submission.profiles.avatar_url}
                                            alt={submission.profiles.full_name}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <User size={20} weight="bold" className="text-gray-500" />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[#43C17A] font-bold text-base">
                                        {submission.profiles?.full_name || "Unknown Student"}
                                    </h3>

                                    {submission.marksObtained !== undefined && submission.marksObtained !== null ? (
                                        <div className="bg-[#43C17A] text-white text-xs font-bold px-4 py-1.5 rounded-md min-w-[70px] text-center">
                                            {submission.marksObtained} / 25
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openMarksModal(submission)}
                                            className="bg-[#16284F] text-white text-xs font-bold px-4 py-1.5 rounded-md cursor-pointer hover:bg-[#102040] transition-colors min-w-[70px]"
                                        >
                                            Add Marks
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-between mt-2">
                                    <div className="flex flex-col gap-2 text-sm">
                                        <div>
                                            <span className="font-bold text-[#282828]">Student ID : </span>
                                            <span className="text-gray-600">{submission.studentId}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-[#282828]">Section : </span>
                                            <span className="text-gray-600">{submission.profiles?.section || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 text-[13px] items-end w-[280px]">
                                        <div className="w-full text-right">
                                            <span className="font-bold text-[#282828]">Submitted on : </span>
                                            <span className="text-gray-600">
                                                {new Date(submission.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center w-full justify-end">
                                            <span className="font-bold text-[#282828] mr-2 flex-shrink-0">File :</span>
                                            <div className="p-1 mr-1 rounded-full bg-[#FE000017] cursor-pointer">
                                                <FilePdf size={15} weight="fill" className="text-red-500 flex-shrink-0" />
                                            </div>
                                            <div className="max-w-[160px] overflow-x-auto whitespace-nowrap scrollbar-hide">
                                                <a
                                                    href={submission.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline"
                                                >
                                                    {formatFileName(submission.fileUrl)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <AdminAddMarksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} student={selectedStudent} />
            )}
        </div>
    );
}