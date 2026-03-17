import AddAnnouncementModal from "@/app/components/modals/AddAnnouncementModal";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import { useUser } from "@/app/utils/context/UserContext";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
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
};



// const card = [
//   {
//     image: "/clip.png",
//     imgHeight: "h-10",
//     title: "Submit internal marks for all subjects before 25 Oct 2025.",
//     professor: "By Justin Orom",
//     time: "Just now",
//     cardBg: "#E8F8EF",
//     imageBg: "#D3F1E0",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/clip.png",
//     imgHeight: "h-10",
//     title: "Submit internal marks for all subjects before 25 Oct 2025.",
//     professor: "By Justin Orom",
//     time: "Just now",
//     cardBg: "#E8F8EF",
//     imageBg: "#D3F1E0",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/clip.png",
//     imgHeight: "h-10",
//     title: "Submit internal marks for all subjects before 25 Oct 2025.",
//     professor: "By Justin Orom",
//     time: "Just now",
//     cardBg: "#E8F8EF",
//     imageBg: "#D3F1E0",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
//   {
//     image: "/class.png",
//     imgHeight: "h-10",
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By John",
//     time: "12 mins ago.",
//     cardBg: "#EEEDFF",
//     imageBg: "#E3E1FF",
//   },
// ];



export default function SemwiseDetailsRight() {
  const [openModal, setOpenModal] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const { collegeId, userId } = useUser();
  const [editAnnouncement, setEditAnnouncement] = useState<any | null>(null);
  const [view, setView] = useState<"my" | "others">("my");

  const loadAnnouncements = async () => {

    if (!collegeId || !userId) return;

    try {

      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        view,
        page: 1,
        limit: 10
      });

      const formatted = res.data.map((item: any) => ({
        collegeAnnouncementId: item.collegeAnnouncementId,
        type: item.type,
        targetRole: item.targetRole,

        image: typeIcons[item.type],
        imgHeight: "h-10",
        title: item.title,

        professor:
          view === "my"
            ? `For ${item.targetRole}`
            : `By ${item.targetRole}`,

        date: item.date,
        createdAt: item.createdAt,

        cardBg: "#E8F8EF",
        imageBg: "#D3F1E0"
      }));

      setAnnouncements(formatted);

    } catch (error) {
      console.error("Failed to fetch announcements", error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [collegeId, userId, view]);

  return (
    <div className="w-[32%] p-2 flex flex-col">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <AnnouncementsCard
        announceCard={announcements}
        height="80vh"
        onAddClick={() => {
          setEditAnnouncement(null);
          setOpenModal(true);
        }}
        onViewChange={setView}
        onEditAnnouncement={(item) => {
          setEditAnnouncement(item);
          setOpenModal(true);
        }}
        refreshAnnouncements={loadAnnouncements}
      />
      <AddAnnouncementModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        refreshAnnouncements={loadAnnouncements}
        editData={editAnnouncement}
      />
    </div>
  );
}
