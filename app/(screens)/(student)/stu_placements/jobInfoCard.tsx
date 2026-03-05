"use client";

import {
  CalendarBlank,
  MapPin,
  ClockCountdown,
  CurrencyInr,
} from "@phosphor-icons/react";

export type JobInfoCardProps = {
  logoUrl?: string;
  companyName: string;
  role: string;
  appliedOn: string;
  statusLabel: string;
  skills: string[];
  description: string;
  jobType: string;
  location: string;
  ctc: string;
  interviewStatus: string;

  showApplyButton?: boolean;
  isApplied?: boolean;
  onApply?: () => void;
};

export const JobInfoCard = ({
  logoUrl,
  companyName,
  role,
  appliedOn,
  statusLabel,
  skills,
  description,
  jobType,
  location,
  ctc,
  interviewStatus,
  showApplyButton,
  isApplied,
  onApply,
}: JobInfoCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 md:px-6 md:py-4 flex items-start gap-4 max-w-3xl">
      <div className="shrink-0">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0057d9] flex items-center justify-center overflow-hidden text-white text-xs font-semibold">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm md:text-base">{companyName[0]}</span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              {companyName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{role}</p>
          </div>

          <div className="flex flex-row items-end gap-2 text-xs">
            {isApplied && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-[#16284F1F] text-[#16284F] whitespace-nowrap">
                <CalendarBlank size={14} className="text-gray-500" />
                <span>Applied on {appliedOn}</span>
              </div>
            )}
            {showApplyButton ? (
              <button
                type="button"
                onClick={!isApplied ? onApply : undefined}
                disabled={isApplied}
                className={`inline-flex items-center px-4 py-1 rounded-md text-xs font-semibold transition
                  ${
                    isApplied
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-emerald-600 border border-emerald-500 hover:bg-emerald-50"
                  }`}
              >
                {isApplied ? "Applied" : "Apply"}
              </button>
            ) : (
              <span className="inline-flex items-center px-4 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold">
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full bg-[#43C17A24] text-[#43C17A] text-xs font-normal"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[13px] md:text-sm text-gray-700 leading-snug">
          {description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              <ClockCountdown weight="fill" size={14} />
              <span>{jobType}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              <MapPin weight="fill" size={14} />
              <span>{location}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              <CurrencyInr size={14} weight="fill" />
              <span>{ctc}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0BB0024] text-[#F0BB00] whitespace-nowrap">
            <span
              className="w-3.5 h-3.5 rounded-full border border-[#eac12a]
              bg-[radial-gradient(circle, #ffe680, #ffcc00, #eab308)]
              shadow-[0_0_6px_2px_rgba(255,204,0,0.6)]"
            />
            <span className="text-xs md:text-sm font-medium">
              {interviewStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
