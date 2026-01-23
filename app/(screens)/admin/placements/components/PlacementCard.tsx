"use client";

import { ShareFat , Clock, MapPin, CurrencyInr, ClockCountdown } from "@phosphor-icons/react";



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
  return (
    <div
      className="w-185 h-66.5 bg-white rounded-xl flex flex-col gap-[10px]"
      style={{
        padding: "23px 21px 23px 25px",
        boxShadow: "8.26px 3.1px 22.71px rgba(150,150,150,0.11)",
      }}
    >
         <div className="flex items-start justify-between">
        <div className="flex gap-4">
         
          <div className="w-[250px] flex justify-start items-start">
            {company === "Infosys" ? (
              <div className="w-[71px] h-[71px] rounded-full bg-[#1E6FD9] flex items-center justify-center">
                <img
                  src={logo}
                  alt={company}
                  className="w-[70px] h-[70px] object-contain"
                />
              </div>
            ) : company === "Amazon" ? (
              <div className="w-[80px] h-[80px] min-w-[80px] min-h-[80px] rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt={company}
                  className="w-[48px] h-[48px] object-contain"
                />
              </div>
            ) : (
              <img
                src={logo}
                alt={company}
                className="w-[71px] h-[71px] object-contain"
              />
            )}

          </div>
       
          <div className="space-y-1">
            <h2 className="text-[18px] font-semibold text-[#282828] whitespace-nowrap">
              {company}
            </h2>
            <p className="text-[20px] font-normal text-[#282828]">
              {role}
            </p>

         
            <div className="flex gap-2 mt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-[3px] rounded-full text-[12px] font-medium bg-[#E8F8EF] text-[#43C17A]"
                >
                  {skill}
                </span>
              ))}
            </div>

          
            <p className="w-[615px] text-[16px] text-[#525252] mt-2">
              {description}
            </p>


            <div
              className="
    flex items-center
    h-[27px]
    gap-[6px]
    px-[9px] py-[4px]
    rounded-[21px]
    gap-3
    bg-[rgba(22,40,79,0.12)]
     border-[rgba(22,40,79,0.08)]
  "
            >

              {tags.map((tag) => {
                let IconComp = ClockCountdown;
                let iconClass = "";

                if (tag === "Part Time") {
                  IconComp = ClockCountdown;
                  iconClass = "w-[13px] h-[13px]";
                } else if (tag === "Full Time") {
                  IconComp = MapPin;
                  iconClass = "w-[10.7px] h-[13px]";
                } else if (tag === "12 Lpa") {
                  IconComp = CurrencyInr;
                  iconClass = "w-[11.7px] h-[11.7px]";
                }

                return (
                  <div
                    key={tag}
                    className="
          flex items-center
          h-6.75
          gap-1.5
         border-[rgba(22,40,79,0.08)]
          text-[#16284F]
          bg-[#16284F1F] py-1 px-2 rounded-full
          text-[16px]
          font-normal
          leading-none
        "
                  >
                   
                    <IconComp
                      weight="fill"
                      className={`${iconClass} text-[#16284F] flex-shrink-0`}
                    />

                    <span className="leading-[19px]">
                      {tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          className=" flex items-center justify-center gap-[100px] w-[70px] rounded-xl  text-white text-sm font-medium rounded-[6.6px]  transition-all active:scale-95"      
          style={{
            background: "#43C17A",
            padding: "8px 35px",
            boxShadow: "0px 3.3px 6.43px rgba(0,0,0,0.05)",
          }}
        >
          <span>Share</span>
         <ShareFat size={20} weight="fill" color="#ffffff" />
        </button>
      </div>


    </div>
  );
}
