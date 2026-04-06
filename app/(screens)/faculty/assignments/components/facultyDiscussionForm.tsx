'use client'
import { useState, useRef, useCallback, useEffect } from "react";
import {
    CaretLeftIcon,
    CloudArrowUp,
    FilePdf,
    FileDoc,
    FileXls,
    FilePpt,
    FileZip,
    FileJs,
    FileCss,
    FileHtml,
    FilePng,
    FileJpg,
    Trash
} from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { fetchDiscussionById, fetchExistingDiscussion, saveDiscussionForum } from "@/lib/helpers/discussionForum/discussionForumAPI";
import { saveDiscussionSections, replaceDiscussionSections, fetchDiscussionSectionByDiscussionId } from "@/lib/helpers/discussionForum/discussionForumSectionsAPI";
import { uploadDiscussionFiles } from "@/lib/helpers/discussionForum/discussionFileUploadStorageAPI";
import { deactivateDiscussionFile, saveDiscussionFiles } from "@/lib/helpers/discussionForum/discussionFileUploadsAPI";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

const ALLOWED_FILE_EXTENSIONS = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
    "rar",
    "png",
    "jpg",
    "jpeg",
    "html",
    "css",
    "js",
    "json",
    "txt"
];

const isValidFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return ext && ALLOWED_FILE_EXTENSIONS.includes(ext);
};

const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "pdf":
            return <FilePdf size={24} weight="fill" className="text-red-500" />;
        case "doc":
        case "docx":
            return <FileDoc size={24} weight="fill" className="text-blue-500" />;
        case "xls":
        case "xlsx":
            return <FileXls size={24} weight="fill" className="text-green-600" />;
        case "ppt":
        case "pptx":
            return <FilePpt size={24} weight="fill" className="text-orange-500" />;
        case "zip":
        case "rar":
            return <FileZip size={24} weight="fill" className="text-yellow-600" />;
        case "js":
            return <FileJs size={24} weight="fill" className="text-yellow-500" />;
        case "html":
            return <FileHtml size={24} weight="fill" className="text-orange-600" />;
        case "css":
            return <FileCss size={24} weight="fill" className="text-blue-600" />;
        case "png":
            return <FilePng size={24} weight="fill" className="text-green-500" />;
        case "jpg":
        case "jpeg":
            return <FileJpg size={24} weight="fill" className="text-green-500" />;

        default:
            return <FilePdf size={24} weight="fill" className="text-gray-400" />;
    }
};

