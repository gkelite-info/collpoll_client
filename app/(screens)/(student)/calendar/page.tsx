import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarRight from "./right/page";
import CalendarLeft from "./left/page";
import { useTranslations } from "next-intl";

export default function CalendarPage() {
  const t = useTranslations("Calendar.student");
  return (
    <>
      <div className="bg-red-00 p-2 flex flex-col lg:pb-5 lg:w-[100%]">
        <div className="flex justify-between items-center bg-indigo-00">
          <div className="flex flex-col w-[50%] h-[100%] bg-green-00">
            <h1 className="text-[#282828] font-bold text-2xl mb-1">
              {t("Calendar")}
            </h1>
            <p className="text-[#282828] text-sm">
              {t(
                "Stay organized and keep track of your weekly schedule with ease",
              )}
            </p>
          </div>
          <div className="flex justify-end w-[32%] bg-yellow-00">
            <CourseScheduleCard style="w-[320px]" />
          </div>
        </div>
        <div className="mt-5 gap-4 bg-green-00 flex gap-3">
          <div className=" bg-pink-00">
            <CalendarLeft />
          </div>
          <div className="flex-1 bg-indigo-00">
            <CalendarRight />
          </div>
        </div>
      </div>
    </>
  );
}
