"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useStudent } from "@/app/utils/context/student/useStudent";

import { JobInfoCard } from "./jobInfoCard";
import { PlacementFilterBar, PlacementFilterBarProps } from "./filterBar";
import AssignmentsRight from "./aside";
import { fetchStudentPlacementCompanies, StudentPlacementCompany } from "@/lib/helpers/student/placements/getStudentPlacementCompanies";
import { applyForStudentPlacement, fetchStudentPlacementApplications, mapApplicationToAppliedPlacement, withdrawStudentPlacementApplication } from "@/lib/helpers/student/placements/studentPlacementApplications";

type TabType = "opportunities" | "applications";

type AppliedPlacement = {
  placementId: number;
  appliedOn: string;
};

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

function getClosingText(endDate?: string) {
  if (!endDate) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closingDate = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(closingDate.getTime())) return "";

  const dayDiff = Math.ceil(
    (closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDiff < 0) return "Closed";
  if (dayDiff === 0) return "Closes today";
  if (dayDiff === 1) return "Closes in 1 day";

  return `Closes in ${dayDiff} days`;
}

function getPlacementCycle(company: StudentPlacementCompany) {
  return company.startDate ? new Date(`${company.startDate}T00:00:00`).getFullYear().toString() : "";
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
  company: StudentPlacementCompany;
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
            <Image
              src={company.logoUrl}
              alt={`${company.companyName} logo`}
              width={112}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#262626]">
              {company.companyName}
            </h2>
            <p className="mt-0.5 text-[14px] text-[#333333]">{company.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow label="Company Name">{company.companyName}</DetailRow>
          <DetailRow label="Description">{company.longDescription}</DetailRow>
          <DetailRow label="Email">{company.email}</DetailRow>
          <DetailRow label="Contact No.">{company.phone}</DetailRow>
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
          <DetailRow label="Roles Offered">{company.role}</DetailRow>
          <DetailRow label="Package Details">{company.packageDetails}</DetailRow>
          <DetailRow label="Drive Type">{company.driveType}</DetailRow>
          <DetailRow label="Work Mode">{company.workMode || "-"}</DetailRow>
          <DetailRow label="Start Date">
            {formatDisplayDate(company.startDate)}
          </DetailRow>
          <DetailRow label="End Date">
            {formatDisplayDate(company.endDate)}
          </DetailRow>
          <DetailRow label="Eligibility">
            {company.isEligible ? "Eligible" : "Not eligible"}
          </DetailRow>
          <DetailRow label="Status">
            {company.isExpired ? "Completed" : "Open"}
          </DetailRow>
          <DetailRow label="Criteria">
            {company.eligibilityCriteria || "-"}
          </DetailRow>
          <DetailRow label="Branch Name">
            {company.branchName || company.collegeBranchId || "-"}
          </DetailRow>
          <DetailRow label="Academic Year">
            {company.academicYear || company.collegeAcademicYearId || "-"}
          </DetailRow>
          <DetailRow label="Job Type">{company.jobType}</DetailRow>
          <DetailRow label="Location(s)">{company.location || "-"}</DetailRow>
          <DetailRow label="Documents">
            <div className="flex flex-wrap gap-2">
              {company.attachments.map((attachment) => (
                <a
                  key={attachment}
                  href={attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#E8F8EF] px-2.5 py-0.5 text-[10px] font-medium text-[#43C17A] transition hover:bg-[#D9F3E5] hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {getAttachmentName(attachment)}
                </a>
              ))}
            </div>
          </DetailRow>
        </div>
      </div>
    </div>
  );
}

function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  loadingLabel,
  isLoading = false,
  confirmClassName = "bg-[#43C17A] text-white hover:bg-[#34A362]",
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  loadingLabel?: string;
  isLoading?: boolean;
  confirmClassName?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={!isLoading ? onCancel : undefined}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[#282828]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${confirmClassName} cursor-pointer disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isLoading ? loadingLabel || confirmLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const {
    loading: studentLoading,
    studentId,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
  } = useStudent();
  const [activeTab, setActiveTab] = useState<TabType>("opportunities");
  const [placements, setPlacements] = useState<StudentPlacementCompany[]>([]);
  const [appliedPlacements, setAppliedPlacements] = useState<AppliedPlacement[]>([]);
  const [selectedPlacement, setSelectedPlacement] =
    useState<StudentPlacementCompany | null>(null);
  const [placementToApply, setPlacementToApply] =
    useState<StudentPlacementCompany | null>(null);
  const [placementToWithdraw, setPlacementToWithdraw] =
    useState<StudentPlacementCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingPlacementId, setApplyingPlacementId] = useState<number | null>(null);
  const [withdrawingPlacementId, setWithdrawingPlacementId] = useState<number | null>(null);

  const [cycle, setCycle] = useState<string>("");
  const [eligibility, setEligibility] =
    useState<PlacementFilterBarProps["eligibility"]>("All");
  const [sortBy, setSortBy] =
    useState<PlacementFilterBarProps["sortBy"]>("Recently Uploaded");

  useEffect(() => {
    if (studentLoading) return;

    if (!collegeId || !collegeEducationId || !collegeBranchId || !collegeAcademicYearId) {
      setPlacements([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadPlacements = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStudentPlacementCompanies({
          collegeId,
          collegeEducationId,
          collegeBranchId,
          collegeAcademicYearId,
        });

        if (isMounted) setPlacements(data);
      } catch (error) {
        console.error("Failed to load student placements", error);
        if (isMounted) setPlacements([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPlacements();

    return () => {
      isMounted = false;
    };
  }, [
    studentLoading,
    collegeId,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
  ]);

  useEffect(() => {
    if (studentLoading) return;

    if (!studentId) {
      setAppliedPlacements([]);
      return;
    }

    let isMounted = true;

    const loadApplications = async () => {
      try {
        const applications = await fetchStudentPlacementApplications(studentId);

        if (isMounted) {
          setAppliedPlacements(applications.map(mapApplicationToAppliedPlacement));
        }
      } catch (error) {
        console.error("Failed to load student placement applications", error);
        if (isMounted) setAppliedPlacements([]);
      }
    };

    void loadApplications();

    return () => {
      isMounted = false;
    };
  }, [studentId, studentLoading]);

  const cycles = useMemo(() => {
    const startYears = placements.map(getPlacementCycle).filter(Boolean);
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
    const uniqueYears = Array.from(new Set([...defaultYears, ...startYears])).sort(
      (a, b) => Number(b) - Number(a),
    );

    return uniqueYears;
  }, [placements]);

  useEffect(() => {
    if (!cycle && cycles.length > 0) {
      setCycle(cycles[0]);
    } else if (cycle && !cycles.includes(cycle)) {
      setCycle(cycles[0]);
    }
  }, [cycle, cycles]);

  const appliedByPlacementId = useMemo(
    () =>
      new Map(
        appliedPlacements.map((application) => [
          application.placementId,
          application.appliedOn,
        ]),
      ),
    [appliedPlacements],
  );

  const handleConfirmApply = async () => {
    if (!placementToApply) return;
    if (!studentId || !placementToApply.isEligible || placementToApply.isExpired) {
      setPlacementToApply(null);
      return;
    }

    setApplyingPlacementId(placementToApply.id);
    try {
      const application = await applyForStudentPlacement({
        studentId,
        placementCompanyId: placementToApply.id,
      });
      const appliedPlacement = mapApplicationToAppliedPlacement(application);

      setAppliedPlacements((prev) => {
        const withoutCurrent = prev.filter(
          (item) => item.placementId !== appliedPlacement.placementId,
        );

        return [...withoutCurrent, appliedPlacement];
      });
      setPlacementToApply(null);
      setActiveTab("applications");
    } catch (error) {
      console.error("Failed to apply for placement", error);
    } finally {
      setApplyingPlacementId(null);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!placementToWithdraw) return;
    if (!studentId) {
      setPlacementToWithdraw(null);
      return;
    }

    setWithdrawingPlacementId(placementToWithdraw.id);
    try {
      await withdrawStudentPlacementApplication({
        studentId,
        placementCompanyId: placementToWithdraw.id,
      });
      setAppliedPlacements((prev) =>
        prev.filter(
          (application) => application.placementId !== placementToWithdraw.id,
        ),
      );
      setPlacementToWithdraw(null);
    } catch (error) {
      console.error("Failed to withdraw placement application", error);
    } finally {
      setWithdrawingPlacementId(null);
    }
  };

  const visiblePlacements = useMemo(() => {
    let list = [...placements];

    if (activeTab === "applications") {
      list = list.filter((placement) => appliedByPlacementId.has(placement.id));
    }

    if (cycle) {
      list = list.filter((placement) => getPlacementCycle(placement) === cycle);
    }

    if (eligibility === "Eligible") {
      list = list.filter((placement) => placement.isEligible);
    } else if (eligibility === "Not Eligible") {
      list = list.filter((placement) => !placement.isEligible);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "Recently Uploaded":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
            b.id - a.id
          );
        case "Oldest First":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
            a.id - b.id
          );
        case "Company Name A-Z":
          return a.companyName.localeCompare(b.companyName);
        case "Company Name Z-A":
          return b.companyName.localeCompare(a.companyName);
        default:
          return 0;
      }
    });

    return list;
  }, [activeTab, appliedByPlacementId, cycle, eligibility, placements, sortBy]);

  return (
    <main className="p-2 bg-red-00">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-2xl font-semibold">Placements</h1>
          <p className="text-black text-sm">
            Track, Manage, and Maintain Student Placement Status
          </p>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <section className="bg-blue-00 flex justify-between gap-4">
        <section className="bg-yellow-00 relative min-w-0 flex-1">
          <PlacementFilterBar
            cycle={cycle}
            cycles={cycles}
            eligibility={eligibility}
            sortBy={sortBy}
            onCycleChange={setCycle}
            onEligibilityChange={setEligibility}
            onSortChange={setSortBy}
          />

          <div className="mt-2 flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("opportunities")}
              className={
                activeTab === "opportunities"
                  ? "text-[#43C17A] font-medium"
                  : "text-black cursor-pointer"
              }
            >
              Opportunities /
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className={
                activeTab === "applications"
                  ? "text-[#43C17A] font-medium"
                  : "text-black cursor-pointer"
              }
            >
              My Applications
            </button>
          </div>

          <section className="mt-4 grid gap-4 bg-blue-00">
            {isLoading ? (
              <p className="py-16 text-center text-sm text-gray-500">
                Loading placements...
              </p>
            ) : visiblePlacements.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-500">
                {activeTab === "applications"
                  ? "You have not applied to any opportunities yet."
                  : `No placement drives found for ${cycle}.`}
              </p>
            ) : (
              visiblePlacements.map((placement) => {
                const appliedOn = appliedByPlacementId.get(placement.id);
                const isApplied = Boolean(appliedOn);

                return (
                  <JobInfoCard
                    key={placement.id}
                    companyName={placement.companyName}
                    role={placement.role}
                    appliedOn={appliedOn}
                    statusLabel={isApplied ? "Applied" : undefined}
                    skills={placement.skills}
                    description={placement.description}
                    jobType={placement.jobType}
                    location={placement.location}
                    ctc={placement.packageDetails}
                    closingText={getClosingText(placement.endDate)}
                    logoUrl={placement.logoUrl}
                    showApplyButton={activeTab === "opportunities"}
                    isApplied={isApplied}
                    isEligible={placement.isEligible}
                    isExpired={placement.isExpired}
                    isApplying={applyingPlacementId === placement.id}
                    onApply={() => setPlacementToApply(placement)}
                    onWithdraw={() => setPlacementToWithdraw(placement)}
                    onClick={() => setSelectedPlacement(placement)}
                  />
                );
              })
            )}
          </section>
        </section>

        <AssignmentsRight />
      </section>

      {selectedPlacement && (
        <PlacementDetailsModal
          company={selectedPlacement}
          onClose={() => setSelectedPlacement(null)}
        />
      )}

      {placementToApply && (
        <ConfirmActionModal
          title="Apply for placement?"
          description={`Do you want to apply for ${placementToApply.companyName}?`}
          confirmLabel="Apply"
          loadingLabel="Applying..."
          isLoading={applyingPlacementId === placementToApply.id}
          onCancel={() => setPlacementToApply(null)}
          onConfirm={handleConfirmApply}
        />
      )}

      {placementToWithdraw && (
        <ConfirmActionModal
          title="Withdraw application?"
          description={`Do you want to withdraw your application for ${placementToWithdraw.companyName}?`}
          confirmLabel="Withdraw"
          loadingLabel="Withdrawing..."
          isLoading={withdrawingPlacementId === placementToWithdraw.id}
          confirmClassName="bg-red-600 text-white hover:bg-red-700"
          onCancel={() => setPlacementToWithdraw(null)}
          onConfirm={handleConfirmWithdraw}
        />
      )}
    </main>
  );
}
