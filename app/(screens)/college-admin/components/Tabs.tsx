"use client";

import { useRouter } from "next/navigation";

const tabs = [
  { label: "Support Admins", value: "support-admins" },
  { label: "Education Types", value: "education-types" },
  { label: "Branches", value: "branches" },
  { label: "Users Overview", value: "users-overview" },
  { label: "Finance", value: "finance" },
];

export default function Tabs({ activeTab }: { activeTab: string }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(`?tab=${tab.value}`)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${
                activeTab === tab.value
                  ? "bg-[#43C17A] text-white"
                  : "bg-[#EAEAEA] text-[#282828]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
