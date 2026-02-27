import {
  Briefcase,
  Buildings,
  GraduationCap,
  Megaphone,
} from "@phosphor-icons/react";

import { BranchPlacementChart } from "../charts/branchPlacementChart";
import { PlacementGrowthChart } from "../charts/placementGrowthChart";
import { PrePlacementTalks } from "./prePlacementTalks";
import DashboardStats from "./statCards";
import { TopHiringCompanies } from "./topHiringCompanies";
import { UpcomingClasses } from "./upcomingClasses";

const MOCK_STATS = [
  {
    title: "Eligible Students",
    value: "05",
    bgColor: "bg-[#E5DEFF]",
    iconColor: "#8B5CF6",
    Icon: GraduationCap,
  },
  {
    title: "Students Placed",
    value: "05",
    bgColor: "bg-[#FFEEDD]",
    iconColor: "#F97316",
    Icon: Briefcase,
  },
  {
    title: "Active Drives",
    value: "14",
    bgColor: "bg-[#E0FCE0]",
    iconColor: "#22C55E",
    Icon: Megaphone,
  },
  {
    title: "Partner Companies",
    value: "5,480",
    bgColor: "bg-[#D0E8FF]",
    iconColor: "#3B82F6",
    Icon: Buildings,
  },
];

const MOCK_COMPANIES = ["tcs", "wipro", "infosys", "accenture"];

const MOCK_BRANCH_DATA = [
  { name: "CSE", value: 100 },
  { name: "EEE", value: 75 },
  { name: "ECE", value: 92 },
  { name: "MECH", value: 78 },
  { name: "IT", value: 95 },
];

const MOCK_TALKS = [
  {
    time: "8:00 AM - 9:00 AM",
    title: "TCS Pre-Placement Talk",
    branch: "CSE",
    details: [
      { label: "Education Type :", value: "B.Tech" },
      { label: "Date :", value: "20 Feb 2026" },
      { label: "Total Participants:", value: "20" },
      { label: "Year :", value: "2nd Year" },
      { label: "Section:", value: "A" },
    ],
  },
  {
    time: "10:00 AM - 11:00 AM",
    title: "Zerodha Pre-Placement Talk",
    branch: "CSE",
    details: [
      { label: "Education Type :", value: "B.Tech" },
      { label: "Date :", value: "20 Feb 2026" },
      { label: "Total Participants:", value: "20" },
      { label: "Year :", value: "2nd Year" },
      { label: "Section:", value: "A" },
    ],
  },
];

const MOCK_GROWTH_CHART_DATA = [
  { id: "1", label: "2026", value: 100, color: "#050A10", branch: "CSE" },
  { id: "2", label: "2025", value: 70, color: "#050A10", branch: "CSE" },
  { id: "gap1", label: "", value: 0, color: "transparent" },
  { id: "3", label: "2026", value: 80, color: "#162444", branch: "EEE" },
  { id: "4", label: "2025", value: 90, color: "#162444", branch: "EEE" },
  { id: "gap2", label: "", value: 0, color: "transparent" },
  { id: "5", label: "2026", value: 100, color: "#1E305A", branch: "ECE" },
  { id: "6", label: "2025", value: 72, color: "#1E305A", branch: "ECE" },
  { id: "gap3", label: "", value: 0, color: "transparent" },
  { id: "7", label: "2026", value: 90, color: "#56647E", branch: "MECH" },
  { id: "8", label: "2025", value: 83, color: "#56647E", branch: "MECH" },
  { id: "gap4", label: "", value: 0, color: "transparent" },
  { id: "9", label: "2026", value: 100, color: "#929CAF", branch: "IT" },
  { id: "10", label: "2025", value: 74, color: "#929CAF", branch: "IT" },
];

const MOCK_GROWTH_LEGEND = [
  { branch: "CSE", color: "#050A10" },
  { branch: "EEE", color: "#162444" },
  { branch: "ECE", color: "#1E305A" },
  { branch: "MECH", color: "#56647E" },
  { branch: "IT", color: "#929CAF" },
];

const MOCK_CLASSES = [
  {
    title: "B.Tech CSE – Year 4",
    desc: "Session on creating professional resumes and optimizing LinkedIn for recruiters.",
    time: "9:00 Am",
  },
  {
    title: "B.Tech CSE – Year 3",
    desc: "Conducting mock GD rounds and evaluating communication, confidence, and reasoning skills.",
    time: "9:00 Am",
  },
  {
    title: "B.Tech CSE – Year 4",
    desc: "Meeting to align upcoming drive schedule and finalize student eligibility lists.",
    time: "9:00 Am",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 flex flex-col">
      <DashboardStats stats={MOCK_STATS} />

      <div className="w-full max-w-6xl mx-auto bg-white rounded-[12px] px-4 mt-4 shadow-sm border border-gray-100/50">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-shrink-0 w-[56px] h-[56px] bg-[#DEEFE5] rounded-lg flex items-center justify-center">
            <img
              src="/calendar-3d.png"
              alt="3D Calendar icon"
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
          </div>

          <p className="text-[13px] py-4 font-medium text-[#1D2B4A] leading-[1.6] m-0">
            Upcoming Placement Alert – TCS and Infosys drives are happening next
            week. 124 shortlisted students are set to attend the recruitment
            rounds. Please be prepared and check your schedule for details.
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-4 bg-[#F3F4F6] pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <TopHiringCompanies companies={MOCK_COMPANIES} />
            <BranchPlacementChart data={MOCK_BRANCH_DATA} />
            <PrePlacementTalks talks={MOCK_TALKS} />
          </div>

          <div className="flex flex-col gap-4 h-full">
            <PlacementGrowthChart
              chartData={MOCK_GROWTH_CHART_DATA}
              legendData={MOCK_GROWTH_LEGEND}
            />
            <UpcomingClasses classes={MOCK_CLASSES} />
          </div>
        </div>
      </div>
    </div>
  );
}
