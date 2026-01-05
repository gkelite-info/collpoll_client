import React from "react";

export interface RequestData {
  sNo: string;
  requestId: string;
  photo: string;
  name: string;
  type: "Faculty" | "Student";
  requestedOn: string;
  details: string;
}

export interface RequestsTableProps {
  requests: RequestData[];
  onViewClick: (data: RequestData) => void;
}

const PendingApprovalsTable: React.FC<RequestsTableProps> = ({
  requests,
  onViewClick,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm font-sans bg-white">
      <table className="w-full min-w-[800px] table-auto border-collapse">
        <thead>
          <tr className="bg-[#F9FAFB] text-left text-xs font-bold text-gray-500 uppercase tracking-tight border-b border-gray-100">
            <th className="px-4 py-2.5">S.No</th>
            <th className="px-4 py-2.5">Request ID</th>
            <th className="px-4 py-2.5">Photo</th>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Requested On</th>
            <th className="px-4 py-2.5">Details</th>
            <th className="px-4 py-2.5 text-center">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {requests.map((request) => (
            <tr
              key={request.requestId}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                {request.sNo}
              </td>

              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">
                <span className="text-[#43C17A]">ID</span>
                <span className="text-gray-400 mx-1">-</span>
                <span className="text-gray-900">{request.requestId}</span>
              </td>

              <td className="px-4 py-2 whitespace-nowrap">
                <div className="h-7 w-7 rounded-full overflow-hidden border border-gray-100">
                  <img
                    src={request.photo}
                    alt={request.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </td>

              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-semibold tracking-tight">
                {request.name}
              </td>

              <td className="px-4 py-2 whitespace-nowrap text-xs">
                <span
                  className={`px-2 py-0.5 rounded-md contain-content font-medium ${
                    request.type === "Faculty"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  {request.type}
                </span>
              </td>

              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                {request.requestedOn}
              </td>

              <td className="px-4 py-2 text-xs text-gray-600 max-w-[200px] truncate">
                {request.details}
              </td>

              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">
                <div className="flex items-center justify-center space-x-1.5">
                  <button className="bg-[#E9F7F1] text-[#43C17A] px-2.5 py-1 rounded-md text-[11px] font-bold hover:bg-[#43C17A] hover:text-white transition-all">
                    Approve
                  </button>
                  <button className="bg-[#FFF1F0] text-[#FF4D4F] px-2.5 py-1 rounded-md text-[11px] font-bold hover:bg-[#FF4D4F] hover:text-white transition-all">
                    Reject
                  </button>
                  <button
                    onClick={() => onViewClick(request)}
                    className="text-[#16284F] cursor-pointer px-2 py-1 text-[11px] font-bold underline hover:text-blue-700 transition-colors"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingApprovalsTable;
