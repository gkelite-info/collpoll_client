"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
    id: number;
    subject: string;
    facultyName: string;
    facultyId: string;
    avatar: string;
    activeQuiz: number;
    pendingSubmissions: number;
    buttonText?: string;
    activeLabel?: string;
}

export default function DiscussionCourseCard({
    id,
    subject,
    facultyName,
    facultyId,
    avatar,
    activeQuiz,
    pendingSubmissions,
    buttonText,
    activeLabel,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleViewDiscussion = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("subjectId", String(id));
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-[10px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <div className="text-center mb-4">
                <h3 className="text-[#43C17A] font-bold text-[15px] tracking-wide uppercase mb-2">
                    {subject}
                </h3>
                <div className="h-px w-full bg-[#ACABAB]" />
            </div>

            <div className="flex items-center gap-3 mb-5 px-1">
                <img
                    src={avatar}
                    alt={facultyName}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col text-left">
                    <span className="text-[#282828] font-bold text-sm">
                        {facultyName}
                    </span>
                    <span className="text-[#8B8B8B] text-[12px]">ID - {facultyId}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 mb-6 px-1">
                <div className="flex gap-2 items-center">
                    <span className="text-[#282828] text-sm">{activeLabel || "Active Discussions"}</span>
                    <span className="bg-[#D0EFDE] text-[#43C17A] text-[12px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                        {activeQuiz}
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-[#282828] text-[13px]">
                        Pending Submissions
                    </span>
                    <span className="bg-[#D0EFDE] text-[#43C17A] text-[12px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                        {pendingSubmissions}
                    </span>
                </div>
            </div>

            <button
                onClick={handleViewDiscussion}
                className="w-full bg-[#16284F] hover:bg-[#1a2f5c] transition-colors cursor-pointer text-white py-2.5 rounded-full text-[13px] font-medium mt-auto">
                {buttonText || "View Discussion"}
            </button>
        </div>
    );
}