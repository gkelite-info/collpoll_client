"use client";
import ClubInfo from "@/app/(screens)/faculty/clubs/components/ClubInfo";
import { clubInfo } from "@/app/(screens)/faculty/clubs/components/mock-data";
import StudentAnnouncements from "./StudentAnnouncements";

export default function MyClubView() {
    return (
        <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            <ClubInfo info={clubInfo} />
            <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute w-full border-t border-[#959595]"></div>
                <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">Today</span>
            </div>

            <div className="flex flex-col mx-auto w-full">
                <StudentAnnouncements />
            </div>
        </div>
    );
}