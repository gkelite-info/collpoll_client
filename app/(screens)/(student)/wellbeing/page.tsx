import { Suspense } from "react";
import WellbeingContent from "./components/WellbeingContent";
import { Loader } from "../calendar/right/timetable";

export default function WellbeingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-10">
        <Loader />
      </div>
    }>
      <WellbeingContent />
    </Suspense>
  );
}