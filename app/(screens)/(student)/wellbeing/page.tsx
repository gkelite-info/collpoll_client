import { Suspense } from "react";
import WellbeingContent from "./components/WellbeingContent";

export default function WellbeingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F3F3F3]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#43C17A]"></div>
      </div>
    }>
      <WellbeingContent />
    </Suspense>
  );
}