import MyAttendanceLeft from "./left";
import MyAttendanceRight from "./right";

export default function Assignments() {
  return (
    <main className="flex items-stretch justify-between w-full pb-2 max-md:flex-col max-md:gap-4">
      <MyAttendanceLeft />
      <MyAttendanceRight />
    </main>
  );
}
