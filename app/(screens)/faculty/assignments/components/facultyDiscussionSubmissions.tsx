"use client";

import { CaretLeft, FilePdf } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import AddMarksModal from "./addMarksModal";

const MOCK_SUBMISSIONS = [
    { id: 1, name: "Lily Tano", studentId: "479210", section: "A", submittedOn: "04/09/2026", file: "AI_Education_Project.pdf", marksObtained: null, totalMarks: 25, avatar: "https://i.pravatar.cc/100?u=1" },
    { id: 2, name: "Ananya Sharma", studentId: "479210", section: "A", submittedOn: "04/09/2026", file: "AI_Education_Project.pdf", marksObtained: 20, totalMarks: 25, avatar: "https://i.pravatar.cc/100?u=2" },
    { id: 3, name: "Sophia Lin", studentId: "479210", section: "A", submittedOn: "04/09/2026", file: "AI_Education_Project.pdf", marksObtained: 20, totalMarks: 25, avatar: "https://i.pravatar.cc/100?u=3" },
    { id: 4, name: "Ananya Sharma", studentId: "479210", section: "A", submittedOn: "04/09/2026", file: "AI_Education_Project_Very_Long_Name_File_Test.pdf", marksObtained: 20, totalMarks: 25, avatar: "https://i.pravatar.cc/100?u=4" },
    { id: 5, name: "Reema Sajid", studentId: "479210", section: "A", submittedOn: "04/09/2026", file: "AI_Education_Project.pdf", marksObtained: 20, totalMarks: 25, avatar: "https://i.pravatar.cc/100?u=5" },
    { id: 6, name: "Estelle Bald", studentId: "479210", section: "A", submittedOn: "04/09/2026", file: "AI_Education_Project.pdf", marksObtained: 20, totalMarks: 25, avatar: "https://i.pravatar.cc/100?u=6" },
];

export default function FacultyDiscussionSubmissions({ discussionId }: { discussionId: string | null }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="flex flex-col w-full h-full pb-10">
            <div
                onClick={handleBack}
                className="flex items-center gap-2 cursor-pointer mb-5 text-[#282828] hover:text-black transition-colors"
            >
                <CaretLeft size={24} weight="bold" />
                <h1 className="font-bold text-xl md:text-2xl">Create and manage project discussions for students.</h1>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex justify-between items-center mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-[#282828]">AI in Education</h2>
                    <p className="text-sm text-gray-600">Research topic &quot;Impact of AI on Education&quot;</p>
                </div>
                <div className="bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm">
                    Total Submissions : 23
                </div>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] scrollbar-hide pr-1">
                {MOCK_SUBMISSIONS.map((student) => (
                    <div key={student.id} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-3">
                        <div className="flex-shrink-0  items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden -mt-1 relative">
                                <Image src={student.avatar} alt={student.name} fill className="object-cover" />
                            </div>
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[#43C17A] font-bold text-base">{student.name}</h3>
                                {student.marksObtained !== null ? (
                                    <div className="bg-[#16284F] text-white text-xs font-bold px-4 py-1.5 rounded-md min-w-[70px] text-center">
                                        {student.marksObtained} / {student.totalMarks}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openMarksModal(student)}
                                        className="bg-[#16284F] text-white text-xs font-bold px-4 py-1.5 rounded-md cursor-pointer hover:bg-[#102040] transition-colors min-w-[70px]"
                                    >
                                        Marks
                                    </button>
                                )}
                            </div>

                            <div className="flex justify-between mt-2">
                                <div className="flex flex-col gap-2 text-sm">
                                    <div>
                                        <span className="font-bold text-[#282828]">Student ID : </span>
                                        <span className="text-gray-600">{student.studentId}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#282828]">Section : </span>
                                        <span className="text-gray-600">{student.section}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 text-[13px] items-end w-[280px]">
                                    <div className="w-full text-right">
                                        <span className="font-bold text-[#282828]">Submitted on : </span>
                                        <span className="text-gray-600">{student.submittedOn}</span>
                                    </div>

                                    <div className="flex items-center w-full justify-end">
                                        <span className="font-bold text-[#282828] mr-1 flex-shrink-0">File :</span>
                                        <div className="p-1 mr-1 rounded-full bg-[#FE000017]">
                                            <FilePdf size={15} weight="fill" className="text-red-500 flex-shrink-0" />
                                        </div>
                                        <div className="max-w-[160px] overflow-x-auto whitespace-nowrap scrollbar-hide">
                                            <span className="text-gray-600">{student.file}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <AddMarksModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                />
            )}
        </div>
    );
}