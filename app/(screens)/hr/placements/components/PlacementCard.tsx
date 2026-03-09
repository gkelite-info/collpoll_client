"use client";

import { ShareFat, MapPin, CurrencyInr, ClockCountdown } from "@phosphor-icons/react";

interface PlacementCardProps {
  logo: string;
  company: string;
  role: string;
  skills: string[];
  description: string;
  tags: string[];
}

export default function PlacementCard({
  logo,
  company,
  role,
  skills,
  description,
  tags,
}: PlacementCardProps) {


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
      className="w-full h-66.5 bg-white rounded-xl flex flex-col"
      style={{
        padding: "23px 21px 23px 25px",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-17.75 shrink-0 flex justify-start items-start">
            {company === "Infosys" ? (
              <div className="w-17.75 h-17.75 rounded-full bg-[#1E6FD9] flex items-center justify-center">
                <img
                  src={logo}
                  alt={company}
                  className="w-17.5 h-17.5 object-contain"
                />
              </div>
            ) : company === "Amazon" ? (
              <div className="w-20 h-20 min-w-20 min-h-20 rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt={company}
                  className="w-12 h-12 object-contain"
                />
              </div>
            ) : (
              <img
                src={logo}
                alt={company}
                className="w-17.75 h-17.75 object-contain"
              />
            )}

          </div>

          <div className="space-y-1">
            <h2 className="text-[18px] font-semibold text-[#282828] whitespace-nowrap">
              {company}
            </h2>
            <p className="text-md font-normal text-[#282828]">
              {role}
            </p>

            <div className="flex gap-2 mt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-0.75 rounded-full text-[12px] font-medium bg-[#E8F8EF] text-[#43C17A]"
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className="w-full text-[14px] text-[#525252] mt-3">
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

              <div className="flex gap-3 mt-3">

                {timeTag && (
                  <div className="flex items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <ClockCountdown weight="fill" className="w-3.25 h-3.25" />
                    <span className="text-[14px] leading-none">{timeTag}</span>
                  </div>
                )}

                {locationTag && (
                  <div className="flex items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <MapPin weight="fill" className="w-3 h-3.5" />
                    <span className="text-[14px] leading-none">{locationTag}</span>
                  </div>
                )}

                {salaryTag && (
                  <div className="flex items-center gap-1.5 bg-[#16284F1F] py-1 px-2 rounded-full text-[#16284F]">
                    <CurrencyInr weight="fill" className="w-3 h-3" />
                    <span className="text-[14px] leading-none">{salaryTag}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
      </div>

    </div>
  );
}
