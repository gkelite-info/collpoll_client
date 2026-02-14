// "use client"
// import { Suspense } from "react";
// import Tabs from "../components/Tabs";
// import CollegeAdminRight from "../components/collegeAdminRight";
// import SupportAdmins from "../components/SupportAdmins";
// import UsersOverview from "../components/users-overview/UsersOverview";
// import Branches from "../components/Branches";
// import EducationTypes from "../components/EducationTypes";
// import { useSearchParams } from "next/navigation";

// function InstitutionManagement() {
//     const searchParams = useSearchParams();
//     const activeTab = searchParams.get("tab") ?? "support-admins";
//     const renderTab = () => {
//         switch (activeTab) {
//             case "education-types":
//                 return <EducationTypes />;
//             case "branches":
//                 return <Branches />;
//             case "users-overview":
//                 return <UsersOverview />;
//             default:
//                 return <SupportAdmins />;
//         }
//     };

//     return (
//         <div className="flex h-screen overflow-hidden mb-2">
//             <div className="w-[68%] flex flex-col p-2 pb-1">
//                 <Tabs activeTab={activeTab} />
//                 <div className="flex-1 overflow-y-auto mt-4 pb-1">
//                     {renderTab()}
//                 </div>
//             </div>
//             <div className="w-[32%] h-full overflow-y-auto p-2">
//                 <CollegeAdminRight />
//             </div>
//         </div>
//     );
// }

// export default function Page() {
//     return (
//         <Suspense fallback="Loading...">
//             <InstitutionManagement />
//         </Suspense>
//     )
// }


"use client";

import { useSearchParams } from "next/navigation";
import Tabs from "../components/Tabs";
import CollegeAdminRight from "../components/collegeAdminRight";
import SupportAdmins from "../components/SupportAdmins";
import UsersOverview from "../components/users-overview/UsersOverview";
import Branches from "../components/Branches";
import EducationTypes from "../components/EducationTypes";
import { Suspense } from "react";

function InstitutionManagementClient() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "support-admins";

  const renderTab = () => {
    switch (activeTab) {
      case "education-types":
        return <EducationTypes />;
      case "branches":
        return <Branches />;
      case "users-overview":
        return <UsersOverview />;
      default:
        return <SupportAdmins />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden mb-2">
      <div className="w-[68%] flex flex-col p-2 pb-1">
        <Tabs activeTab={activeTab} />
        <div className="flex-1 overflow-y-auto mt-4 pb-1">
          {renderTab()}
        </div>
      </div>

      <div className="w-[32%] h-full overflow-y-auto p-2">
        <CollegeAdminRight />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback="Loading...">
      <InstitutionManagementClient />
    </Suspense>
  );
}
