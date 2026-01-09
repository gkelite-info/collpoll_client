import AssignmentsLeft from "./components/left";
import AssignmentsRight from "./components/right";


export default function Page() {
  return (
    <main className="flex w-full min-h-screen">
      <AssignmentsLeft />
      <AssignmentsRight />
    </main>
  );
}
