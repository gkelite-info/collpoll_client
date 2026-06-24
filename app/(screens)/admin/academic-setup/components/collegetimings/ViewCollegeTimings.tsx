"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getCollegeTimings } from "@/lib/helpers/collegeTimings/collegeTimingsAPI";
import CollegeTimingsTable from "./CollegeTimingsTable";

export default function ViewCollegeTimings() {
  const { collegeId } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTimings() {
      if (!collegeId) return;
      setIsLoading(true);
      const res = await getCollegeTimings(collegeId);
      
      if (res.success && res.data) {
        setTableData(res.data);
      }
      setIsLoading(false);
    }
    fetchTimings();
  }, [collegeId]);

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-5">
        <h2 className="text-xl font-bold text-[#16284F]">College Timings</h2>
      </div>

      <CollegeTimingsTable timings={tableData} isLoading={isLoading} />
    </div>
  );
}
