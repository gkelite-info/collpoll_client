import React, { useState, useRef, useCallback } from "react";
import { X, CloudArrowUp, FilePdf, Trash, DownloadSimple, UserCircle, CalendarBlank, CalendarDotsIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarDaysIcon } from "lucide-react";

export function StudentDiscussionUploadModal({ discussion, onUpload }: { discussion: any, onUpload: (files: any[]) => void; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleUploadSubmit = () => {
        onUpload(files.map(f => ({
            name: f.name,
            size: (f.size / 1024).toFixed(2) + " KB"
        })));
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
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
                    <button onClick={handleClose} className="p-1 cursor-pointer rounded-md transition-colors"><X size={24} /></button>
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
                                    <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="p-1.5 text-[#43C17A] bg-[#e2f6ea] rounded hover:bg-[#c9efd9] transition-colors flex-shrink-0">
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
                    <button onClick={handleUploadSubmit} className="w-full cursor-pointer py-3 rounded-md font-bold text-sm bg-[#43C17A] text-white hover:bg-[#38a366] shadow-sm transition-colors">
                        Upload File
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
                                <span className="text-gray-600">{discussion.uploadedOn}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center cursor-pointer gap-2 bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm">
                            Download <span className="bg-white rounded-full text-[#43C17A] p-1"><DownloadSimple size={12} weight="bold" /></span>
                        </button>
                        <button onClick={handleClose} className="text-gray-500 p-1 cursor-pointer rounded-md"><X size={24} /></button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold text-[#282828]">Project Overview</h3>
                        <p className="text-sm text-[#282828] leading-relaxed whitespace-pre-line">{discussion.details.overview}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold text-[#282828]">Learning Objectives</h3>
                        <ul className="text-sm text-[#282828] flex flex-col gap-1">
                            {discussion.details.objectives.map((obj: string, i: number) => (
                                <li key={i}>• {obj}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-base font-bold text-[#282828]">Project Requirements</h3>
                        {discussion.details.requirements.map((req: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-[#282828]">{req.title}</h4>
                                <p className="text-sm text-[#282828] leading-relaxed whitespace-pre-line">{req.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }`}</style>
        </div>
    );
}