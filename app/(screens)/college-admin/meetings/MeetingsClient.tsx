"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SemwiseDetailsRight from "../(dashboard)/components/right";
import MeetingsTabs from "./components/MeetingsTabs";
import { useSearchParams } from "next/navigation";
import MeetingsGrid from "./components/MeetingsGrid";
import PreviousMeetingsGrid from "./components/PreviousMeetingsGrid";
import { useState } from "react";
import CreateMeetingModal from "./modal/CreateMeetingModal";


export default function MeetingsClient() {
    const searchParams = useSearchParams();

    const [isModalOpen, setIsModalOpen] = useState(false);



    const activeTab = searchParams.get("tab") ?? "upcoming";
    return (
        <div className="flex flex-col h-screen overflow-hidden mb-2">

            {/* LEFT SECTION */}
            <div className="w-full  flex justify-between p-2 pb-1 mx-auto">

                {/* Header Section */}
                <div className="mt-6 ml-6">

                    {/* Title */}
                    <h1 className="text-2xl font-medium text-[#282828]">
                        Meetings
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg font-normal text-[#282828] mt-2">
                        View and join meetings or schedule meetings
                    </p>
                </div>

                <div className="w-[32%] h-full overflow-y-auto p-2">
                    <CourseScheduleCard isVisibile={false} />
                </div>

            </div>

            <div className="w-full flex items-center justify-between mt-8 px-6">

                {/* Center Tabs */}
                <div className="flex-1 flex justify-center">
                    <MeetingsTabs activeTab={activeTab} />
                </div>

                {/* Create Meeting Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#43C17A] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                    Create Meeting
                </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 pr-2 pb-3">
                {activeTab === "upcoming" ? (
                    <MeetingsGrid />
                ) : (
                    <PreviousMeetingsGrid />
                )}
            </div>

            <CreateMeetingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            



        </div>
    );
}
