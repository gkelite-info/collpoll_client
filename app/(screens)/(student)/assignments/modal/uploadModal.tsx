"use client";

import { useRef, useState, useEffect } from "react";
import { CardProp } from "../components/card";
import { CloudArrowUp, Trash } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import { insertAssignmentSubmission, } from "@/lib/helpers/student/assignments/insertAssignmentSubmission";
import toast from "react-hot-toast";

type UploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (fileName: string, index: number) => void;
    card?: CardProp;
    index?: number;
    existingFilePath?: string | null;
};

export default function UploadModal({ isOpen, onClose, onUpload, card, index, existingFilePath }: UploadModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingFile, setExistingFile] = useState<{
        path: string;
        name: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileDeleted, setFileDeleted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (existingFilePath) {
            const fileName = existingFilePath.split("/").pop()!;

            const fakeFile = new File([], fileName, {
                type: "application/pdf",
            });

            setSelectedFiles([fakeFile]);
        } else {
            setSelectedFiles([]);
        }
    }, [existingFilePath, isOpen]);
    if (!isOpen) return null;

    const isLocked = (existingFilePath && !fileDeleted) || selectedFiles.length > 0;
    const triggerFileInput = () => {
        if (isLocked) {
            toast.error("Delete the existing file before uploading a new one");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (existingFilePath || selectedFiles.length > 0) {
            toast.error("Delete the existing file before uploading a new one");
            e.target.value = "";
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            e.target.value = "";
            return;
        }

        setSelectedFiles([file]);
        e.target.value = "";
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select a file");
            return;
        }

        if (!card) return;

        if (existingFilePath) {
            toast.error("Delete the existing file before uploading a new one");
            return;
        }

        try {
            setIsUploading(true);

            const file = selectedFiles[0];
            const filePath = `assignments/${card.assignmentId}/${file.name}`;

            const { error } = await supabase.storage
                .from("student_submissions")
                .upload(filePath, file, { upsert: true });

            if (error) {
                toast.error("Upload failed");
                return;
            }

            const res = await insertAssignmentSubmission({
                assignmentId: Number(card.assignmentId),
                filePath,
            });

            if (!res.success) {
                toast.error("Failed to save submission");
                return;
            }

            onUpload(filePath, index!);
            toast.success("Assignment submitted successfully 🎉");
            onClose();
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };
    const handleDeleteExistingFile = async () => {

        if (!existingFilePath || !card) {
            return;
        }

        try {
            setIsDeleting(true);
            const { error: storageErr } = await supabase.storage
                .from("student_submissions")
                .remove([existingFilePath]);

            if (storageErr) {
                throw storageErr;
            }

            const { data: authData, error: authErr } = await supabase.auth.getUser();

            if (authErr || !authData?.user) {
                throw new Error("No auth user");
            }

            const user = authData.user;

            const { data: userRow, error: userErr } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", user.id)
                .single();

            if (userErr || !userRow) {
                throw new Error("Internal user not found");
            }

            const { data: student, error: studentErr } = await supabase
                .from("students")
                .select("studentId")
                .eq("userId", userRow.userId)
                .single();

            if (studentErr || !student) {
                throw new Error("Student not found");
            }

            const { data: updatedRow, error: dbErr } = await supabase
                .from("student_assignments_submission")
                .update({
                    file: "",
                    updatedAt: new Date().toISOString(),
                })
                .eq("studentId", student.studentId)
                .eq("assignmentId", card.assignmentId)
                .is("deletedAt", null)
                .select();

            if (dbErr) {
                throw dbErr;
            }

            if (!updatedRow || updatedRow.length === 0) {
            } else {
            }

            setSelectedFiles([]);
            setFileDeleted(true);
            onUpload("", index!);
            toast.success("File deleted. You can upload a new file now.");

        } catch (err) {
            toast.error("Failed to delete uploaded file");
        } finally {
            setIsDeleting(false);
        }
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-start justify-center overflow-y-auto z-50 p-6">
            <div className="bg-white rounded-lg shadow-xl p-6 w-[420px] max-h-[90vh] overflow-y-auto  flex flex-col animate-fadeIn relative">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-[#282828] font-semibold text-lg">
                        Upload Assignment
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-[#282828] hover:text-black text-xl cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
                <p className="text-sm text-[#282828] mb-2">Submit your assignment file in the required format. </p>

                <div className="bg-blue-00 mt-2">
                    <h5 className="text-[#111827] font-medium text-md">Assignment Details</h5>
                    <div className="flex items-start justify-start gap-2 bg-yellow-00 mt-1">
                        <div className="lg:w-[20%] flex flex-col justify-start">
                            <p className="text-sm text-[#282828]">Subject :</p>
                            <p className="text-sm text-[#282828]">Topic :</p>
                            <p className="text-sm text-[#282828]">Faculty :</p>
                        </div>
                        <div className="lg:w-auto h-auto flex flex-col justify-start">
                            <p className="text-sm text-[#282828]">
                                {card?.subjectName}
                            </p>

                            <div className="max-w-[250px] overflow-x-auto whitespace-nowrap">
                                <p className="text-sm text-[#282828]">
                                    {card?.topicName}
                                </p>
                            </div>

                            <p className="text-sm text-[#282828]">
                                {card?.professor}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-00 mt-2 flex flex-col justify-start gap-2 flex-1">
                    <h5 className="text-[#111827] font-medium text-left">Upload your file</h5>
                    <div
                        className={`lg:w-full gap-2 border border-[#707070] border-dashed border-2 rounded-lg p-4 py-3 flex flex-col items-center justify-center
  ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={!isLocked ? triggerFileInput : undefined}
                    >
                        <CloudArrowUp size={65} className="text-[#CECECE]" />
                        <h5 className="text-[#666666] text-sm">Drag & Drop your file here or</h5>
                        <button
                            className={`lg:px-3 lg:mb-4 lg:py-1 text-[#111827] lg:font-medium border border-[#666666] rounded-lg cursor-pointer
    ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerFileInput();
                            }}
                            type="button"
                            disabled={isLocked}
                        >
                            Browse Files
                        </button>
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={isLocked}
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
                                    {/* <button onClick={() => removeFile(idx)}>
                                        <Trash size={22} className="text-red-500 cursor-pointer" />
                                    </button> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {existingFilePath && (
                    <button
                        className="text-red-500 text-sm underline mt-3 self-start cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleDeleteExistingFile}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete uploaded file"}
                    </button>
                )}

                <div className="flex justify-center gap-3 mt-5">
                    <button
                        className="bg-[#43C17A] text-white w-[49%] py-2 cursor-pointer rounded-md text-sm hover:bg-[#3AAA6B] disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? "Submitting..." : "Submit Assignment"}
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