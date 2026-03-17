import { PencilSimple, FilePdf, CalendarDotsIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function FacultyDiscussionCard({ data, discussionView = "active" }: { data: any, discussionView?: "active" | "completed"; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleViewSubmissions = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "viewSubmissions");
        params.set("discussionId", data.id);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEdit = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "editDiscussion");
        params.set("discussionId", data.id);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-1">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 w-[70%]">
                    <h3 className="text-lg font-bold text-[#282828]">{data.title}</h3>
                    <p className="text-sm text-[#111827] whitespace-pre-line leading-relaxed">{data.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    {discussionView === "active" && (
                        <button
                            onClick={handleEdit}
                            className="bg-[#16284F38] cursor-pointer p-2.5 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <PencilSimple size={18} weight="fill" className="text-[#16284F]" />
                        </button>
                    )}
                    <button
                        onClick={handleViewSubmissions}
                        className="bg-[#43C17A] cursor-pointer text-[#EFEFEF] px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#38a366] transition-colors">
                        View Submissions
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-[1.3fr_1.5fr] gap-6 pt-4 border-t border-gray-50">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-full bg-[#43C07A24]">
                            <CalendarDotsIcon size={18} className="text-[#43C17A]" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828] text-sm">Uploaded On :</span>
                        <span className="text-gray-600">{data.uploadedOn}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-full bg-[#43C07A24]">
                            <CalendarDotsIcon size={18} className="text-[#43C17A]" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828] text-sm">Deadline :</span>
                        <span className="text-gray-600">{data.deadline}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                    <span className="font-bold text-[#282828] text-sm">Attachments</span>
                    <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
                        {data.attachments.map((file: string, idx: number) => (
                            <div key={idx} className="flex items-center cursor-pointer gap-2 bg-[#16284F38] text-[#16284F] px-3 py-1 rounded-md text-xs font-medium flex-shrink-0">
                                <div className="bg-[#16284F] rounded-full p-1 flex items-center justify-center mx-auto">
                                    <FilePdf size={16} weight="fill" className="text-white" />
                                </div>
                                {file}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}