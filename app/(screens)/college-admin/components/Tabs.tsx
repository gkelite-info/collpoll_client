"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const tabs = [
  { label: "Support Admins", value: "support-admins" },
  { label: "Education Types", value: "education-types" },
  { label: "Branches", value: "branches" },
  { label: "Users Overview", value: "users-overview" },
  { label: "Finance Overview", value: "finance" },
];

export default function Tabs({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[#E6E6E6] rounded-full p-2 shadow-sm overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`px-4 py-1.5 cursor-pointer rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                ${
                  isActive
                    ? "bg-[#43C17A] text-white shadow-sm"
                    : "bg-[#D8D8D8] text-[#16284F]"
                }
              `}
              style={{ backgroundColor: !isActive ? "#D8D8D8" : undefined }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
