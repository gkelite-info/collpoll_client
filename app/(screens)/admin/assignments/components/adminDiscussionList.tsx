"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import AdminDiscussionCard from "./adminDiscussionCard";
import { useEffect, useMemo, useState } from "react";
import { AdminDiscussionShimmer } from "./shimmers/discussionShimmer";
import { fetchCompletedDiscussionsByFacultyId, fetchDiscussionsByFacultyId } from "@/lib/helpers/discussionForum/discussionForumAPI";


export default function AdminDiscussionList({ subjectId }: { subjectId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const facultyId = searchParams.get("facultyId");
    const discussionView = searchParams.get("discussionView") || "active";

    useEffect(() => {
        const getDiscussions = async () => {
            if (!facultyId || facultyId === "undefined" || facultyId === "null") {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                if (discussionView === "active") {
                    const data = await fetchDiscussionsByFacultyId(Number(facultyId));
                    setDiscussions(data || []);
                } else {
                    const data = await fetchCompletedDiscussionsByFacultyId(Number(facultyId));
                    setDiscussions(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch discussions:", err);
                setDiscussions([]);
            } finally {
                setLoading(false);
            }
        };

        getDiscussions();
    }, [facultyId, discussionView, refetchTrigger]);

    const filteredDiscussions = useMemo(() => {
        return discussions || [];
    }, [discussions]);

    const handleViewChange = (view: "active" | "completed") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("discussionView", view);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("subjectId");
        params.delete("facultyId");
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
            <div className="flex items-center gap-1 mb-6 hover:text-gray-600 transition-colors" >
                <CaretLeft size={24} weight="bold" className="text-[#282828] cursor-pointer" onClick={handleBack} />
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
                {loading ? (
                    <>
                        <AdminDiscussionShimmer />
                        <AdminDiscussionShimmer />
                        <AdminDiscussionShimmer />
                    </>

                ) : filteredDiscussions.length > 0 ? (
                    filteredDiscussions.map((discussion) => {
                        const cleanedFiles = discussion.discussion_file_uploads?.map((file: any) => {

                            const rawName = file.fileUrl
                                ? decodeURIComponent(file.fileUrl.split("/").pop() || "Attachment")
                                : "Attachment";

                            const cleanName = rawName.includes("_")
                                ? rawName.substring(rawName.indexOf("_") + 1)
                                : rawName;

                            return {
                                ...file,
                                displayFileName: cleanName
                            };
                        }) || [];

                        return (
                            <AdminDiscussionCard
                                key={discussion.discussionId}
                                data={{
                                    ...discussion,
                                    discussion_file_uploads: cleanedFiles
                                }}
                                discussionView={discussionView as "active" | "completed"}
                                onDeleteSuccess={() => setRefetchTrigger(prev => prev + 1)}
                            />
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 italic">No {discussionView} discussions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}