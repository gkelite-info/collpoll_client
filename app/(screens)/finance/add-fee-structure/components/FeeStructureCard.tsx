"use client";

import {
    Pencil,
    DownloadSimple,
    CaretDown,
    PencilSimpleLine,
} from "@phosphor-icons/react";


export default function FeeStructureCard() {
    return (
        <div className="w-full border-2 rounded-lg bg-white overflow-hidden">
            <div className="flex items-start justify-between">
                <div className="bg-[#EBFFF4] px-8 pt-4 pb-5 rounded-t-lg h-[100px] w-full">
                    <div className="flex justify-between ">
                        <div className="flex flex-col justify-between flex-1">
                            <div className="flex items-start">
                                <div className="w-[13%]">
                                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-white flex items-center justify-center">
                                        <img
                                            src="/logo.png"
                                            alt="Institute Logo"
                                            className="w-[40px] h-[40px] object-contain"
                                        />
                                    </div>
                                </div>
                                <h2 className="text-lg font-semibold text-[#282828]">
                                    ABC Institute of Technology
                                </h2>
                            </div>
                            <p className="text-lg ml-[13%] justify-content-end text-[#282828]">
                                Duration: 4 Years (8 Semesters)
                            </p>
                        </div>
                        <div className="flex flex-col justify-between flex-1 ">
                            <div className="flex flex-col justify-between h-full">
                                <h3 className="text-lg font-semibold text-[#282828]">
                                    Academic Year: 2025–2029
                                </h3>
                                <p className="text-lg text-[#282828]">
                                    Branch : Computer Science (CSE)
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 justify-between items-end ">
                            <button className="flex items-center gap-1 bg-[#1F2F56] text-white text-sm px-3 py-1 rounded-md">
                                Year 1
                                <CaretDown size={14} />
                            </button>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#43C17A] text-white">
                                    <Pencil size={16} />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#43C17A] text-white">
                                    <DownloadSimple size={16} weight="bold" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-5">
                <h4 className="text-lg font-semibold text-[#1F2F56] mb-4">
                    Year 1 – (1 & 2 Semesters)
                </h4>
                <div className="space-y-3 text-base text-[#282828]">

                    {[
                        ["Tution Fee", "₹ 85,000"],
                        ["Laboratory Fee", "₹ 5,000"],
                        ["Library Fee", "₹ 3,000"],
                        ["Examination Fee", "₹ 2,000"],
                        ["Development Fee", "₹ 5,000"],
                        ["Miscellaneous", "₹ 1,000"],
                        ["GST", "% 18"],
                    ].map((item, index) => (
                        <div key={index} className="flex justify-between">

                            <span className="flex items-center gap-2">
                                <span className="text-[18px] text-[#1F2F56] leading-none">•</span>
                                {item[0]}
                            </span>

                            <span>{item[1]}</span>

                        </div>
                    ))}
                </div>

                <div className="border-t my-4"></div>
                <div className="space-y-2 text-[14px]">
                    <div className="font-semibold text-[#1F2F56]">
                        Total Fee : ₹ 1,01,000
                    </div>

                    <div className="text-base text-[#282828]">
                        Due Date : 15/08/2026
                    </div>
                    <div className="flex justify-between items-center text-base text-[#282828]">
                        <span>Late Fee : ₹100 / Day after due date</span>
                        <span>Finance Office - ABC Institute of Technology</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
