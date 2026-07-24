"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { getAdminAcademicsCards, mapAcademicCards } from "@/lib/helpers/admin/academics/getAdminAcademicsCards";
import { useAcademicFilters } from "@/lib/helpers/admin/academics/useAcademicFilters";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import FacultyAcademicCard from "./components/facultyAcademicCard";
import { FilterDropdown } from "./components/filterDropdown";
import { AcademicSectionsSkeleton } from "./shimmer/academicSectionsSkeleton";
import { SubjectWiseAttendance } from "./components/subjectWiseAttendance";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { Loader } from "../../(student)/calendar/right/timetable";

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

const AcademicPage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useUser();
  const [cards, setCards] = useState<AcademicCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { collegeId: adminCollegeId, collegeEducationId, collegeEducationType } = useAdmin();

  const cardsPerPage = 9;
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const {
    educations,
    resetEducation,
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
  } = useAcademicFilters({ userId: userId ?? undefined, collegeId: adminCollegeId });

  const isSchool = isSchoolEducation(
    education?.collegeEducationType || collegeEducationType
  );
  const apiFilters = {
    educationId: education?.collegeEducationId ?? null,
    branchId: branch?.collegeBranchId ?? null,
    academicYearId: year?.collegeAcademicYearId ?? null,
    sectionId: section?.collegeSectionsId ?? null,
    subjectId: subject?.collegeSubjectId ?? null,
  };

  const apiFiltersStr = JSON.stringify(apiFilters);

  useEffect(() => {
    if (!adminCollegeId) return;
    const timer = setTimeout(() => {
      loadCardsOnly();
    }, 150);

    return () => clearTimeout(timer);
  }, [adminCollegeId, currentPage, debouncedSearch, apiFiltersStr]);

  const isEducationInitialized = useRef(false);

  useEffect(() => {
    if (!collegeEducationId || !selectEducation) return;
    if (isEducationInitialized.current) return;

    selectEducation({
      collegeEducationId,
      collegeEducationType,
    } as any);
    isEducationInitialized.current = true;
  }, [collegeEducationId, selectEducation, collegeEducationType]);

  const loadCardsOnly = async () => {
    if (!adminCollegeId) return;
    try {
      setLoading(true);

      const { data, totalCount } = await getAdminAcademicsCards(
        adminCollegeId,
        currentPage,
        cardsPerPage,
        debouncedSearch,
        JSON.parse(apiFiltersStr),
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

  if (!mounted) return null;

  const handleBack = () => {
    router.push("/admin/attendance");
  };

  if (view === "subjectWise") {
    return <SubjectWiseAttendance onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col m-4 min-h-[calc(100vh-100px)]">
      <div className="mb-6 flex flex-col md:flex-row w-full justify-between items-center md:items-start gap-4">
        <div className="order-2 md:order-1 w-full">
          <div className="flex items-center gap-2 group w-fit cursor-pointer">
            <h1 className="text-xl font-bold text-[#282828]">Academics</h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            {isSchool
              ? "Track syllabus progress and manage notes by class"
              : "Track syllabus progress and manage notes by semester"}
          </p>
        </div>
        <div className="order-1 md:order-2 w-full md:w-[350px] flex justify-end">
          <CourseScheduleCard isVisibile={false} fullWidth={false} />
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
            displayModifier={(val) => {
              if (val === "All") return "All";
              const found = educations.find((e) => e.collegeEducationId.toString() === val);
              if (found) return found.collegeEducationType;
              if (val === collegeEducationId?.toString()) return collegeEducationType;
              return val;
            }}
          />

          {!isSchool && (
            <FilterDropdown
              label={education?.collegeEducationType === "Inter" ? "Group" : "Branch"}
              value={branch?.collegeBranchId?.toString() ?? "All"}
              disabled={!education}
              placeholder={education?.collegeEducationType === "Inter" ? "Select Group" : "Select Branch"}
              options={["All", ...branches.map((b) => b.collegeBranchId.toString())]}
              onChange={(val) => {
                if (val === "All") {
                  selectBranch(null);
                  selectYear(null);
                  setSection(null);
                  setSubject(null);
                  return;
                }
                const br = branches.find((b) => b.collegeBranchId === +val);
                if (br) {
                  selectBranch(br);
                  selectYear(null);
                  setSection(null);
                  setSubject(null);
                }
              }}
              displayModifier={(val) =>
                val === "All" ? "All" : (branches.find((b) => b.collegeBranchId.toString() === val)?.collegeBranchCode ?? val)
              }
            />
          )}

          <FilterDropdown
            label="Year"
            value={year?.collegeAcademicYearId?.toString() ?? "All"}
            placeholder="Select Year"
            disabled={isSchool ? !education : !branch}
            options={["All", ...[...years].sort((a, b) => (a.collegeAcademicYear || "").localeCompare(b.collegeAcademicYear || "")).map((y) => y.collegeAcademicYearId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                selectYear(null);
                setSection(null);
                setSubject(null);
                return;
              }
              const yr = years.find((y) => y.collegeAcademicYearId === +val);
              yr && selectYear(yr);
            }}
            displayModifier={(val) => {
              if (val === "All") return "All";
              return years.find((y) => y.collegeAcademicYearId.toString() === val)?.collegeAcademicYear ?? "All";
            }}
          />

          <FilterDropdown
            label="Section"
            value={section?.collegeSectionsId?.toString() ?? "All"}
            placeholder="Select Section"
            disabled={!year}
            options={["All", ...sections.map((s) => s.collegeSectionsId.toString())]}
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
              val === "All" ? "All" : (sections.find((s) => s.collegeSectionsId.toString() === val)?.collegeSections ?? val)
            }
          />

          <FilterDropdown
            label="Subject"
            value={subject?.collegeSubjectId?.toString() ?? "All"}
            placeholder="Select Subject"
            disabled={!section}
            options={["All", ...subjects.map((s) => s.collegeSubjectId.toString())]}
            onChange={(val) => {
              if (val === "All") {
                setSubject(null);
                return;
              }
              const sub = subjects.find((s) => s.collegeSubjectId === +val);
              sub && setSubject(sub);
            }}
            displayModifier={(val) =>
              val === "All" ? "All" : (subjects.find((s) => s.collegeSubjectId.toString() === val)?.subjectName ?? val)
            }
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between bg-[#F3F6F9] rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px] mx-auto">
          {loading ? (
            [...Array(6)].map((_, i) => <AcademicSectionsSkeleton key={i} />)
          ) : !loading && cards.length === 0 ? (
            <div className="col-span-full flex justify-center py-20 text-gray-400">
              {debouncedSearch
                ? "No matches found on this page."
                : "No academic records found."}
            </div>
          ) : (
            cards.map((dept) => {
              const style = getDynamicBranchStyle(dept.branchCode);
              const cardTitle = isSchool
                ? `Section - ${dept.section}`
                : `${dept.branchCode} - ${dept.section}`;
              return (
                <FacultyAcademicCard
                  key={dept.id}
                  id={dept.id}
                  name={cardTitle}
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

        <div className="flex justify-center items-center mt-6 w-full max-w-[1200px] mx-auto rounded-lg shadow-sm">
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
    <Suspense fallback={<div className="w-full h-full py-10 text-center"><Loader/></div>}>
      <AcademicPage />
    </Suspense>
  );
}
