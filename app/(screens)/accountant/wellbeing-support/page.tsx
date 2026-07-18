import { Suspense } from "react";
import WellbeingContent, {
  WellbeingPageShimmer,
} from "@/app/(screens)/finance/wellbeing/components/WellbeingContent";

export default function AccountantWellbeingSupportPage() {
  return (
    <Suspense fallback={<WellbeingPageShimmer />}>
      <WellbeingContent />
    </Suspense>
  );
}
