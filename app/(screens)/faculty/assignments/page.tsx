import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AssignmentsRight from "../../assignments/right";
import { AssignmentsLeft } from "./components/left";

export default function Page() {
  return (
    <main className="flex w-full min-h-screen">
      <AssignmentsLeft />
      <AssignmentsRight />
    </main>
  );
}
