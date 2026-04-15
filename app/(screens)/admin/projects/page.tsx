"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import ProjectsHeader from "./components/ProjectsHeader";
import FacultyAcademicCard from "./components/facultyAcademicCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WipOverlay from "@/app/utils/WipOverlay";
import { fetchBranchOptionsForAdmin } from "@/lib/helpers/admin/collegeBranchAPI";
import { fetchAcademicYearOptionsForAdmin } from "@/lib/helpers/admin/collegeAcademicYearAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { FilterDropdown } from "../assignments/components/filterDropdown";
import { fetchActiveStudentCount } from "@/lib/helpers/admin/studentsCountAPI";
import { fetchActiveFacultyData, fetchActiveProjectCountByBranchYear, fetchSubjectFacultyList } from "@/lib/helpers/admin/facultyCountAPI";
import { getBranchTheme } from "../assignments/utils/palette";
import DiscussionDeptCard from "../assignments/components/discussionDeptCard";
import { DiscussionDeptCardSkeleton } from "../assignments/components/shimmers/DiscussionDeptCardSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import DiscussionCourseCard from "../assignments/components/discussionCourseCard";
import AdminProjectsList from "./AdminProjectsList";
import { useUser } from "@/app/utils/context/UserContext";

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

  const [branchOptions, setBranchOptions] = useState<
    { id: number; name: string; code: string }[]
  >([]);

  const [yearOptions, setYearOptions] = useState<
    { id: number; label: string }[]
  >([]);

  const [branches, setBranches] = useState<any[]>([]);
  const selectedBranch = branchOptions.find(b => String(b.id) === branchId);
  const selectedYear = yearOptions.find(y => String(y.id) === yearId);

  const [activeProjectCounts, setActiveProjectCounts] = useState<Record<string, number>>({});

  const normalizedRole =
    role?.toLowerCase() === "admin" ? "admin" : "faculty";

  // ✅ Load branches
  useEffect(() => {
    if (!userId || !collegeEducationId) return;

    const loadBranches = async () => {
      try {
        const data = await fetchBranchOptionsForAdmin(
          userId,
          collegeEducationId
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
  }, [userId, collegeEducationId]);

  // ✅ Load years (handles ALL case 🔥)
  useEffect(() => {
    if (!userId || branches.length === 0) return;

    const loadYears = async () => {
      try {
        if (branchFilter !== "All") {
          const years = await fetchAcademicYearOptionsForAdmin(
            userId,
            Number(branchFilter)
          );

          setYearOptions(
            years.map((y) => ({
              id: y.value,
              label: y.label,
            }))
          );
        } else {
          // ALL branches years
          const allYearsRequests = branches.map((b) =>
            fetchAcademicYearOptionsForAdmin(
              userId,
              b.collegeBranchId
            )
          );

          const results = await Promise.all(allYearsRequests);

          const flatYears = results
            .flat()
            .map((y) => ({ id: y.value, label: y.label }));

          const uniqueYears = Array.from(
            new Map(flatYears.map((item) => [item.label, item])).values()
          );

          setYearOptions(uniqueYears);
        }
      } catch (err) {
        console.error("Failed to load years", err);
      }
    };

    loadYears();
  }, [branchFilter, userId, branches]);

  // ✅ Filtering logic (same as discussion forum)
  const filteredCards = useMemo(() => {
    const cards = branches.flatMap((branch) => {
      const yearsToDisplay =
        yearFilter === "All"
          ? yearOptions
          : yearOptions.filter((y) => String(y.id) === yearFilter);

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
  }, [branches, yearOptions, branchFilter, yearFilter]);

  useEffect(() => {
    const getCounts = async () => {
      if (!collegeEducationId || filteredCards.length === 0) return;

      try {
        setLoading(true);

        const results = await Promise.all(
          filteredCards.map(async (card) => {
            const [studentCount, facultyData] = await Promise.all([
              fetchActiveStudentCount(
                collegeEducationId,
                card.branchId,
                card.yearId
              ),
              fetchActiveFacultyData(
                collegeEducationId,
                card.branchId,
                card.yearId
              ),
            ]);

            return {
              branchId: card.branchId,
              yearId: card.yearId,
              studentCount,
              facultyCount: facultyData.count,
              facultyPhotos: facultyData.photos,
            };
          })
        );

        setCountsData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCounts();
  }, [filteredCards, collegeEducationId]);

  useEffect(() => {
    const loadCourses = async () => {
      if (!branchId || !yearId) return;

      try {
        setCourseLoading(true);

        // 👉 replace with your API
        const data = await fetchSubjectFacultyList(
          Number(yearId),
          Number(branchId)
        );

        // 🔥 remove duplicates
        const uniqueMap = new Map();

        data.forEach((item: any) => {
          const key = `${item.subject}-${item.facultyId}`; // unique combo

          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        const uniqueData = Array.from(uniqueMap.values());

        setCourseList(uniqueData);

      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setCourseLoading(false);
      }
    };

    loadCourses();
  }, [branchId, yearId]);

  useEffect(() => {
    const getCounts = async () => {
      if (!collegeEducationId || !collegeId || filteredCards.length === 0) return;

      try {
        setLoading(true);

        const results = await Promise.all(
          filteredCards.map(async (card) => {
            const [studentCount, facultyData, activeCount] = await Promise.all([
              fetchActiveStudentCount(
                collegeEducationId,
                card.branchId,
                card.yearId
              ),
              fetchActiveFacultyData(
                collegeEducationId,
                card.branchId,
                card.yearId
              ),
              // ✅ fetch real active project count
              fetchActiveProjectCountByBranchYear(
                collegeId,
                card.branchId,
                card.yearId
              ),
            ]);

            return {
              branchId: card.branchId,
              yearId: card.yearId,
              studentCount,
              facultyCount: facultyData.count,
              facultyPhotos: facultyData.photos,
              activeProjectCount: activeCount, // ✅
            };
          })
        );

        setCountsData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCounts();
  }, [filteredCards, collegeEducationId, collegeId]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("dept");
    params.delete("year");
    params.delete("branchId");
    params.delete("yearId");

    router.push("/admin/projects");
  };

  return (
    <div className="relative overflow-hidden p-4 flex flex-col">
      {/* <WipOverlay fullHeight={true} /> */}

      {/* Header */}
      <div className="flex w-full justify-between items-center">
        <ProjectsHeader />
        <div className="w-[350px]">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      {!dept ? (
        <>
          <div className="flex gap-4 mt-4">
            <FilterDropdown
              label="Branch"
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
                      value: String(y.id),
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
        <AdminProjectsList subjectId={subjectId}
          college_branch={selectedBranch?.code ?? null}
          collegeAcademicYear={selectedYear?.label ?? null}
          faculty_edu_type={dept ?? null}
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
                    id={course.id}
                    subject={course.subject}
                    facultyName={course.facultyName}
                    facultyId={course.facultyId}
                    avatar={course.avatar}
                    activeQuiz={course.activeQuiz || 0}
                    pendingSubmissions={course.pendingSubmissions || 0}
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
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectsOverview />
    </Suspense>
  );
}