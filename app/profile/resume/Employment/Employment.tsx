"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmploymentForm from "./EmploymentForm";
import { getEmployment } from "@/lib/helpers/profile/employment";
import { useRouter } from "next/navigation";

export default function Employment() {
  const router = useRouter();

  const studentId = 1;

  const [employments, setEmployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployments();
  }, []);

  const fetchEmployments = async () => {
    try {
      const data = await getEmployment(studentId);
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

  if (loading) return <p className="h-full w-full text-[#282828] flex self-center justify-center items-center">Loading...</p>;

  return (
    <div className="bg-white rounded-xl p-6 w-full min-h-screen mt-2 mb-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-[#282828]">Employment</h2>

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
          >
            Add +
          </button>

          <button
            onClick={() => router.push("/profile?academic-achievements")}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {employments.map((emp, index) => (
        <EmploymentForm
          key={index}
          index={index}
          data={emp}
          studentId={studentId}
          onSuccess={fetchEmployments}
        />
      ))}
    </div>
  );
}
