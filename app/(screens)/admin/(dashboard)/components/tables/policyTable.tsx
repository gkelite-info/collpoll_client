import { PencilSimple, Trash } from "@phosphor-icons/react";
import { useState } from "react";

const initialPolicies = [
  {
    id: "1",
    name: "Attendance Requirement",
    description:
      "Minimum 75% attendance is required to appear for semester exams.",
    status: true,
    lastUpdated: "20 Nov 2025",
  },
  {
    id: "2",
    name: "Assignment Deadline",
    description: "Assignments must be submitted within 7 days of announcement.",
    status: true,
    lastUpdated: "19 Nov 2025",
  },
  {
    id: "3",
    name: "Leave Limit Policy",
    description: "Students can take a maximum of 10 leaves per semester.",
    status: true,
    lastUpdated: "17 Nov 2025",
  },
  {
    id: "4",
    name: "Exam Revaluation Policy",
    description:
      "Students can apply for revaluation within 10 days after results.",
    status: true,
    lastUpdated: "15 Nov 2025",
  },
  {
    id: "5",
    name: "Grace Marks Policy",
    description:
      "Up to 5 marks may be added for participation in college events.",
    status: true,
    lastUpdated: "19 Nov 2025",
  },
  {
    id: "6",
    name: "Leave Limit Policy",
    description: "Students can take a maximum of 10 leaves per semester.",
    status: true,
    lastUpdated: "19 Nov 2025",
  },
  {
    id: "7",
    name: "Exam Revaluation Policy",
    description:
      "Students can apply for revaluation within 10 days after results are declared.",
    status: true,
    lastUpdated: "15 Nov 2025",
  },
];

const PolicyTable = () => {
  const [policies, setPolicies] = useState(initialPolicies);

  const handleToggle = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: !p.status } : p))
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm font-sans">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-gray-200">
            <th className="w-[22%] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A]">
              Policy Name
            </th>
            <th className="w-[43%] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A]">
              Description
            </th>
            <th className="w-[10%] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A]">
              Status
            </th>
            <th className="w-[15%] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A]">
              Updated
            </th>
            <th className="w-[10%] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A] text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {policies.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 transition-colors group"
            >
              <td className="px-4 py-3 text-[13px] font-semibold text-[#333] truncate">
                {row.name}
              </td>
              <td className="px-4 py-3 text-[12px] text-[#666] leading-snug">
                {row.description}
              </td>

              {/* FIXED TOGGLE */}
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggle(row.id)}
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    row.status ? "bg-[#43C17A]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      row.status ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </td>

              <td className="px-4 py-3 text-[12px] text-[#888]">
                {row.lastUpdated}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button className="p-1.5 rounded-md bg-[#DCFCE7] text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-all">
                    <PencilSimple size={14} weight="bold" />
                  </button>
                  <button className="p-1.5 rounded-md bg-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all">
                    <Trash size={14} weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PolicyTable;
