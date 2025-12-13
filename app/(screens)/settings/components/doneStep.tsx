"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useRouter } from "next/navigation";

export default function DoneStep() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FAFBFC] p-6 ">
      <div className="flex justify-between mb-6">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center text-[#282828] gap-2">
            Current Password
          </div>
          <p className="text-gray-500 text-sm">
            Update Your Current Account Password
          </p>
        </div>
        <div className="w-[32%]">
          <CourseScheduleCard />
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-2 text-[#282828]">
            Password updated
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Your password has been successfully changed.
          </p>

          <button
            onClick={() => router.push("/settings")}
            className="bg-[#43C17A] text-white px-6 py-2 rounded font-semibold"
          >
            Back to Settings
          </button>
        </div>
      </div>
    </main>
  );
}
