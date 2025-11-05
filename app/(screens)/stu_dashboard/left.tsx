'use client'

import CardComponent from "@/app/utils/card";
import { BookOpen, Chalkboard, ClockAfternoon, UsersThree } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function StuDashLeft() {
    const [today, setToday] = useState("");

    useEffect(() => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const year = currentDate.getFullYear();

        setToday(`${day}/${month}/${year}`);
    }, []);

    const cardData = [
        {
            style: "bg-[#E2DAFF] h-27 w-44",
            icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
            value: "92%",
            label: "Attendance"
        },
        {
            style: "bg-[#FFEDDA] h-27 w-44",
            icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
            value: "2 Due",
            label: "Assignments"
        },
        {
            style: "bg-[#E6FBEA] h-27 w-44",
            icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
            value: "Mid Exams",
            label: "11/03/2025"
        },
        {
            style: "bg-[#CEE6FF] h-27 w-44",
            icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
            value: "Fee Due",
            label: "$5600"
        }
    ]

    return (
        <>
            <div className="w-[68%] p-2">
                <div className="flex justify-between items-center rounded-lg h-35 bg-[#DAEEE3]">
                    <div className="flex flex-col w-[60%] p-3 gap-1 bg-yellow-00 rounded-l-lg h-[100%]">
                        <div className="flex items-center gap-3">
                            <p className="text-[#714EF2] text-sm font-medium">B.Tech CSE - Year 2</p>
                            <p className="text-[#43C17A] text-sm font-medium">ID - <span className="text-[#282828] text-sm">2111221</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[#282828]">Welcome Back, <span className="text-[#089144] text-sm font-medium">Firstname</span></p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs text-[#454545]">You’ve completed 5 of your tasks.</p>
                            <p className="text-xs text-[#454545]">Keep up the great progress!</p>
                        </div>
                        <div className="bg-[#A3FFCB] w-[25%] p-1 flex items-center justify-center rounded-sm text-[#007533] font-semibold text-sm">
                            {today ? today : "Loading date..."}
                        </div>
                    </div>
                    <div className="w-[40%] bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center">
                        <p className="text-black">Image</p>
                    </div>
                </div>
                <div className="mt-3 rounded-lg flex gap-3 text-xs">
                    {cardData.map((item, index) => (
                        <CardComponent
                            key={index}
                            style={item.style}
                            icon={item.icon}
                            value={item.value}
                            label={item.label}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}