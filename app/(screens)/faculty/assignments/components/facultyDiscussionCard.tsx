import {
    PencilSimple,
    FilePdf,
    FileDoc,
    FileXls,
    FilePpt,
    FileZip,
    FileJs,
    FileCss,
    FileHtml,
    FilePng,
    FileJpg,
    CalendarDotsIcon,
    Trash
} from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "pdf":
            return <FilePdf size={16} weight="fill" className="text-white" />;
        case "doc":
        case "docx":
            return <FileDoc size={16} weight="fill" className="text-white" />;
        case "xls":
        case "xlsx":
            return <FileXls size={16} weight="fill" className="text-white" />;
        case "ppt":
        case "pptx":
            return <FilePpt size={16} weight="fill" className="text-white" />;
        case "zip":
        case "rar":
            return <FileZip size={16} weight="fill" className="text-white" />;
        case "js":
            return <FileJs size={16} weight="fill" className="text-white" />;
        case "html":
            return <FileHtml size={16} weight="fill" className="text-white" />;
        case "css":
            return <FileCss size={16} weight="fill" className="text-white" />;
        case "png":
            return <FilePng size={16} weight="fill" className="text-white" />;
        case "jpg":
        case "jpeg":
            return <FileJpg size={16} weight="fill" className="text-white" />;

        default:
            return <FilePdf size={16} weight="fill" className="text-white" />;
    }
};

export default function FacultyDiscussionCard({ data, discussionView = "active", onDelete }: { data: any, discussionView?: "active" | "completed", onDelete?: (discussionId: number) => void; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleViewSubmissions = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "viewSubmissions");
        params.set("discussionId", String(data.discussionId));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEdit = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "editDiscussion");
        params.set("discussionId", String(data.discussionId));
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-1 w-full">
            {/* Desktop View */}
            <div className="hidden md:flex flex-col gap-1 w-full">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 lg:w-[60%]">
                        <h3 className="text-lg font-bold text-[#282828]">{data.title}</h3>
                        <p className="text-sm text-[#111827] whitespace-pre-line leading-relaxed">{data.description}</p>
                    </div>
                    <div className="flex items-center gap-3 w-fit">
                        {discussionView === "active" && (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="bg-[#16284F38] cursor-pointer p-2.5 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <PencilSimple size={18} weight="fill" className="text-[#16284F]" />
                                </button>
                                <button
                                    onClick={() => onDelete?.(data.discussionId)}
                                    className="bg-red-50 cursor-pointer p-2.5 rounded-full hover:bg-red-100 transition-colors"
                                >
                                    <Trash size={18} weight="fill" className="text-red-500" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleViewSubmissions}
                            className="bg-[#43C17A] cursor-pointer text-[#EFEFEF] px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#38a366] transition-colors">
                            View Submissions
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-[1.3fr_1.5fr] gap-6 pt-4 border-t border-gray-50 mt-1">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="p-1.5 rounded-full bg-[#43C07A24]">
                                <CalendarDotsIcon size={18} className="text-[#43C17A]" weight="regular" />
                            </div>
                            <span className="font-bold text-[#282828] text-sm">Uploaded On :</span>
                            <span className="text-gray-600">
                                {data.createdAt
                                    ? new Date(data.createdAt).toLocaleDateString("en-GB")
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="p-1.5 rounded-full bg-[#43C07A24]">
                                <CalendarDotsIcon size={18} className="text-red-500" weight="regular" />
                            </div>
                            <span className="font-bold text-[#282828] text-sm">Deadline :</span>
                            <span className="text-gray-600">
                                {data.deadline
                                    ? new Date(data.deadline).toLocaleDateString("en-GB")
                                    : "—"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <span className="font-bold text-[#282828] text-sm">Attachments</span>
                        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
                            {(data.discussion_file_uploads ?? []).map((file: { fileUrl: string }, idx: number) => (
                                <a
                                    key={idx}
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center cursor-pointer gap-2 bg-[#16284F38] text-[#16284F] px-3 py-1 rounded-md text-xs font-medium flex-shrink-0">
                                    <div className="bg-[#16284F] rounded-full p-1 flex items-center justify-center mx-auto">
                                        {getFileIcon(file.fileUrl)}
                                    </div>
                                    {file.fileUrl.split("/").pop()?.split("_").slice(1).join("_")}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[15px] font-bold text-[#282828] leading-tight">{data.title}</h3>
                    <p className="text-[13px] text-[#111827] whitespace-pre-line leading-relaxed">{data.description}</p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[13px]">
                        <div className="p-1 rounded-full bg-[#43C07A24]">
                            <CalendarDotsIcon size={14} className="text-[#43C17A]" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828]">Uploaded On :</span>
                        <span className="text-gray-600">
                            {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "—"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px]">
                        <div className="p-1 rounded-full bg-[#43C07A24]">
                            <CalendarDotsIcon size={14} className="text-red-500" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828]">Deadline :</span>
                        <span className="text-gray-600">
                            {data.deadline ? new Date(data.deadline).toLocaleDateString("en-GB") : "—"}
                        </span>
                    </div>
                </div>

                {data.discussion_file_uploads && data.discussion_file_uploads.length > 0 && (
                    <div className="flex flex-col gap-2 min-w-0 pt-2 border-t border-gray-50">
                        <span className="font-bold text-[#282828] text-[13px]">Attachments</span>
                        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full pb-1">
                            {data.discussion_file_uploads.map((file: { fileUrl: string }, idx: number) => (
                                <a
                                    key={idx}
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center cursor-pointer gap-2 bg-[#16284F38] text-[#16284F] px-2.5 py-1 rounded-md text-[11px] font-medium flex-shrink-0"
                                >
                                    <div className="bg-[#16284F] rounded-full p-1 flex items-center justify-center">
                                        {getFileIcon(file.fileUrl)}
                                    </div>
                                    <span className="truncate max-w-[150px]">
                                        {file.fileUrl.split("/").pop()?.split("_").slice(1).join("_") || "Document"}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-50 mt-1">
                    {discussionView === "active" ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="bg-[#16284F38] cursor-pointer p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                                <PencilSimple size={16} weight="fill" className="text-[#16284F]" />
                            </button>
                            <button
                                onClick={() => onDelete?.(data.discussionId)}
                                className="bg-red-50 cursor-pointer p-2 rounded-full hover:bg-red-100 transition-colors flex items-center justify-center"
                            >
                                <Trash size={16} weight="fill" className="text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={handleViewSubmissions}
                        className="bg-[#43C17A] cursor-pointer text-[#EFEFEF] px-4 py-2 rounded-md text-[13px] font-bold hover:bg-[#38a366] transition-colors ml-auto"
                    >
                        View Submissions
                    </button>
                </div>
            </div>
        </div>
    );
}