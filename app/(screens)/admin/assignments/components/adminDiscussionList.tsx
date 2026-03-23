"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import AdminDiscussionCard from "./adminDiscussionCard";

export const STATIC_ACTIVE_DISCUSSIONS = Array.from({ length: 4 }, (_, i) => ({
    discussionId: i + 1,
    title: i % 2 === 0 ? "AI in Education" : "Future of Web3",
    description: `Research topic "${i % 2 === 0 ? 'Impact of AI on Education' : 'Decentralized Web Architecture'}"\nFollow the project guidelines in the attached document.`,
    createdAt: "2025-01-07T00:00:00.000Z",
    deadline: "10/01/2025",
    discussion_file_uploads: i % 3 === 0
        ? [{ fileUrl: "Project Guidelines.pdf" }, { fileUrl: "Reference Material.pdf" }]
        : [{ fileUrl: "Project Guidelines.pdf" }]
}));

export const STATIC_COMPLETED_DISCUSSIONS = Array.from({ length: 3 }, (_, i) => ({
    discussionId: i + 10,
    title: i % 2 === 0 ? "Operating Systems Design" : "Data Structures Optimization",
    description: `Research topic "${i % 2 === 0 ? 'Kernel Architecture' : 'Graph Algorithms'}"\nReview the final reports submitted by groups.`,
    createdAt: "2024-11-15T00:00:00.000Z",
    deadline: "30/11/2024",
    discussion_file_uploads: [{ fileUrl: "OS_Project_Details.pdf" }]
}));

export default function AdminDiscussionList({ subjectId }: { subjectId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const discussionView = searchParams.get("discussionView") || "active";

    const handleViewChange = (view: "active" | "completed") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("discussionView", view);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("subjectId");
        params.delete("discussionView");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleCreate = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "createDiscussion");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full h-full flex flex-col mx-auto">
            <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-gray-600 transition-colors" >
                <CaretLeft size={24} weight="bold" className="text-[#282828]" onClick={handleBack} />
                <h1 className="font-bold text-2xl text-[#282828]">Discussions for Subject</h1>
            </div>

            <div className="flex justify-between w-full mb-6">
                <div className="flex gap-4 pb-1">
                    <h5
                        className={`text-sm cursor-pointer pb-1 transition-all ${discussionView === "active" ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                        onClick={() => handleViewChange("active")}
                    >
                        Active Discussions
                    </h5>
                    <h5
                        className={`text-sm cursor-pointer pb-1 transition-all ${discussionView === "completed" ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]" : "text-[#282828]"}`}
                        onClick={() => handleViewChange("completed")}
                    >
                        Completed Discussions
                    </h5>
                </div>
                <button
                    className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1.5 rounded-md font-bold hover:bg-[#102040] transition-colors"
                    onClick={handleCreate}
                >
                    Create Discussion
                </button>
            </div>

            <div className="flex flex-col gap-4 pb-10">
                {discussionView === "active" &&
                    STATIC_ACTIVE_DISCUSSIONS.map((discussion) => (
                        <AdminDiscussionCard
                            key={discussion.discussionId}
                            data={discussion}
                            discussionView="active"
                        />
                    ))}

                {discussionView === "completed" &&
                    STATIC_COMPLETED_DISCUSSIONS.map((discussion) => (
                        <AdminDiscussionCard
                            key={discussion.discussionId}
                            data={discussion}
                            discussionView="completed"
                        />
                    ))}
            </div>
        </div>
    );
}