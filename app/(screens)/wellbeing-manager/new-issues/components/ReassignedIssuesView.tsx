"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CaretDown, ExclamationMarkIcon, Export, EyeIcon, FunnelSimpleIcon, ListDashes, RepeatIcon, Tray } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { downloadCSV } from "@/app/utils/downloadCSV";
import { MdPendingActions } from "react-icons/md";
import { MdOutlineFlag } from "react-icons/md";
import { Suspense, useState } from "react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import TicketDetailsView from "./TicketDetailsView";
import ReassignTicketModal from "../../components/ReassignTicketModal";


function ReassignedIssuesContent() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const searchParams = useSearchParams();
    const selectedTicketId = searchParams.get("ticketId");
    const [reassignModalTargetId, setReassignModalTargetId] = useState<string | null>(null);

    const baseTemplates = [
        { category: "Infrastructure", issueTitle: "Basketball court lights not functioning properly", description: "Students reported poor visibility during evening practice sessions due to dim/faulty floodlights", assignedTo: "Sports" },
        { category: "Infrastructure", issueTitle: "Uneven football ground surface causing injuries", description: "Players reported uneven patches and loose grass areas on the football field", assignedTo: "Sports" },
        { category: "Infrastructure", issueTitle: "WiFi not working near sports complex", description: "Students reported unstable internet connectivity around the indoor stadium", assignedTo: "Sports" },
        { category: "Infrastructure", issueTitle: "Floodlights flickering on football ground", description: "Evening practice sessions are affected due to electrical fluctuations", assignedTo: "Sports" },
    ];

    const rawMockData = Array.from({ length: 26 }).map((_, index) => ({
        ticketId: `#TK-${8800 + index}`,
        ...baseTemplates[index % 4],
    }));

    const columns = [
        { title: "TICKET ID", key: "ticketId" },
        { title: "CATEGORY", key: "category" },
        { title: "ISSUE TITLE", key: "issueTitle" },
        { title: "DESCRIPTION", key: "description" },
        { title: "ORIGINALLY ASSIGNED TO", key: "assignedTo" },
        { title: "ACTION", key: "action" },
    ];

    const tableData = rawMockData.map((row) => ({
        ticketId: <span className="text-emerald-600 font-bold text-[13px] min-w-[80px] block">{row.ticketId}</span>,
        category: <span className="text-gray-600 text-[13px] min-w-[110px] block">{row.category}</span>,
        issueTitle: <span className="font-bold text-[#16284F] text-[13px] max-w-[200px] block line-clamp-2">{row.issueTitle}</span>,
        description: <span className="text-gray-500 text-[12px] max-w-[280px] block line-clamp-2 leading-relaxed">{row.description}</span>,
        assignedTo: <span className="text-gray-600 text-[13px] block font-medium">{row.assignedTo}</span>,
        action:
            <button className="text-gray-700 flex gap-2 hover:text-[#16284F] text-[13px] font-semibold underline decoration-gray-300">
                <span
                    onClick={() => router.push(`?tab=reassigned&ticketId=${encodeURIComponent(row.ticketId.toString().replace('#', ''))}`)}
                    className="bg-[#16284F] cursor-pointer text-[#ffffff] p-1.5 rounded-full">
                    <EyeIcon size={16} weight="fill" />
                </span>
                <span
                    onClick={() => setReassignModalTargetId(row.ticketId as string)}
                    className="bg-[#16284F] cursor-pointer text-[#ffffff] p-1.5 rounded-full">
                    <RepeatIcon size={16} weight="fill" />
                </span>
            </button>
    }));

    const totalItems = rawMockData.length;
    const paginatedTableData = tableData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (selectedTicketId) {
        return (
            <TicketDetailsView
                ticketId={`#${selectedTicketId}`}
                onBack={() => router.push('?tab=reassigned')}
            />
        );
    }

    return (
        <main className="flex flex-col lg:flex-row w-full min-h-screen overflow-auto">
            <div className="w-full p-2 flex flex-col gap-2 lg:h-screen lg:overflow-y-auto custom-scrollbar">
                <div className="flex flex-col sm:flex-row justify-between gap-4   mt-1">
                    <div className="flex flex-col justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-lg md:text-[26px] font-bold leading-none select-none">
                            <span onClick={() => router.push("?tab=new")} className="text-[#16284F] cursor-pointer transition-colors">New Issues</span>
                            <span className="text-[#16284F] font-bold">/</span>
                            <span className="text-[#43C17A] cursor-pointer flex items-center gap-1.5">Reassigned Issues</span>
                        </div>
                        <p className="text-gray-500 text-[12px] sm:text-xs md:text-sm font-medium -mt-1">
                            Review and manage cases transferred to your department's oversight.
                        </p>
                    </div>

                    <button
                        onClick={() => downloadCSV(rawMockData, "Reassigned_Campus_Issues_Report")}
                        className="flex items-center justify-center gap-2 bg-[#047857] text-white px-3 sm:px-4 py-2 md:py-1 rounded-md text-[12px] sm:text-sm font-semibold tracking-wide transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
                    >
                        <Export size={16} weight="bold" />
                        <span>Export Report</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full mt-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F0E4] shrink-0">
                            <Tray size={24} weight="bold" className="text-[#006E2F]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                Total Issues
                            </span>
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                42
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFDDB8] shrink-0">
                            <MdPendingActions className="text-[#855300] h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                Pending Review
                            </span>
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                18
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFDAD7] shrink-0">
                            <ExclamationMarkIcon size={24} weight="bold" className="text-[#B61722] font-extrabold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                Urgent Action
                            </span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-[#D32F2F] leading-none">
                                    05
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-semibold text-[#D32F2F] mt-1 tracking-wide">
                                    High priority tickets
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden mt-1">
                    <div className="flex flex-row flex-wrap items-center gap-3 mt-4 mb-2 ml-5">
                        <div className="relative flex items-center bg-[#F3FCEF] border border-[#BCCBB94D] hover:bg-[#EAF3EE] rounded-lg transition-all px-3 py-2 cursor-pointer group">
                            <FunnelSimpleIcon size={16} className="text-[#3D4A3D] mr-2 shrink-0" weight="bold" />
                            <span className="text-[#161D16] text-[12px] sm:text-[13px] font-bold pr-6 select-none whitespace-nowrap">
                                All Source Categories
                            </span>
                            <CaretDown size={14} weight="bold" className="text-[#2B3B30] absolute right-3 pointer-events-none transition-transform group-hover:scale-110" />
                        </div>
                        <div className="relative flex items-center bg-[#F3FCEF] border border-[#BCCBB94D] hover:bg-[#EAF3EE] rounded-lg transition-all px-3 py-2 cursor-pointer group">
                            <MdOutlineFlag className="text-[#3D4A3D] mr-2" />
                            <span className="text-[#161D16] text-[12px] sm:text-[13px] font-bold pr-6 select-none whitespace-nowrap">
                                Priority: All
                            </span>
                            <CaretDown size={14} weight="bold" className="text-[#2B3B30] absolute right-3 pointer-events-none transition-transform group-hover:scale-110" />
                        </div>
                    </div>
                    <div className="p-1 overflow-x-auto select-none">
                        <div className="min-w-[800px] w-full px-2">
                            <TableComponent columns={columns} tableData={paginatedTableData} isLoading={false} />
                        </div>
                    </div>
                    {totalItems > 0 && (
                        <Pagination
                            currentPage={page}
                            totalItems={totalItems}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setPage}
                            roundedBottom="rounded-b-xl pb-4"
                        />
                    )}
                </div>
            </div>
            <ReassignTicketModal
                isOpen={reassignModalTargetId !== null}
                onClose={() => setReassignModalTargetId(null)}
                ticketId={reassignModalTargetId || undefined}
            />
        </main>
    );
}

export default function ReassignedIssuesView() {
    return (
        <Suspense fallback={<div className="w-full flex items-center justify-center p-10 font-medium">
            <Loader />
        </div>}>
            <ReassignedIssuesContent />
        </Suspense>
    );
}