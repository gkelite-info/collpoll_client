"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";

export default function Announcements() {
  const card = [
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Submit internal marks for all subjects before 25 Oct 2025.",
      professor: "By Stephen Jones",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "Upload final project abstracts by 1 Dec 2025.",
      professor: "By Stephen Jones",
      time: "12:40 PM",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
    {
      image: "/book.png",
      imgHeight: "h-10",
      title: "Mid-semester exams scheduled from 5–10 Dec 2025.",
      professor: "By Stephen Jones",
      time: "12:40 PM",
      cardBg: "#FBF5EA",
      imageBg: "#F7EBD5",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "College will remain closed on 26 Jan 2026 (Republic Day).",
      professor: "By Stephen Jones",
      time: "12:40 PM",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Placement drive registrations close on 28 Nov 2025.",
      professor: "By Stephen Jones",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "Faculty to update attendance records by 24 Nov 2025.",
      professor: "By Stephen Jones",
      time: "12:40 PM",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
    {
      image: "/book.png",
      imgHeight: "h-10",
      title: "Upload lab reports before 30 Nov 2025.",
      professor: "By Stephen Jones",
      time: "12:40 PM",
      cardBg: "#FBF5EA",
      imageBg: "#F7EBD5",
    },
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Department heads must submit timetable updates by 27 Nov 2025.",
      professor: "By Stephen Jones",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
  ];

  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-sm
        w-full
        h-187.75
        flex
        flex-col
      "
    >
      <div className="flex-1 overflow-y-auto">
        <AnnouncementsCard announceCard={card} />
      </div>
    </div>
  );
}
