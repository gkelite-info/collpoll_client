"use client";

import { ShareFat, MapPin, CurrencyInr, ClockCountdown, CalendarBlank } from "@phosphor-icons/react";

interface PlacementCardProps {
  logo: string;
  company: string;
  role: string;
  skills: string[];
  description: string;
  tags: string[];
  status?: string;
  closingText?: string;
  onClick?: () => void;
}

export default function PlacementCard({
  logo,
  company,
  role,
  skills,
  description,
  tags,
  status,
  closingText,
  onClick,
}: PlacementCardProps) {
  const statusClassName =
    status === "Completed"
      ? "bg-[#F1F3F5] text-[#6B7280]"
      : "bg-[#E8F8EF] text-[#43C17A]";


  const timeTag =
    tags.find((t) => t === "Part Time") ??
    tags.find((t) => t === "Full Time");

  const salaryTag = tags.find((t) => t.endsWith("Lpa"));

  const locationTag = tags.find(
    (t) =>
      t !== timeTag &&
      t !== salaryTag
  );


  return (
    <div
      className="w-full h-66.5 cursor-pointer overflow-hidden bg-white rounded-xl flex flex-col transition hover:shadow-md"
      style={{
        padding: "23px 21px 23px 25px",
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="w-28 shrink-0 flex justify-start items-start">
            <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-lg bg-white">
              <img
                src={logo}
                alt={company}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <h2 className="max-w-full truncate text-[18px] font-semibold text-[#282828]">
              {company}
            </h2>
            <p className="text-md font-normal text-[#282828]">
              {role}
            </p>

            <div className="mt-2 flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 pr-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="shrink-0 px-3 py-0.75 rounded-full text-[12px] font-medium bg-[#E8F8EF] text-[#43C17A]"
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className="mt-3 max-h-[44px] overflow-y-auto pr-2 text-[14px] leading-snug text-[#525252] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
              {description}
            </p>

            <div
              className="
    flex items-center
    h-6.75
    gap-1.5
    px-2.25 py-1
    rounded-[21px]
  "
            >

              <div className="mt-3 flex max-w-full flex-nowrap gap-3 overflow-x-auto pb-1 pr-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">

                {timeTag && (
                  <div className="flex shrink-0 items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <ClockCountdown weight="fill" className="w-3.25 h-3.25" />
                    <span className="text-[14px] leading-none">{timeTag}</span>
                  </div>
                )}

                {locationTag && (
                  <div className="flex shrink-0 items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <MapPin weight="fill" className="w-3 h-3.5" />
                    <span className="text-[14px] leading-none">{locationTag}</span>
                  </div>
                )}

                {salaryTag && (
                  <div className="flex shrink-0 items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <CurrencyInr weight="fill" className="w-3 h-3" />
                    <span className="text-[14px] leading-none">{salaryTag}</span>
                  </div>
                )}

                {closingText && (
                  <div className="flex shrink-0 items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <CalendarBlank weight="fill" className="w-3.5 h-3.5" />
                    <span className="text-[14px] leading-none">{closingText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {status ? (
          <span className={`rounded-lg px-4 py-1.5 text-md font-medium ${statusClassName}`}>
            {status}
          </span>
        ) : (
          <button
            className="flex items-center gap-2 cursor-pointer justify-center rounded-lg text-white text-md font-medium transition-all active:scale-95"
            style={{
              background: "#43C17A",
              padding: "6px 20px",
              boxShadow: "0px 3.3px 6.43px rgba(0,0,0,0.05)",
            }}
          >
            <span>Share</span>
            <ShareFat size={18} weight="fill" color="#ffffff" />
          </button>
        )}
      </div>

    </div>
  );
}
