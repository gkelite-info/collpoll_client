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
  const t = useTranslations("Placements.student");

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
      className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full cursor-pointer transition hover:shadow-md h-auto"
      onClick={onClick}
    >
      {/* DESKTOP VIEW */}

      <div className="hidden md:grid grid-cols-[15%_85%] px-6 py-4 items-start gap-4 w-full">
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

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col gap-3 p-4 w-full h-auto">
        <div className="flex justify-between items-start gap-3 w-full">
          <div className="flex gap-3 items-center min-w-0 flex-1">
            <div className="h-12 w-12 rounded-full  text-white aspect-square flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 shadow-sm">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-full w-full object-cover p-1 aspect-square"
                />
              ) : (
                <span className="text-lg font-bold">{companyName[0]}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-[#282828] leading-tight truncate">
                {companyName}
              </h3>
              <p className="text-[12px] text-gray-600 font-medium truncate mt-0.5">
                {role}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isApplied && !showApplyButton && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-[#515151] whitespace-nowrap bg-[#F4F5F6]">
                <CalendarBlank size={12} weight="bold" />
                <span>
                  {t("Applied on {date}", { date: appliedOn || "-" })}
                </span>
              </div>
            )}

            {isExpired ? (
              <span className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold border border-gray-200 shadow-sm">
                {t("Completed")}
              </span>
            ) : !isEligible ? (
              <span className="px-3 py-1.5 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold shadow-sm">
                {t("Not Eligible")}
              </span>
            ) : showApplyButton ? (
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={isApplying}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition shadow-sm whitespace-nowrap
                  ${
                    isApplying
                      ? "bg-emerald-50 text-emerald-500 border border-emerald-300 cursor-not-allowed"
                      : isApplied
                        ? "bg-white text-red-500 border border-red-400"
                        : "bg-[#16284F] text-white"
                  }`}
              >
                {isApplying
                  ? t("Applying")
                  : isApplied
                    ? t("Withdraw")
                    : t("Apply")}
              </button>
            ) : (
              <span className="bg-[#43C17A] text-white px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm">
                {t(statusLabel || "Applied")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1 w-full">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 bg-[#E8F8EF] text-[#43C17A] rounded-full text-[10px] font-semibold"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="text-[12px] text-gray-600 leading-snug line-clamp-2 w-full">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-1 w-full border-t border-gray-50">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F5F6] text-[#414141] text-[10px] font-semibold">
            <ClockCountdown
              weight="fill"
              size={12}
              className="text-[#16284F]"
            />
            <span>{jobType}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F5F6] text-[#414141] text-[10px] font-semibold">
            <MapPin weight="fill" size={12} className="text-[#16284F]" />
            <span>{location}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F5F6] text-[#414141] text-[10px] font-semibold">
            <CurrencyInr size={12} weight="fill" className="text-[#16284F]" />
            <span>{ctc}</span>
          </span>
          {closingText && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF9E5] text-[#F0A500] text-[10px] font-semibold border border-[#F0A500]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F0A500]"></span>
              <span>{closingText}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
