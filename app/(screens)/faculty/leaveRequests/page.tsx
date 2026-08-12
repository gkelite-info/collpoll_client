import { LeavePageShimmer } from "@/app/components/shimmers/LeaveRequestsShimmer";
import FacultyLeavesLeft from "./left";
import LeavesRight from "./right";
import { Suspense } from "react";

export default function Assignments() {
  return (
    <main className="flex min-h-screen w-full flex-col pb-5 lg:flex-row">
      <div className="w-full lg:w-[68%]">
        <Suspense fallback={<LeavePageShimmer />}>
          <FacultyLeavesLeft />
        </Suspense>
      </div>
      <LeavesRight />
    </main>
  );
}
