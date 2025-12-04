'use client'
import { useState, useEffect } from "react";

type Props = {
    style?: string
}

export default function CourseScheduleCard({ style = "" }: { style?: string }) {

    const [time, setTime] = useState("");
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            const formattedTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
            setTime(formattedTime);

            const formattedDay = String(now.getDate()).padStart(2, "0");
            const formattedMonth = now.toLocaleString("en-US", { month: "short" });
            setDay(formattedDay);
            setMonth(formattedMonth);
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <div className={`flex justify-between ${style}`}>
                <div className="bg-[#43C17A] w-[49%] h-[54px] shadow-md rounded-lg p-3 flex items-center justify-center">
                    <p className="text-[#EFEFEF] text-sm">B.Tech CSE – Year 2</p>
                </div>

                <div className="bg-white shadow-md w-[49%] h-[54px] rounded-lg flex items-center">
                    <div className="w-[30%] h-full flex flex-col justify-center items-center rounded-l-lg bg-[#16284F]">
                        <p className="text-xs text-[#EFEFEF] font-medium">{day}</p>
                        <p className="text-xs text-[#FFFFFF]">{month}</p>
                    </div>

                    <div className="w-[70%] rounded-r-lg flex items-center justify-center">
                        <p className="text-[#16284F] text-md font-semibold">{time}</p>
                    </div>
                </div>
            </div>
        </>
    )
}