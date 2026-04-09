"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Suspense } from "react";
import { MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import FacultyAttendanceCard, {
  Department,
} from "./components/facultyAttendanceCard";

import { User, UsersThree } from "@phosphor-icons/react";
import CardComponent from "./components/cards";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { fetchAttendanceStats } from "@/lib/helpers/admin/attendance/attendanceStats";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
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
import { getBatchSectionStats } from "@/lib/helpers/admin/attendance/getBatchSectionStats";
import { supabase } from "@/lib/supabaseClient";

interface ExtendedDepartment extends Department {
  id: string;
  section: string;
  subject: string;
  deptCode: string;
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

const AttendancePage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cards, setCards] = useState<AcademicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [adminContext, setAdminContext] = useState<{
    adminId: number;
    collegeId: number;
    collegePublicId: string;
    collegeCode: string;
    collegeEducationId: number;
  } | null>(null);

  const [adminLoading, setAdminLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const showStatsLoader = adminLoading || statsLoading;
  const { userId } = useUser();
  const { collegeEducationId } = useAdmin();

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
  } = useAcademicFilters(userId ?? undefined);

  const apiFilters = {
    educationId: education?.collegeEducationId ?? null,
    branchId: branch?.collegeBranchId ?? null,
    academicYearId: year?.collegeAcademicYearId ?? null,
    sectionId: section?.collegeSectionsId ?? null,
    subjectId: subject?.collegeSubjectId ?? null,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadAdminContext = async () => {
      try {
        setAdminLoading(true);
        const ctx = await fetchAdminContext(userId);

        let validEduId = parseInt(ctx?.collegeEducationId as any);

        if (isNaN(validEduId)) {
          const { data } = await supabase
            .from("admins")
            .select("collegeEducationId")
            .eq("userId", userId)
            .single();

          if (data?.collegeEducationId) {
            validEduId = data.collegeEducationId;
          }
        }

        if (isMounted) {
          setAdminContext({
            ...ctx,
            collegeEducationId: validEduId,
          });
        }
      } catch (err: any) {
        console.error("Failed to load admin context", err);
        toast.error("Failed to load admin information.");
      } finally {
        if (isMounted) setAdminLoading(false);
      }
    };

    loadAdminContext();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (
      adminContext?.collegeEducationId &&
      educations.length > 0 &&
      !education
    ) {
      const assignedEdu = educations.find(
        (e) =>
          Number(e.collegeEducationId) ===
          Number(adminContext.collegeEducationId),
      );
      if (assignedEdu) {
        selectEducation(assignedEdu);
      }
    }
  }, [
    adminContext?.collegeEducationId,
    educations,
    education,
    selectEducation,
  ]);

  useEffect(() => {
    if (
      !adminContext?.collegeId ||
      !adminContext?.collegeEducationId ||
      isNaN(adminContext.collegeEducationId)
    )
      return;

    let isMounted = true;

    const loadStats = async () => {
      try {
        setStatsLoading(true);

        const data = await fetchAttendanceStats({
          collegeId: adminContext.collegeId,
          collegeEducationId: adminContext.collegeEducationId,
        });

        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load attendance stats", err);
        toast.error("Unable to load attendance statistics.");
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [adminContext]);

  useEffect(() => {
    if (!userId) return;
    loadCardsOnly();
  }, [userId, currentPage, education, branch, year, section, subject, debouncedSearch]);

  const loadCardsOnly = async () => {
    try {
      setLoading(true);
      const { collegeId } = await fetchAdminContext(userId!);

      const { data, totalCount } = await getAdminAcademicsCards(
        collegeId,
        currentPage,
        cardsPerPage,
        debouncedSearch,
        apiFilters,
      );

      let mappedCards = mapAcademicCards(data);
      const sectionIds = mappedCards.map((c) => c.collegeSectionsId);

      if (sectionIds.length > 0) {
        const stats = await getBatchSectionStats(sectionIds);

        mappedCards = mappedCards.map((card) => {
          const stat = stats.find(
            (s) => s.sectionId === card.collegeSectionsId,
          );
          return {
            ...card,
            avgAttendance: stat?.avgAttendance || 0,
            belowThresholdCount: stat?.belowThresholdCount || 0,
          };
        });
      }

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
      icon: <UsersThree size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#60AEFF",
      value: stats.totalDepartments,
      label: "Total branches",
    },
    {
      id: "2",
      style: "bg-[#E6FBEA]",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#43C17A",
      value: stats.totalStudents,
      label: "Total students",
    },
    {
      id: "3",
      style: "bg-[#FFE0E0] ",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FF2020",
      value: stats.studentsBelow75,
      label: "Students below 75%",
    },
    {
      id: "4",
      style: "bg-[#CEE6FF]",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#60AEFF",
      value: stats.pendingCorrections,
      label: "Pending attedance corrections",
    },
  ];

  const cardsPerPage = 15;
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
            Track, verify, and manage attendance records across branches and
            faculty.
          </p>
        </div>
        <div className="w-38">
          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>
      </div>

      <div className="flex gap-4 w-full h-full mb-3">
        {showStatsLoader ? (
          <div className="flex items-center justify-center w-full h-32">
            <Loader />
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
        <div className="relative w-full md:w-[32%]">
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
          <div className="flex flex-col gap-1 min-w-30 overflow-visible">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1">
              Education
            </label>
            <div className="relative border border-gray-300 rounded-md bg-gray-50 w-[120px] flex items-center h-6.25 overflow-hidden">
              <span className="w-full text-[13px] font-medium text-gray-500 pl-2 truncate cursor-not-allowed">
                {education?.collegeEducationType ?? "Loading..."}
              </span>
            </div>
          </div>

          <FilterDropdown
            label="Branch"
            value={branch?.collegeBranchId?.toString() ?? "All"}
            disabled={!education}
            placeholder="Select Branch"
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

          <FilterDropdown
            label="Year"
            value={year?.collegeAcademicYearId?.toString() ?? "All"}
            disabled={!branch}
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

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {loading || adminLoading || collegeEducationId === null ? (
            <div className="flex items-center col-span-full justify-center w-full h-32">
              <Loader />
            </div>
          ) : !loading && cards.length === 0 ? (
            <div className="col-span-full flex justify-center py-20 text-gray-400">
              {cards.length > 0
                ? "No matches found on this page."
                : "No academic records found."}
            </div>
          ) : (
            cards.map((dept) => {
              const style = getDynamicBranchStyle(dept.branchCode);
              return (
                <FacultyAttendanceCard
                  key={dept.id}
                  avgAttendance={dept.avgAttendance || 0}
                  belowThresholdCount={dept.belowThresholdCount || 0}
                  name={`${dept.branchCode} - ${dept.section}`}
                  text={style.text}
                  color={style.color}
                  bgColor={style.bgColor}
                  collegeId={adminContext!.collegeId}
                  collegeEducationId={collegeEducationId}
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
        {cards.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg border cursor-pointer bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <CaretLeft size={18} weight="bold" color="black" />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 cursor-pointer h-9 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
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
              disabled={currentPage === totalPages || loading}
              className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <CaretRight size={18} weight="bold" color="black" />
            </button>
          </div>
        )}
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
