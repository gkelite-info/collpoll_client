import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

const card = [
  {
    image: "/clip.png",
    imgHeight: "h-10",
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    time: "Just now",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/clip.png",
    imgHeight: "h-10",
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    time: "Just now",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/clip.png",
    imgHeight: "h-10",
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    time: "Just now",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
];

export default function CollegeAdminRight() {
  return (
    <div className="flex flex-col">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <AnnouncementsCard announceCard={card} height="80vh" />
    </div>
  );
}
