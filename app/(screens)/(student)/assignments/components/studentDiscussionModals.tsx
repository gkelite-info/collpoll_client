'use client'
import React, { useState, useRef, useCallback } from "react";
import { X, CloudArrowUp, FilePdf, Trash, DownloadSimple, UserCircle, CalendarBlank, CalendarDotsIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStudent } from "@/app/utils/context/student/useStudent";
import toast from "react-hot-toast";
import { saveStudentDiscussionUpload, uploadStudentDiscussionFiles } from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";

export function StudentDiscussionUploadModal({ discussion, onUpload, onSuccess }: { discussion: any, onUpload: (files: any[]) => void; onSuccess?: () => void; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { studentId } = useStudent();
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleUploadSubmit = async () => {
        if (files.length === 0) {
            toast.error("Please select at least one file");
            return;
        }

        if (!studentId) {
            toast.error("Student not found");
            return;
        }

        try {
            setLoading(true);

            const fileUrls = await uploadStudentDiscussionFiles(
                discussion.discussionId,
                studentId,
                files
            );

            for (const fileUrl of fileUrls) {
                const result = await saveStudentDiscussionUpload({
                    studentId,
                    discussionId: discussion.discussionId,
                    discussionSectionId: discussion.discussionSectionId,
                    fileUrl,
                });

                if (!result.success) {
                    toast.error("Failed to save file record.");
                    return;
                }
            }

            onUpload(files.map(f => ({
                name: f.name,
                size: (f.size / 1024).toFixed(2) + " KB"
            })));

            toast.success("Files uploaded successfully!");
            onSuccess?.();

            const params = new URLSearchParams(searchParams.toString());
            params.delete("modal");
            params.delete("discussionId");
            router.push(`${pathname}?${params.toString()}`);

        } catch (error) {
            toast.error("Upload failed. Please try again.");
            console.error("handleUploadSubmit error:", error);
        } finally {
            setLoading(false);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    };
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files?.length) setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-[#43C17A]">{discussion.title}</h2>
                        <h3 className="text-lg font-bold text-[#282828] mt-2">Upload</h3>
                    </div>
                    <button onClick={handleClose} className="p-1 cursor-pointer rounded-md transition-colors"><X size={24} color="black" /></button>
                </div>

                <div className="flex flex-col gap-4">
                    <input type="file" multiple ref={fileInputRef} onChange={onFileSelect} className="hidden" />

                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-colors ${isDragging ? "border-[#43C17A] bg-[#e2f6ea]" : "border-gray-300 bg-gray-50/50"}`}
                    >
                        <CloudArrowUp size={48} className="text-gray-400" />
                        <p className="text-base text-gray-600">Drag & Drop Your File here or</p>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white border cursor-pointer border-gray-200 text-[#282828] px-5 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            Browse Files
                        </button>
                    </div>

                    {files.length > 0 && (
                        <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between border border-green-100 rounded-md p-3 bg-white">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FilePdf size={24} weight="fill" className="text-red-500 flex-shrink-0" />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium text-[#282828] truncate">{file.name}</span>
                                            <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 bg-red-100 rounded transition-colors flex-shrink-0 cursor-pointer">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8 gap-4">
                    <button onClick={handleClose} className="w-full cursor-pointer py-3 rounded-md font-bold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleUploadSubmit}
                        className="w-full cursor-pointer py-3 rounded-md font-bold text-sm bg-[#43C17A] text-white hover:bg-[#38a366] shadow-sm transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Uploading.." : "Upload File"}

                    </button>
                </div>
            </div>
            <style jsx>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }`}</style>
        </div>
    );
}

export function StudentDiscussionDetailsModal({ discussion }: { discussion: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">

                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-2xl font-bold text-[#43C17A]">{discussion.title}</h2>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-[#43C07A24] p-1 rounded-full">
                                    <UserCircle size={18} className="text-[#43C17A]" weight="regular" />
                                </div>
                                <span className="font-bold text-[#282828]">Faculty Name :</span>
                                <span className="text-gray-600">{discussion.facultyName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-[#43C07A24] p-1 rounded-full">
                                    <CalendarDotsIcon size={18} className="text-[#43C17A]" weight="regular" />
                                </div>
                                <span className="font-bold text-[#282828]">Uploaded On :</span>
                                <span className="text-gray-600">
                                    {discussion.createdAt ? new Date(discussion.createdAt).toLocaleDateString() : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const firstFile = discussion.attachments?.[0];
                                if (firstFile?.fileUrl) {
                                    window.open(firstFile.fileUrl, "_blank");
                                }
                            }} className="flex items-center cursor-pointer gap-2 bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm">
                            Download <span className="bg-white rounded-full text-[#43C17A] p-1"><DownloadSimple size={12} weight="bold" /></span>
                        </button>
                        <button onClick={handleClose} className="text-gray-500 p-1 cursor-pointer rounded-md"><X size={24} /></button>
                    </div>
                </div>

                <div className="bg-pink-00 flex flex-col lg:px-5 lg:py-4">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold text-[#282828]">Description</h3>
                        <p className="text-sm text-[#282828] leading-relaxed whitespace-pre-line">
                            {discussion.description ?? "No description provided."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold text-[#282828]">Deadline</h3>
                        <p className="text-sm text-[#282828]">
                            {discussion.deadline ? new Date(discussion.deadline).toLocaleDateString() : "—"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold text-[#282828]">Marks</h3>
                        <p className="text-sm text-[#282828]">{discussion.marks ?? "—"}</p>
                    </div>
                    {discussion.attachments?.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-base font-bold text-[#282828]">Attachments</h3>
                            <div className="flex flex-wrap gap-2">
                                {discussion.attachments.map((file: { fileUrl: string }, idx: number) => (
                                    <a
                                        key={idx}
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-[#e2e8f0] text-[#334155] px-3 py-1.5 rounded-md text-xs font-semibold"
                                    >
                                        <FilePdf size={16} weight="fill" className="text-[#1e293b]" />
                                        {file.fileUrl?.split("/").pop()?.split("_").slice(1).join("_") ?? "File"}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <style jsx>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }`}</style>
        </div >
    );
}