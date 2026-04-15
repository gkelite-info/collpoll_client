"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmploymentForm from "./EmploymentForm";
import { getEmployment } from "@/lib/helpers/profile/employment";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";

function EmploymentShimmer() {
  return (
    <div className="mb-12 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-5 bg-gray-200 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-md" />
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="h-3 w-36 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-10 w-full bg-gray-200 rounded-md" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-10 w-full bg-gray-200 rounded-md" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded-md" />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <div className="h-9 w-24 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function Employment() {
  const router = useRouter();
  const { studentId } = useUser();

  const [employments, setEmployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetchEmployments();
  }, [studentId]);

  const fetchEmployments = async () => {
    try {
      const data = await getEmployment(studentId!);
      setEmployments(data.length ? data : [{}]);
    } catch {
      toast.error("Failed to load employment details");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const last = employments[employments.length - 1];
    if (!last?.employmentId) {
      toast.error("Please submit the latest employment before adding a new one.");
      return;
    }
    setEmployments((prev) => [...prev, {}]);
  };

  if (!studentId) return null;

  return (
    <div className="bg-white rounded-xl p-6 pb-0.5 w-full mt-2 mb-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-[#282828]">Employment</h2>

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
          >
            Add +
          </button>
        </div>
      </div>

      {loading ? (
        <EmploymentShimmer />
      ) : (
        employments.map((emp, index) => (
          <EmploymentForm
            key={index}
            index={index}
            data={emp}
            studentId={studentId!}
            onSuccess={fetchEmployments}
          />
        ))
      )}
    </div>
  );
}