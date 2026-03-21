'use client';
import TabNavigation from "./tabNavigation";

export default function QuizBasic() {
  return (
    <div className="flex flex-col m-4">
      {/* Tab Navigation */}
      <TabNavigation />

      <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col p-4 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Quiz Management</h2>
          <p className="text-gray-500">Quiz interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}
