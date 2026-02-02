"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import {
  getAdminAcademicsCards,
  mapAcademicCards,
} from "@/lib/helpers/admin/academics/getAdminAcademicsCards";
import { useAcademicFilters } from "@/lib/helpers/admin/academics/useAcademicFilters";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import FacultyAcademicCard from "./components/facultyAcademicCard";
import { FilterDropdown } from "./components/filterDropdown";
import { AcademicSectionsSkeleton } from "./shimmer/academicSectionsSkeleton";
import { SubjectWiseAttendance } from "../attendance/components/subjectWiseAttendance";

/* =========================================
   1. COLOR PALETTE & HELPER
   ========================================= */
const COLOR_PALETTE = [
  { text: "#FF767D", color: "#FFB4B8", bgColor: "#FFF5F5" }, // CSE
  { text: "#FF9F7E", color: "#F3D3C8", bgColor: "#FFF9DB" }, // ECE
  { text: "#F8CF64", color: "#F3E2B6", bgColor: "#FFF9DB" }, // MECH
  { text: "#66EEFA", color: "#BCECF0", bgColor: "#E7F5FF" }, // IT
  { text: "#10B981", color: "#6EE7B7", bgColor: "#ECFDF5" }, // Green
  { text: "#8B5CF6", color: "#C4B5FD", bgColor: "#F5F3FF" }, // Purple
  { text: "#EC4899", color: "#F9A8D4", bgColor: "#FDF2F8" }, // Pink
  { text: "#6366F1", color: "#A5B4FC", bgColor: "#EEF2FF" }, // Indigo
  { text: "#14B8A6", color: "#5EEAD4", bgColor: "#F0FDFA" }, // Teal
  { text: "#84CC16", color: "#BEF264", bgColor: "#F7FEE7" }, // Lime
  { text: "#0EA5E9", color: "#7DD3FC", bgColor: "#F0F9FF" }, // Sky
  { text: "#F59E0B", color: "#FCD34D", bgColor: "#FFFBEB" }, // Amber
  { text: "#F43F5E", color: "#FDA4AF", bgColor: "#FFF1F2" }, // Rose
  { text: "#7C3AED", color: "#C4B5FD", bgColor: "#F5F3FF" }, // Violet
  { text: "#D946EF", color: "#F0ABFC", bgColor: "#FDF4FF" }, // Fuchsia
  { text: "#F97316", color: "#FDBA74", bgColor: "#FFF7ED" }, // Orange
  { text: "#64748B", color: "#CBD5E1", bgColor: "#F8FAFC" }, // Slate
  { text: "#059669", color: "#6EE7B7", bgColor: "#ECFDF5" }, // Mint
  { text: "#DC2626", color: "#FCA5A5", bgColor: "#FEF2F2" }, // Crimson
  { text: "#2563EB", color: "#93C5FD", bgColor: "#EFF6FF" }, // Royal
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

export type AcademicCardData = {
  id: string;
  branchName: string;
  branchCode: string;
  section: string;
  year: string;
  totalStudents: number;
  faculties: {
    facultyId: number;
    fullName: string;
    email: string;
  }[];
};

/* =========================================
   2. MAIN COMPONENT
   ========================================= */
const AcademicPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useUser();
  const [cards, setCards] = useState<AcademicCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [mounted, setMounted] = useState(false);

  const cardsPerPage = 15;
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const router = useRouter();
  const totalPages = Math.ceil(totalRecords / cardsPerPage);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!userId) return;
    loadCardsOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentPage, education, branch, year, section, subject]);

  const loadCardsOnly = async () => {
    try {
      setLoading(true);
      const { collegeId } = await fetchAdminContext(userId!);

      const { data, totalCount } = await getAdminAcademicsCards(
        collegeId,
        currentPage,
        cardsPerPage,
        "",
        apiFilters,
      );

      setCards(mapAcademicCards(data));
      setTotalRecords(totalCount);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load academic records.");
      setCards([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;

    const lowerQuery = search.toLowerCase();

    return cards.filter((card) => {
      return (
        card.branchCode.toLowerCase().includes(lowerQuery) ||
        card.branchName.toLowerCase().includes(lowerQuery) ||
        card.section.toLowerCase().includes(lowerQuery) ||
        card.year.toLowerCase().includes(lowerQuery)
      );
    });
  }, [search, cards]);

  if (!mounted) return null;

  const handleBack = () => {
    router.push("/admin/attendance");
  };

  if (view === "subjectWise") {
    return <SubjectWiseAttendance onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col m-4">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit cursor-pointer">
            <h1 className="text-xl font-bold text-[#282828]">Academics</h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Track syllabus Progress and manage notes by semester
          </p>
        </div>
        <div className="w-[30%]">
          <CourseScheduleCard isVisibile={true} fullWidth={false} />
        </div>
      </div>

      {/* Search & Filters */}
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
          <FilterDropdown
            label="Education"
            value={education?.collegeEducationId?.toString() ?? "All"}
            options={[
              "All",
              ...educations.map((e) => e.collegeEducationId.toString()),
            ]}
            onChange={(val) => {
              if (val === "All") {
                resetEducation();
                return;
              }
              const edu = educations.find((e) => e.collegeEducationId === +val);
              edu && selectEducation(edu);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : (educations.find(
                    (e) => e.collegeEducationId.toString() === val,
                  )?.collegeEducationType ?? val)
            }
          />

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

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {loading ? (
            [...Array(6)].map((_, i) => <AcademicSectionsSkeleton key={i} />)
          ) : !loading && filteredCards.length === 0 ? (
            <div className="col-span-full flex justify-center py-20 text-gray-400">
              {cards.length > 0
                ? "No matches found on this page."
                : "No academic records found."}
            </div>
          ) : (
            filteredCards.map((dept) => {
              const style = getDynamicBranchStyle(dept.branchCode);
              return (
                <FacultyAcademicCard
                  key={dept.id}
                  id={dept.id}
                  name={`${dept.branchCode} - ${dept.section}`}
                  year={dept.year}
                  totalStudents={dept.totalStudents}
                  faculties={dept.faculties}
                  facultyName="N/A"
                  avgAttendance={0}
                  belowThresholdCount={0}
                  text={style.text}
                  color={style.color}
                  bgColor={style.bgColor}
                />
              );
            })
          )}
        </div>

        {totalPages > 1 && (
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
    <Suspense fallback={<div>Loading...</div>}>
      <AcademicPage />
    </Suspense>
  );
}
