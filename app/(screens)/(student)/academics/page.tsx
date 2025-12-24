import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { FaChevronDown } from "react-icons/fa6";
import SubjectCard from "./components/subjectCard";

export default function Academics() {
  const cardData = [
    {
      profileIcon: "/lec-1.png",
      subjectTitle: "Data Structures",
      subjectCredits: 4,
      lecturer: "Deekshitha",
      units: 3,
      topicsCovered: 12,
      topicsTotal: 15,
      nextLesson: "Stacks and Queues",
      fromDate: "12-10-2025",
      toDate: "31-01-2026",
      percentage: 50,
    },
    {
      profileIcon: "/lec-2.png",
      subjectTitle: "Operating Systems",
      subjectCredits: 3,
      lecturer: "Raghavendra",
      units: 5,
      topicsCovered: 20,
      topicsTotal: 28,
      nextLesson: "Process Synchronization",
      fromDate: "2025-08-01",
      toDate: "2025-12-15",
      percentage: 70,
    },
    {
      profileIcon: "/lec-3.png",
      subjectTitle: "Database Management Systems (DBMS)",
      subjectCredits: 4,
      lecturer: "Anjali Rao",
      units: 4,
      topicsCovered: 1,
      topicsTotal: 18,
      nextLesson: "Normalization Techniques",
      fromDate: "2025-09-10",
      toDate: "2026-02-20",
      percentage: 100,
    },
    {
      profileIcon: "/lec-3.png",
      subjectTitle: "Computer Oriented Statistical Methods",
      subjectCredits: 4,
      lecturer: "Rajesh",
      units: 4,
      topicsCovered: 8,
      topicsTotal: 18,
      nextLesson: "Normalization Techniques",
      fromDate: "2025-09-10",
      toDate: "2026-02-20",
      percentage: 30,
    },
    {
      profileIcon: "/lec-3.png",
      subjectTitle: "Computer Oriented Architecture",
      subjectCredits: 4,
      lecturer: "Suresh Jain",
      units: 4,
      topicsCovered: 16,
      topicsTotal: 18,
      nextLesson: "Normalization Techniques",
      fromDate: "2025-09-10",
      toDate: "2026-02-20",
      percentage: 60,
    },
    {
      profileIcon: "/lec-4.png",
      subjectTitle: "Object Oriented Programming Language",
      subjectCredits: 4,
      lecturer: "Shankar",
      units: 5,
      topicsCovered: 18,
      topicsTotal: 18,
      nextLesson: "Normalization Techniques",
      fromDate: "2025-09-10",
      toDate: "2026-02-20",
      percentage: 60,
    },
  ];

  return (
    <div className="p-2 flex flex-col lg:pb-5">
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col w-[50%]">
          <h1 className="text-[#282828] font-bold text-[28px] mb-1">
            Academics
          </h1>
          <p className="text-[#282828] text-[18px]">
            Track syllabus Progress and manage notes by semester
          </p>
        </div>
        <div className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      <div className="mt-4">
        <SubjectCard subjectProps={cardData} />
      </div>
    </div>
  );
}
