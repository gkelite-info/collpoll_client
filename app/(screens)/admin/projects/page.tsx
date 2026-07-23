"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import ProjectsHeader from "./components/ProjectsHeader";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { fetchBranchOptionsForAdmin } from "@/lib/helpers/admin/collegeBranchAPI";
import { fetchAcademicYearOptionsForAdmin, fetchAcademicYearOptionsForAdminBulk } from "@/lib/helpers/admin/collegeAcademicYearAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { FilterDropdown } from "../assignments/components/filterDropdown";
import { fetchAdminEducationTypes, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { getBatchStudentCounts, getBatchFacultyData, getBatchProjectCounts } from "@/lib/helpers/admin/projectsOverviewAPI";
import { fetchSubjectFacultyList } from "@/lib/helpers/admin/facultyCountAPI";
import { getBranchTheme } from "../assignments/utils/palette";
import DiscussionDeptCard from "../assignments/components/discussionDeptCard";
import { DiscussionDeptCardSkeleton } from "../assignments/components/shimmers/DiscussionDeptCardSkeleton";
import { FilterBarSkeleton } from "../assignments/components/shimmers/FilterBarSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import DiscussionCourseCard from "../assignments/components/discussionCourseCard";
import AdminProjectsList from "./AdminProjectsList";
import { useUser } from "@/app/utils/context/UserContext";
import { Loader } from "../../(student)/calendar/right/timetable";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { supabase } from "@/lib/supabaseClient";
import { fetchAdminPendingStats } from "@/lib/helpers/projects/project";

function ProjectsOverview() {
  const { userId, collegeEducationId, collegeId, collegeEducationType, loading: adminLoading } = useAdmin();
  const { role } = useUser();
  const [countsData, setCountsData] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courseList, setCourseList] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const subjectId = searchParams.get("subjectId");
  const facultyId = searchParams.get("facultyId");
  const subjectName = searchParams.get("subjectName");

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const branchId = searchParams.get("branchId");
  const yearId = searchParams.get("yearId");

  const [educations, setEducations] = useState<any[]>([]);
  const [educationFilter, setEducationFilter] = useState<string>("All");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isFetchingCounts, setIsFetchingCounts] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
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
    if (!educationFilter || educationFilter === "All") {
      if (educations.length === 1) return educations[0].collegeEducationType;
      return collegeEducationType;
    }
    const edu = educations.find((e) => String(e.collegeEducationId) === String(educationFilter));
    return edu ? edu.collegeEducationType : collegeEducationType;
  }, [educationFilter, educations, dbEducationType, collegeEducationType]);

  const isEducationReady = educations.length > 0 && educationFilter !== "All";

  const [activeProjectCounts, setActiveProjectCounts] = useState<Record<string, number>>({});

  const normalizedRole =
    role?.toLowerCase() === "admin" ? "admin" : "faculty";

  const isSchool = isSchoolEducation(
    education?.collegeEducationType || collegeEducationType || "unknown"
  );

  // Load educations first, then auto-select based on what's actually available
  useEffect(() => {
    if (!userId) return;
    const loadEducations = async () => {
      try {
        let edus: any[] = [];
        if (collegeId) {
          edus = await fetchEducations(collegeId);
        } else {
          // Fallback just in case collegeId is missing but we have userId
          edus = await fetchAdminEducationTypes(userId);
        }

        const loadedEdus = edus || [];
        setEducations(loadedEdus);

        // Auto-select: prefer context education if it exists in loaded list, else first
        if (loadedEdus.length > 0) {
          let targetEdu = null;
          if (collegeEducationId) {
            targetEdu = loadedEdus.find((e: any) => e.collegeEducationId === collegeEducationId);
          }
          if (!targetEdu) {
            targetEdu = loadedEdus[0];
          }
          setEducationFilter(targetEdu.collegeEducationId.toString());
          setEducation(targetEdu);
        }
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Failed to load educations", err);
        setIsInitialLoad(false);
      }
    };
    loadEducations();
  }, [userId, collegeId, collegeEducationId]);

  useEffect(() => {
    if (!userId || !educationFilter || educationFilter === "All") {
      setBranchOptions([]);
      setBranches([]);
      setYearOptions([]);
      setBranchYearsMap({});
      return;
    }

    const loadMetadata = async () => {
      try {
        const branchData = await fetchBranchOptionsForAdmin(
          userId,
          Number(educationFilter)
        );

        setBranchOptions(
          branchData.map((b) => ({
            id: b.collegeBranchId,
            name: b.name,
            code: b.code,
          }))
        );

        setBranches(branchData);

        if (!isSchool && branchData.length === 0) {
          setYearOptions([]);
          setBranchYearsMap({});
          if (!isInitialLoad) {
            setIsMetadataLoaded(true);
          }
          return;
        }

        if (isSchool) {
          const years = await fetchAcademicYearOptionsForAdmin(userId, null);
          const uniqueYears = Array.from(
            new Map(years.map((item) => [item.label, item])).values()
          );
          setYearOptions(uniqueYears);
          setBranchYearsMap({ 0: years });
        } else {
          const branchIds = branchData.map((b) => b.collegeBranchId);
          const bulkYears = await fetchAcademicYearOptionsForAdminBulk(userId, branchIds);
          
          const results = branchData.map((b) => {
            const yearsForBranch = bulkYears.filter(y => y.collegeBranchId === b.collegeBranchId);
            return {
              branchId: b.collegeBranchId,
              years: yearsForBranch.map((y) => ({ id: y.collegeAcademicYearId, label: y.collegeAcademicYear })),
            };
          });

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
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      } finally {
        setIsMetadataLoaded(true);
        setIsMetadataLoading(false);
      }
    };

    loadMetadata();
  }, [userId, educationFilter, isSchool]);

  const filteredCards = useMemo(() => {
    if (isSchool) {
      const yearsToDisplay =
        yearFilter === "All"
          ? yearOptions
          : yearOptions.filter((y) => y.label === yearFilter);

      return yearsToDisplay.map((year) => ({
        branchId: null,
        name: selectedEducationLabel || "Class",
        year: year.label,
        yearId: year.id,
      }));
    }

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
  }, [branches, branchYearsMap, branchFilter, yearFilter, isSchool, yearOptions, selectedEducationLabel]);

  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * cardsPerPage;
    return filteredCards.slice(startIndex, startIndex + cardsPerPage);
  }, [filteredCards, currentPage, cardsPerPage]);


  useEffect(() => {
    const loadCourses = async () => {
      if (adminLoading) return;

      if (!yearId || !collegeId || (!isSchool && !branchId)) {
        setCourseLoading(false);
        return;
      }

      try {
        setCourseLoading(true);

        const [data, projectStats] = await Promise.all([
          fetchSubjectFacultyList(Number(yearId), branchId ? Number(branchId) : null),
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
  }, [branchId, yearId, collegeId, adminLoading, isSchool]);


  useEffect(() => {
    if (isMetadataLoaded && filteredCards.length === 0) {
      setIsPageReady(true);
    }
  }, [isMetadataLoaded, filteredCards.length]);

  useEffect(() => {
    const getAllOverviewCounts = async () => {
      if (!educationFilter || !collegeId || isMetadataLoading) return;

      if (paginatedCards.length === 0) {
        if (isMetadataLoaded && !isMetadataLoading) {
          setIsFetchingCounts(false);
          setIsPageReady(true);
        }
        return;
      }

      try {
        setIsFetchingCounts(true);

        const cardKeys = paginatedCards.map((card) => ({
          branchId: card.branchId,
          yearId: card.yearId,
        }));

        // 3 bulk queries instead of N*3 individual queries
        const [studentCountsMap, facultyDataMap, projectCountsMap] = await Promise.all([
          getBatchStudentCounts(Number(educationFilter), cardKeys),
          getBatchFacultyData(Number(educationFilter), cardKeys),
          getBatchProjectCounts(collegeId, cardKeys),
        ]);

        const results = paginatedCards.map((card) => {
          const key = `${card.branchId ?? "null"}-${card.yearId}`;
          const facultyInfo = facultyDataMap.get(key) ?? { count: 0, photos: [] };

          return {
            branchId: card.branchId,
            yearId: card.yearId,
            studentCount: studentCountsMap.get(key) ?? 0,
            facultyCount: facultyInfo.count,
            facultyPhotos: facultyInfo.photos,
            activeProjectCount: projectCountsMap.get(key) ?? 0,
          };
        });

        setCountsData(results);
      } catch (err) {
        console.error("Error loading overview counts:", err);
      } finally {
        setIsFetchingCounts(false);
        setIsPageReady(true);
      }
    };

    getAllOverviewCounts();
  }, [paginatedCards, educationFilter, collegeId, isMetadataLoading]);


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
    <div className="relative min-h-screen bg-[#F4F4F4] p-4 flex flex-col">
      <div className="flex flex-col md:flex-row w-full justify-between items-center md:items-start gap-4">
        <div className="order-2 md:order-1 w-full">
          <ProjectsHeader
            title="Projects"
            subtitle="Create, manage, and track student projects effortlessly."
            showBack={Boolean(dept)}
            onBackClick={handleBack}
          />
        </div>
        <div className="order-1 md:order-2 w-full md:w-[350px] flex justify-end">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      {!dept ? (
        <>
          {!isPageReady ? (
            <>
              <FilterBarSkeleton />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DiscussionDeptCardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 mt-4 w-full">
                <FilterDropdown
                  label="Education"
                  value={educationFilter}
                  options={educations.map((e) => ({
                    label: e.collegeEducationType,
                    value: e.collegeEducationId.toString()
                  }))}
                  onChange={(val) => {
                    setIsMetadataLoading(true);
                    setIsFetchingCounts(true);
                    setCurrentPage(1);
                    setEducationFilter(val);
                    setBranchFilter("All");
                    setYearFilter("All");
                    setBranches([]);
                    setYearOptions([]);
                    setBranchOptions([]);
                    setBranchYearsMap({});
                    const edu = educations.find((e) => e.collegeEducationId.toString() === val);
                    if (edu) setEducation(edu);
                    else setEducation(null);
                  }}
                />

                {!isSchool && isEducationReady && (
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
                      setIsFetchingCounts(true);
                      setCurrentPage(1);
                      setBranchFilter(val);
                      setYearFilter("All");
                    }}
                  />
                )}

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
                  onChange={(val) => {
                    setIsFetchingCounts(true);
                    setCurrentPage(1);
                    setYearFilter(val);
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between mt-4">
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
                  {isFetchingCounts || isMetadataLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <DiscussionDeptCardSkeleton key={i} />
                    ))
                  ) : paginatedCards.length > 0 ? (
                    paginatedCards.map((card, idx) => {
                      const cardData = countsData.find(
                        (c) =>
                          String(c.branchId) === String(card.branchId) &&
                          String(c.yearId) === String(card.yearId)
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
                          isSchool={isSchool}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-[10px] border border-gray-100">
                      <p className="text-[#282828] font-bold text-[18px]">No Projects Found</p>
                      <p className="text-[#727272] text-[14px] mt-1">There are no active projects for the selected filters.</p>
                    </div>
                  )}
                </div>

                {!isFetchingCounts && filteredCards.length > 0 && (
                  <div className="flex justify-center items-center mt-6 mb-4 w-full max-w-[1200px] mx-auto rounded-lg shadow-sm">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredCards.length}
                      itemsPerPage={cardsPerPage}
                      onPageChange={(p) => {
                        setIsFetchingCounts(true);
                        setCurrentPage(p);
                      }}
                      alwaysShow={true}
                      roundedBottom="rounded-lg"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : subjectId ? (
        <AdminProjectsList
          subjectId={subjectId}
          college_branch={!isSchool ? (dept ?? selectedBranch?.code ?? null) : null}
          collegeAcademicYear={year ?? selectedYear?.label ?? null}
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
              <div className="col-span-full py-20 sm:py-40 text-center">
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
