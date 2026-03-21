"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { CaretDown, CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { fetchAdminDepartmentStats } from "@/lib/helpers/admin/assignments/fetchAdminDepartmentStats";
import AssignmentCard from "./components/assignmentCard";
import QuizBasic from "./components/quizBasic";
import DiscussionForumBasic from "./components/discussionForumBasic";
import TabNavigation from "./components/tabNavigation";
import { Loader } from "../../(student)/calendar/right/timetable";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

interface FilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  displayModifier?: (opt: string) => string;
}

const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  displayModifier,
}: FilterProps) => {
  return (
    <div className="flex flex-col gap-1 min-w-30">
      <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1">
        {label}
      </label>
      <div className="relative border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-[13px] font-medium text-gray-700 pl-2 pr-2 focus:outline-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="py-2">
              {displayModifier ? displayModifier(opt) : opt}
            </option>
          ))}
        </select>
        <CaretDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          weight="bold"
        />
      </div>
    </div>
  );
};

const AssignmentPage = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "assignments";

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const { collegeEducationType } = useAdmin();
  const cardsPerPage = 15;

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;

        const { data: userRecord } = await supabase
          .from("users")
          .select("userId")
          .eq("auth_id", auth.user.id)
          .single();

        if (!userRecord) return;

        const adminCtx = await fetchAdminContext(userRecord.userId);

        const { data } = await fetchAdminDepartmentStats(adminCtx.collegeId, adminCtx.collegeEducationId);
        setDataList(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredResults = useMemo(() => {
    return dataList.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesDept = deptFilter === "All" || item.deptCode === deptFilter;
      const matchesYear = yearFilter === "All" || item.year === yearFilter;
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [search, deptFilter, yearFilter, dataList]);

  const totalPages = Math.ceil(filteredResults.length / cardsPerPage);
  const currentCards = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredResults.slice(start, start + cardsPerPage);
  }, [filteredResults, currentPage]);

  const uniqueDepts = useMemo(
    () => ["All", ...Array.from(new Set(dataList.map((d) => d.name)))],
    [dataList],
  );
  const uniqueYears = useMemo(
    () => ["All", ...Array.from(new Set(dataList.map((d) => d.year)))],
    [dataList],
  );

  if (loading && activeTab === "assignments")
    return (
      <div className="p-10 text-center">
        <Loader />
      </div>
    );

  // Render different content based on active tab
  if (activeTab === "quiz") {
    return <QuizBasic />;
  }

  if (activeTab === "discussion") {
    return <DiscussionForumBasic />;
  }

  // Default: Assignments tab
  return (
    <div className="flex flex-col m-4">
      {/* Tab Navigation */}
      <TabNavigation />

      <div className="mt-0 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-[69%]">
          <input
            type="text"
            placeholder="Search here......"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-black h-11 pl-5 pr-12 rounded-full bg-[#EAEAEA] text-sm outline-none"
          />
          <MagnifyingGlass
            size={22}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E]"
            weight="bold"
          />
        </div>

        <div className="bg-white rounded-xl p-2 px-4 shadow-sm flex flex-wrap gap-4 border border-gray-100">
          <FilterDropdown
            label={collegeEducationType === "Inter" ? "Group" : "Branch"}
            value={deptFilter}
            options={uniqueDepts}
            onChange={setDeptFilter}
          />
          <FilterDropdown
            label="Year"
            value={yearFilter}
            options={uniqueYears}
            onChange={setYearFilter}
            displayModifier={(o) => (o === "All" ? o : `${o}`)}
          />
        </div>
      </div>

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {currentCards.map((dept) => (
            <AssignmentCard key={dept.id} {...dept} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border bg-white disabled:opacity-30"
            >
              <CaretLeft size={18} />
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border bg-white disabled:opacity-30"
            >
              <CaretRight size={18} />
            </button>
          </div>
        )}
        {filteredResults.length === 0 && (
          <div className="flex justify-center py-20 text-gray-400">
            No matching records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignmentPage />
    </Suspense>
  );
}
