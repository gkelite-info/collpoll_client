"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { CaretLeftIcon, CloudArrowUp, FilePdf, Trash } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const MOCK_SECTIONS = [
    { id: "1", name: "Section A" },
    { id: "2", name: "Section B" },
    { id: "3", name: "Section C" }
];

export default function AdminDiscussionForm({ discussionId }: { discussionId?: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<{ id: number; fileUrl: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        title: discussionId ? "AI in Education" : "",
        description: discussionId ? "Research topic Impact of AI on Education" : "",
        deadline: discussionId ? "2025-01-10" : "",
        marks: discussionId ? "25" : "",
        sections: [] as string[]
    });
    const [sectionOpen, setSectionOpen] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
                setSectionOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSection = (sectionId: string) => {
        setForm(prev => ({
            ...prev,
            sections: prev.sections.includes(sectionId)
                ? prev.sections.filter((s: string) => s !== sectionId)
                : [...prev.sections, sectionId]
        }));
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("discussionId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSave = () => {
        if (!form.title || !form.description || !form.deadline || !form.marks || form.sections.length === 0) {
            toast.error("Please fill all required fields and select a section");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            toast.success(discussionId ? "Discussion updated successfully." : "Discussion created successfully.");
            setLoading(false);
            handleBack();
        }, 800);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };
    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);
    const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

    return (
        <div className="mx-auto flex flex-col h-full overflow-y-auto pb-10">
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
                            className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#807F7F] outline-none focus:border-[#43C17A]"
                        />
                    </div>

                    <div className="flex flex-col gap-2" ref={sectionRef}>
                        <label className="font-bold text-[#282828] text-sm">Section(s)</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setSectionOpen(!sectionOpen)}
                                className="w-full border cursor-pointer border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#43C17A] text-gray-600 bg-white flex items-center justify-between"
                            >
                                <span className={form.sections.length === 0 ? "text-gray-400" : "text-gray-600"}>
                                    {form.sections.length === 0 ? "Select Section(s)" : form.sections.map(id => MOCK_SECTIONS.find(s => s.id === id)?.name).join(", ")}
                                </span>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${sectionOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {sectionOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md">
                                    {MOCK_SECTIONS.map(section => (
                                        <label key={section.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={form.sections.includes(section.id)}
                                                onChange={() => toggleSection(section.id)}
                                                className="accent-[#43C17A] w-4 h-4 cursor-pointer"
                                            />
                                            {section.name}
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
                <div className={`grid gap-6 ${files.length > 0 ? "grid-cols-[1.5fr_1fr]" : "grid-cols-1"}`}>
                    <input type="file" multiple ref={fileInputRef} onChange={onFileSelect} className="hidden" />
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${isDragging ? "border-[#43C17A] bg-[#e2f6ea]" : "border-gray-300 bg-gray-50/50"} ${files.length === 0 ? "py-16" : ""}`}
                    >
                        <CloudArrowUp size={40} className={isDragging ? "text-[#43C17A]" : "text-gray-400"} />
                        <p className="text-sm text-gray-500">Drag & Drop Your File here or</p>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white cursor-pointer border border-gray-200 text-[#282828] px-4 py-1.5 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            Browse Files
                        </button>
                    </div>

                    {(files.length > 0) && (
                        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-1 justify-between border border-red-100 rounded-md p-3 bg-white shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FilePdf size={24} weight="fill" className="text-red-500 flex-shrink-0" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[#282828] whitespace-nowrap overflow-x-auto">{file.name}</span>
                                            <span className="text-xs text-gray-400">File attached</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(idx)} className="p-1.5 bg-red-50 cursor-pointer text-red-500 rounded-full hover:bg-red-100 transition-colors flex-shrink-0">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-6 gap-4">
                <button onClick={handleBack} className="px-6 bg-white cursor-pointer py-2.5 rounded-md font-bold text-sm text-[#7B7B7B] border border-[#7B7B7B]">Cancel</button>
                <button onClick={handleSave} disabled={loading} className="px-8 cursor-pointer py-2.5 rounded-md font-bold text-sm bg-[#43C17A] text-white shadow-sm">
                    {loading ? "Saving.." : "Save"}
                </button>
            </div>
        </div>
    );
}