"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import { getAdminSubjectsList } from "@/lib/helpers/admin/academics/getAdminSubjectsList";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubjectCard, { CardProps } from "../components/subjectCards";
import { SubjectCardSkeleton } from "../shimmer/subjectCardSkeleton";

export function ClientAcademicsWrapper({
  category,
  year,
}: {
  category: string;
  year: string;
}) {
  const router = useRouter();
  const { userId } = useUser();

  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<CardProps[]>([]);
  const [meta, setMeta] = useState({ title: "Loading...", year: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { collegeId } = await fetchAdminContext(userId);
      const sectionId = parseInt(category, 10);

      if (isNaN(sectionId)) {
        console.error("Invalid Section ID");
        setLoading(false);
        return;
      }

      const response = await getAdminSubjectsList(collegeId, sectionId);
      setSubjectData(response.subjects);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to load subject data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, category]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="p-2 flex flex-col lg:pb-5 m-4">
      <div className="flex justify-between items-start mb-5">
        <div className="flex flex-col w-[50%]">
          <div className="flex items-center gap-1">
            <button className="cursor-pointer" onClick={handleBack}>
              <CaretLeft size={23} className="-ml-1.5 text-black" />
            </button>
            <h1 className="text-[#282828] font-semibold text-2xl mb-1">
              Academics - {meta.title}
            </h1>
          </div>
          <p className="text-[#282828] text-s ml-5">
            {meta.year} • Track syllabus Progress
          </p>
        </div>

        <div className="flex flex-col items-end w-[32%] gap-4">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <SubjectCardSkeleton key={i} />
            ))}
          </div>
        ) : subjectData.length > 0 ? (
          <SubjectCard subjectProps={subjectData} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 text-lg">
              No subjects found for this class.
            </p>
            <p className="text-gray-400 text-sm">
              Use "Add Unit" to assign units and topics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
