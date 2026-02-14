import { Suspense } from "react";
// import EducationTypes from "./components/education-types/EducationTypes";
// import Branches from "./components/branches/Branches";
// import UsersOverview from "./components/users-overview/UsersOverview";
import Tabs from "../components/Tabs";
import CollegeAdminRight from "../components/collegeAdminRight";
import SupportAdmins from "../components/SupportAdmins";

interface Props {
  searchParams: {
    tab?: string;
  };
}

export default function InstitutionManagement({ searchParams }: Props) {
  const tab = searchParams?.tab || "support-admins";

  const renderTab = () => {
    switch (tab) {
    //   case "education-types":
    //     return <EducationTypes />;
    //   case "branches":
    //     return <Branches />;
    //   case "users-overview":
    //     return <UsersOverview />;
      default:
        return <SupportAdmins />;
    }
  };

  return (
    <div className="flex p-2">
      {/* LEFT SIDE */}
      <div className="w-[68%] space-y-4">
        <Tabs activeTab={tab} />
        <Suspense fallback={<div>Loading...</div>}>
          {renderTab()}
        </Suspense>
      </div>

      {/* RIGHT SIDE */}
      <CollegeAdminRight />
    </div>
  );
}
