"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import { fetchAdminDepartmentStats } from "@/lib/helpers/admin/assignments/fetchAdminDepartmentStats";
import AssignmentCard from "./components/assignmentCard";

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
}: FilterProps) => (
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

const AssignmentPage = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);

  const cardsPerPage = 15;
  const router = useRouter();

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

        // 2. Fetch Aggregated Stats
        const { data } = await fetchAdminDepartmentStats(adminCtx.collegeId);
        setDataList(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtering Logic
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

  // Pagination Logic
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

  if (loading)
    return (
      <div className="p-10 text-black text-center">Loading Overview...</div>
    );

  return (
    <div className="flex flex-col m-4">
      <div className="mb-6 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit cursor-pointer">
            <h1 className="text-xl font-bold text-[#282828]">
              Assignments Overview
            </h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Track subjects, faculty who created assignments, raised issues, and
            submission progress.
          </p>
        </div>
        <div className="w-[30%]">
          <CourseScheduleCard isVisibile={true} fullWidth={false} />
        </div>
      </div>

      <div className="mt-0 mb-4 flex flex-col md:flex-row items-center gap-4">
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
            label="Department"
            value={deptFilter}
            options={uniqueDepts}
            onChange={setDeptFilter}
          />
          <FilterDropdown
            label="Year"
            value={yearFilter}
            options={uniqueYears}
            onChange={setYearFilter}
            displayModifier={(o) => (o === "All" ? o : `${o} Year`)}
          />
        </div>
      </div>

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {currentCards.map((dept) => (
            <AssignmentCard key={dept.id} {...dept} />
          ))}
        </div>

        {/* Pagination Controls (Hidden if 1 page) */}
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
