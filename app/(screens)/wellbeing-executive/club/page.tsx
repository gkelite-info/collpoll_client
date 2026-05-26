import { Suspense } from "react";
import ClubShimmer from "../../faculty/clubs/components/shimmer";
import WellbeingClubClient from "./WellbeingClubClient";

export default function ClubPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-2 md:p-2 flex justify-center">
      <div className="w-full">
        <Suspense
          fallback={
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <ClubShimmer />
            </div>
          }
        >
          <WellbeingClubClient />
        </Suspense>
      </div>
    </div>
  );
}
