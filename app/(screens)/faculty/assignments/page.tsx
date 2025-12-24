import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import AssignmentsRight from "../../assignments/right";
import AssignmentsLeft from "./components/left";
=======
=======
>>>>>>> Stashed changes
import AssignmentsRight from "../../(student)/assignments/right";
import { AssignmentsLeft } from "./components/left";
>>>>>>> Stashed changes

export default function Page() {
  return (
    <main className="flex w-full min-h-screen">
      <AssignmentsLeft />
      <AssignmentsRight />
    </main>
  );
}
