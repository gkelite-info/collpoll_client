"use client";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyAssignedSubjects } from "@/lib/helpers/faculty/getFacultyAssignedSubjects";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FacultyQuizFormProps {
    onCancel: () => void;
    onSaved: () => void;
}

export default function FacultyQuizForm({ onCancel, onSaved }: FacultyQuizFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { facultyId } = useFaculty();
    const [subjects, setSubjects] = useState<{ collegeSubjectId: number; subjectName: string }[]>([]);
    const [sections, setSections] = useState<{ collegeSectionsId: number; collegeSections: string }[]>([]);
    const [topics, setTopics] = useState<{ topicTitle: string; collegeSubjectUnitId: number }[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

    useEffect(() => {
        if (!facultyId) return;
        getFacultyAssignedSubjects({ facultyId })
            .then((data) => {
                const uniqueSubjects = Array.from(
                    new Map(
                        data.map((item: any) => [
                            item.college_subjects?.collegeSubjectId,
                            item.college_subjects,
                        ])
                    ).values()
                ).filter(Boolean) as { collegeSubjectId: number; subjectName: string }[];
                setSubjects(uniqueSubjects);

                setSelectedSubjectId(uniqueSubjects[0]?.collegeSubjectId ?? null);

                const uniqueSections = Array.from(
                    new Map(
                        data.map((item: any) => [
                            item.college_sections?.collegeSectionsId,
                            item.college_sections,
                        ])
                    ).values()
                ).filter(Boolean) as { collegeSectionsId: number; collegeSections: string }[];
                setSections(uniqueSections);
            })
            .catch(() => toast.error("Failed to fetch subjects"));
    }, [facultyId]);

    useEffect(() => {
        if (!selectedSubjectId) return;
        getTopicsBySubjectId(selectedSubjectId)
            .then((data) => setTopics(data))
            .catch(() => toast.error("Failed to fetch topics"));
    }, [selectedSubjectId]);

    const handleAddQuestions = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "addQuestions");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <div className="bg-blue-00 flex items-center lg:mb-1">
                    <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onCancel} />
                    <h1 className="font-bold text-2xl text-[#282828]">Create New Quiz</h1>
                </div>
                <p className="text-[#282828] text-sm lg:ml-6">Enter details below to set up and publish your quiz for students.</p>
            </div>

            <div className="bg-white rounded-md p-3 flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-[#282828]">Quiz Title</label>
                    <input
                        type="text"
                        placeholder="CPU Scheduling"
                        className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Subject</label>
                        <input
                            type="text"
                            value={subjects[0]?.subjectName || ""}
                            readOnly
                            placeholder="Loading..."
                            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Topic</label>
                        <div className="relative">
                            <select className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors appearance-none bg-white cursor-pointer w-full">
                                <option value="">Select Topic</option>
                                {topics.map((topic, index) => (
                                    <option key={index} value={topic.collegeSubjectUnitId}>
                                        {topic.topicTitle}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#282828]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Section(s)</label>
                        <input
                            type="text"
                            value={sections[0]?.collegeSections || ""}
                            readOnly
                            placeholder="Loading..."
                            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-[#282828]">Total Marks</label>
                        <input
                            type="number"
                            placeholder="Eg: 40"
                            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#282828]">Duration</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-[#282828]">Start Date</span>
                            <input
                                type="date"
                                className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-[#282828]">End Date</span>
                            <input
                                type="date"
                                className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-md cursor-pointer border border-[#16284F] text-[#16284F] text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search);
                            params.set("action", "addQuestions");
                            router.push(`${window.location.pathname}?${params.toString()}`);
                        }}
                        className="flex items-center cursor-pointer gap-2 px-6 py-2 rounded-md bg-[#43C17A] text-white text-sm font-medium hover:bg-[#35a868] transition-colors"
                    >
                        Add Questions <span className="text-base">›</span>
                    </button>
                </div>
            </div>
        </div>
    );
}