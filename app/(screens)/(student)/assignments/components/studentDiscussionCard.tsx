import { MouseEvent } from "react";
import { CalendarBlank, CalendarDotsIcon, FilePdf, UserCircle, XCircle } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function StudentDiscussionCard({
    data,
    isCompleted = false,
    uploadedFiles = [],
    onRemoveFile
}: {
    data: any,
    isCompleted?: boolean,
    uploadedFiles?: any[],
    onRemoveFile?: (index: number) => void
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleCardClick = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("modal", "viewDiscussion");
        params.set("discussionId", data.id);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleUploadClick = (e: MouseEvent) => {
        e.stopPropagation();
        const params = new URLSearchParams(searchParams.toString());
        params.set("modal", "uploadDiscussion");
        params.set("discussionId", data.id);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 w-[80%]">
                    <h3 className="text-lg font-bold text-[#282828]">{data.title}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{data.subtitle}</p>
                </div>
                <div>
                    {!isCompleted ? (
                        <button
                            onClick={handleUploadClick}
                            className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-[#38a366] transition-colors"
                        >
                            Upload
                        </button>
                    ) : (
                        <div className="bg-[#16284F] text-white px-5 py-1.5 rounded-md text-sm font-bold">
                            Uploaded
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_1.5fr] gap-6 mt-1">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="bg-[#43C07A24] p-1 rounded-full">
                            <UserCircle size={18} className="text-[#43C17A]" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828]">Faculty Name :</span>
                        <span className="text-gray-600">{data.facultyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="bg-[#43C07A24] p-1 rounded-full">
                            <CalendarDotsIcon size={18} className="text-[#43C17A]" weight="regular" />
                        </div>
                        <span className="font-bold text-[#282828]">Uploaded On :</span>
                        <span className="text-gray-600">{data.uploadedOn}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                    <span className="font-bold text-[#282828] text-sm">
                        {isCompleted ? "Faculty Attachments" : "Attachments"}
                    </span>
                    <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
                        {data.attachments.map((file: string, idx: number) => (
                            <div key={`fac-${idx}`} className="flex items-center gap-2 bg-[#e2e8f0] text-[#334155] px-3 py-1.5 rounded-md text-xs font-semibold flex-shrink-0">
                                <FilePdf size={16} weight="fill" className="text-[#1e293b]" />
                                {file}
                            </div>
                        ))}

                        {!isCompleted && uploadedFiles && uploadedFiles.map((file: any, idx: number) => (
                            <div key={`stu-${idx}`} className="flex items-center gap-2 bg-[#e2e8f0] text-[#334155] pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold flex-shrink-0">
                                <FilePdf size={16} weight="fill" className="text-[#1e293b]" />
                                {file.name}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onRemoveFile) onRemoveFile(idx);
                                    }}
                                    className="ml-1 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                                >
                                    <XCircle size={16} weight="regular" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isCompleted && (uploadedFiles.length > 0 || data.uploadedFiles) && (
                <div className="flex flex-col gap-3 mt-2 border-t border-gray-100 pt-4">
                    <span className="font-bold text-[#282828] text-sm">Uploaded Files</span>
                    <div className="flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2">
                        {(uploadedFiles.length > 0 ? uploadedFiles : data.uploadedFiles || []).map((file: any, idx: number) => (
                            <div
                                key={`up-${idx}`}
                                className="flex items-center gap-3 border border-gray-200 rounded-md p-3 w-64 bg-white flex-shrink-0"
                            >
                                <FilePdf size={24} weight="fill" className="text-red-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-[#282828] truncate">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-gray-400">{file.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}