'use client'
import { ChatCircleDots } from "@phosphor-icons/react";
import { FaChevronRight } from "react-icons/fa6";

type SubjectProgressCard = {
    image: string;
    professor: string;
    subject: string;
}

type SubjectProgressCardProps = {
    props: SubjectProgressCard[];
}

export default function FacultyChat({ props }: SubjectProgressCardProps) {
    return (
        <>
            <div className="bg-white h-64 rounded-lg w-[49%] p-4 shadow-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h6 className="text-[#282828] font-semibold">Faculty Chat</h6>
                    <FaChevronRight className="cursor-pointer text-black" />
                </div>
                <div className="bg-red-00 flex flex-col gap-2 overflow-y-auto" >
                    {props.map((item, index) => (
                        <div className="bg-[#E8F6E2] lg:h-[67px] rounded-full flex items-center px-2 py-2 gap-1" key={index}>
                            <div className="rounded-full lg:h-14 lg:w-14 flex items-center justify-center">
                                <img src={item.image} className="lg:h-14 lg:w-14 object-cover rounded-full" />
                            </div>
                            <div className="h-full lg:w-[60%] flex flex-col items-start justify-center pl-1">
                                <p className="text-[#282828] font-medium text-md">Prof.{item.professor}</p>
                                <p className="text-[#282828] text-sm">{item.subject}</p>
                            </div>
                            <div className="bg-[#A1D683] rounded-full lg:h-14 lg:w-14 flex items-center justify-center">
                                <ChatCircleDots size={32} weight="fill" className="text-white cursor-pointer" />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </>
    )
}