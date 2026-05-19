import MyAttendanceLeft from "./left";
import MyAttendanceRight from "./right";

export default function Assignments() {
  return (
    <>
      <div className="flex items-start justify-between">
        <MyAttendanceLeft />
        <MyAttendanceRight />
      </div>
    </>
  );
}
