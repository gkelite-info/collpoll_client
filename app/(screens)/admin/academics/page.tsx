"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Suspense } from "react";
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SubjectWiseAttendance } from "../attendance/components/subjectWiseAttendance";
import { useRouter } from "next/navigation";
import FacultyAcademicCard from "./components/facultyAcademicCard";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import { getAdminAcademicsCards, mapAcademicCards } from "@/lib/helpers/admin/academics/getAdminAcademicsCards";
import { useAcademicFilters } from "@/lib/helpers/admin/academics/useAcademicFilters";
import { FilterDropdown } from "./components/filterDropdown";

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

const DEFAULT_CARD_STYLE = {
  facultyName: "N/A",
  text: "#16284F",
  color: "#16284F",
  bgColor: "#E7F5FF",
  avgAttendance: 0,
  belowThresholdCount: 0,
};

const AcademicPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useUser();
  const [cards, setCards] = useState<AcademicCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
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
  }, [
    userId,
    currentPage,
    debouncedSearch,
    education,
    branch,
    year,
    section,
    subject
  ]);

  const loadCardsOnly = async () => {
    try {
      setLoading(true);
      const { collegeId } = await fetchAdminContext(userId!);
      const { data, totalCount } = await getAdminAcademicsCards(
        collegeId,
        currentPage,
        cardsPerPage,
        debouncedSearch,
        apiFilters
      );
      setCards(mapAcademicCards(data));
      setTotalRecords(totalCount);
    } catch (error: any) {
      toast.error(
        error?.message ||
        "Unable to load academic records. Please try again later."
      );
      setCards([]);
      setTotalRecords(0);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);


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

      <div className="mt-0 mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-[32%]">
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

        <div className="bg-white rounded-xl p-2 px-4 shadow-sm flex flex-wrap flex-1 gap-2 border border-gray-100">
          <FilterDropdown
            label="Education"
            value={education?.collegeEducationId?.toString() ?? "All"}
            options={["All", ...educations.map(e => e.collegeEducationId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                resetEducation();
                return;
              }
              const edu = educations.find(e => e.collegeEducationId === +val);
              edu && selectEducation(edu);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : educations.find(e => e.collegeEducationId.toString() === val)
                  ?.collegeEducationType ?? val
            }
          />

          <FilterDropdown
            label="Branch"
            value={branch?.collegeBranchId?.toString() ?? "All"}
            disabled={!education}
            placeholder="Select Branch"
            options={["All", ...branches.map(b => b.collegeBranchId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                selectEducation(education);
                return;
              }
              const br = branches.find(b => b.collegeBranchId === +val);
              br && selectBranch(br);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : branches.find(b => b.collegeBranchId.toString() === val)
                  ?.collegeBranchCode ?? val
            }
          />

          <FilterDropdown
            label="Year"
            value={year?.collegeAcademicYearId?.toString() ?? "All"}
            disabled={!branch}
            placeholder="Select Year"
            options={["All", ...years.map(y => y.collegeAcademicYearId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                setSection(null);
                setSubject(null);
                return;
              }
              const yr = years.find(y => y.collegeAcademicYearId === +val);
              yr && selectYear(yr);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : years.find(y => y.collegeAcademicYearId.toString() === val)
                  ?.collegeAcademicYear ?? val
            }
          />

          <FilterDropdown
            label="Section"
            value={section?.collegeSectionsId?.toString() ?? "All"}
            disabled={!year}
            placeholder="Select Section"
            options={["All", ...sections.map(s => s.collegeSectionsId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                setSection(null);
                setSubject(null);
                return;
              }
              const sec = sections.find(s => s.collegeSectionsId === +val);
              sec && setSection(sec);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : sections.find(s => s.collegeSectionsId.toString() === val)
                  ?.collegeSections ?? val
            }
          />

          <FilterDropdown
            label="Subject"
            value={subject?.collegeSubjectId?.toString() ?? "All"}
            disabled={!section}
            placeholder="Select Subject"
            options={["All", ...subjects.map(s => s.collegeSubjectId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                setSubject(null);
                return;
              }
              const sub = subjects.find(s => s.collegeSubjectId === +val);
              sub && setSubject(sub);
            }}
            displayModifier={(val) =>
              val === "All"
                ? "All"
                : subjects.find(s => s.collegeSubjectId.toString() === val)
                  ?.subjectName ?? val
            }
          />
        </div>
        
      </div>

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) :
            !loading && cards.length === 0 ? (
              <div className="col-span-full flex justify-center py-20 text-gray-400">
                No academic records found.
              </div>
            ) : (
              cards.map((dept) => (
                // <FacultyAcademicCard key={dept.id} {...dept} />
                <FacultyAcademicCard
                  key={dept.id}
                  name={`${dept.branchCode} - ${dept.section}`}
                  year={dept.year}
                  totalStudents={dept.totalStudents}
                  faculties={dept.faculties}
                  {...DEFAULT_CARD_STYLE}
                />
              )))}
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
    <Suspense fallback={<div>Loading...</div>}>
      <AcademicPage />
    </Suspense>
  );
}
