"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import ProjectsHeader from "./components/ProjectsHeader";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WipOverlay from "@/app/utils/WipOverlay";
import { fetchBranchOptionsForAdmin } from "@/lib/helpers/admin/collegeBranchAPI";
import { fetchAcademicYearOptionsForAdmin } from "@/lib/helpers/admin/collegeAcademicYearAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { FilterDropdown } from "../assignments/components/filterDropdown";
import { fetchAdminEducationTypes, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { fetchActiveStudentCount } from "@/lib/helpers/admin/studentsCountAPI";
import { fetchActiveFacultyData, fetchActiveProjectCountByBranchYear, fetchSubjectFacultyList } from "@/lib/helpers/admin/facultyCountAPI";
import { getBranchTheme } from "../assignments/utils/palette";
import DiscussionDeptCard from "../assignments/components/discussionDeptCard";
import { DiscussionDeptCardSkeleton } from "../assignments/components/shimmers/DiscussionDeptCardSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import DiscussionCourseCard from "../assignments/components/discussionCourseCard";
import AdminProjectsList from "./AdminProjectsList";
import { useUser } from "@/app/utils/context/UserContext";
import { Loader } from "../../(student)/calendar/right/timetable";
import { fetchAdminPendingStats } from "@/lib/helpers/projects/project";
import { supabase } from "@/lib/supabaseClient";

function ProjectsOverview() {
  const { userId, collegeEducationId, collegeId } = useAdmin();
  const { role } = useUser();
  const [countsData, setCountsData] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courseList, setCourseList] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const subjectId = searchParams.get("subjectId");
  const facultyId = searchParams.get("facultyId");
  const subjectName = searchParams.get("subjectName");

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const branchId = searchParams.get("branchId");
  const yearId = searchParams.get("yearId");

  const [educations, setEducations] = useState<any[]>([]);
  const [educationFilter, setEducationFilter] = useState<string>("All");
  const [education, setEducation] = useState<any>(null);

  const [branchOptions, setBranchOptions] = useState<
    { id: number; name: string; code: string }[]
  >([]);

  const [yearOptions, setYearOptions] = useState<
    { id: number; label: string }[]
  >([]);

  const [branchYearsMap, setBranchYearsMap] = useState<Record<number, { id: number; label: string }[]>>({});

  const [branches, setBranches] = useState<any[]>([]);
  const selectedBranch = branchOptions.find(b => String(b.id) === branchId);
  const selectedYear = yearOptions.find(y => String(y.id) === yearId);

  const [dbEducationType, setDbEducationType] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) {
      setDbEducationType(null);
      return;
    }
    const fetchEduType = async () => {
      try {
        const { data, error } = await supabase
          .from("college_branch")
          .select(`
            college_education:collegeEducationId (
              collegeEducationType
            )
          `)
          .eq("collegeBranchId", Number(branchId))
          .single();
        
        if (data) {
          const edu = Array.isArray(data.college_education)
            ? data.college_education[0]
            : data.college_education;
          setDbEducationType(edu?.collegeEducationType || null);
        }
      } catch (err) {
        console.error("Failed to fetch edu type", err);
      }
    };
    fetchEduType();
  }, [branchId]);

  const selectedEducationLabel = useMemo(() => {
    if (dbEducationType) return dbEducationType;
    if (!educationFilter || educationFilter === "All" || educations.length === 0) return null;
    const edu = educations.find((e) => String(e.collegeEducationId) === String(educationFilter));
    return edu ? edu.collegeEducationType : null;
  }, [educationFilter, educations, dbEducationType]);

  const [activeProjectCounts, setActiveProjectCounts] = useState<Record<string, number>>({});

  const normalizedRole =
    role?.toLowerCase() === "admin" ? "admin" : "faculty";

  useEffect(() => {
    if (collegeEducationId && educationFilter === "All") {
      setEducationFilter(collegeEducationId.toString());
    }
  }, [collegeEducationId]);

  useEffect(() => {
    if (!userId) return;
    const loadEducations = async () => {
      try {
        let edus = await fetchAdminEducationTypes(userId);
        if ((!edus || edus.length === 0) && collegeId) {
          edus = await fetchEducations(collegeId);
        }
        setEducations(edus || []);
        if (collegeEducationId && edus) {
          const edu = edus.find((e: any) => e.collegeEducationId === collegeEducationId);
          if (edu) setEducation(edu);
        }
      } catch (err) {
        console.error("Failed to load educations", err);
      }
    };
    loadEducations();
  }, [userId, collegeId, collegeEducationId]);

  useEffect(() => {
    if (!userId || !educationFilter || educationFilter === "All") {
      setBranchOptions([]);
      setBranches([]);
      return;
    }

    const loadBranches = async () => {
      try {
        const data = await fetchBranchOptionsForAdmin(
          userId,
          Number(educationFilter)
        );

        setBranchOptions(
          data.map((b) => ({
            id: b.collegeBranchId,
            name: b.name,
            code: b.code,
          }))
        );

        setBranches(data);
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };

    loadBranches();
  }, [userId, educationFilter]);

  useEffect(() => {
    if (!userId || branches.length === 0) {
      setYearOptions([]);
      setBranchYearsMap({});
      return;
    }

    const loadYears = async () => {
      try {
        const results = await Promise.all(
          branches.map(async (b) => {
            const years = await fetchAcademicYearOptionsForAdmin(userId, b.collegeBranchId);
            return {
              branchId: b.collegeBranchId,
              years: years.map((y) => ({ id: y.value, label: y.label })),
            };
          })
        );

        const newMap: Record<number, { id: number; label: string }[]> = {};
        results.forEach((item) => {
          newMap[item.branchId] = item.years;
        });
        setBranchYearsMap(newMap);

        const allFlat = results.flatMap((r) => r.years);
        const uniqueYears = Array.from(
          new Map(allFlat.map((item) => [item.label, item])).values()
        );
        setYearOptions(uniqueYears);
      } catch (err) {
        console.error("Failed to load years", err);
      }
    };

    loadYears();
  }, [userId, branches]);

  const filteredCards = useMemo(() => {
    const cards = branches.flatMap((branch) => {
      const branchYears = branchYearsMap[branch.collegeBranchId] ?? [];
      const yearsToDisplay =
        yearFilter === "All"
          ? branchYears
          : branchYears.filter((y) => y.label === yearFilter);

      return yearsToDisplay.map((year) => ({
        branchId: branch.collegeBranchId,
        name: branch.code,
        year: year.label,
        yearId: year.id,
      }));
    });

    return cards.filter((card) =>
      branchFilter === "All"
        ? true
        : String(card.branchId) === branchFilter
    );
  }, [branches, branchYearsMap, branchFilter, yearFilter]);


  useEffect(() => {
    const loadCourses = async () => {
      if (!branchId || !yearId || !collegeId) return;

      try {
        setCourseLoading(true);

        const [data, projectStats] = await Promise.all([
          fetchSubjectFacultyList(Number(yearId), Number(branchId)),
          fetchAdminPendingStats(Number(yearId), collegeId)
        ]);

        const enrichedCourses = data.map((item: any) => {
          const key = `${Number(item.subjectId)}_${Number(item.facultyId)}`;
          const stats = projectStats ? projectStats[key] : null;

          return {
            ...item,
            activeProjectCount: stats ? stats.active : 0,
            pendingSubmissions: stats ? stats.pending : 0,
          };
        });

        const uniqueMap = new Map();
        enrichedCourses.forEach((item: any) => {
          const key = `${item.subjectId}_${item.facultyId}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        setCourseList(Array.from(uniqueMap.values()));
      } catch (err) {
        console.error("Failed to load enriched projects:", err);
      } finally {
        setCourseLoading(false);
      }
    };

    loadCourses();
  }, [branchId, yearId, collegeId]);


  useEffect(() => {
    const getAllOverviewCounts = async () => {
      if (!educationFilter || educationFilter === "All" || !collegeId || filteredCards.length === 0) return;

      try {
        setLoading(true);

        const results = await Promise.all(
          filteredCards.map(async (card) => {
            const [studentCount, facultyData, activeCount] = await Promise.all([
              fetchActiveStudentCount(Number(educationFilter), card.branchId, card.yearId),
              fetchActiveFacultyData(Number(educationFilter), card.branchId, card.yearId),
              fetchActiveProjectCountByBranchYear(collegeId, card.branchId, card.yearId),
            ]);

            return {
              branchId: card.branchId,
              yearId: card.yearId,
              studentCount,
              facultyCount: facultyData.count,
              facultyPhotos: facultyData.photos,
              activeProjectCount: activeCount,
            };
          })
        );

        setCountsData(results);
      } catch (err) {
        console.error("Error loading overview counts:", err);
      } finally {
        setLoading(false);
      }
    };

    getAllOverviewCounts();
  }, [filteredCards, educationFilter, collegeId]);


  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("dept");
    params.delete("year");
    params.delete("branchId");
    params.delete("yearId");
    params.delete("subjectId");
    params.delete("facultyId");
    params.delete("projectView");
    params.delete("subjectName");

    const query = params.toString();
    router.push(query ? `/admin/projects?${query}` : "/admin/projects");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F4F4] p-4 flex flex-col">
      {/* <WipOverlay fullHeight={true} /> */}
      <div className="flex w-full justify-between items-center">
        <ProjectsHeader
          title="Projects"
          subtitle="Create, manage, and track student projects effortlessly."
          showBack={Boolean(dept)}
          onBackClick={handleBack}
        />
        <div className="w-[350px]">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      {!dept ? (
        <>
          <div className="flex gap-4 mt-4">
            <FilterDropdown
              label="Education"
              value={educationFilter}
              options={educations.map((e) => ({
                label: e.collegeEducationType,
                value: e.collegeEducationId.toString()
              }))}
              onChange={(val) => {
                setEducationFilter(val);
                setBranchFilter("All");
                setYearFilter("All");
                const edu = educations.find((e) => e.collegeEducationId.toString() === val);
                if (edu) setEducation(edu);
              }}
            />

            <FilterDropdown
              label={education?.collegeEducationType === "Inter" ? "Group" : "Branch"}
              value={branchFilter}
              options={[
                { label: "All", value: "All" },
                ...branchOptions.map((b) => ({
                  label: b.code,
                  value: String(b.id),
                })),
              ]}
              onChange={(val) => {
                setBranchFilter(val);
                setYearFilter("All");
              }}
            />

            <FilterDropdown
              label="Year"
              value={yearFilter}
              disabled={yearOptions.length === 0}
              options={
                yearOptions.length === 0
                  ? [{ label: "Loading...", value: "loading" }]
                  : [
                    { label: "All", value: "All" },
                    ...yearOptions.map((y) => ({
                      label: y.label,
                      value: y.label,
                    })),
                  ]
              }
              onChange={(val) => setYearFilter(val)}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <DiscussionDeptCardSkeleton key={i} />
              ))
            ) : filteredCards.length > 0 ? (
              filteredCards.map((card, idx) => {
                const cardData = countsData.find(
                  (c) =>
                    c.branchId === card.branchId &&
                    c.yearId === card.yearId
                );

                const branchTheme = getBranchTheme(card.name);

                return (
                  <DiscussionDeptCard
                    key={`${card.branchId}-${card.year}-${idx}`}
                    name={card.name}
                    year={card.year}
                    branchId={card.branchId}
                    yearId={card.yearId}
                    text={branchTheme.text}
                    color={branchTheme.color}
                    bgColor={branchTheme.bgColor}
                    activeText="Active Projects"
                    activeCount={cardData ? cardData.activeProjectCount : 0}
                    students={cardData ? cardData.studentCount : 0}
                    facultyCount={cardData ? cardData.facultyCount : 0}
                    facultyPhotos={cardData ? cardData.facultyPhotos : []}
                  />
                );
              })
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <DiscussionDeptCardSkeleton key={i} />
              ))
            )}
          </div>
        </>
      ) : subjectId ? (
        <AdminProjectsList
          subjectId={subjectId}
          college_branch={selectedBranch?.code ?? null}
          collegeAcademicYear={selectedYear?.label ?? null}
          faculty_edu_type={selectedEducationLabel ?? null}
          subjectName={subjectName ?? null}
        />
      ) : (
        <>
          <div className="bg-pink-00 gap-5 w-full mx-auto">
            {courseLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DiscussionDeptCardSkeleton key={i} />
                ))}
              </div>
            ) : courseList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {courseList.map((course: any) => (
                  <DiscussionCourseCard
                    key={course.id}
                    id={course.subjectId}
                    subject={course.subject}
                    facultyName={course.facultyName}
                    facultyId={course.facultyId}
                    employeeId={course.employeeId}
                    avatar={course.avatar}
                    activeQuiz={course.activeQuiz || 0}
                    pendingSubmissions={course.pendingSubmissions}
                    buttonText="View Projects"
                    activeLabel="Active Projects"
                    branchId={Number(branchId)}
                    yearId={Number(yearId)}
                    role={normalizedRole}
                    dept={dept}
                    year={year}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400 italic">
                  No projects available for this branch/year.
                </p>
              </div>
            )}
          </div>
        </>
      )
      }
    </div >
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <ProjectsOverview />
    </Suspense>
  );
}
