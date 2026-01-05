interface RequestData {
  id: string;
  avatar: string;
  name: string;
  role: "Student" | "Faculty";
  dept: string;
  email: string;
  contact: string;
  requestedOn: string;
}

interface UserRequestsTableProps {
  data?: RequestData[];
}

export default function UserRequestsTable({
  data = MOCK_REQUESTS,
}: UserRequestsTableProps) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EAECEF] text-[#4B5563]">
              <th className="py-2 px-4 text-center text-[11px] font-semibold uppercase tracking-wider w-12">
                S.No
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider w-16">
                Photo
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider">
                Role
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider">
                Dept
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider">
                Email
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider">
                Contact
              </th>
              <th className="py-2 px-4 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                Requested On
              </th>
              <th className="py-2 px-4 text-center text-[11px] font-semibold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/80 transition-colors duration-150"
              >
                <td className="py-2 px-4 text-center text-[13px] text-gray-500 font-medium">
                  {row.id}
                </td>
                <td className="py-2 px-4">
                  <div className="h-8 w-8 relative">
                    <img
                      src={row.avatar}
                      alt={row.name}
                      className="h-full w-full rounded-full object-cover border border-gray-100"
                    />
                  </div>
                </td>
                <td className="py-2 px-4 text-[13px] text-gray-700 font-medium whitespace-nowrap">
                  {row.name}
                </td>
                <td className="py-2 px-4 text-[13px] text-gray-600">
                  {row.role}
                </td>
                <td className="py-2 px-4 text-[13px] text-gray-600">
                  {row.dept}
                </td>
                <td className="py-2 px-4 text-[13px] text-gray-600">
                  {row.email}
                </td>
                <td className="py-2 px-4 text-[13px] text-gray-600 tabular-nums whitespace-nowrap">
                  {row.contact}
                </td>
                <td className="py-2 px-4 text-[13px] text-gray-600 tabular-nums whitespace-nowrap">
                  {row.requestedOn}
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <button className="bg-[#DBF3E6] hover:bg-[#A7F3D0] text-[#43C17A] text-[10px] font-bold px-3 py-1 rounded-full transition-colors">
                      Approve
                    </button>
                    <button className="bg-[#FFE3E3] hover:bg-[#FECDD3] text-[#FF0A0A] text-[10px] font-bold px-3 py-1 rounded-full transition-colors">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const MOCK_REQUESTS: RequestData[] = [
  {
    id: "01",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    name: "Arun Kumar",
    role: "Student",
    dept: "CSE",
    email: "arun@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "02",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    name: "Estelle Bald",
    role: "Faculty",
    dept: "IT",
    email: "estelle@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "03",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
    name: "Amanda Wo",
    role: "Student",
    dept: "ECE",
    email: "amanda@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "04",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    name: "Lily Tano",
    role: "Faculty",
    dept: "Mech",
    email: "lily@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "05",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    name: "Kevin Ray",
    role: "Student",
    dept: "CSE",
    email: "kevin@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "06",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    name: "Sophia Lin",
    role: "Faculty",
    dept: "IT",
    email: "sophia@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "07",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=faces",
    name: "Daniel Cruz",
    role: "Student",
    dept: "ECE",
    email: "daniel@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "08",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
    name: "Arjun Mehta",
    role: "Faculty",
    dept: "Mech",
    email: "arjun@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "09",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces",
    name: "Neha Sharma",
    role: "Student",
    dept: "CSE",
    email: "neha@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "10",
    avatar:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=150&h=150&fit=crop&crop=faces",
    name: "Jason Paul",
    role: "Faculty",
    dept: "IT",
    email: "jason@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "11",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
    name: "Reema Sajid",
    role: "Student",
    dept: "ECE",
    email: "reema@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
  {
    id: "12",
    avatar:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=faces",
    name: "Suresh N",
    role: "Faculty",
    dept: "Mech",
    email: "suresh@college.edu",
    contact: "98765 23140",
    requestedOn: "20 Nov 2025",
  },
];
