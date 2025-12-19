'use client'
import { Calendar } from "@phosphor-icons/react";

type attendanceProp = {
    percentage: number;
}

export default function AttendanceCard({ percentage }: attendanceProp) {
    return (
        <>
            <div className="bg-white h-[200px] w-[33%] rounded-lg p-2 flex flex-col gap-2">
                <div className="bg-pink-00 w-full h-[20%] flex items-center justify-between">
                    <div className="bg-[#EAECFC] rounded-lg p-1">
                        <Calendar size={22} weight="fill" color="#604DDC" />
                    </div>
                    <h4 className="text-lg font-medium text-[#282828]">Attendance</h4>
                    <div className="rounded-full lg:h-8 lg:w-8 bg-[#E9E7FA] flex items-center justify-center">
                        <p className="text-[#604DDC] text-xs font-semibold">{percentage}%</p>
                    </div>
                </div>
                <div className="bg-yellow-400 w-full h-[80%]">
                    Bottom
                </div>
            </div>
        </>
    )
}