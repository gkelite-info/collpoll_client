import LeavesLeft from "./left";
import LeavesRight from "./right";

export default function Assignments() {
  return (
    <>
      <div className="flex items-start justify-between">
        <LeavesLeft />
        <LeavesRight />
      </div>
    </>
  );
}
