// import { Suspense } from "react";
// import { announcementsData, clubInfo, requestsData } from "./components/mock-data";
// import ClubHeader from "./components/ClubHeader";
// import TabNavigation from "./components/TabNavigation";
// import RequestsList from "./components/RequestsList";
// import ClubInfo from "./components/ClubInfo";
// import Announcements from "./components/Announcements";
// import ClubShimmer from "./components/shimmer";

// export default async function FacultyClubsPage({
//     searchParams,
// }: {
//     searchParams: Promise<{ tab?: string; filter?: string }>;
// }) {
//     const params = await searchParams;
//     const currentTab = params.tab || "requests";
//     const currentFilter = params.filter || "all";

//     const filteredRequests = requestsData.filter((req) => {
//         if (currentFilter === "all") return true;
//         return req.status === currentFilter;
//     });

//     return (
//         <div className="min-h-screen bg-[#f3f4f6] p-2 md:p-2">
//             <ClubHeader />
//             <div className="mx-auto max-w-5xl">
//                 <main className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
//                     <div className="flex justify-center mb-8">
//                         <TabNavigation currentTab={currentTab} />
//                     </div>
//                     <Suspense fallback={<div><ClubShimmer /></div>}>
//                         {currentTab === "requests" ? (
//                             <div className="animate-in fade-in duration-300">
//                                 <ClubInfo info={clubInfo} />
//                                 <RequestsList
//                                     requests={filteredRequests}
//                                     currentFilter={currentFilter}
//                                 />
//                             </div>
//                         ) : (
//                             <div className="animate-in fade-in duration-300">
//                                 <Announcements announcements={announcementsData} />
//                             </div>
//                         )}
//                     </Suspense>
//                 </main>
//             </div>
//         </div>
//     );
// }

import { Suspense } from "react";
import ClubShimmer from "./components/shimmer";
import FacultyClubsClient from "./FacultyClubsClient";

export default function FacultyClubsPage() {
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
          <FacultyClubsClient />
        </Suspense>
      </div>
    </div>
  );
}