'use client'

import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";

export default function UserInfoCard() {

    const [today, setToday] = useState("");
    const { userId } = useUser();
    const { fullName } = useUser();

    useEffect(() => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const year = currentDate.getFullYear();

        setToday(`${day}/${month}/${year}`);
    }, []);

    return (
        <>
            <div className="flex justify-between items-center rounded-lg h-[170px] bg-[#DAEEE3]">
                <div className="flex flex-col justify-between w-[60%] p-3 gap-1 bg-yellow-00 rounded-l-lg h-[100%]">
                    <div className="flex items-center gap-3">
                        <p className="text-[#714EF2] text-sm font-medium">B.Tech CSE - Year 2</p>
                        <p className="text-[#089144] text-sm font-medium">ID - <span className="text-[#282828] text-sm">{userId}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-[#282828]">Welcome Back, <span className="text-[#089144] text-sm font-medium">{fullName}</span></p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs text-[#454545]">You’ve completed <span className="text-[#089144] font-semibold">5</span> of your tasks.</p>
                        <p className="text-xs text-[#454545]">Keep up the great progress!</p>
                    </div>
                    <div className="bg-[#A3FFCB] w-[25%] p-1 flex items-center justify-center rounded-sm text-[#007533] font-semibold text-sm">
                        {today ? today : "Loading date..."}
                    </div>
                </div>
                <div className="w-[40%] bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center">
                    <img src="maleuser.png" className="lg:relative lg:top-[-6] z-50 h-[180px]" />
                </div>
            </div>
        </>
    )
}