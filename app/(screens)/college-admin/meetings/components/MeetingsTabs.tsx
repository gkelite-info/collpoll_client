"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const tabs = [
  { label: "Upcoming Meetings", value: "upcoming" },
  { label: "Previous Meetings", value: "previous" },
];

export default function MeetingsTabs({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center ">
      <div className="px-2 py-2 bg-[#EEEEEE] rounded-full flex items-center justify-center">
        <div className="flex gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabClick(tab.value)}
                className={`
                  w-[177px] h-[40px] rounded-full flex items-center justify-center text-[16px] font-medium transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-[#43C17A] text-white"
                      : "bg-[#D8D8D8] text-[#414141]"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
