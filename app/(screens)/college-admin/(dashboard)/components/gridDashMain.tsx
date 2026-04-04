"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  UserGear,
  Buildings,
  UsersThree,
} from "@phosphor-icons/react";
import { FeeCollectionTrend, fetchFeeCollectionTrend, formatINR } from "@/lib/helpers/collegeAdmin/Feecollectiontrendapi";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { DashboardStats, fetchCollegeAdminDashboardStats } from "@/lib/helpers/collegeAdmin/Collegeadmindashboardapi";
import { AdminProfileCardShimmer } from "../shimmers/AdminProfileCardShimmer";
import { StatCardShimmer } from "../shimmers/StatCardShimmer";
import { QuickLinkCardShimmer } from "../shimmers/QuickLinkCardShimmer";
import { FeeCollectionTrendCardShimmer } from "../shimmers/FeeCollectionTrendCardShimmer";
import { MeetingCardShimmer } from "../shimmers/MeetingCardShimmer";
import { AdminSectionShimmer } from "../shimmers/AdminSectionShimmer";
import AdminListView from "./AdminListView";
import FacultyListView from "./FacultyListView";
import StudentListView from "./StudentListView";
import ParentListView from "./ParentListView";
import FinanceListView from "./FinanceListView";



// ─── Static config (icons / colors only) ─────────────────────────────────────

const statConfig = [
  { id: 1, key: "educationTypeCount", label: "Education Types", color: "bg-[#EAE4FF]", icon: GraduationCap, iconColor: "text-[#7C3AED]" },
  { id: 2, key: "totalAdmins", label: "Admins", color: "bg-[#FFF0D9]", icon: UserGear, iconColor: "text-[#EA580C]" },
  { id: 3, key: "totalBranches", label: "Branches", color: "bg-[#E2F9EB]", icon: Buildings, iconColor: "text-[#10B981]" },
  { id: 4, key: "totalUsers", label: "Total Users", color: "bg-[#D1E9FF]", icon: UsersThree, iconColor: "text-[#2563EB]" },
] as const;

