"use client";

import Image from "next/image";
import { X } from "@phosphor-icons/react";
import { PlacementCompany } from "../components/mockData";

type CompanyDetailsModalProps = {
  company: PlacementCompany;
  onClose: () => void;
};

function CompanyLogo({ company }: { company: PlacementCompany }) {
  return (
    <div className="flex h-12 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
      <Image
        src={company.logo}
        alt={`${company.name} logo`}
        width={112}
        height={48}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[170px_1fr] gap-6 text-[15px] leading-6 text-[#333333]">
      <span className="font-medium text-[#262626]">{label} :</span>
      <div>{children}</div>
    </div>
  );
}

function getAttachmentName(attachment: string) {
  const cleanAttachment = attachment.split("?")[0];
  return decodeURIComponent(cleanAttachment.split("/").pop() || attachment);
}

function formatDisplayDate(date?: string) {
  if (!date) return "-";

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function getWebsiteHref(website: string) {
  const trimmedWebsite = website.trim();
  if (!trimmedWebsite) return "";

  return /^https?:\/\//i.test(trimmedWebsite)
    ? trimmedWebsite
    : `https://${trimmedWebsite}`;
}

export default function CompanyDetailsModal({
  company,
  onClose,
}: CompanyDetailsModalProps) {
  const websiteHref = getWebsiteHref(company.website);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[82vh] w-full max-w-[620px] overflow-y-auto rounded-[10px] bg-white px-9 py-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F6] text-[#4B5563] transition hover:bg-[#E5E7EB]"
          aria-label="Close company details"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="mb-5 flex items-center gap-4">
          <CompanyLogo company={company} />
          <div>
            <h2 className="text-[20px] font-semibold text-[#262626]">
              {company.name}
            </h2>
            <p className="mt-0.5 text-[14px] text-[#333333]">{company.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow label="Company Name">{company.name}</DetailRow>
          <DetailRow label="Company Description">
            {company.longDescription}
          </DetailRow>
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
            {company.skills.join(", ")}
          </DetailRow>
          <DetailRow label="Roles Offered">{company.role}</DetailRow>
          <DetailRow label="Package Details">
            {company.packageDetails}
          </DetailRow>
          <DetailRow label="Drive Type">{company.driveType}</DetailRow>
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
          <DetailRow label="Eligibility Criteria">
            {company.eligibilityCriteria || "-"}
          </DetailRow>
          <DetailRow label="Branch Name">
            {company.branchName || company.collegeBranchId || "-"}
          </DetailRow>
          <DetailRow label="Academic Year">
            {company.academicYear || company.collegeAcademicYearId || "-"}
          </DetailRow>
          {/* <DetailRow label="No. of Students Placed">
            {company.studentsPlaced}
          </DetailRow> */}
          <DetailRow label="Job Type">{company.tags[0] || "Full Time"}</DetailRow>
          <DetailRow label="Location(s)">
            {company.locations.join(", ")}
          </DetailRow>
          <DetailRow label="Documents / Attachments">
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
