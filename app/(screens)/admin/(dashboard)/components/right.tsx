"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import AddUserModal from "./addUserModal";

export default function AdminDashRight() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const card = [
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Submit internal marks for all subjects before 25 Oct 2025.",
      professor: "By Stephen jones",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "Upload final project abstracts by 1 Dec 2025.",
      professor: "By Stephen jones",
      time: "12:40 PM",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
    {
      image: "/book.png",
      imgHeight: "h-10",
      title: "Mid-semester exams scheduled from 5–10 Dec 2025.",
      professor: "By Stephen jones",
      time: "12:40 PM",
      cardBg: "#FBF5EA",
      imageBg: "#F7EBD5",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "College will remain closed on 26 Jan 2026 (Republic Day).",
      professor: "By Stephen jones",
      time: "12:40 PM",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Placement drive registrations close on 28 Nov 2025.",
      professor: "By Stephen jones",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "Faculty to update attendance records by 24 Nov 2025.",
      professor: "By Stephen jones",
      time: "12:40 PM",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
    {
      image: "/book.png",
      imgHeight: "h-10",
      title: "Upload lab reports before 30 Nov 2025.",
      professor: "By Stephen jones",
      time: "12:40 PM",
      cardBg: "#FBF5EA",
      imageBg: "#F7EBD5",
    },
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Department heads must submit timetable updates by 27 Nov 2025.",
      professor: "By Stephen jones",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
  ];

  return (
    <>
      <div className="w-[32%] p-2 flex flex-col ">
        <div className="grid grid-cols-2 gap-4 w-full items-center">
          <span
            onClick={() => setIsModalOpen(true)}
            className="bg-[#3EAD6F] font-medium cursor-pointer rounded-lg h-[54px] flex items-center justify-around gap-1 text-[#EFEFEF] px-4"
          >
            <Plus size={24} />
            <p className="text-lg">Add User</p>
          </span>

          <CourseScheduleCard isVisibile={false} />
        </div>
        <WorkWeekCalendar />
        <AnnouncementsCard announceCard={card} />
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
