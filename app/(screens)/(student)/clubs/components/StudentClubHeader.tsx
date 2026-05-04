"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useTranslations } from "next-intl";

export default function StudentClubHeader() {
  const t = useTranslations("Clubs.student");
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#282828]">{t("Clubs")}</h1>
        <p className="text-[#282828] mt-1">
          {t("Discover and join a club that matches your interests")}
        </p>
      </div>
      <div className="w-[320px]">
        <CourseScheduleCard />
      </div>
    </div>
  );
}
