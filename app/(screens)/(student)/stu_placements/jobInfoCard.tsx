"use client";

import {
  CalendarBlank,
  MapPin,
  ClockCountdown,
  CurrencyInr,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export type JobInfoCardProps = {
  logoUrl?: string;
  companyName: string;
  role: string;
  appliedOn?: string;
  statusLabel?: string;
  skills: string[];
  description: string;
  jobType: string;
  location: string;
  ctc: string;
  startDate?: string;
  endDate?: string;
  closingText?: string;

  showApplyButton?: boolean;
  isApplied?: boolean;
  isEligible?: boolean;
  isExpired?: boolean;
  isApplying?: boolean;
  onApply?: () => void;
  onWithdraw?: () => void;
  onClick?: () => void;
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
  closingText,
  showApplyButton,
  isApplied,
  isEligible = true,
  isExpired = false,
  isApplying = false,
  onApply,
  onWithdraw,
  onClick,
}: JobInfoCardProps) => {
  const t = useTranslations("Placements.student"); // Hook

  const handleApplyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isApplying) return;

    if (isApplied) {
      onWithdraw?.();
      return;
    }

    onApply?.();
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 md:px-6 md:py-4 grid grid-cols-[15%_85%] w-full  items-start gap-4 cursor-pointer transition hover:shadow-md"
      onClick={onClick}
    >
      <div className="shrink-0">
        <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-lg bg-white text-[#16284F] text-xs font-semibold">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm md:text-base">{companyName[0]}</span>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              {companyName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{role}</p>
          </div>

          <div className="flex shrink-0 flex-row items-end gap-2 text-xs">
            {isApplied && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-[#16284F1F] text-[#16284F] whitespace-nowrap">
                <CalendarBlank size={14} className="text-gray-500" />
                <span>
                  {t("Applied on {date}", { date: appliedOn || "-" })}
                </span>
              </div>
            )}
            {isExpired ? (
              <span className="inline-flex items-center px-4 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                {t("Completed")}
              </span>
            ) : !isEligible ? (
              <span className="inline-flex items-center px-4 py-1 rounded-md bg-amber-50 text-amber-600 text-xs font-semibold">
                {t("Not Eligible")}
              </span>
            ) : showApplyButton ? (
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={isApplying}
                className={`inline-flex items-center px-4 py-1 rounded-md text-xs font-semibold transition cursor-pointer
                  ${
                    isApplying
                      ? "cursor-not-allowed border border-emerald-300 bg-emerald-50 text-emerald-500"
                      : isApplied
                        ? "border border-red-400 bg-white text-red-500 hover:bg-red-50"
                        : "bg-white text-emerald-600 border border-emerald-500 hover:bg-emerald-50"
                  }`}
              >
                {isApplying
                  ? t("Applying")
                  : isApplied
                    ? t("Withdraw")
                    : t("Apply")}
              </button>
            ) : (
              <span className="inline-flex items-center px-4 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold">
                {t(statusLabel || "Applied")}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 text-xs font-medium">
          {isEligible ? (
            <span className="text-[#43C17A]">{t("Eligible")}</span>
          ) : (
            <span className="text-[#F0A500]">{t("Not Eligible")}</span>
          )}
        </div>

        <div className="mt-3 flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 pr-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="shrink-0 px-3 py-1 rounded-full bg-[#43C17A24] text-[#43C17A] text-xs font-normal"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="mt-3 max-h-[44px] overflow-y-auto pr-2 text-[13px] md:text-sm text-gray-700 leading-snug [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          {description}
        </p>

        <p className="mt-2 text-[12px] font-medium text-[#43C17A]">
          {t("Click card to see more")}
        </p>

        <div className="mt-3 min-w-0 text-xs md:text-sm">
          <div className="flex w-full min-w-0 max-w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 pr-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
            <span className="inline-flex shrink-0 items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              <ClockCountdown weight="fill" size={14} />
              <span className="whitespace-nowrap">{jobType}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              <MapPin weight="fill" size={14} />
              <span className="whitespace-nowrap">{location}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              <CurrencyInr size={14} weight="fill" />
              <span className="whitespace-nowrap">{ctc}</span>
            </span>
            {closingText && (
              <span className="inline-flex shrink-0 items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                <CalendarBlank size={14} weight="fill" />
                <span className="whitespace-nowrap">{closingText}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
