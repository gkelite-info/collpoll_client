'use client'
import { Books, Calendar } from "@phosphor-icons/react";

type NextExamProps = {
    date: string;
    subject: string;
}


export default function NextExamCard({ date, subject }: NextExamProps) {
    return (
        <>
            <div className="bg-white h-[200px] w-[32%] rounded-lg p-2 flex flex-col gap-2 shadow-md">
                <div className="w-[85%] h-[20%] flex items-center justify-between">
                    <div className="bg-[#F9EFDE] rounded-lg p-1">
                        <Books size={22} weight="fill" color="#E6BD71" />
                    </div>
                    <h4 className="text-lg font-medium text-[#282828]">
                        Next Exam Date
                    </h4>
                </div>
                <div className="bg-yellow-00 w-full h-[80%] flex flex-col items-center justify-center gap-4">
                    <div className="bg-[#EBF6E4] w-[70%] h-[60%] rounded-lg flex flex-col items-center justify-center gap-2">
                        <div className="bg-[#A2D884] rounded-full lg:h-9 lg:w-9 flex items-center justify-center">
                            <Calendar size={22} />
                        </div>
                        <p className="text-[#16284F] font-medium text-sm">Date : <span className="text-[#A2D884] font-medium text-sm">{date}</span></p>
                    </div>
                    <div className="bg-red-00 w-fit text-center">
                        <p className="text-[#16284F] font-medium text-xs">Subject - <span className="text-[#604DDC] font-medium text-xs">{subject}</span></p>
                    </div>
                </div>
            </div>
        </>
    )
}