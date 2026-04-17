import { Suspense } from "react";
import StudentClubHeader from "./components/StudentClubHeader";
import ClubShimmer from "../../faculty/clubs/components/shimmer";
import StudentClubsClient from "./StudentClubsClient";


export default function StudentClubsPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-2 md:p-2 flex justify-center">
      <div className="mx-auto w-full">
        <StudentClubHeader />
        <Suspense
          fallback={
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm min-h-[80vh]">
              <ClubShimmer />
            </div>
          }
        >
          <StudentClubsClient />
        </Suspense>
      </div>
    </div>
  );
}