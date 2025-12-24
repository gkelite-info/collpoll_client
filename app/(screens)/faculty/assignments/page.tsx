import AssignmentsLeft from "../../(student)/assignments/left";
import AssignmentsRight from "../../(student)/assignments/right";


export default function Page() {
  return (
    <main className="flex w-full min-h-screen">
      <AssignmentsLeft />
      <AssignmentsRight />
    </main>
  );
}
