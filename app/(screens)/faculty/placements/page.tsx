"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import TaskPanel from "@/app/utils/taskPanel";
import { CaretLeftIcon, CaretRight, X } from "@phosphor-icons/react";

import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getPlacementCompanies } from "@/lib/helpers/placements/getPlacementCompanies";
import { fetchAdminPlacementFilterOptions } from "@/lib/helpers/placements/getPlacementFilterOptions";
import type { PlacementCompany } from "@/app/(screens)/placement/placements/components/mockData";
import PlacementFilters, {
  placementSortOptions,
  placementStatusOptions,
} from "@/app/(screens)/admin/placements/components/PlacementFilters";
import PlacementList from "@/app/(screens)/admin/placements/components/PlacementList";
import Announcements from "./compounents/Announcement";

function getPlacementCycle(company: PlacementCompany) {
  return company.startDate
    ? new Date(`${company.startDate}T00:00:00`).getFullYear().toString()
    : "";
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
        className="relative max-h-[82vh] w-full max-w-[640px] overflow-y-auto rounded-[10px] bg-white px-9 py-8 shadow-2xl"
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
    <div className="shrink-0 space-y-4">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
      <div className="flex w-full flex-nowrap items-center gap-6 overflow-hidden pb-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex shrink-0 items-center gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-36 animate-pulse rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function FacultyPlacementRightShimmer() {
  return (
    <div className="w-[32%] shrink-0 p-1 pt-0 pr-0">
      <div className="mb-3 h-[86px] animate-pulse rounded-xl bg-gray-200" />
      <div className="mb-3 h-[220px] animate-pulse rounded-xl bg-gray-200" />
      <div className="mb-3 h-[220px] animate-pulse rounded-xl bg-gray-200" />
      <div className="h-[320px] animate-pulse rounded-xl bg-gray-200" />
    </div>
  );
}

