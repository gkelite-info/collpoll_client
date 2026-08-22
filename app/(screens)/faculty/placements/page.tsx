"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInstitutionTerminology } from "@/app/utils/hooks/useInstitutionTerminology";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import TaskPanel from "@/app/utils/taskPanel";
import type { Task } from "@/app/utils/taskPanel";
import { CaretLeftIcon, CaretRight, X } from "@phosphor-icons/react";

import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import {
  fetchFacultyTasksForLoggedInFaculty,
  saveFacultyTask,
} from "@/lib/helpers/faculty/facultyTasks";
import type { FacultyTaskRow } from "@/lib/helpers/faculty/facultyTasks";
import { getPlacementCompanies } from "@/lib/helpers/placements/getPlacementCompanies";
import { fetchAdminPlacementFilterOptions } from "@/lib/helpers/placements/getPlacementFilterOptions";
import type { PlacementCompany } from "@/app/(screens)/placement/placements/components/mockData";
import PlacementFilters, {
  placementSortOptions,
  placementStatusOptions,
} from "@/app/(screens)/admin/placements/components/PlacementFilters";
import PlacementList from "@/app/(screens)/admin/placements/components/PlacementList";
import Announcements from "./compounents/Announcement";

import {
  fetchEducations,
  fetchBranches,
  fetchAcademicYears,
} from "@/lib/helpers/admin/academics/academicDropdowns";

type FacultyTaskSummary = Pick<
  FacultyTaskRow,
  "facultyTaskId" | "taskTitle" | "description" | "time" | "date"
>;

function getAttachmentName(attachment: string) {
  const cleanAttachment = attachment.split("?")[0];
  return decodeURIComponent(cleanAttachment.split("/").pop() || attachment);
}

function getWebsiteHref(website: string) {
  const trimmedWebsite = website.trim();
  if (!trimmedWebsite) return "";

  return /^https?:\/\//i.test(trimmedWebsite)
    ? trimmedWebsite
    : `https://${trimmedWebsite}`;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-5 text-[14px] leading-6 text-[#333333]">
      <span className="font-medium text-[#262626]">{label} :</span>
      <div>{children}</div>
    </div>
  );
}

function formatDisplayDate(date?: string) {
  if (!date) return "-";

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function PlacementDetailsModal({
  company,
  onClose,
}: {
  company: PlacementCompany;
  onClose: () => void;
}) {
  const websiteHref = getWebsiteHref(company.website);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[82vh] max-md:max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[10px] bg-white px-9 py-8 max-md:px-4 max-md:py-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F6] text-[#4B5563] transition hover:bg-[#E5E7EB]"
          aria-label="Close placement details"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#262626]">
              {company.name}
            </h2>
            <p className="mt-0.5 text-[14px] text-[#333333]">{company.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow label="Company Name">{company.name}</DetailRow>
          <DetailRow label="Description">{company.longDescription}</DetailRow>
          <DetailRow label="Email">{company.email || "-"}</DetailRow>
          <DetailRow label="Contact No.">{company.phone || "-"}</DetailRow>
          <DetailRow label="Website">
            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="text-[#43C17A] underline-offset-2 transition hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {company.website}
              </a>
            ) : (
              "-"
            )}
          </DetailRow>
          <DetailRow label="Required Skills">
            {company.skills.join(", ") || "-"}
          </DetailRow>
          <DetailRow label="Roles Offered">{company.role || "-"}</DetailRow>
          <DetailRow label="Package Details">
            {company.packageDetails || "-"}
          </DetailRow>
          <DetailRow label="Drive Type">{company.driveType || "-"}</DetailRow>
          <DetailRow label="Work Mode">{company.workMode || "-"}</DetailRow>
          <DetailRow label="Start Date">
            {formatDisplayDate(company.startDate)}
          </DetailRow>
          <DetailRow label="End Date">
            {formatDisplayDate(company.endDate)}
          </DetailRow>
          <DetailRow label="Status">
            {company.isExpired ? "Completed" : "Open"}
          </DetailRow>
          <DetailRow label="Criteria">
            {company.eligibilityCriteria || "-"}
          </DetailRow>
          <DetailRow label="Education Type">
            {company.educationTypeName || company.collegeEducationId || "-"}
          </DetailRow>
          <DetailRow label="Branch Name">
            {company.branchName || company.collegeBranchId || "-"}
          </DetailRow>
          <DetailRow label="Academic Year">
            {company.academicYear || company.collegeAcademicYearId || "-"}
          </DetailRow>
          <DetailRow label="Job Type">
            {company.tags[0] || company.jobTypeValue || "-"}
          </DetailRow>
          <DetailRow label="Location(s)">
            {company.locations.join(", ") || "-"}
          </DetailRow>
          <DetailRow label="Documents">
            <div className="flex flex-wrap gap-2">
              {company.attachments.length > 0 ? (
                company.attachments.map((attachment) => (
                  <a
                    key={attachment}
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#E8F8EF] px-3 py-1 text-[12px] font-medium text-[#43C17A] transition hover:bg-[#D9F3E5] hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {getAttachmentName(attachment)}
                  </a>
                ))
              ) : (
                "-"
              )}
            </div>
          </DetailRow>
        </div>
      </div>
    </div>
  );
}

