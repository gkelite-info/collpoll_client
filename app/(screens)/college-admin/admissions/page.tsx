import { Metadata } from "next";
import KpiCards from "./components/KpiCards";
import AdmissionsChart from "./components/AdmissionsChart";
import RecentSubmissions from "./components/RecentSubmissions";

export const metadata: Metadata = {
  title: "Admissions | College Admin",
  description: "Overview of admissions from the Gkelite website",
};

export default function AdmissionsPage() {
  return (
    <div className="flex-1 w-full min-h-[90vh] p-2 pb-5 overflow-y-auto">
      <div className="space-y-4">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admissions Overview</h1>
            <p className="text-gray-500 mt-1">Monitor website traffic and application submissions.</p>
          </div>
          {/* <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 font-medium text-sm transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-200 hover:bg-blue-700 font-medium text-sm transition-colors">
              View Settings
            </button>
          </div> */}
        </div>

        <KpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdmissionsChart />
          </div>
          <div className="lg:col-span-1">
            <RecentSubmissions />
          </div>
        </div>
      </div>
    </div>
  );
}
