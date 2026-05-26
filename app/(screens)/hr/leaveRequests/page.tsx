import { Suspense } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import LeaveRequestsClient from "./components/LeaveRequestsClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[55vh] items-center justify-center">
          <Loader />
        </div>
      }
    >
      <LeaveRequestsClient />
    </Suspense>
  );
}
