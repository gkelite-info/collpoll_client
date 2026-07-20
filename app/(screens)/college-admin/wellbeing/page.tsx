import { Suspense } from "react";
import WellbeingContent, { WellbeingPageShimmer } from "./components/WellbeingContent";
import CollegeAdminWellbeingGuard from "./components/CollegeAdminWellbeingGuard";

export default function WellbeingPage() {
  return (
    <CollegeAdminWellbeingGuard>
      <Suspense fallback={<WellbeingPageShimmer />}>
        <WellbeingContent />
      </Suspense>
    </CollegeAdminWellbeingGuard>
  );
}
