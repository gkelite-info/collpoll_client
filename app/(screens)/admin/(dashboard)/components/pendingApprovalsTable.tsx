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
}

const PendingApprovalsTable: React.FC<RequestsTableProps> = ({ requests }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl mt-2 font-sans">
      <table className="w-full min-w-[800px] table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-3">S.No</th>
            <th className="px-6 py-3">Request ID</th>
            <th className="px-6 py-3">Photo</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Requested On</th>
            <th className="px-6 py-3">Details</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {requests.map((request) => (
            <tr key={request.requestId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.sNo}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="text-[#43C17A]">ID</span> -{" "}
                <span className="text-gray-900">{request.requestId}</span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={request.photo}
                  alt={request.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {request.name}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.type}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.requestedOn}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.details}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="bg-[#DBF3E6] text-[#43C17A] px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#D9F9C3]">
                    Approve
                  </button>
                  <button className="bg-[#FFE3E3] text-[#FF0A0A] px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#FFD7D9]">
                    Reject
                  </button>
                  <button className="text-[#16284F] cursor-pointer px-3 py-1.5 text-sm font-medium underline decoration-solid hover:text-gray-900">
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
