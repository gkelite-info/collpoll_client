"use client";

import { useUser } from "@/app/utils/context/UserContext";

export default function Page() {
  const {
    fullName,
    identifierId,
    wellBeingId,
    wellBeingIds,
    wellBeingRegistrationTypes,
    loading,
    gender  
  } = useUser();

  console.log("gender check", gender);

  const assignmentLabel =
    wellBeingRegistrationTypes.length > 0
      ? wellBeingRegistrationTypes.join(", ")
      : "Not assigned";

  return (
    <div className="min-h-full p-4 md:p-6">
      <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-[#43C17A]">
          Wellbeing Executive
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Welcome{fullName ? `, ${fullName}` : ""}
        </h1>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-[#F4F4F4] p-4">
            <p className="text-xs font-medium text-gray-500">Employee ID</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {loading ? "Loading..." : identifierId || "Not available"}
            </p>
          </div>
          <div className="rounded-md bg-[#F4F4F4] p-4">
            <p className="text-xs font-medium text-gray-500">
              Primary Wellbeing ID
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {loading ? "Loading..." : wellBeingId ?? "Not available"}
            </p>
          </div>
          <div className="rounded-md bg-[#F4F4F4] p-4">
            <p className="text-xs font-medium text-gray-500">
              Assignment Scope
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
              {loading ? "Loading..." : assignmentLabel}
            </p>
          </div>
        </div>
        {wellBeingIds.length > 1 && (
          <p className="mt-4 text-xs text-gray-500">
            Active wellbeing records: {wellBeingIds.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
