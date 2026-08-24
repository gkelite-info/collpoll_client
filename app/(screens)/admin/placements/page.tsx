"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInstitutionTerminology } from "@/app/utils/hooks/useInstitutionTerminology";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { CaretLeftIcon, CaretRight, X } from "@phosphor-icons/react";

import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { getPlacementCompanies } from "@/lib/helpers/placements/getPlacementCompanies";
import type { PlacementCompany } from "@/app/(screens)/placement/placements/components/mockData";
import PlacementFilters, {
    placementSortOptions,
    placementStatusOptions,
} from "./components/PlacementFilters";
import PlacementList from "./components/PlacementList";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import Announcements from "./components/Announcements";

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

import {
  fetchEducations,
  fetchBranches,
  fetchAcademicYears,
} from "@/lib/helpers/admin/academics/academicDropdowns";

function AdminPlacementHeaderShimmer() {
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

function AdminPlacementRightShimmer() {
    return (
        <div className="w-[32%] shrink-0 p-1 pt-0 pr-0">
            <div className="mb-3 h-[86px] animate-pulse rounded-xl bg-gray-200" />
            <div className="mb-3 h-[220px] animate-pulse rounded-xl bg-gray-200" />
            <div className="h-[380px] animate-pulse rounded-xl bg-gray-200" />
        </div>
    );
}

export default function PlacementsPage() {
    const { collegeId, loading: adminLoading } = useAdmin();
    const { isSchool } = useInstitutionTerminology();
    const [placements, setPlacements] = useState<PlacementCompany[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isListLoading, setIsListLoading] = useState(true);
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

    useEffect(() => {
        if (adminLoading) return;

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
                console.error("Failed to load admin placements", error);
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
    }, [adminLoading, educationTypeId, branchId, academicYearId, collegeId, currentPage, sortBy, status]);

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

    useEffect(() => {
        if (!collegeId) return;

        const timer = window.setTimeout(() => {
            void loadEducations();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [collegeId, loadEducations]);

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

    const pageLoading = adminLoading || isInitialLoad;
    const filterRefreshing = filterLoadingKey !== null;

    return (
        <section className="h-screen flex gap-1 overflow-hidden">
            <div className="relative flex-1 flex flex-col pl-2 pr-1 min-w-0">
                {pageLoading ? (
                    <AdminPlacementHeaderShimmer />
                ) : (
                    <div className="shrink-0">
                        <h1 className="text-black text-2xl font-semibold">
                            Placements
                        </h1>

                        <p className="text-black text-sm">
                            Track, Manage, and Maintain Student Placement Status
                        </p>

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
                )}


                <div className="flex-1 overflow-y-auto pr-1 pb-4 mt-2">
                    <PlacementList
                        placements={placements}
                        isLoading={adminLoading || isListLoading || filterRefreshing}
                        cycle=""
                        onPlacementClick={setSelectedPlacement}
                    />

                    {!pageLoading && !filterRefreshing && (
                        <div className="mb-2 mt-5">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalRecords}
                                itemsPerPage={rowsPerPage}
                                onPageChange={setCurrentPage}
                                disabled={isListLoading}
                                alwaysShow
                                bgClassName="bg-transparent"
                            />
                        </div>
                    )}
                </div>
            </div>
            {pageLoading ? (
                <AdminPlacementRightShimmer />
            ) : (
                <div className="w-[32%] shrink-0 p-1 pt-0 pr-0 flex flex-col sticky top-0 h-screen">
                    <CourseScheduleCard isVisibile={false} />
                    <WorkWeekCalendar />
                    <Announcements />
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

