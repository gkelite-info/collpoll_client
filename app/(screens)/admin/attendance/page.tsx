"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  CaretDown,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import FacultyAttendanceCard, {
  Department,
} from "./components/facultyAttendanceCard";

import { User, UsersThree } from "@phosphor-icons/react";
import CardComponent from "./components/cards";
import { useSearchParams } from "next/navigation";
import { SubjectWiseAttendance } from "./components/subjectWiseAttendance";
import { useRouter } from "next/navigation";

const cardData = [
  {
    id: "1",
    style: "bg-[#CEE6FF]",
    icon: <UsersThree size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#60AEFF",
    value: "08",
    label: "Total Departments",
  },
  {
    id: "2",
    style: "bg-[#E6FBEA]",
    icon: <User size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#43C17A",
    value: "1200",
    label: "Total Students",
  },
  {
    id: "3",
    style: "bg-[#FFE0E0] ",
    icon: <User size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#FF2020",
    value: "92",
    label: "Students below 75%",
  },
  {
    id: "4",
    style: "bg-[#CEE6FF]",
    icon: <User size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#60AEFF",
    value: "15",
    label: "Pending Attendance Corrections",
  },
];

interface ExtendedDepartment extends Department {
  id: string;
  section: string;
  subject: string;
  deptCode: string;
}

interface FilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  displayModifier?: (opt: string) => string;
}

const DEPT_CONFIGS = [
  {
    name: "CSE",
    text: "#FF767D",
    color: "#FFB4B8",
    bgColor: "#FFF5F5",
    subjects: ["Data Structures", "DBMS", "AI"],
  },
  {
    name: "ECE",
    text: "#FF9F7E",
    color: "#F3D3C8",
    bgColor: "#FFF9DB",
    subjects: ["VLSI", "Signals", "Embedded"],
  },
  {
    name: "MECH",
    text: "#F8CF64",
    color: "#F3E2B6",
    bgColor: "#FFF9DB",
    subjects: ["Thermodynamics", "Robotics"],
  },
  {
    name: "IT",
    text: "#66EEFA",
    color: "#BCECF0",
    bgColor: "#E7F5FF",
    subjects: ["Web Dev", "Cloud", "Cyber"],
  },
];

const SECTIONS = ["A", "B", "C", "D"];
const YEARS = ["1", "2", "3", "4"];

const generateFullMockData = (): ExtendedDepartment[] => {
  const data: ExtendedDepartment[] = [];
  DEPT_CONFIGS.forEach((dept) => {
    YEARS.forEach((yr) => {
      SECTIONS.forEach((sec) => {
        dept.subjects.forEach((sub) => {
          data.push({
            id: `${dept.name}-${yr}-${sec}-${sub}`,
            name: `${dept.name} - ${sec} (${sub})`,
            deptCode: dept.name,
            text: dept.text,
            color: dept.color,
            bgColor: dept.bgColor,
            totalStudents: Math.floor(Math.random() * 15) + 50,
            avgAttendance: Math.floor(Math.random() * 25) + 70,
            belowThresholdCount: Math.floor(Math.random() * 10),
            year: yr,
            section: sec,
            subject: sub,
          });
        });
      });
    });
  });
  return data;
};

const allData = generateFullMockData();

const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  displayModifier,
}: FilterProps) => (
  <div className="flex flex-col gap-1 min-w-[120px]">
    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1">
      {label}
    </label>
    <div className="relative border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-[13px] font-medium text-gray-700 pl-2 pr-2 focus:outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="py-2">
            {displayModifier ? displayModifier(opt) : opt}
          </option>
        ))}
      </select>
      <CaretDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        weight="bold"
      />
    </div>
  </div>
);

const Page = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const cardsPerPage = 15;

  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const uniqueSubjects = useMemo(
    () => ["All", ...Array.from(new Set(allData.map((d) => d.subject)))],
    []
  );

  const filteredResults = useMemo(() => {
    return allData.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesDept = deptFilter === "All" || item.deptCode === deptFilter;
      const matchesYear = yearFilter === "All" || item.year === yearFilter;
      const matchesSection =
        sectionFilter === "All" || item.section === sectionFilter;
      const matchesSubject =
        subjectFilter === "All" || item.subject === subjectFilter;
      return (
        matchesSearch &&
        matchesDept &&
        matchesYear &&
        matchesSection &&
        matchesSubject
      );
    });
  }, [search, deptFilter, yearFilter, sectionFilter, subjectFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, deptFilter, yearFilter, sectionFilter, subjectFilter]);

  const totalPages = Math.ceil(filteredResults.length / cardsPerPage);
  const currentCards = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredResults.slice(start, start + cardsPerPage);
  }, [filteredResults, currentPage]);

  if (!mounted) return null;

  const handleBack = () => {
    router.push("/admin/attendance");
  };

  if (view === "subjectWise") {
    return <SubjectWiseAttendance onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col m-4">
      <div className="mb-6 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit cursor-pointer">
            <h1 className="text-xl font-bold text-[#282828]">
              Attendance Overview
            </h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Track, Verify, and Manage Attendance Records Across Departments and
            Faculty.
          </p>
        </div>
        <div className="w-38">
          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>
      </div>

      <div className="flex gap-4 w-full h-full mb-3">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            style={`${item.style} w-[156px] h-[156px]`}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            value={item.value}
            label={item.label}
          />
        ))}
        <div>
          <WorkWeekCalendar style="h-full w-[350px]" />
        </div>
      </div>

      <div className="mt-4 mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-[43%]">
          <input
            type="text"
            placeholder="Search here......"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-black h-11 pl-5 pr-12 rounded-full bg-[#EAEAEA] text-sm outline-none"
          />
          <MagnifyingGlass
            size={22}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E]"
            weight="bold"
          />
        </div>

        <div className="bg-white rounded-xl p-2 px-4 shadow-sm flex flex-wrap gap-4 border border-gray-100">
          <FilterDropdown
            label="Department"
            value={deptFilter}
            options={["All", ...DEPT_CONFIGS.map((d) => d.name)]}
            onChange={setDeptFilter}
          />
          <FilterDropdown
            label="Year"
            value={yearFilter}
            options={["All", ...YEARS]}
            onChange={setYearFilter}
            displayModifier={(o) => (o === "All" ? o : `${o} Year`)}
          />
          <FilterDropdown
            label="Section"
            value={sectionFilter}
            options={["All", ...SECTIONS]}
            onChange={setSectionFilter}
            displayModifier={(o) => (o === "All" ? o : `Section ${o}`)}
          />
          <FilterDropdown
            label="Subject"
            value={subjectFilter}
            options={uniqueSubjects}
            onChange={setSubjectFilter}
          />
        </div>
      </div>

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {currentCards.map((dept) => (
            <FacultyAttendanceCard key={dept.id} {...dept} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border cursor-pointer bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <CaretLeft size={18} weight="bold" color="black" />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 cursor-pointer h-9 rounded-lg text-sm font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-[#16284F] text-white"
                      : "bg-white text-gray-600 border hover:border-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <CaretRight size={18} weight="bold" color="black" />
            </button>
          </div>
        )}
        {filteredResults.length === 0 && (
          <div className="flex justify-center py-20 text-gray-400">
            No matching records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
