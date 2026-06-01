import LeavesLeft from "./left";
import LeavesRight from "./right";

export default function LeaveRequests() {
  return (
    <main className="flex flex-col lg:flex-row w-full min-h-screen pb-5">
      <div className="w-[100%] lg:w-[68%]">
        <LeavesLeft />
      </div>
      <LeavesRight />
    </main>
  );
}
