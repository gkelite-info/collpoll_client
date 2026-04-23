"use client";
import ClubInfo from "@/app/(screens)/faculty/clubs/components/ClubInfo";
import StudentAnnouncements from "./StudentAnnouncements";
import { useUser } from "@/app/utils/context/UserContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getStudentClubDetailsAPI } from "@/lib/helpers/clubActivity/studentClubAPI";
import { StudentAnnouncementsShimmer } from "../shimmers/StudentAnnouncementsShimmer";

export default function MyClubView() {

    const { studentId } = useUser();
    const [clubState, setClubState] = useState<{
        status: "loading" | "none" | "pending" | "joined";
        info: any | null;
        role: string | null;
    }>({ status: "loading", info: null, role: null });

    useEffect(() => {
        if (!studentId) return;

        const loadClubStatus = async () => {
            try {
                const data = await getStudentClubDetailsAPI(parseInt(String(studentId), 10));
                setClubState({
                    status: data.status as any,
                    info: data.clubInfo,
                    role: data.role
                });
            } catch (error) {
                toast.error("Failed to load your club information.");
                setClubState({ status: "none", info: null, role: null });
            }
        };

        loadClubStatus();
    }, [studentId]);

    if (clubState.status === "loading") {
        return (
            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                <ClubInfo isLoading={true} />
                <div className="relative mb-8 flex items-center justify-center">
                    <div className="absolute w-full border-t border-[#959595]/30"></div>
                    <div className="relative h-5 w-16 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex flex-col mx-auto w-full">
                    <StudentAnnouncementsShimmer />
                </div>
            </div>
        );
    }

    if (clubState.status === "none") {
        return (
            <div className="flex flex-col items-center justify-center pt-22 pb-10 animate-in fade-in duration-500">
                <div className="bg-[#16284F]/10 p-8 h-30 w-30 flex items-center justify-center rounded-full mb-4">
                    <span className="text-4xl rounded-full">🔍</span>
                </div>
                <h2 className="text-xl font-bold text-[#16284F] mb-2">No Club Joined</h2>
                <p className="text-gray-500 font-medium text-center max-w-md">
                    You are not currently a member of any club. Explore the available clubs and send a request to join one!
                </p>
            </div>
        );
    }

    if (clubState.status === "pending") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] animate-in fade-in duration-500">
                <div className="bg-[#FB8000]/10 p-8 h-30 w-30 flex items-center justify-center rounded-full mb-4">
                    <span className="text-4xl rounded-full">⏳</span>
                </div>
                <h2 className="text-xl font-bold text-[#16284F] mb-2">Request Pending</h2>
                <p className="text-gray-500 font-medium text-center max-w-md">
                    Your request to join <span className="font-bold text-[#282828]">{clubState.info?.name}</span> is currently pending approval by the responsible faculty or mentors.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            <ClubInfo info={clubState.info} />
            <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute w-full border-t border-[#959595]"></div>
                <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">Today</span>
            </div>

            <div className="flex flex-col mx-auto w-full">
                <StudentAnnouncements userRole={clubState.role} />
            </div>
        </div>
    );
}