import MyAttendanceLeft from "./left";
import MyAttendanceRight from "./right";

export default function Assignments() {
  return (
    <>
      <div className="flex items-start justify-between max-md:flex-col max-md:gap-4">
        <MyAttendanceLeft />
        <MyAttendanceRight />
      </div>
    </>
  );
}
