import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { StudentDataTable } from "./studentDataTable";
import CalendarRibbonComponent from "@/app/utils/calendar";
import CardComponent, { CardProps } from "./stuPerfCards";
import {
  CaretLeft,
  ChartLineDown,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import TopFivePerformers from "./topFivePerformers";
import { TOP_PERFORMERS } from "./data";
import PerformanceTrendChart from "./performanceTrendChart";

interface StudentPerformancePageProps {
  onGoBack: () => void;
}

const cardData: CardProps[] = [
  {
    value: "35",
    label: "Total Students",

    bgColor: "bg-[#E2DAFF]",

    icon: <UsersThree />,
    iconBgColor: "bg-white",

    iconColor: "text-[#714EF2]",
  },
  {
    value: "30",
    label: "Present Today",

    bgColor: "bg-[#FFEDDA]",

    icon: <UserCircle />,
    iconBgColor: "bg-white",

    iconColor: "text-[#FFBB70]",
  },
  {
    value: "5",
    label: "Low Attendance",

    bgColor: "bg-[#E6FBEA]",

    icon: <ChartLineDown />,
    iconBgColor: "bg-white",

    iconColor: "text-[#089144]",
  },
];

export default function StudentPerformancePage({
  onGoBack,
}: StudentPerformancePageProps) {
  return (
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <div className="flex items-start justify-center">
          <button
            onClick={onGoBack}
            className="flex cursor-pointer items-center text-sm text-gray-600 hover:text-green-700 font-semibold transition-colors"
          >
            <CaretLeft weight="bold" size={26} className="mr-1" />
          </button>
          <div>
            <div className="flex">
              <h1 className="text-black text-xl font-semibold">
                Student Performance
              </h1>
            </div>
            <p className="text-black text-sm">
              Your class students overview for year 2 - CSE
            </p>
          </div>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="w-full max-w-5xl rounded-xl mb-5">
        <div className="flex gap-3">
          <div>
            <span className="text-gray-600 text-sm font-medium">
              Department:{" "}
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              CSE
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Year:</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              2nd Year
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Section:</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              A
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-sm font-medium">Semester:</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-0.5 rounded-full font-semibold text-sm tracking-wide">
              III
            </span>
          </div>
        </div>
      </div>

      <article className="flex gap-3 justify-center items-center mb-4">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            bgColor={item.bgColor}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
        ))}
        <CalendarRibbonComponent />
      </article>
      <section>
        <StudentDataTable />
        <div className="flex gap-3 pb-4 mt-5">
          <div className="">
            <TopFivePerformers performers={TOP_PERFORMERS} />
          </div>

          <div className="min-w-[600px]">
            <PerformanceTrendChart />
          </div>
        </div>
      </section>
    </main>
  );
}
