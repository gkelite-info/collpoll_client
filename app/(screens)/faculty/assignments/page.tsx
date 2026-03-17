import AssignmentsLeft from "./components/left";
import AssignmentsRight from "./components/right";


export default function Page() {
  return (
    <main className="flex w-full max-h-screen overflow-y-auto focus:outline-none">
      <AssignmentsLeft />
      <AssignmentsRight />
    </main>
  );
}
