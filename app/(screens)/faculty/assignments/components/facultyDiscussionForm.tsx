// --- CHANGED: Updated imports to include useState, useRef, and useCallback ---
import React, { useState, useRef, useCallback } from "react";
import { ArrowLeft, CaretLeftIcon, CloudArrowUp, FilePdf, Trash } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function FacultyDiscussionForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- ADDED: State and refs for file uploading ---
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
    };

    // --- ADDED: File Upload Handlers ---
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
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
            setFiles(prev => [...prev, ...droppedFiles]);
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
    // ------------------------------------

    return (
        <div className="w-full flex flex-col h-full overflow-y-auto pb-10">
            <div className="flex items-center gap-1 mb-4">
                <button onClick={handleBack} className=" cursor-pointer border-gray-100 ">
                    <CaretLeftIcon size={20} className="text-[#282828]" weight="bold" />
                </button>
                <h2 className="text-xl font-bold text-[#282828]">
                    {initialData ? "Edit" : "Create"} and manage project discussions for students.
                </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 mb-6">
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#282828] text-sm">Discussion Title</label>
                    <input
                        type="text"
                        placeholder="Enter Discussion Title here"
                        defaultValue={initialData?.title || ""}
                        className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#43C17A]"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#282828] text-sm">Description</label>
                    <textarea
                        placeholder="Enter Description here"
                        rows={6}
                        defaultValue={initialData?.description || ""}
                        className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-[#43C17A] resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[#282828] text-sm">Deadline</label>
                        <input
                            type="date"
                            className="w-full border cursor-pointer border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#43C17A] text-gray-600"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[#282828] text-sm">Section(s)</label>
                        <select className="w-full border cursor-pointer border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#43C17A] text-gray-600 bg-white">
                            <option>Select Section(s)</option>
                            <option>Section A</option>
                            <option>Section B</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
                <h3 className="font-bold text-[#282828] text-base">Project Files</h3>

                <div className={`grid gap-6 ${files.length > 0 ? "grid-cols-[1.5fr_1fr]" : "grid-cols-1"}`}>
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
                            } ${files.length === 0 ? "py-16" : ""}`}
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

                    {files.length > 0 && (
                        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {files.map((file, idx) => (
                                <div key={`${file.name}-${idx}`} className="flex items-center gap-1 justify-between border border-red-100 rounded-md p-3 bg-white shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FilePdf size={24} weight="fill" className="text-red-500 flex-shrink-0" />
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
                <button onClick={handleBack} className="px-8 cursor-pointer py-2.5 rounded-md font-bold text-sm bg-[#43C17A] text-white shadow-sm">
                    Save
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8; 
                }
            `}</style>
        </div>
    );
}