"use client";

import { X, FilePdf } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

interface AddMarksModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
}

export default function AddMarksModal({ isOpen, onClose, student }: AddMarksModalProps) {
    const [marks, setMarks] = useState<string>("");

    useEffect(() => {
        if (student?.marksObtained) {
            setMarks(String(student.marksObtained));
        } else {
            setMarks("");
        }
    }, [student]);

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#111827]">Add Marks</h2>
                    <button onClick={onClose} className="text-[#000000] cursor-pointer">
                        <X size={20} weight="regular" />
                    </button>
                </div>

                <h3 className="text-[#43C17A] font-bold text-sm mb-4">{student.name}</h3>

                <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm font-semibold text-[#282828] mb-8">
                    <span>Student ID</span>
                    <span className="font-medium text-gray-600">: {student.studentId}</span>

                    <span>Submitted On</span>
                    <span className="font-medium text-gray-600">: {student.submittedOn}</span>

                    <span>File</span>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                        :
                        <div className="p-1 rounded-full bg-[#FE000017]">
                            <FilePdf size={16} weight="fill" className="text-red-500 flex-shrink-0" />
                        </div>
                        <span
                            className="max-w-[180px] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300"
                        >
                            {student.file}
                        </span>
                    </span>
                </div>

                <div className="flex justify-center items-center gap-3 mb-8">
                    <input
                        type="number"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        placeholder="0"
                        className="w-20 h-14 bg-[#FFF1F1] text-[#16284F] text-2xl font-bold rounded-lg text-center outline-none focus:ring-2 focus:ring-[#43C17A]/50 transition-all"
                    />
                    <div className="w-20 h-14 bg-[#16284F] text-white text-2xl font-bold rounded-lg flex items-center justify-center">
                        {student.totalMarks}
                    </div>
                </div>

                <div className="flex justify-center gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 cursor-pointer rounded-lg border border-[#7B7B7B] text-[#7B7B7B] font-bold text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                        }}
                        className="flex-1 py-2.5 cursor-pointer rounded-lg bg-[#43C17A] text-white font-bold text-sm"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    );
}