export default function FacultyDiscussionForm({ discussionId, onSaved }: { discussionId?: number, onSaved?: () => void; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { facultyId, sections } = useFaculty();

    const [initialLoading, setInitialLoading] = useState(!!discussionId);
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<{ discussionFileUploadId: number; fileUrl: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        deadline: "",
        marks: "",
        sections: [] as string[]
    });
    const [sectionOpen, setSectionOpen] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
    const [isDeletingFile, setIsDeletingFile] = useState(false);

    useEffect(() => {
        const loadDiscussion = async () => {
            if (!discussionId) return;
            try {
                const data = await fetchDiscussionById(discussionId);
                if (!data) return;

                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    deadline: data.deadline || "",
                    marks: data.discussion_forum_sections?.[0]?.marks?.toString() || "",
                    sections: data.discussion_forum_sections?.map(
                        (s: any) => String(s.collegeSectionsId)
                    ) || []
                });

                // setExistingFiles(data.discussion_file_uploads ?? []);
                setExistingFiles(
                    (data.discussion_file_uploads ?? [])
                        .filter((f: any) => f.isActive && !f.is_deleted && !f.deletedAt)
                        .map((f: any) => ({
                            discussionFileUploadId: f.discussionFileUploadId,
                            fileUrl: f.fileUrl
                        }))
                );
            } catch (err) {
                toast.error("Failed to load discussion");
            } finally {
                setInitialLoading(false);
            }
        };
        loadDiscussion();
    }, [discussionId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
                setSectionOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSection = (section: string) => {
        setForm(prev => ({
            ...prev,
            sections: prev.sections.includes(section)
                ? prev.sections.filter((s: string) => s !== section)
                : [...prev.sections, section]
        }));
    };

    // const removeExistingFile = async (discussionFileUploadId: number) => {
    //     try {
    //         const result = await deactivateDiscussionFile(discussionFileUploadId);
    //         if (result.success) {
    //             setExistingFiles(prev => prev.filter(f => f.discussionFileUploadId !== discussionFileUploadId));
    //             toast.success("File removed successfully.");
    //         } else {
    //             toast.error("Failed to remove file.");
    //         }
    //     } catch (error) {
    //         toast.error("Failed to remove file.");
    //         console.error("removeExistingFile error:", error);
    //     }
    // };

    const removeExistingFile = async (discussionFileUploadId: number) => {

        try {
            const result = await deactivateDiscussionFile(discussionFileUploadId);
            if (!result.success) {
                toast.error("Failed to remove file.");
                return;
            }
            setExistingFiles(prev =>
                prev.filter(f => f.discussionFileUploadId !== discussionFileUploadId)
            );
            toast.success("File removed successfully.");
        } catch (error) {
            toast.error("Failed to remove file.");
        }
    };

    const handleSave = async () => {
        try {
            if (!form.title) { toast.error("Title is required"); return; }
            if (!form.description) { toast.error("Description is required"); return; }
            if (!form.deadline) { toast.error("Deadline is required"); return; }
            if (!form.marks || Number(form.marks) <= 0) { toast.error("Please enter valid marks"); return; }
            if (!form.sections || form.sections.length === 0) { toast.error("Please select at least one section"); return; }

            if (!discussionId) {
                const { data: existing } = await fetchExistingDiscussion(form.title, form.deadline);
                if (existing) {
                    toast.error("A discussion with the same title and deadline already exists.");
                    return;
                }
            }

            setLoading(true);

            const payload = await saveDiscussionForum(
                {
                    discussionId: discussionId,
                    title: form.title,
                    description: form.description,
                    deadline: form.deadline,
                },
                { facultyId: facultyId ?? undefined }
            );

            if (!payload.success || !payload.discussionId) {
                toast.error("Failed to save discussion. Please try again.");
                return;
            }

            const sectionsPayload = form.sections.map((collegeSectionsId: string) => ({
                collegeSectionsId: Number(collegeSectionsId),
                marks: Number(form.marks) || 0,
            }));

            let sectionsResult = { success: true };

            if (!discussionId) {
                sectionsResult = await saveDiscussionSections(payload.discussionId, sectionsPayload);
            } else {
                const existingSectionIds = form.sections.map(Number).sort().join(",");
                const newSectionIds = sectionsPayload.map(s => s.collegeSectionsId).sort().join(",");

                if (existingSectionIds !== newSectionIds) {
                    sectionsResult = await replaceDiscussionSections(payload.discussionId, sectionsPayload);
                }
            }

            if (!sectionsResult.success) {
                toast.error("Discussion saved but failed to save sections.");
                return;
            }

            if (files.length > 0) {
                try {
                    const { success, data: savedSection } = await fetchDiscussionSectionByDiscussionId(payload.discussionId);

                    if (!success || !savedSection) {
                        toast.error("Discussion saved but failed to fetch section.");
                        return;
                    }

                    const fileUrls = await uploadDiscussionFiles(payload.discussionId, files);
                    const filesResult = await saveDiscussionFiles(payload.discussionId, fileUrls, savedSection.discussionSectionId);
                    if (!filesResult.success) {
                        toast.error("Discussion saved but failed to save file records.");
                        return;
                    }
                } catch (uploadError) {
                    toast.error("Discussion saved but file upload failed.");
                    console.error("File upload error:", uploadError);
                    return;
                }
            }

            toast.success(discussionId ? "Discussion updated successfully." : "Discussion created successfully.");
            handleBack();

        } catch (error) {
            toast.error("Failed to save discussion");
            console.error("Failed to save discussion", error);
        } finally {
            setLoading(false);
        }
    }

    const handleBack = () => {
        onSaved?.();
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("discussionId");
        params.set("discussionView", "active");
        router.push(`${pathname}?${params.toString()}`);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            // setFiles(prev => [...prev, ...newFiles]);

            const validFiles = newFiles.filter(isValidFile);
            const invalidFiles = newFiles.filter(f => !isValidFile(f));
            if (invalidFiles.length > 0) {
                toast.error("Only project related files allowed (pdf, doc, excel, ppt, zip, images)");
            }

            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            // setFiles(prev => [...prev, ...droppedFiles]);
            const validFiles = droppedFiles.filter(isValidFile);
            const invalidFiles = droppedFiles.filter(f => !isValidFile(f));
            if (invalidFiles.length > 0) {
                toast.error("Unsupported file type detected");
            }
            setFiles(prev => [...prev, ...validFiles]);
        }
    }, []);

    const removeFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 👇 Show spinner while loading existing data
    if (initialLoading) {
        return (
            <div className="w-full flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#43C17A] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const confirmDeleteExistingFile = async () => {
        if (!deleteFileId) return;
        try {
            setIsDeletingFile(true);
            const result = await deactivateDiscussionFile(deleteFileId);
            if (!result.success) {
                toast.error("Failed to remove file.");
                return;
            }
            setExistingFiles(prev =>
                prev.filter(f => f.discussionFileUploadId !== deleteFileId)
            );
            toast.success("File removed successfully.");
        } catch (error) {
            toast.error("Failed to remove file.");
        } finally {
            setDeleteFileId(null);
            setIsDeletingFile(false);
        }
    };

    const handleExistingFileDeleteClick = (discussionFileUploadId: number) => {
        setDeleteFileId(discussionFileUploadId);
    };

    return (
        <div className="w-full flex flex-col h-full overflow-y-auto pb-10">
            <div className="flex items-center gap-1 mb-4">
                <button onClick={handleBack} className="cursor-pointer border-gray-100">
                    <CaretLeftIcon size={20} className="text-[#282828]" weight="bold" />
                </button>
                <h2 className="text-xl font-bold text-[#282828]">
                    {discussionId ? "Edit" : "Create"} and manage project discussions for students.
                </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 mb-6">
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#282828] text-sm">Discussion Title</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter Discussion Title here"
                        className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#807F7F] outline-none focus:border-[#43C17A]"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#282828] text-sm">Description</label>
                    <textarea
                        placeholder="Enter Description here"
                        rows={6}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none text-[#807F7F] focus:border-[#43C17A] resize-none"
                    />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[#282828] text-sm">Deadline</label>
                        <input
                            type="date"
                            value={form.deadline}
                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            className="w-full border cursor-pointer border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#43C17A] text-gray-600"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[#282828] text-sm">Marks</label>
                        <input
                            type="number"
                            min={0}
                            value={form.marks}
                            onChange={(e) => setForm({ ...form, marks: e.target.value })}
                            placeholder="Enter total marks"
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#807F7F] outline-none focus:border-[#43C17A]"
                        />
                    </div>

                    <div className="flex flex-col gap-2" ref={sectionRef}>
                        <label className="font-bold text-[#282828] text-sm">Section(s)</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setSectionOpen(prev => !prev)}
                                className="w-full border cursor-pointer border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#43C17A] text-gray-600 bg-white flex items-center justify-between"
                            >
                                <span className={form.sections.length === 0 ? "text-gray-400" : "text-gray-600"}>
                                    {form.sections.length === 0
                                        ? "Select Section(s)"
                                        : form.sections.map((id: string) =>
                                            sections.find(s => String(s.collegeSectionsId) === id)?.college_sections?.collegeSections ?? id
                                        ).join(", ")}
                                </span>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${sectionOpen ? "rotate-180" : ""}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {sectionOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md">
                                    {sections.map(section => (
                                        <label
                                            key={section.facultySectionId}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.sections.includes(String(section.collegeSectionsId))}
                                                onChange={() => toggleSection(String(section.collegeSectionsId))}
                                                className="accent-[#43C17A] w-4 h-4 cursor-pointer"
                                            />
                                            {section.college_sections?.collegeSections ?? `Section ${section.collegeSectionsId}`}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
                <h3 className="font-bold text-[#282828] text-base">Project Files</h3>
                <div className={`grid gap-6 ${files.length > 0 || existingFiles.length > 0 ? "grid-cols-[1.5fr_1fr]" : "grid-cols-1"}`}>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={onFileSelect}
                        className="hidden"
                    />
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${isDragging ? "border-[#43C17A] bg-[#e2f6ea]" : "border-gray-300 bg-gray-50/50"
                            } ${files.length === 0 && existingFiles.length === 0 ? "py-16" : ""}`}
                    >
                        <CloudArrowUp size={40} className={isDragging ? "text-[#43C17A]" : "text-gray-400"} />
                        <p className="text-sm text-gray-500">Drag & Drop Your File here or</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white cursor-pointer border border-gray-200 text-[#282828] px-4 py-1.5 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            Browse Files
                        </button>
                    </div>

                    {(files.length > 0 || existingFiles.length > 0) && (
                        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {existingFiles.map((file) => (
                                <div key={file.discussionFileUploadId} className="flex items-center gap-1 justify-between border border-blue-100 rounded-md p-3 bg-white shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* <FilePdf size={24} weight="fill" className="text-blue-500 flex-shrink-0" /> */}
                                        {getFileIcon(file.fileUrl)}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[#282828] whitespace-nowrap overflow-x-auto">
                                                {file.fileUrl.split("/").pop()}
                                            </span>
                                            <span className="text-xs text-gray-400">Existing file</span>
                                        </div>
                                    </div>
                                    <button
                                        // onClick={() => removeExistingFile(file.discussionFileUploadId)}
                                        onClick={() => handleExistingFileDeleteClick(file.discussionFileUploadId)}
                                        className="p-1.5 bg-red-50 cursor-pointer text-red-500 rounded-full hover:bg-red-100 transition-colors flex-shrink-0"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ))}

                            {files.map((file, idx) => (
                                <div key={`${file.name}-${idx}`} className="flex items-center gap-1 justify-between border border-red-100 rounded-md p-3 bg-white shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* <FilePdf size={24} weight="fill" className="text-red-500 flex-shrink-0" /> */}
                                        {getFileIcon(file.name)}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[#282828] whitespace-nowrap overflow-x-auto">
                                                {file.name}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="p-1.5 bg-red-50 cursor-pointer text-red-500 rounded-full hover:bg-red-100 transition-colors flex-shrink-0"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-6 gap-4">
                <button onClick={handleBack} className="px-6 bg-white cursor-pointer py-2.5 rounded-md font-bold text-sm text-[#7B7B7B] border border-[#7B7B7B]">
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-8 cursor-pointer py-2.5 rounded-md font-bold text-sm bg-[#43C17A] text-white shadow-sm"
                    disabled={loading}
                >
                    {loading ? "Saving.." : "Save"}
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
            `}</style>

            <ConfirmDeleteModal
                open={!!deleteFileId}
                onConfirm={confirmDeleteExistingFile}
                onCancel={() => setDeleteFileId(null)}
                isDeleting={isDeletingFile}
                name="file"
            />
        </div>
    );
}