import FacultyLeavesLeft from "./left";
import LeavesRight from "./right";

export default function Assignments() {
  return (
    <main className="flex min-h-screen w-full flex-col pb-5 lg:flex-row">
      <div className="w-full lg:w-[68%]">
        <FacultyLeavesLeft />
      </div>
      <LeavesRight />
    </main>
  );
}
