"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Suspense } from "react";
import { MagnifyingGlass, CaretLeft, CaretRight, BuildingApartmentIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import FacultyAttendanceCard, {
  Department,
} from "./components/facultyAttendanceCard";

import { User } from "@phosphor-icons/react";
import CardComponent from "./components/cards";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { fetchAttendanceStats } from "@/lib/helpers/admin/attendance/attendanceStats";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { Loader } from "../../(student)/calendar/right/timetable";
import { useAcademicFilters } from "@/lib/helpers/admin/academics/useAcademicFilters";
import {
  getAdminAcademicsCards,
  mapAcademicCards,
} from "@/lib/helpers/admin/attendance/getAdminAttendanceCards";
import { FilterDropdown } from "../academics/components/filterDropdown";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import SubjectWiseAttendance from "./components/subjectWiseAttendance";
import { AcademicSectionsSkeleton } from "../academics/shimmer/academicSectionsSkeleton";
import { StatsCardsSkeleton } from "./shimmers/statsCardsSkeleton";
import { useAdminAttendanceRealtime } from "@/lib/helpers/faculty/attendance/liveAttendanceAPI";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

interface AcademicCard {
  id: string;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  branchName: string;
  branchCode: string;
  section: string;
  year: string;
  totalStudents: number;
  totalSubjects: number;
  totalFaculties: number;
  avgAttendance?: number;
  belowThresholdCount?: number;
  faculties: {
    facultyId: number;
    fullName: string;
    email: string;
  }[];
}

const COLOR_PALETTE = [
  { text: "#FF767D", color: "#FFB4B8", bgColor: "#FFF5F5" },
  { text: "#FF9F7E", color: "#F3D3C8", bgColor: "#FFF9DB" },
  { text: "#F8CF64", color: "#F3E2B6", bgColor: "#FFF9DB" },
  { text: "#66EEFA", color: "#BCECF0", bgColor: "#E7F5FF" },
  { text: "#10B981", color: "#6EE7B7", bgColor: "#ECFDF5" },
  { text: "#8B5CF6", color: "#C4B5FD", bgColor: "#F5F3FF" },
  { text: "#EC4899", color: "#F9A8D4", bgColor: "#FDF2F8" },
  { text: "#6366F1", color: "#A5B4FC", bgColor: "#EEF2FF" },
  { text: "#14B8A6", color: "#5EEAD4", bgColor: "#F0FDFA" },
  { text: "#84CC16", color: "#BEF264", bgColor: "#F7FEE7" },
  { text: "#0EA5E9", color: "#7DD3FC", bgColor: "#F0F9FF" },
  { text: "#F59E0B", color: "#FCD34D", bgColor: "#FFFBEB" },
  { text: "#F43F5E", color: "#FDA4AF", bgColor: "#FFF1F2" },
  { text: "#7C3AED", color: "#C4B5FD", bgColor: "#F5F3FF" },
  { text: "#D946EF", color: "#F0ABFC", bgColor: "#FDF4FF" },
  { text: "#F97316", color: "#FDBA74", bgColor: "#FFF7ED" },
  { text: "#64748B", color: "#CBD5E1", bgColor: "#F8FAFC" },
  { text: "#059669", color: "#6EE7B7", bgColor: "#ECFDF5" },
  { text: "#DC2626", color: "#FCA5A5", bgColor: "#FEF2F2" },
  { text: "#2563EB", color: "#93C5FD", bgColor: "#EFF6FF" },
];

const getDynamicBranchStyle = (branchCode: string) => {
  if (!branchCode) return COLOR_PALETTE[0];
  const code = branchCode.trim().toUpperCase();
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

const AttendancePage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cards, setCards] = useState<AcademicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [realtimeTrigger, setRealtimeTrigger] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { userId } = useUser();
  const {
    collegeId,
    collegeEducationId: defaultEduId,
    collegeEducationType: defaultEduType,
    loading: adminLoading,
  } = useAdmin();

  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalStudents: 0,
    studentsBelow75: 0,
    pendingCorrections: 0,
  });

  const {
    educations,
    branches,
    years,
    sections,
    subjects,
    education,
    branch,
    year,
    section,
    subject,
    selectEducation,
    selectBranch,
    selectYear,
    setSection,
    setSubject,
    resetEducation,
  } = useAcademicFilters({ userId: userId ?? undefined, collegeId });

  const isSchool = isSchoolEducation(
    education?.collegeEducationType || defaultEduType
  );
  const isInter =
    education?.collegeEducationType === "Inter" ||
    defaultEduType === "Inter";

  const currentEducationId =
    education?.collegeEducationId ?? defaultEduId ?? null;

  const apiFilters = {
    educationId: currentEducationId,
    branchId: branch?.collegeBranchId ?? null,
    academicYearId: year?.collegeAcademicYearId ?? null,
    sectionId: section?.collegeSectionsId ?? null,
    subjectId: subject?.collegeSubjectId ?? null,
  };

  const apiFiltersStr = JSON.stringify(apiFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (defaultEduId && educations.length > 0 && !education) {
      const assignedEdu = educations.find(
        (e) => Number(e.collegeEducationId) === Number(defaultEduId)
      );
      if (assignedEdu) {
        selectEducation(assignedEdu);
      }
    }
  }, [defaultEduId, educations, education, selectEducation]);

  useEffect(() => {
    if (!collegeId || !currentEducationId) return;

    let isMounted = true;

    const loadStats = async () => {
      try {
        if (realtimeTrigger === 0) setStatsLoading(true);

        const data = await fetchAttendanceStats({
          collegeId,
          collegeEducationId: currentEducationId,
        });

        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load attendance stats", err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [collegeId, currentEducationId, realtimeTrigger]);

  useAdminAttendanceRealtime(() => {
    setRealtimeTrigger((prev) => prev + 1);
  });

  useEffect(() => {
    if (!collegeId || adminLoading) return;
    const timer = setTimeout(() => {
      loadCardsOnly();
    }, 150);

    return () => clearTimeout(timer);
  }, [collegeId, adminLoading, currentPage, debouncedSearch, apiFiltersStr]);

  useEffect(() => {
    if (realtimeTrigger > 0 && collegeId) {
      const timer = setTimeout(() => {
        loadCardsOnly(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [realtimeTrigger, collegeId]);

  const loadCardsOnly = async (showLoader = true) => {
    if (!collegeId) return;
    try {
      if (showLoader) setLoading(true);

      const { data, totalCount } = await getAdminAcademicsCards(
        collegeId,
        currentPage,
        cardsPerPage,
        debouncedSearch,
        JSON.parse(apiFiltersStr)
      );

      const mappedCards = mapAcademicCards(data);

      setCards(mappedCards);
      setTotalRecords(totalCount);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load records.");
      setCards([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const cardData = [
    {
      id: "1",
      style: "bg-[#CEE6FF]",
      icon: <BuildingApartmentIcon size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#60AEFF",
      value: stats.totalDepartments,
      label: isSchool ? "Total Classes" : isInter ? "Total Groups" : "Total Branches",
    },
    {
      id: "2",
      style: "bg-[#E6FBEA]",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#43C17A",
      value: stats.totalStudents,
      label: "Total Students",
    },
    {
      id: "3",
      style: "bg-[#FFE0E0] ",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FF2020",
      value: stats.studentsBelow75,
      label: "Students Below 75%",
    },
    {
      id: "4",
      style: "bg-[#FFEDDA]",
      icon: <WarningIcon size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FFBB70",
      value: stats.pendingCorrections,
      label: "Pending Attedance Corrections",
    },
  ];

  const cardsPerPage = 9;
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const totalPages = Math.ceil(totalRecords / cardsPerPage);

  if (!mounted) return null;

  const handleBack = () => {
    router.push("/admin/attendance");
  };

  if (view === "subjectWise") {
    return <SubjectWiseAttendance onBack={handleBack} />;
  }

  const showStatsLoader = adminLoading || statsLoading;

  return (
    <div className="flex flex-col m-4">
      <div className="mb-6 flex flex-col md:flex-row w-full justify-between items-center md:items-start gap-4">
        <div className="order-2 md:order-1 w-full">
          <div className="flex items-center gap-2 group w-fit cursor-pointer">
            <h1 className="text-xl font-bold text-[#282828]">
              Attendance Overview
            </h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            {isSchool
              ? "Track, verify, and manage attendance records across classes and faculty."
              : "Track, verify, and manage attendance records across branches and faculty."}
          </p>
        </div>
        <div className="order-1 md:order-2 w-full md:w-[350px] flex justify-end">
          <CourseScheduleCard isVisibile={false} fullWidth={false} />
        </div>
      </div>

      <div className="flex gap-4 w-full h-full mb-3">
        {showStatsLoader ? (
          <div className="w-full">
            <StatsCardsSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full h-32">
            {cardData.map((item, index) => (
              <CardComponent
                key={index}
                style={`${item.style} h-[156px]`}
                icon={item.icon}
                iconBgColor={item.iconBgColor}
                value={item.value}
                label={item.label}
              />
            ))}
          </div>
        )}
        <div>
          <WorkWeekCalendar style="h-full w-[350px]" />
        </div>
      </div>

      <div className="mt-0 mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-[32%] shrink-0">
          <input
            type="text"
            placeholder="Search here..."
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

        <div className="bg-white rounded-xl p-2 px-4 shadow-sm flex flex-wrap flex-1 gap-2 border border-gray-100">
          <FilterDropdown
            label="Education"
            value={education?.collegeEducationId?.toString() ?? "All"}
            placeholder="Select Education"
            options={["All", ...educations.map((e) => e.collegeEducationId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                resetEducation();
                return;
              }
              const edu = educations.find((e) => e.collegeEducationId === +val);
              if (edu) selectEducation(edu);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : educations.find((e) => e.collegeEducationId === +val)?.collegeEducationType || val
            }
          />

          {!isSchool && (
            <FilterDropdown
              label={education?.collegeEducationType === "Inter" ? "Group" : "Branch"}
              value={branch?.collegeBranchId?.toString() ?? "All"}
              disabled={!education}
              placeholder={education?.collegeEducationType === "Inter" ? "Select Group" : "Select Branch"}
              options={[
                "All",
                ...branches.map((b) => b.collegeBranchId.toString()),
              ]}
              onChange={(val) => {
                if (val === "All") {
                  selectEducation(education);
                  return;
                }
                const br = branches.find((b) => b.collegeBranchId === +val);
                br && selectBranch(br);
              }}
              displayModifier={(val) =>
                val === "All"
                  ? "All"
                  : (branches.find((b) => b.collegeBranchId.toString() === val)
                    ?.collegeBranchCode ?? val)
              }
            />
          )}

          <FilterDropdown
            label="Year"
            value={year?.collegeAcademicYearId?.toString() ?? "All"}
            disabled={isSchool ? !education : !branch}
            placeholder="Select Year"
            options={[
              "All",
              ...years.map((y) => y.collegeAcademicYearId.toString()),
            ]}
            onChange={(val) => {
              if (val === "All") {
                setSection(null);
                setSubject(null);
                return;
              }
              const yr = years.find((y) => y.collegeAcademicYearId === +val);
              yr && selectYear(yr);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : (years.find((y) => y.collegeAcademicYearId.toString() === val)
                  ?.collegeAcademicYear ?? val)
            }
          />

          <FilterDropdown
            label="Section"
            value={section?.collegeSectionsId?.toString() ?? "All"}
            disabled={!year}
            placeholder="Select Section"
            options={[
              "All",
              ...sections.map((s) => s.collegeSectionsId.toString()),
            ]}
            onChange={(val) => {
              if (val === "All") {
                setSection(null);
                setSubject(null);
                return;
              }
              const sec = sections.find((s) => s.collegeSectionsId === +val);
              sec && setSection(sec);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : (sections.find((s) => s.collegeSectionsId.toString() === val)
                  ?.collegeSections ?? val)
            }
          />

          <FilterDropdown
            label="Subject"
            value={subject?.collegeSubjectId?.toString() ?? "All"}
            disabled={!section}
            placeholder="Select Subject"
            options={[
              "All",
              ...subjects.map((s) => s.collegeSubjectId.toString()),
            ]}
            onChange={(val) => {
              if (val === "All") {
                setSubject(null);
                return;
              }
              const sub = subjects.find((s) => s.collegeSubjectId === +val);
              sub && setSubject(sub);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : (subjects.find((s) => s.collegeSubjectId.toString() === val)
                  ?.subjectName ?? val)
            }
          />
        </div>
      </div>

      <div className="flex flex-col justify-between min-h-[calc(100vh-420px)] bg-[#F3F6F9] rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {loading || adminLoading || !collegeId ? (
            [...Array(9)].map((_, i) => <AcademicSectionsSkeleton key={i} />)
          ) : !loading && cards.length === 0 ? (
            <div className="col-span-full flex justify-center py-20 text-gray-400">
              No academic records found.
            </div>
          ) : (
            cards.map((dept) => {
              const style = getDynamicBranchStyle(dept.branchCode);
              const cardTitle = isSchool
                ? `Section - ${dept.section}`
                : `${dept.branchCode} - ${dept.section}`;

              return (
                <FacultyAttendanceCard
                  key={dept.id}
                  avgAttendance={dept.avgAttendance || 0}
                  belowThresholdCount={dept.belowThresholdCount || 0}
                  name={cardTitle}
                  text={style.text}
                  color={style.color}
                  bgColor={style.bgColor}
                  collegeId={collegeId!}
                  collegeEducationId={currentEducationId!}
                  collegeBranchId={dept.collegeBranchId}
                  collegeAcademicYearId={dept.collegeAcademicYearId}
                  collegeSectionsId={dept.collegeSectionsId}
                  year={dept.year}
                  totalStudents={dept.totalStudents}
                  faculties={dept.faculties}
                  totalSubjects={dept.totalSubjects}
                  branch={dept.branchCode}
                  section={dept.section}
                  totalFaculties={dept.totalFaculties}
                />
              );
            })
          )}
        </div>
        <div className="flex justify-center items-center mt-2 mb-2 w-full max-w-[1200px] mx-auto rounded-lg shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalItems={totalRecords}
            itemsPerPage={cardsPerPage}
            onPageChange={setCurrentPage}
            alwaysShow={true}
            roundedBottom="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <AttendancePage />
    </Suspense>
  );
}
