"use client";

import { useRef, useState } from "react";
import { CardProp } from "../components/card";
import { CloudArrowUp, Trash } from "@phosphor-icons/react";

type UploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (fileName: string, index: number) => void;
    card?: CardProp;
    index?: number;
};

export default function UploadModal({ isOpen, onClose, onUpload, card, index }: UploadModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const pdfFiles = files.filter(file => file.type === "application/pdf");

        if (pdfFiles.length !== files.length) {
            alert("Only PDF files are allowed!");
        }

        const newFiles = pdfFiles.filter(file => !selectedFiles.some(f => f.name === file.name));
        setSelectedFiles(prev => [...prev, ...newFiles]);

        e.target.value = "";
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) {
            alert("Please select at least one file!");
            return;
        }

        if (index !== undefined) {
            selectedFiles.forEach(file => onUpload(file.name, index));
        }

        setSelectedFiles([]);
        onClose();
    };

    const removeFile = (idx: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const formatFileSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-[420px] max-h-[90vh] flex flex-col animate-fadeIn relative">
                <div className="flex justify-start lg:gap-3 items-center mb-1">
                    <button
                        onClick={onClose}
                        className="text-[#282828] hover:text-black text-xl cursor-pointer"
                    >
                        ✕
                    </button>
                    <h2 className="text-[#282828] font-semibold text-lg">Upload Assignment</h2>
                </div>
                <p className="text-sm text-[#282828] mb-2">Submit your assignment file in the required format. </p>

                <div className="bg-blue-00 mt-2">
                    <h5 className="text-[#111827] font-medium text-md">Assignment Details</h5>
                    <div className="flex items-start justify-start gap-2 bg-yellow-00 mt-1">
                        <div className="lg:w-[20%] flex flex-col justify-start">
                            <p className="text-sm text-[#282828]">Submit :</p>
                            <p className="text-sm text-[#282828]">Topic :</p>
                            <p className="text-sm text-[#282828]">Faculty :</p>
                        </div>
                        <div className="lg:w-auto h-auto flex flex-col justify-start">
                            <p className="text-sm text-[#282828]">{card?.title}</p>
                            <p className="text-sm text-[#282828]">{card?.assignmentTitle}</p>
                            <p className="text-sm text-[#282828]">{card?.professor}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-00 mt-2 flex flex-col justify-start gap-2 flex-1 overflow-hidden">
                    <h5 className="text-[#111827] font-medium text-left">Upload your file</h5>
                    <div
                        className="lg:w-full gap-2 bg-blue-00 border border-[#707070] border-dashed border-2 rounded-lg p-4 py-3 flex flex-col items-center justify-center cursor-pointer">
                        <CloudArrowUp size={65} className="text-[#CECECE]" />
                        <h5 className="text-[#666666] text-sm">Drag & Drop your file here or</h5>
                        <button
                            className="lg:px-3 lg:mb-4 lg:py-1 text-[#111827] lg:font-medium border border-[#666666] rounded-lg cursor-pointer"
                            onClick={triggerFileInput}
                            type="button"
                        >
                            Browse Files
                        </button>
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            multiple
                        />
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="max-h-36 overflow-y-auto mt-2 flex flex-col gap-2">
                            {selectedFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between border-1 border-[#C7C7C7] px-2 py-1 rounded-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <img src="/pdf.png" alt="/pdf.png" className="h-6" />
                                        <p className="text-[#111827] lg:text-sm lg:truncate">{file.name} <span style={{ fontSize: 10, marginLeft: 2, color: "#454545" }}>({formatFileSize(file.size)})</span></p>
                                    </div>
                                    <button onClick={() => removeFile(idx)}>
                                        <Trash size={22} className="text-red-500 cursor-pointer" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-3 mt-5">
                    <button
                        className="bg-[#43C17A] text-white w-[49%] py-2 cursor-pointer rounded-md text-sm hover:bg-[#3AAA6B]"
                        onClick={handleUpload}
                    >
                        Submit Assignment
                    </button>
                    <button
                        className="border w-[49%] py-2 rounded-md text-sm text-[#282828] cursor-pointer"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
