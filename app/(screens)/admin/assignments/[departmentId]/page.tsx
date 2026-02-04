"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CourseCard from "../components/courseCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import { fetchAdminSubjectDetails } from "@/lib/helpers/admin/assignments/fetchAdminSubjectDetails";

const DepartmentSubjectPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const departmentId = decodeURIComponent(params.departmentId as string);
  const year = searchParams.get("year") || "1";

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

        const { data } = await fetchAdminSubjectDetails(
          adminCtx.collegeId,
          departmentId,
          year,
        );

        setCourses(data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [departmentId, year]);

  if (loading)
    return (
      <div className="p-10 text-center text-black">
        Loading Faculty Subjects...
      </div>
    );

  return (
    <div className="flex flex-col m-4 relative">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#282828]">
            {departmentId} — {year} Overview
          </h1>
          <p className="text-[#282828] mt-1 text-sm">
            Detailed view of faculty assignments and subject progress.
          </p>
        </div>
        <div className="w-80">
          <CourseScheduleCard />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-20 rounded-xl text-center text-gray-400 border border-dashed">
          No active subjects found for this department and year.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.uniqueId} {...course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentSubjectPage;
