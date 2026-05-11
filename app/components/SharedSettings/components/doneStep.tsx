"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { usePathname, useRouter } from "next/navigation";

export default function DoneStep() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#FAFBFC] p-6 max-md:bg-[#F4F5F6] max-md:p-0">
      <div className="flex justify-between mb-6 max-md:p-4 max-md:mb-2">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center text-[#282828] gap-2 max-md:text-[22px]">
            Current Password
          </div>
          <p className="text-gray-500 text-sm max-md:hidden">
            Update Your Current Account Password
          </p>
        </div>
        <div className="w-[32%] max-md:hidden">
          <CourseScheduleCard />
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center max-md:px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center max-md:p-6 max-md:rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-[#282828]">
            Password updated
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Your password has been successfully changed.
          </p>

          <button
            onClick={() => router.push(pathname)}
            className="w-full sm:w-auto bg-[#43C17A] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#3ba869] transition-colors cursor-pointer"
          >
            Back to Settings
          </button>
        </div>
      </div>
    </main>
  );
}