function FacultyPlacementHeaderShimmer() {
  return (
    <div className="shrink-0 space-y-4 mt-2 mb-2 max-md:mt-0 max-md:mb-0">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
      <div className="flex w-full flex-nowrap items-center gap-6 overflow-hidden pb-3 mt-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex shrink-0 items-center gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-[26px] w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-4 w-24 animate-pulse rounded bg-[#43C17A]/30 mt-2" />
    </div>
  );
}

function FacultyPlacementRightShimmer() {
  return (
    <div className="w-[32%] shrink-0 p-1 pt-0 pr-0 max-md:hidden">
      <div className="mb-3 h-[86px] animate-pulse rounded-xl bg-gray-200" />
      <div className="mb-3 h-[220px] animate-pulse rounded-xl bg-gray-200" />
      <div className="mb-3 h-[220px] animate-pulse rounded-xl bg-gray-200" />
      <div className="h-[320px] animate-pulse rounded-xl bg-gray-200" />
    </div>
  );
}

export default function PlacementsPage() {
  const {
    collegeId,
    facultyId,
    subjectIds,
    loading: facultyLoading,
  } = useFaculty();
  const { isSchool } = useInstitutionTerminology();
  const [placements, setPlacements] = useState<PlacementCompany[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [filterLoadingKey, setFilterLoadingKey] = useState<
    "education" | "branch" | "academicYear" | "status" | "sort" | null
  >(null);

  const [educations, setEducations] = useState<{ id: number; label: string }[]>([]);
  const [branches, setBranches] = useState<{ id: number; label: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: number; label: string }[]>([]);

  const [educationTypeId, setEducationTypeId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [status, setStatus] =
    useState<(typeof placementStatusOptions)[number]>("All");
  const [sortBy, setSortBy] =
    useState<(typeof placementSortOptions)[number]>("Recently Uploaded");
  const [selectedPlacement, setSelectedPlacement] =
    useState<PlacementCompany | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const collegeSubjectId = subjectIds?.[0] ?? null;

  const loadTasks = useCallback(async () => {
    if (!collegeSubjectId || !facultyId) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    try {
      setTasksLoading(true);
      const res = await fetchFacultyTasksForLoggedInFaculty({
        facultyId,
        collegeSubjectId,
      });

      setTasks(
        res.data.map((task: FacultyTaskSummary) => ({
          facultyTaskId: task.facultyTaskId,
          title: task.taskTitle,
          description: task.description,
          time: task.time,
          date: task.date,
        })),
      );
    } catch (error) {
      console.error("Failed to load faculty placement tasks", error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [collegeSubjectId, facultyId]);

  const handleSaveTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number,
  ) => {
    if (!collegeSubjectId || !facultyId) {
      throw new Error("Faculty or subject details are unavailable");
    }

    const res = await saveFacultyTask(
      {
        facultyTaskId: taskId,
        collegeSubjectId,
        taskTitle: payload.title,
        description: payload.description,
        date: payload.dueDate,
        time: payload.dueTime,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSectionsId: payload.collegeSectionsId,
      },
      facultyId,
    );

    if (!res.success) {
      throw new Error("Save failed");
    }

    await loadTasks();
  };

  useEffect(() => {
    if (!facultyLoading) {
      void loadTasks();
    }
  }, [facultyLoading, loadTasks]);

  useEffect(() => {
    if (facultyLoading) return;

    if (!collegeId) {
      setPlacements([]);
      setTotalRecords(0);
      setIsInitialLoad(false);
      setIsListLoading(false);
      return;
    }

    let isMounted = true;

    const loadPlacements = async () => {
      setIsListLoading(true);
      try {
        const data = await getPlacementCompanies({
          collegeId,
          includeExpired: true,
          page: currentPage,
          pageSize: rowsPerPage,
          educationTypeId,
          branchId,
          academicYearId,
          status,
          sortBy,
        });

        if (isMounted) {
          setPlacements(data.data);
          setTotalRecords(data.totalCount);
        }
      } catch (error) {
        console.error("Failed to load faculty placements", error);
        if (isMounted) {
          setPlacements([]);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted) {
          setIsListLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    void loadPlacements();

    return () => {
      isMounted = false;
    };
  }, [educationTypeId, branchId, academicYearId, collegeId, currentPage, facultyLoading, sortBy, status]);

  const loadEducations = useCallback(async () => {
    if (!collegeId) return;
    setFilterLoadingKey("education");
    try {
      const data = await fetchEducations(collegeId);
      setEducations(
        data.map((item: any) => ({
          id: item.collegeEducationId,
          label: item.collegeEducationType || "Unknown",
        })),
      );
    } catch (error) {
      console.error("Failed to load educations:", error);
    } finally {
      setFilterLoadingKey(null);
    }
  }, [collegeId]);

  const loadBranches = useCallback(async (eduId: number) => {
    if (!collegeId) return;
    setFilterLoadingKey("branch");
    try {
      const data = await fetchBranches(collegeId, eduId);
      setBranches(
        data.map((item: any) => ({
          id: item.collegeBranchId,
          label: item.collegeBranchType || item.collegeBranchCode || "Unknown",
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
    } finally {
      setFilterLoadingKey(null);
    }
  }, [collegeId]);

  const loadAcademicYears = useCallback(async (eduId: number, branchId: number | null) => {
    if (!collegeId) return;
    setFilterLoadingKey("academicYear");
    try {
      const data = await fetchAcademicYears(collegeId, eduId, branchId);
      setAcademicYears(
        data.map((item: any) => ({
          id: item.collegeAcademicYearId,
          label: item.collegeAcademicYear || "Unknown",
        })),
      );
    } catch (error) {
      console.error("Failed to load academic years:", error);
    } finally {
      setFilterLoadingKey(null);
    }
  }, [collegeId]);

  const handleEducationOpen = () => {
    if (educations.length === 0) void loadEducations();
  };

  const handleBranchOpen = () => {
    if (branches.length === 0 && educationTypeId) void loadBranches(educationTypeId);
  };

  const handleAcademicYearOpen = () => {
    if (academicYears.length === 0 && educationTypeId) void loadAcademicYears(educationTypeId, branchId);
  };

  const handleEducationChange = (value: number | null) => {
    setCurrentPage(1);
    setEducationTypeId(value);
    setBranchId(null);
    setAcademicYearId(null);
    setBranches([]);
    setAcademicYears([]);
    if (value) {
      void loadBranches(value);
      void loadAcademicYears(value, null);
    }
  };

  const handleBranchChange = (value: number | null) => {
    setCurrentPage(1);
    setBranchId(value);
    setAcademicYearId(null);
    setAcademicYears([]);
    if (educationTypeId) {
      void loadAcademicYears(educationTypeId, value);
    }
  };

  const handleAcademicYearChange = (value: number | null) => {
    setCurrentPage(1);
    setAcademicYearId(value);
  };

  const handleStatusChange = (value: (typeof placementStatusOptions)[number]) => {
    setCurrentPage(1);
    setStatus(value);
  };

  const handleSortChange = (value: (typeof placementSortOptions)[number]) => {
    setCurrentPage(1);
    setSortBy(value);
  };

  const pageLoading = facultyLoading || isInitialLoad;
  const filterRefreshing = filterLoadingKey !== null;

  return (
    <section className="custom-scrollbar flex h-full w-full min-w-0 gap-1 overflow-x-hidden overflow-y-scroll pb-4 max-md:p-0 max-md:bg-[#F4F5F6]">
      <div className="relative flex min-w-0 flex-1 flex-col pl-2 pr-1 max-md:px-4 max-md:pt-4">
        {pageLoading ? (
          <FacultyPlacementHeaderShimmer />
        ) : (
          <div className="shrink-0 max-md:mb-2">
            <h1 className="text-2xl font-semibold text-black max-md:text-[22px]">Placements</h1>
            <p className="text-sm text-black max-md:hidden">
              Track, Manage, and Maintain Student Placement Status
            </p>
            <div className="shrink-0 pt-1">
            <PlacementFilters
              isSchool={isSchool}
              educationTypeId={educationTypeId}
              educations={educations}
              branchId={branchId}
              branches={branches}
              academicYearId={academicYearId}
              academicYears={academicYears}
              status={status}
              sortBy={sortBy}
              isEducationLoading={filterLoadingKey === "education"}
              isBranchLoading={filterLoadingKey === "branch"}
              isAcademicYearLoading={filterLoadingKey === "academicYear"}
              isStatusLoading={filterLoadingKey === "status"}
              isSortLoading={filterLoadingKey === "sort"}
              onEducationChange={handleEducationChange}
              onEducationOpen={handleEducationOpen}
              onBranchChange={handleBranchChange}
              onBranchOpen={handleBranchOpen}
              onAcademicYearChange={handleAcademicYearChange}
              onAcademicYearOpen={handleAcademicYearOpen}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
            />
          </div>
          </div>
        )}

        <div className="mt-2 flex-1 pb-4 pr-1 max-md:mt-0 max-md:pr-0">
          <PlacementList
            placements={placements}
            isLoading={facultyLoading || isListLoading || filterRefreshing}
            cycle=""
            onPlacementClick={setSelectedPlacement}
          />

          {!pageLoading && !filterRefreshing && totalRecords > rowsPerPage && (
            <div className="mb-2 mt-5">
              <Pagination
                currentPage={currentPage}
                totalItems={totalRecords}
                itemsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                bgClassName="bg-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {pageLoading ? (
        <FacultyPlacementRightShimmer />
      ) : (
        <div className="sticky top-0 flex h-fit w-[32%] shrink-0 flex-col gap-2 p-1 pt-0 pr-0 max-md:hidden">
          <CourseScheduleCard />
          <WorkWeekCalendar />
          <div className="flex w-full flex-col gap-2 pb-4">
            <TaskPanel
              role="faculty"
              style={true}
              facultyTasks={tasksLoading ? [] : tasks}
              loading={tasksLoading}
              collegeSubjectId={collegeSubjectId ?? undefined}
              facultyId={facultyId ?? undefined}
              onAddTask={() => { }}
              onSaveTask={handleSaveTask}
              onDeleteTask={async () => {
                await loadTasks();
              }}
            />
            <Announcements />
          </div>
        </div>
      )}

      {selectedPlacement && (
        <PlacementDetailsModal
          company={selectedPlacement}
          onClose={() => setSelectedPlacement(null)}
        />
      )}
    </section>
  );
}
