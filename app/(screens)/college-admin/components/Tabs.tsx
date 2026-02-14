"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const tabs = [
  { label: "Support Admins", value: "support-admins" },
  { label: "Education Types", value: "education-types" },
  { label: "Branches", value: "branches" },
  { label: "Users Overview", value: "users-overview" },
  { label: "Finance", value: "finance" },
];

export default function Tabs({ activeTab }: { activeTab: string }) {
    console.log("checking tab", activeTab)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-full p-2 shadow-sm overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`px-6 py-2 cursor-pointer rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                ${
                  isActive
                    ? "bg-[#43C17A] text-white shadow-sm"
                    : "bg-[#EAEAEA] text-[#282828] hover:bg-[#DCDCDC]"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
