import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import ClubsClient from "./ClubsClient";

export default function ClubsPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] p-2 pb-4 flex justify-center">
      <div className="w-full mx-auto">
        <Suspense fallback={<div className="text-center p-10 text-gray-500"><Loader/></div>}>
          <ClubsClient />
        </Suspense>
      </div>
    </div>
  );
}