import MyAttendanceLeft from "./left";
import MyAttendanceRight from "./right";

export default function Assignments() {
  return (
    <main className="flex flex-col lg:flex-row w-full min-h-screen pb-5">
      <div className="w-[100%] lg:w-[68%]">
        <MyAttendanceLeft />
      </div>
      <MyAttendanceRight />
    </main>
  );
}
