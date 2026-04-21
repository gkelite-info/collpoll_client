"use client";

import Image from "next/image";
import {
  ClockCountdown,
  CurrencyInr,
  MapPin,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { PlacementCompany } from "./mockData";

type PlacementCompanyCardProps = {
  company: PlacementCompany;
  onClick: () => void;
  onEdit: () => void;
};

function CompanyLogo({ company }: { company: PlacementCompany }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
      <Image
        src={company.logo}
        alt={`${company.name} logo`}
        width={80}
        height={80}
        className="h-16 w-16 object-cover rounded-full"
      />
    </div>
  );
}

export default function PlacementCompanyCard({
  company,
  onClick,
  onEdit,
}: PlacementCompanyCardProps) {
  const timeTag =
    company.tags.find((tag) => tag === "Part Time") ??
    company.tags.find((tag) => tag === "Full Time");
  const salaryTag = company.tags.find((tag) => tag.endsWith("Lpa"));
  const locationTag = company.tags.find(
    (tag) => tag !== timeTag && tag !== salaryTag,
  );

  return (
    <div
      className="relative w-full cursor-pointer rounded-[22px] bg-white px-8 py-4"
      onClick={onClick}
    >
      <div className="flex min-w-0 gap-4">
        <CompanyLogo company={company} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pr-28">
            <h2 className="text-[18px] font-semibold text-[#282828]">
              {company.name}
            </h2>
            {company.subtitle && (
              <span className="text-[13px] text-[#282828]">
                ({company.subtitle})
              </span>
            )}
          </div>

          <p className="mt-1 pr-28 text-[17px] text-[#282828]">
            {company.role}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {company.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[#E8F8EF] px-3 py-1 text-[12px] font-medium text-[#43C17A]"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-4 w-full text-sm leading-5 text-[#525252]">
            {company.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {timeTag && (
              <div className="flex items-center gap-1.5 rounded-full bg-[#16284F1F] px-2.5 py-1 text-[#16284F]">
                <ClockCountdown weight="fill" className="h-3.5 w-3.5" />
                <span className="text-[14px]">{timeTag}</span>
              </div>
            )}

            {locationTag && (
              <div className="flex items-center gap-1.5 rounded-full bg-[#16284F1F] px-2.5 py-1 text-[#16284F]">
                <MapPin weight="fill" className="h-3.5 w-3.5" />
                <span className="text-[14px]">{locationTag}</span>
              </div>
            )}

            {salaryTag && (
              <div className="flex items-center gap-1.5 rounded-full bg-[#16284F1F] px-2.5 py-1 text-[#16284F]">
                <CurrencyInr weight="fill" className="h-3.5 w-3.5" />
                <span className="text-[14px]">{salaryTag}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute right-5 top-4 flex items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onEdit}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#1B2E58] text-white"
        >
          <PencilSimple size={16} weight="bold" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#FFE9E9] text-[#FF6B6B]"
        >
          <Trash size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
