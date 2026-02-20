import { Laptop, PencilSimple, Trash } from "@phosphor-icons/react";
import PillTag from "./PillTag";
import { Meeting } from "../page";

export default function MeetingCard({ data }: { data: Meeting }) {
    return (
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="bg-[#43C17A26] px-4 py-2 flex items-center justify-between gap-3 border-b-2 border-dotted border-[#43C17A]">
                <div className="flex gap-2 items-center justify-center">
                    <div className="bg-[#43C17A] p-1 rounded-full text-white">
                        <Laptop size={20} weight="fill" color="#E9E9E9" />
                    </div>
                    <span className="text-[#11934A] font-medium text-base">{data.timeRange}</span>
                </div>
                <div className="flex gap-2 items-center justify-center">
                    <button
                        className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-full bg-white"
                        onClick={() => console.log("Edit", data.id)}
                    >
                        <PencilSimple size={16} weight="fill" className="text-[#43C17A]" />
                    </button>

                    <button
                        className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-full bg-white"
                        onClick={() => console.log("Delete", data.id)}
                    >
                        <Trash size={16} weight="fill" className="text-[#FF0000]" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div className="w-[80%] overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <h2 className="text-[#43C17A] font-semibold inline-block min-w-full">
                            {data.title}
                        </h2>
                    </div>
                    <span className="bg-[#22c55e] text-[#ffffff] px-3 py-1 rounded-full text-xs whitespace-nowrap">
                        {data.branch}
                    </span>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <span className="min-w-27.5 text-[#303030] font-normal text-sm">Education Type :</span>
                        <PillTag label={data.educationType} />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                            <span className="min-w-27.5 text-[#303030] font-normal text-base">Date :</span>
                            <PillTag label={data.date} />
                        </div>
                        <button
                            className={`px-4 py-1 rounded-full text-sm font-medium ${data.type === 'previous'
                                ? 'bg-[#CDCDCD] text-[#414141]'
                                : 'bg-[#16284F] text-white cursor-pointer'
                                }`}
                            onClick={() => data.type !== "previous" && window.open(data.meetingLink, '_blank', 'noopener,noreferrer')}
                        >
                            {data.type === 'previous' ? 'Completed' : 'Join Meeting'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};