import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

type Status = "Evaluated" | "Pending";

interface Row {
  id: number;
  photo: string;
  name: string;
  roll: string;
  date?: string;
  file?: string;
  marks?: string;
  feedback?: string;
  status: Status;
}

const initialData: Row[] = [
  {
    id: 1,
    photo: "https://i.pravatar.cc/40?img=1",
    name: "Amelia Coll",
    roll: "2345001",
    date: "02 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "23 / 25",
    feedback: "Good explanation of complexity.",
    status: "Evaluated",
  },
  {
    id: 2,
    photo: "https://i.pravatar.cc/40?img=2",
    name: "Estelle Bald",
    roll: "2345002",
    date: "03 Jan 2025",
    file: "DSA_Assignment1.pdf",
    status: "Pending",
  },
  {
    id: 3,
    photo: "https://i.pravatar.cc/40?img=3",
    name: "Amanda Wo",
    roll: "2345003",
    date: "02 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "25 / 25",
    feedback: "Excellent work.",
    status: "Evaluated",
  },
  {
    id: 4,
    photo: "https://i.pravatar.cc/40?img=4",
    name: "Lily Tano",
    roll: "2345004",
    date: "02 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "19 / 25",
    feedback: "Concepts correct but code not optimized.",
    status: "Evaluated",
  },
  {
    id: 5,
    photo: "https://i.pravatar.cc/40?img=5",
    name: "Kevin Ray",
    roll: "2345005",
    date: "03 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "24 / 25",
    feedback: "Neat presentation and comments.",
    status: "Evaluated",
  },
  {
    id: 6,
    photo: "https://i.pravatar.cc/40?img=6",
    name: "Sophia Lin",
    roll: "2345006",
    status: "Pending",
  },
  {
    id: 7,
    photo: "https://i.pravatar.cc/40?img=7",
    name: "Daniel Cruz",
    roll: "2345007",
    date: "03 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "21 / 25",
    feedback: "Logic clear; missed one test case.",
    status: "Evaluated",
  },
  {
    id: 8,
    photo: "https://i.pravatar.cc/40?img=8",
    name: "Arjun Mehta",
    roll: "2345008",
    date: "02 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "22 / 25",
    feedback: "Good attempt, improve documentation.",
    status: "Evaluated",
  },
  {
    id: 9,
    photo: "https://i.pravatar.cc/40?img=9",
    name: "Neha Sharma",
    roll: "2345009",
    status: "Pending",
  },
  {
    id: 10,
    photo: "https://i.pravatar.cc/40?img=10",
    name: "Jason Paul",
    roll: "2345110",
    date: "03 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "20 / 25",
    feedback: "Used correct approach; minor syntax errors.",
    status: "Evaluated",
  },
  {
    id: 11,
    photo: "https://i.pravatar.cc/40?img=11",
    name: "Reema Sajid",
    roll: "2345111",
    date: "02 Jan 2025",
    file: "DSA_Assignment1.pdf",
    marks: "25 / 25",
    feedback: "Flawless execution.",
    status: "Evaluated",
  },
  {
    id: 12,
    photo: "https://i.pravatar.cc/40?img=12",
    name: "Suresh N",
    roll: "2345112",
    status: "Pending",
  },
];

export default function AssignmentTable() {
  const [rows, setRows] = useState<Row[]>(initialData);
  const [filter, setFilter] = useState<"All" | Status>("All");

  const filtered =
    filter === "All" ? rows : rows.filter((r) => r.status === filter);

  const updateStatus = (id: number, status: Status) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="w-screen overflow-x-auto ">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="text-gray-500">Sort :</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-full bg-green-50 px-2 py-1 text-green-600"
        >
          <option>All</option>
          <option>Evaluated</option>
          <option>Pending</option>
        </select>
      </div>

      <div>
        <table className="w-full text-sm ">
          <thead className="bg-[#ECECEC] text-[#282828]">
            <tr>
              <th className="px-4 py-3 text-left">S.No</th>
              <th className="px-4 py-3 text-left">Photo</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Roll No.</th>
              <th className="px-4 py-3 text-left">Submission Date</th>
              <th className="px-4 py-3 text-left">File</th>
              <th className="px-4 py-3 text-left">Marks</th>
              <th className="px-4 py-3 text-left">Feedback</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className="text-[#515151]">
                <td className="px-4 py-3">{String(i + 1).padStart(2, "0")}</td>

                <td className="px-4 py-3">
                  <img src={r.photo} className="h-8 w-8 rounded-full" />
                </td>

                <td className="px-4 py-3">{r.name}</td>

                <td className="px-4 py-3">
                  <span className="text-green-500">ID</span> - {r.roll}
                </td>

                <td className="px-4 py-3">{r.date || "-"}</td>

                <td className="px-4 py-3">{r.file || "-"}</td>

                <td
                  className={`px-4 py-3 font-medium ${
                    r.marks?.startsWith("25")
                      ? "text-green-500"
                      : r.marks
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  {r.marks || "-"}
                </td>

                <td className="px-4 py-3 max-w-xs truncate">
                  {r.feedback || "-"}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      updateStatus(
                        r.id,
                        r.status === "Evaluated" ? "Pending" : "Evaluated"
                      )
                    }
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                      r.status === "Evaluated"
                        ? "bg-[#E3F6EB] text-[#13934B]"
                        : "bg-[#FFF1E2] text-[#FFBB70]"
                    }`}
                  >
                    {r.status}
                    <CaretDown size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
