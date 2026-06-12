import { Suspense } from "react";
import WellbeingContent, { WellbeingPageShimmer } from "./components/WellbeingContent";

export default function WellbeingPage() {
  return (
    <Suspense fallback={<WellbeingPageShimmer />}>
      <WellbeingContent />
    </Suspense>
  );
}
