import PlacementRight from "../(dashboard)/components/right";
import WellbeingLeavesLeft from "../../wellbeing-executive/leaveRequests/left";

export default function PlacementLeaveRequests() {
  return (
    <main className="flex min-h-screen w-full flex-col pb-5 lg:flex-row">
      <div className="w-full lg:w-[68%]">
        <WellbeingLeavesLeft employeeRole="PlacementOfficer" enableTaggedView />
      </div>
      <PlacementRight />
    </main>
  );
}
