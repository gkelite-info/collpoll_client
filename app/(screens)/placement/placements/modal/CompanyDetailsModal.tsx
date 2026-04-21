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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
      <Image
        src={company.logo}
        alt={`${company.name} logo`}
        width={48}
        height={48}
        className="h-8 w-8 object-contain"
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

export default function CompanyDetailsModal({
  company,
  onClose,
}: CompanyDetailsModalProps) {
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
          <DetailRow label="Website">{company.website}</DetailRow>
          <DetailRow label="Required Skills">
            {company.skills.join(", ")}
          </DetailRow>
          <DetailRow label="Roles Offered">{company.role}</DetailRow>
          <DetailRow label="Package Details">
            {company.packageDetails}
          </DetailRow>
          <DetailRow label="Drive Type">{company.driveType}</DetailRow>
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
                <span
                  key={attachment}
                  className="rounded-full bg-[#E8F8EF] px-2.5 py-0.5 text-[10px] font-medium text-[#43C17A]"
                >
                  {attachment}
                </span>
              ))}
            </div>
          </DetailRow>
        </div>
      </div>
    </div>
  );
}