const quickLinks = [
  "Admins",
  "Faculty",
  "Students",
  "Parents",
  "Finance",
  "Placement",
];

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  color,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
  iconColor: string;
}) => (
  <div
    className={`${color} rounded-md p-5 flex flex-col justify-between h-[120px] shadow-xs`}
  >
    <div className="bg-white w-8 h-8 aspect-square rounded-sm flex items-center justify-center mb-1">
      <Icon size={20} weight="fill" className={iconColor} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-[#1F2937]">{value}</h3>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  </div>
);

// ─── QuickLinkCard ────────────────────────────────────────────────────────────

const QuickLinkCard = ({ title, onClick }: { title: string; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-[#E4F2E7] hover:bg-[#d4eadd] transition-colors rounded-lg p-4 flex flex-col justify-between h-16 cursor-pointer shadow-xs"
  >
    <span className="font-semibold text-[#1F2937] text-[14px]">{title}</span>
    <span className="text-xs font-medium text-[#1F2937] underline decoration-1 underline-offset-2">
      View
    </span>
  </div>
);

// ─── AdminProfileCard ─────────────────────────────────────────────────────────

const AdminProfileCard = ({ data }: { data: any }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-bold text-[#1F2937] text-lg">{data.fullName}</h3>
      <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded-full">
        Active
      </span>
    </div>

    <a
      href={`mailto:${data.email}`}
      className="text-[#22C55E] text-xs font-medium mb-5 hover:underline block"
    >
      {data.email}
    </a>

    {/* Details Grid */}
    <div className="space-y-2 text-[13px]">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Education Type :</span>
        <span className="font-bold text-[#1E40AF]">{data.eduType}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Branches:</span>
        <span className="font-bold text-gray-800">{data.branchCount}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Mobile:</span>
        <span className="font-bold text-gray-800">{data.mobile}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Gender:</span>
        <span className="font-bold text-gray-800">{data.gender}</span>
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="text-gray-600 font-medium">Date of Joining:</span>
        <span className="font-bold text-gray-600">
          {data.dateOfJoining && data.dateOfJoining !== "—"
            ? data.dateOfJoining
            : "—"}
        </span>
      </div>
    </div>
  </div>
);

// ─── FeeCollectionTrendCard ───────────────────────────────────────────────────

// Assign a fixed colour palette per segment index
const SEGMENT_COLORS = ["#7C3AED", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#EC4899"];

const FeeCollectionTrendCard = ({ trend }: { trend: FeeCollectionTrend | null }) => {
  // Build arc segments from real data; fall back to empty donut while loading
  const segments = (trend?.segments ?? []).map((seg, i) => ({
    label: seg.eduType,
    value: formatINR(seg.collected),
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    amount: seg.collected,
  }));

  const total = segments.reduce((s, seg) => s + seg.amount, 0) || 1; // avoid /0
  const cx = 70, cy = 70, r = 52, gap = 0.04;

  let startAngle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const angle = (seg.amount / total) * 2 * Math.PI - gap;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
    startAngle = endAngle + gap;
    return { ...seg, d };
  });

  const centreLabel = trend ? formatINR(trend.grandTotal) : "—";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <p className="font-bold text-[#1F2937] text-[14px]">Fee Collection Trend</p>

      {/* Donut centred */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="150" height="150" viewBox="0 0 140 140">
            {arcs.length > 0 ? (
              arcs.map((arc, i) => (
                <path
                  key={i}
                  d={arc.d}
                  stroke={arc.color}
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                />
              ))
            ) : (
              /* Empty state ring while loading */
              <circle
                cx={cx} cy={cy} r={r}
                stroke="#E5E7EB" strokeWidth="14" fill="none"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[15px] font-bold text-[#1F2937]">{centreLabel}</span>
          </div>
        </div>
      </div>

      {/* Legend below donut */}
      <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-[12px]">
        {arcs.length > 0 ? (
          arcs.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
              <div>
                <p className="text-gray-500 font-medium leading-tight">{seg.label}</p>
                <p className="font-bold leading-tight" style={{ color: seg.color }}>{seg.value}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs">No collection data yet</p>
        )}
      </div>
    </div>
  );
};

// ─── MeetingCard ──────────────────────────────────────────────────────────────

const PillTag = ({ label }: { label: string }) => (
  <span className="bg-gray-100 text-gray-600 font-medium text-xs px-3 py-1 rounded-full whitespace-nowrap">
    {label}
  </span>
);

const MeetingCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-w-0">
    {/* Green header bar */}
    <div className="bg-[#43C17A26] px-4 py-2.5 flex items-center gap-3 border-b-2 border-dotted border-[#43C17A]">
      <div className="bg-[#43C17A] p-1.5 rounded-full flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9E9E9">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" stroke="#E9E9E9" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <span className="text-[#11934A] font-semibold text-base">8:00 AM - 9:00 AM</span>
    </div>

    {/* Body */}
    <div className="p-5 flex flex-col gap-5 flex-1">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[#43C17A] font-semibold text-[15px]">Fee Planning Q1</h2>
        <span className="bg-[#43C17A26] text-[#11934A] text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
          Finance
        </span>
      </div>

      <div className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-normal flex-shrink-0">Education Type :</span>
          <PillTag label="B.Tech" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-normal flex-shrink-0">Admin :</span>
          <PillTag label="Shravani - (B.Tech)" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-normal flex-shrink-0">Date :</span>
          <PillTag label="20 Feb 2026" />
          <button
            disabled
            className="ml-auto px-6 py-2.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed whitespace-nowrap flex-shrink-0"
            title="No meeting link available"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId, loading: contextLoading } = useCollegeAdmin();

  // Map URL subview param → activeView label
  const SUBVIEW_MAP: Record<string, string> = {
    admins:   "Admins",
    faculty:  "Faculty",
    students: "Students",
    parents:  "Parents",
    finance:  "Finance",
  };

  const subviewParam = searchParams.get("subview");
  const [activeView, setActiveView] = useState<string | null>(
    subviewParam ? (SUBVIEW_MAP[subviewParam] ?? null) : null
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<FeeCollectionTrend | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (contextLoading || !collegeId) return;
    const load = async () => {
      try {
        const [dashData, trendData] = await Promise.all([
          fetchCollegeAdminDashboardStats(collegeId),
          fetchFeeCollectionTrend(collegeId),
        ]);
        setStats(dashData);
        setTrend(trendData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [collegeId, contextLoading]);

  const isLoading = contextLoading || isFetching;

  const handleSetView = (view: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view) {
      params.set("subview", view.toLowerCase());
    } else {
      params.delete("subview");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
    setActiveView(view);
  };

  // ── Sub-view: Admins list ──
  if (activeView === "Admins") {
    return <AdminListView onBack={() => handleSetView(null)} />;
  }

  if (activeView === "Faculty") {
    return <FacultyListView onBack={() => handleSetView(null)} />;
  }

  if (activeView === "Students") {
    return <StudentListView onBack={() => handleSetView(null)} />;
  }

  if (activeView === "Parents") {
    return <ParentListView onBack={() => handleSetView(null)} />;
  }

  if (activeView === "Finance") {
    return <FinanceListView onBack={() => handleSetView(null)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statConfig.map((stat) => (
          isLoading || !stats ? (
            <StatCardShimmer key={stat.id} />
          ) : (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={String(stats[stat.key as keyof DashboardStats] ?? 0)}
              color={stat.color}
              icon={stat.icon}
              iconColor={stat.iconColor}
            />
          )
        ))}
      </div>

      {/* Middle Quick Links Row */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading
            ? [...Array(6)].map((_, i) => (
              <QuickLinkCardShimmer key={i} />
            ))
            : quickLinks.map((link) => (
              <QuickLinkCard
                key={link}
                title={link}
                onClick={() => handleSetView(link)}
              />
            ))
          }
        </div>
      </div>

      {/* Admins — horizontal scroll, single row */}
      {isLoading ? (
        <AdminSectionShimmer />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1F2937] text-xl font-bold">Admins</h2>
            <button
              onClick={() => router.push("/college-admin/add-admin")}
              className="bg-[#089144] hover:bg-[#06723a] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Add Admin
            </button>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {(stats?.adminDetails ?? []).map((admin) => (
              <div key={admin.adminId} className="min-w-[260px] flex-shrink-0">
                <AdminProfileCard data={admin} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Collection Trend + Meeting Card */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {isLoading ? (
          <FeeCollectionTrendCardShimmer />
        ) : (
          <FeeCollectionTrendCard trend={trend} />
        )}
        {isLoading ? (
          <MeetingCardShimmer />
        ) : (
          <MeetingCard />
        )}
      </div>
    </div>
  );
}