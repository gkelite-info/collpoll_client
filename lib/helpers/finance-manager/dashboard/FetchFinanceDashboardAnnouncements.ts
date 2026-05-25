import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";

export type FinanceDashboardAnnouncement = {
  collegeAnnouncementId?: number;
  image: string;
  imgHeight: string;
  title: string;
  professor: string;
  date?: string;
  formattedDate?: string;
  createdAt?: string;
  time?: string;
  cardBg: string;
  imageBg: string;
  type?: string;
  targetRoles?: string[];
};

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

const palette = [
  { cardBg: "#E8F8EF", imageBg: "#D3F1E0" },
  { cardBg: "#F0EDFF", imageBg: "#E0D9FF" },
  { cardBg: "#FFF6E7", imageBg: "#FFECC7" },
  { cardBg: "#EAF4FF", imageBg: "#D6E9FF" },
];

const formatRole = (role?: string | null) =>
  role
    ?.replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "";

export async function fetchFinanceDashboardAnnouncements({
  collegeId,
  userId,
  role,
  view,
}: {
  collegeId: number;
  userId: number;
  role: string;
  view: "my" | "others";
}): Promise<FinanceDashboardAnnouncement[]> {
  const result = await fetchCollegeAnnouncements({
    collegeId,
    userId,
    role,
    view,
    page: 1,
    limit: 20,
  });

  return result.data.map((item, index) => {
    const colors = palette[index % palette.length];
    const targetRoles = Array.isArray(item.targetRoles)
      ? item.targetRoles
      : [];

    return {
      collegeAnnouncementId: item.collegeAnnouncementId,
      title: item.title,
      date: item.date,
      formattedDate: item.formattedDate,
      createdAt: item.createdAt,
      type: item.type,
      targetRoles,
      image: typeIcons[item.type] || "/clip.png",
      imgHeight: "h-10",
      cardBg: colors.cardBg,
      imageBg: colors.imageBg,
      professor:
        view === "my"
          ? `For ${targetRoles.map(formatRole).join(", ") || "All"}`
          : `By ${formatRole(item.createdByRole) || "Admin"}`,
    };
  });
}
