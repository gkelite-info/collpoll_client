import { Suspense } from "react";
import ClubShimmer from "../../faculty/clubs/components/shimmer";
import CollegeAdminClubsClient from "./CollegeAdminClubsClient";
import CollegeAdminClubHeader from "./components/CollegeAdminClubHeader";


export default function StudentClubsPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-2 md:p-2 flex justify-center">
      <div className="mx-auto w-full">
        <CollegeAdminClubHeader />
        <Suspense
          fallback={
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm min-h-[80vh]">
              <ClubShimmer />
            </div>
          }
        >
          <CollegeAdminClubsClient />
        </Suspense>
      </div>
    </div>
  );
}