export default function PlacementsPage() {
  const { collegeId, loading: facultyLoading } = useFaculty();
  const [placements, setPlacements] = useState<PlacementCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLoadingKey, setFilterLoadingKey] = useState<
    "cycle" | "branch" | "status" | "sort" | null
  >(null);
  const [serverCycles, setServerCycles] = useState<string[]>([]);
  const [serverBranches, setServerBranches] = useState<string[]>([]);
  const [cycle, setCycle] = useState("");
  const [branch, setBranch] = useState("All");
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

  useEffect(() => {
    if (facultyLoading) return;

    if (!collegeId) {
      setPlacements([]);
      setTotalRecords(0);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadPlacements = async () => {
      setIsLoading(true);
      try {
        const data = await getPlacementCompanies({
          collegeId,
          includeExpired: true,
          page: currentPage,
          pageSize: rowsPerPage,
          cycle,
          branchName: branch,
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
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPlacements();

    return () => {
      isMounted = false;
    };
  }, [branch, collegeId, currentPage, cycle, facultyLoading, sortBy, status]);

  const loadFilterOptions = useCallback(
    async (loadingKey: "cycle" | "branch" | "status" | "sort") => {
      if (!collegeId) return;

      const startedAt = Date.now();
      setFilterLoadingKey(loadingKey);
      try {
        const options = await fetchAdminPlacementFilterOptions(collegeId);
        setServerCycles(options.cycles);
        setServerBranches(options.branches);
      } catch (error) {
        console.error("Failed to refresh faculty placement filter options:", error);
      } finally {
        const remainingDelay = 350 - (Date.now() - startedAt);
        if (remainingDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingDelay));
        }
        setFilterLoadingKey(null);
      }
    },
    [collegeId],
  );

  const handleCycleChange = (value: string) => {
    setCurrentPage(1);
    setCycle(value);
    void loadFilterOptions("cycle");
  };

  const handleBranchChange = (value: string) => {
    setCurrentPage(1);
    setBranch(value);
    void loadFilterOptions("branch");
  };

  const handleStatusChange = (value: (typeof placementStatusOptions)[number]) => {
    setCurrentPage(1);
    setStatus(value);
    void loadFilterOptions("status");
  };

  const handleSortChange = (value: (typeof placementSortOptions)[number]) => {
    setCurrentPage(1);
    setSortBy(value);
    void loadFilterOptions("sort");
  };

  const cycles = useMemo(() => {
    const placementYears = placements.map(getPlacementCycle).filter(Boolean);
    const currentYear = new Date().getFullYear();
    const defaultYears = Array.from(
      new Set([
        "2025",
        String(currentYear - 1),
        String(currentYear),
        String(currentYear + 1),
        String(currentYear + 2),
      ]),
    );

    return Array.from(new Set([...defaultYears, ...placementYears, ...serverCycles])).sort(
      (a, b) => Number(b) - Number(a),
    );
  }, [placements, serverCycles]);

  useEffect(() => {
    const currentYear = String(new Date().getFullYear());

    if (!cycle && cycles.length > 0) {
      setCycle(cycles.includes(currentYear) ? currentYear : cycles[0]);
    } else if (Number(cycle) > Number(currentYear)) {
      setCycle(currentYear);
    } else if (cycle && !cycles.includes(cycle)) {
      setCycle(cycles.includes(currentYear) ? currentYear : cycles[0]);
    }
  }, [cycle, cycles]);

  const branches = useMemo(() => {
    const placementBranches = placements
      .map((placement) => placement.branchName)
      .filter((item): item is string => Boolean(item));

    return Array.from(new Set([...placementBranches, ...serverBranches])).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [placements, serverBranches]);

  useEffect(() => {
    if (branch !== "All" && !branches.includes(branch)) {
      setBranch("All");
    }
  }, [branch, branches]);

  const pageLoading = facultyLoading || isLoading;
  const filterRefreshing = filterLoadingKey !== null;

  return (
    <section className="flex h-screen gap-1 overflow-hidden pb-4">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden pl-2 pr-1">
        {pageLoading ? (
          <FacultyPlacementHeaderShimmer />
        ) : (
          <div className="shrink-0">
            <h1 className="text-2xl font-semibold text-black">Placements</h1>
            <p className="text-sm text-black">
              Track, Manage, and Maintain Student Placement Status
            </p>

            <PlacementFilters
              cycle={cycle}
              cycles={cycles}
              branch={branch}
              branches={branches}
              status={status}
              sortBy={sortBy}
              isCycleLoading={filterLoadingKey === "cycle"}
              isBranchLoading={filterLoadingKey === "branch"}
              isStatusLoading={filterLoadingKey === "status"}
              isSortLoading={filterLoadingKey === "sort"}
              onCycleChange={handleCycleChange}
              onBranchChange={handleBranchChange}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
            />
          </div>
        )}

        <div className="mt-2 flex-1 overflow-y-auto pb-4 pr-1">
          <PlacementList
            placements={placements}
            isLoading={facultyLoading || isLoading || filterRefreshing}
            cycle={cycle}
            onPlacementClick={setSelectedPlacement}
          />

          {!pageLoading && !filterRefreshing && totalPages > 1 && (
            <div className="mb-2 mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  currentPage === 1
                    ? "cursor-not-allowed border-gray-200 text-gray-300"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CaretLeftIcon size={18} weight="bold" />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 rounded-lg font-semibold transition ${
                      currentPage === page
                        ? "bg-[#16284F] text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  currentPage === totalPages
                    ? "cursor-not-allowed border-gray-200 text-gray-300"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>

      {pageLoading ? (
        <FacultyPlacementRightShimmer />
      ) : (
        <div className="sticky top-0 flex h-screen w-[32%] shrink-0 flex-col gap-2 p-1 pt-0 pr-0">
          <CourseScheduleCard />
          <WorkWeekCalendar />
          <div className="flex w-full flex-col gap-2 overflow-y-auto pb-4">
            <TaskPanel style={true} />
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
