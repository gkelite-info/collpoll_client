import { Laptop } from "@phosphor-icons/react";
import PillTag from "./PillTag";
import { Meeting } from "../page";

export default function MeetingCard({ data }: { data: Meeting }){
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="bg-[#dcfce7] px-4 py-3 flex items-center gap-3 border-b-2 border-dotted border-[#86efac]">
                <div className="bg-[#22c55e] p-2 rounded-full text-white">
                    <Laptop size={20} />
                </div>
                <span className="text-[#15803d] font-semibold text-lg">{data.timeRange}</span>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-[#22c55e] font-bold text-lg leading-tight w-3/4">
                        {data.title}
                    </h3>
                    {data.tags?.map((tag) => (
                        <span key={tag} className="bg-[#22c55e] text-white text-xs px-2 py-1 rounded-full font-bold">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="min-w-[110px] text-gray-800 font-medium">Education Type :</span>
                        <PillTag label={data.educationType} />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="min-w-[110px] text-gray-800 font-medium">Date :</span>
                        <PillTag label={data.date} />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="min-w-[110px] text-gray-800 font-medium">Total Participants:</span>
                        <PillTag label={data.participants.toString()} />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="min-w-[110px] text-gray-800 font-medium">Year :</span>
                        <PillTag label={data.year} />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-800 font-medium">Section:</span>
                            <PillTag label={data.section} />
                        </div>
                        <button className="bg-[#1e293b] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors shadow-lg shadow-slate-300/50">
                            Join Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};