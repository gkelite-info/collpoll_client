"use client";
import WellbeingRight from "../components/WellbeingRight";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import {
  WarningCircle,
  Warning,
  ClockCountdown,
  ListChecks,
  ListDashes,
  Plus,
  CaretDown,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import AddExecutiveModal from "../components/AddExecutiveModal";

export default function NewIssuesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardData = [
    {
      id: "TOTAL_ISSUES",
      style: "bg-[#E6E0FF] border border-black/5 hover:shadow-md transition-all h-[130px]",
      icon: <ListChecks size={22} weight="fill" color="#6C20CA" />,
      value: "24",
      label: "Total Issues Today",
    },
    {
      id: "HIGHEST_CATEGORY",
      style: "bg-[#FFEDDA] border border-black/5 hover:shadow-md transition-all h-[130px]",
      icon: <Warning size={22} weight="fill" color="#F59E0B" />,
      value: (
        <span className="flex items-baseline gap-1">
          Infrastructure <span className="text-[18px]">(10)</span>
        </span>
      ),
      label: "Highest Category",
    },
    {
      id: "HIGH_PRIORITY",
      style: "bg-[#FFE4E4] border border-black/5 hover:shadow-md transition-all h-[130px]",
      icon: <ClockCountdown size={22} weight="fill" color="#EF4444" />,
      value: "06",
      label: "High Priority Issues",
    },
    {
      id: "TOTAL_CATEGORIES",
      style: "bg-[#E5F9EA] border border-black/5 hover:shadow-md transition-all h-[130px]",
      icon: <WarningCircle size={22} weight="fill" color="#10B981" />,
      value: "05",
      label: "Total Categories",
    },
  ];

  const dropdowns = [
    { label: "Role", options: ["Student", "Faculty", "Staff"] },
    { label: "Category", options: ["All", "Medical", "Infrastructure", "Event", "Sports", "Safety"] },
    { label: "Branch", options: ["All", "CSE", "ECE", "MECH"] },
    { label: "Year", options: ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"] },
  ];

  const issues = [
    {
      id: 1,
      student: "Shreya Patel",
      details: "B.Tech CSE • ID-28939",
      image: "https://i.pravatar.cc/150?img=45",
      issueTitle: "Projector not working in CR-2",
      issueDesc: "The project has not been working since",
      category: "Infrastructure",
      priority: "Medium",
    },
    {
      id: 2,
      student: "Shreya Patel",
      details: "B.Tech CSE • ID-28939",
      image: "https://i.pravatar.cc/150?img=47",
      issueTitle: "WiFi not working in Hostel Floor 3",
      issueDesc: "Internet connectivity is very poor or un...",
      category: "Infrastructure",
      priority: "Medium",
    },
    {
      id: 3,
      student: "Rahul Sharma",
      details: "B.Tech CSE • ID-28939",
      image: "https://i.pravatar.cc/150?img=11",
      issueTitle: "Ground maintenance required",
      issueDesc: "Football field has uneven surface.",
      category: "Sports",
      priority: "Medium",
    },
    {
      id: 4,
      student: "Sameer Rathod",
      details: "B.Tech CSE • ID-28939",
      image: "https://i.pravatar.cc/150?img=12",
      issueTitle: "Ground maintenance required",
      issueDesc: "Football field has uneven surface.",
      category: "Sports",
      priority: "Medium",
    },
    {
      id: 5,
      student: "Shreya Patel",
      details: "B.Tech CSE • ID-28939",
      image: "https://i.pravatar.cc/150?img=20",
      issueTitle: "Projector not working in CR-2",
      issueDesc: "The project has not been working since",
      category: "Infrastructure",
      priority: "Medium",
    },
    {
      id: 6,
      student: "Shreya Patel",
      details: "B.Tech CSE • ID-28939",
      image: "https://i.pravatar.cc/150?img=26",
      issueTitle: "WiFi not working in Hostel Floor 3",
      issueDesc: "Internet connectivity is very poor or un...",
      category: "Hostel",
      priority: "Medium",
    },
  ];

  const columns = [
    { title: "Student", key: "student" },
    { title: "Issue", key: "issue" },
    { title: "Category", key: "category" },
    { title: "Priority", key: "priority" },
  ];

  const tableData = issues.map((issue) => ({
    student: (
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-100 shadow-sm relative">
          <Image
            src={issue.image}
            alt={issue.student}
            fill
            sizes="42px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[14px] font-bold text-[#16284F] truncate">{issue.student}</p>
          <p className="text-[12px] text-gray-500 font-medium truncate mt-0.5">{issue.details}</p>
        </div>
      </div>
    ),
    issue: (
      <div className="flex flex-col min-w-0 pl-2">
        <p className="text-[14px] font-bold text-[#16284F] truncate">{issue.issueTitle}</p>
        <p className="text-[13px] text-gray-500 truncate mt-0.5">{issue.issueDesc}</p>
      </div>
    ),
    category: (
      <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#EDF3FF] text-[#4E88FF]">
        {issue.category}
      </span>
    ),
    priority: (
      <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#FFF4ED] text-[#FF9E4E]">
        {issue.priority}
      </span>
    ),
  }));

  return (
    <main className="flex flex-col lg:flex-row w-full min-h-screen overflow-x-hidden">
      <div className="w-full lg:w-[68%] p-4 md:p-6 lg:p-2 flex flex-col gap-6 lg:gap-8 lg:h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#16284F] text-lg md:text-[26px] font-bold leading-tight">
              New Issues
            </h1>
            <p className="text-[#16284F] text-[13px] md:text-sm font-medium">
              View all new issues received across categories
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex items-center">
              <select className="cursor-pointer appearance-none bg-[#16284F] text-[#ffffff] py-1.5 pl-3 pr-8 rounded-md outline-none text-[13px] md:text-sm font-medium h-[34px]">
                <option value="">College</option>
                <option value="engineering">Engineering</option>
                <option value="medical">Medical</option>
                <option value="arts">Arts</option>
              </select>
              <CaretDown size={14} weight="bold" color="#ffffff" className="absolute right-2.5 pointer-events-none" />
            </div>
            <div className="relative flex items-center">
              <select className="cursor-pointer appearance-none bg-[#16284F] text-[#ffffff] py-1.5 pl-3 pr-8 rounded-md outline-none text-[13px] md:text-sm font-medium h-[34px]">
                <option value="">Student</option>
                <option value="ug">Undergraduate</option>
                <option value="pg">Postgraduate</option>
                <option value="phd">PhD</option>
              </select>
              <CaretDown size={14} weight="bold" color="#ffffff" className="absolute right-2.5 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex lg:hidden items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(67,193,122,0.25)] active:scale-95 group shrink-0"
          >
            <div className="flex items-center justify-center border-2 border-white rounded-full group-hover:rotate-90 transition-transform duration-300">
              <Plus size={12} weight="bold" />
            </div>
            Add Executive
          </button>
        </div>
        <div className="lg:overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full mb-3">
            {cardData.map((item, index) => (
              <CardComponent
                key={index}
                style={item.style}
                icon={item.icon}
                iconBgColor="#ffffff"
                value={<span className="text-[20px] md:text-base font-extrabold text-[#16284F] leading-none block pt-2 truncate">{item.value}</span>}
                label={item.label}
                textSize="text-[12px] md:text-[13px] text-[#4D6285] font-semibold"
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4">
            {dropdowns.map((dropdown, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#16284F] text-[13px] md:text-sm font-bold whitespace-nowrap">
                  {dropdown.label} :
                </span>
                <div className="relative flex items-center">
                  <select className="appearance-none border border-[#D7D7D7] shadow-sm text-[#282828] text-[13px] md:text-sm font-bold outline-none cursor-pointer hover:border-gray-400 py-1.5 pl-3 pr-8 rounded-md transition-all focus:ring-2 focus:ring-[#43C17A]/20 min-w-[100px] h-[34px]">
                    {dropdown.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={14} weight="bold" color="#282828" className="absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-[#16284F] text-lg font-bold">Issues Received Today</h2>
            <div className="bg-white -mt-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 p-5 -mb-6 border-b border-gray-50">
                <div className="bg-[#E8F8EF] p-2 rounded-full">
                  <ListDashes size={20} color="#43C17A" weight="fill" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#282828]">Recent Issues</h3>
                  <p className="text-sm text-[#282828] font-medium">Latest reported complaints across campus</p>
                </div>
              </div>
              <div className="p-2 sm:p-4">
                <TableComponent
                  columns={columns}
                  tableData={tableData}
                  isLoading={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <WellbeingRight button={true} onHeaderActionClick={() => setIsModalOpen(true)} />
      <AddExecutiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}