"use client"

import AnnouncementsCard from "@/app/utils/announcementsCard";
import { useUser } from "@/app/utils/context/UserContext";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useEffect, useState } from "react";

const typeIcons: Record<string, string> = {
    class: "/class.png",
    exam: "/exam.png",
    meeting: "/meeting.png",
    holiday: "/calendar-3d.png",
    event: "/event.png",
    notice: "/clip.png",
    result: "/result.jpg",
    timetable: "/timetable.png",
    placement: "/placement.png",
    emergency: "/emergency.png",
    finance: "/finance.jpg",
    other: "/others.png",
};

const formatRole = (role: string) =>
    role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());


export default function Right() {

    const { collegeId, userId, role } = useUser();

    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [view, setView] = useState<"my" | "others">("my");

    const fetchData = async () => {
        try {
            if (!collegeId || !userId || !role) return;

            const res = await fetchCollegeAnnouncements({
                collegeId,
                userId,
                role,
                view,
                page: 1,
                limit: 20,
            });

            const formatted = res.data.map((item: any) => ({
                collegeAnnouncementId: item.collegeAnnouncementId,
                title: item.title,
                date: item.date,
                createdAt: item.createdAt,
                type: item.type,
                targetRoles: item.targetRoles,

                image: typeIcons[item.type] || "/clip.png",
                imgHeight: "h-10",
                cardBg: "#E8F8EF",
                imageBg: "#D3F1E0",

                professor:
                    view === "my"
                        ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
                        : `By ${formatRole(item.createdByRole)}`,
            }));

            setAnnouncements(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!collegeId || !userId || !role) return;
        fetchData();
    }, [collegeId, userId, role, view]);



    return (
        <>
            <div className="bg-yellow-00 w-[32%] p-2 flex flex-col">
                <WorkWeekCalendar
                    style="mt-2"
                />
                <AnnouncementsCard
                    announceCard={announcements}
                    height="80vh"
                    onViewChange={(v) => setView(v)}
                    refreshAnnouncements={fetchData}
                />
            </div>
        </>
    )
}