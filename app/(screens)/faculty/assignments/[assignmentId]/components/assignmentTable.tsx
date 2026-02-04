// import { useState } from "react";
// import { CaretDown } from "@phosphor-icons/react";

// type Status = "Evaluated" | "Pending";

// interface Row {
//   id: number;
//   photo: string;
//   name: string;
//   roll: string;
//   date?: string;
//   file?: string;
//   marks?: string;
//   feedback?: string;
//   status: Status;
// }

// const initialData: Row[] = [
//   {
//     id: 1,
//     photo: "https://i.pravatar.cc/40?img=1",
//     name: "Amelia Coll",
//     roll: "2345001",
//     date: "02 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "23 / 25",
//     feedback: "Good explanation of complexity.",
//     status: "Evaluated",
//   },
//   {
//     id: 2,
//     photo: "https://i.pravatar.cc/40?img=2",
//     name: "Estelle Bald",
//     roll: "2345002",
//     date: "03 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     status: "Pending",
//   },
//   {
//     id: 3,
//     photo: "https://i.pravatar.cc/40?img=3",
//     name: "Amanda Wo",
//     roll: "2345003",
//     date: "02 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "25 / 25",
//     feedback: "Excellent work.",
//     status: "Evaluated",
//   },
//   {
//     id: 4,
//     photo: "https://i.pravatar.cc/40?img=4",
//     name: "Lily Tano",
//     roll: "2345004",
//     date: "02 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "19 / 25",
//     feedback: "Concepts correct but code not optimized.",
//     status: "Evaluated",
//   },
//   {
//     id: 5,
//     photo: "https://i.pravatar.cc/40?img=5",
//     name: "Kevin Ray",
//     roll: "2345005",
//     date: "03 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "24 / 25",
//     feedback: "Neat presentation and comments.",
//     status: "Evaluated",
//   },
//   {
//     id: 6,
//     photo: "https://i.pravatar.cc/40?img=6",
//     name: "Sophia Lin",
//     roll: "2345006",
//     status: "Pending",
//   },
//   {
//     id: 7,
//     photo: "https://i.pravatar.cc/40?img=7",
//     name: "Daniel Cruz",
//     roll: "2345007",
//     date: "03 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "21 / 25",
//     feedback: "Logic clear; missed one test case.",
//     status: "Evaluated",
//   },
//   {
//     id: 8,
//     photo: "https://i.pravatar.cc/40?img=8",
//     name: "Arjun Mehta",
//     roll: "2345008",
//     date: "02 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "22 / 25",
//     feedback: "Good attempt, improve documentation.",
//     status: "Evaluated",
//   },
//   {
//     id: 9,
//     photo: "https://i.pravatar.cc/40?img=9",
//     name: "Neha Sharma",
//     roll: "2345009",
//     status: "Pending",
//   },
//   {
//     id: 10,
//     photo: "https://i.pravatar.cc/40?img=10",
//     name: "Jason Paul",
//     roll: "2345110",
//     date: "03 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "20 / 25",
//     feedback: "Used correct approach; minor syntax errors.",
//     status: "Evaluated",
//   },
//   {
//     id: 11,
//     photo: "https://i.pravatar.cc/40?img=11",
//     name: "Reema Sajid",
//     roll: "2345111",
//     date: "02 Jan 2025",
//     file: "DSA_Assignment1.pdf",
//     marks: "25 / 25",
//     feedback: "Flawless execution.",
//     status: "Evaluated",
//   },
//   {
//     id: 12,
//     photo: "https://i.pravatar.cc/40?img=12",
//     name: "Suresh N",
//     roll: "2345112",
//     status: "Pending",
//   },
// ];

// export default function AssignmentTable() {
//   const [rows, setRows] = useState<Row[]>(initialData);
//   const [filter, setFilter] = useState<"All" | Status>("All");

//   const filtered =
//     filter === "All" ? rows : rows.filter((r) => r.status === filter);

//   const updateStatus = (id: number, status: Status) => {
//     setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
//   };

//   return (
//     <div className="w-screen overflow-x-auto ">
//       <div className="mb-3 flex items-center gap-2 text-sm">
//         <span className="text-gray-500">Sort :</span>
//         <select
//           value={filter}
//           onChange={(e) => setFilter(e.target.value as any)}
//           className="rounded-full bg-green-50 px-2 py-1 text-green-600"
//         >
//           <option>All</option>
//           <option>Evaluated</option>
//           <option>Pending</option>
//         </select>
//       </div>

//       <div>
//         <table className="w-full text-sm ">
//           <thead className="bg-[#ECECEC] text-[#282828]">
//             <tr>
//               <th className="px-4 py-3 text-left">S.No</th>
//               <th className="px-4 py-3 text-left">Photo</th>
//               <th className="px-4 py-3 text-left">Name</th>
//               <th className="px-4 py-3 text-left">Roll No.</th>
//               <th className="px-4 py-3 text-left">Submission Date</th>
//               <th className="px-4 py-3 text-left">File</th>
//               <th className="px-4 py-3 text-left">Marks</th>
//               <th className="px-4 py-3 text-left">Feedback</th>
//               <th className="px-4 py-3 text-left">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.map((r, i) => (
//               <tr key={r.id} className="text-[#515151]">
//                 <td className="px-4 py-3">{String(i + 1).padStart(2, "0")}</td>

//                 <td className="px-4 py-3">
//                   <img src={r.photo} className="h-8 w-8 rounded-full" />
//                 </td>

//                 <td className="px-4 py-3">{r.name}</td>

//                 <td className="px-4 py-3">
//                   <span className="text-green-500">ID</span> - {r.roll}
//                 </td>

//                 <td className="px-4 py-3">{r.date || "-"}</td>

//                 <td className="px-4 py-3">{r.file || "-"}</td>

//                 <td
//                   className={`px-4 py-3 font-medium ${
//                     r.marks?.startsWith("25")
//                       ? "text-green-500"
//                       : r.marks
//                       ? "text-yellow-500"
//                       : "text-gray-400"
//                   }`}
//                 >
//                   {r.marks || "-"}
//                 </td>

//                 <td className="px-4 py-3 max-w-xs truncate">
//                   {r.feedback || "-"}
//                 </td>

//                 <td className="px-4 py-3">
//                   <button
//                     onClick={() =>
//                       updateStatus(
//                         r.id,
//                         r.status === "Evaluated" ? "Pending" : "Evaluated"
//                       )
//                     }
//                     className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
//                       r.status === "Evaluated"
//                         ? "bg-[#E3F6EB] text-[#13934B]"
//                         : "bg-[#FFF1E2] text-[#FFBB70]"
//                     }`}
//                   >
//                     {r.status}
//                     <CaretDown size={12} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { CaretDown, Check, X, FilePdf } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

type Status = "Evaluated" | "Pending";

interface Row {
  id: number;
  photo: string;
  name: string;
  roll: string;
  date?: string;
  file?: string;
  filePath?: string;
  marks?: string;
  feedback?: string;
  status: Status;
  submissionId?: number;
}

export default function AssignmentTable({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | Status>("All");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempData, setTempData] = useState<{
    marks: string;
    feedback: string;
    status: Status;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (assignmentId) fetchDynamicData();
  }, [assignmentId]);

  async function fetchDynamicData() {
    try {
      setLoading(true);
      const { data: assign, error: assignErr } = await supabase
        .from("assignments")
        .select("collegeBranchId, marks")
        .eq("assignmentId", assignmentId)
        .single();

      if (assignErr) throw assignErr;

      const { data: students, error: studentError } = await supabase
        .from("students")
        .select(`studentId, users (fullName, email, userId)`)
        .eq("collegeBranchId", assign.collegeBranchId)
        .eq("isActive", true);

      if (studentError) throw studentError;

      const { data: submissions } = await supabase
        .from("student_assignments_submission")
        .select("*")
        .eq("assignmentId", assignmentId);

      const mergedRows: Row[] = (students || []).map((student: any) => {
        const sub = submissions?.find((s) => s.studentId === student.studentId);
        const user = student.users;

        return {
          id: student.studentId,
          photo: `https://i.pravatar.cc/40?u=${user?.email || student.studentId}`,
          name: user?.fullName || "Unknown",
          roll: String(user?.userId || "N/A"),
          date: sub
            ? new Date(sub.submittedOn).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
          file: sub?.file?.split("/").pop() || "-",
          filePath: sub?.file || null,
          marks: sub?.marksScored !== null ? `${sub.marksScored}` : "",
          feedback: sub?.feedback || "",
          status: sub?.status === "Evaluated" ? "Evaluated" : "Pending",
          submissionId: sub?.studentAssignmentSubmissionId,
        };
      });

      setRows(mergedRows);
    } catch (err: any) {
      toast.error("Error loading table data");
    } finally {
      setLoading(false);
    }
  }

  const handleViewFile = async (filePath: string) => {
    if (!filePath) {
      toast.error("File path is missing");
      return;
    }

    try {
      const BUCKET_NAME = "student_submissions";
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error("Supabase Storage Error:", error);
        toast.error(`Storage Error: ${error.message}`);
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      toast.error("An unexpected error occurred while opening the file");
    }
  };

  const startEditing = (row: Row) => {
    if (!row.submissionId) {
      toast.error("No submission found to evaluate");
      return;
    }
    setEditingId(row.id);
    setTempData({
      marks: row.marks || "",
      feedback: row.feedback || "",
      status: row.status,
    });
  };

  const handleSaveRequest = () => setShowConfirm(true);

  const confirmSave = async () => {
    if (!editingId || !tempData) return;
    const row = rows.find((r) => r.id === editingId);

    const { error } = await supabase
      .from("student_assignments_submission")
      .update({
        marksScored: parseInt(tempData.marks) || 0,
        feedback: tempData.feedback,
        status: tempData.status,
        updatedAt: new Date().toISOString(),
      })
      .eq("studentAssignmentSubmissionId", row?.submissionId);

    if (error) {
      toast.error("Update failed");
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...tempData } : r)),
      );
      toast.success("Saved successfully");
      setEditingId(null);
    }
    setShowConfirm(false);
  };

  const filtered =
    filter === "All" ? rows : rows.filter((r) => r.status === filter);

  if (loading)
    return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="w-full relative">
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-poppins">
              Confirm Save
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-poppins">
              Are you sure you want to save these evaluation details?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmSave}
                className="flex-1 bg-[#13934B] text-white py-2 rounded-lg font-medium"
              >
                Yes, Save
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2 text-sm px-1">
        <span className="text-gray-500">Sort :</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-full bg-green-50 px-2 py-1 text-green-600 outline-none border-none cursor-pointer"
        >
          <option>All</option>
          <option>Evaluated</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#ECECEC] text-[#282828] font-poppins">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">S.No</th>
              <th className="px-4 py-3 text-left font-semibold">Photo</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Roll No.</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">File</th>
              <th className="px-4 py-3 text-left font-semibold">Marks</th>
              <th className="px-4 py-3 text-left font-semibold">Feedback</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="font-poppins">
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                className="text-[#515151] border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-3">
                  <img
                    src={r.photo}
                    className="h-8 w-8 rounded-full border border-gray-100"
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-[#282828]">
                  {r.name}
                </td>
                <td className="px-4 py-3">
                  <span className="text-green-500 font-bold">ID</span> -{" "}
                  {r.roll}
                </td>
                <td className="px-4 py-3">{r.date || "-"}</td>

                <td className="px-4 py-3">
                  {r.filePath ? (
                    <button
                      onClick={() => handleViewFile(r.filePath!)}
                      className="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 max-w-[120px] transition-all"
                    >
                      <FilePdf
                        size={18}
                        weight="fill"
                        className="text-red-500"
                      />
                      <span className="truncate font-medium">{r.file}</span>
                    </button>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <input
                      type="number"
                      value={tempData?.marks}
                      onChange={(e) =>
                        setTempData({ ...tempData!, marks: e.target.value })
                      }
                      className="w-16 border rounded px-1 py-1 outline-green-500"
                    />
                  ) : (
                    <span
                      onClick={() => startEditing(r)}
                      className="cursor-pointer font-bold text-[#282828]"
                    >
                      {r.marks || "-"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <input
                      type="text"
                      value={tempData?.feedback}
                      onChange={(e) =>
                        setTempData({ ...tempData!, feedback: e.target.value })
                      }
                      className="w-full min-w-[150px] border rounded px-2 py-1 outline-green-500"
                    />
                  ) : (
                    <span
                      onClick={() => startEditing(r)}
                      className="cursor-pointer truncate block max-w-[150px] italic text-gray-500"
                    >
                      {r.feedback || "-"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={tempData?.status}
                        onChange={(e) =>
                          setTempData({
                            ...tempData!,
                            status: e.target.value as Status,
                          })
                        }
                        className="rounded-full bg-gray-50 px-2 py-1 text-xs border font-bold"
                      >
                        <option>Pending</option>
                        <option>Evaluated</option>
                      </select>
                      <button
                        onClick={handleSaveRequest}
                        className="text-green-600 p-1 hover:scale-110 transition-transform"
                      >
                        <Check size={20} weight="bold" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-red-500 p-1 hover:scale-110 transition-transform"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(r)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                        r.status === "Evaluated"
                          ? "bg-[#E3F6EB] text-[#13934B]"
                          : "bg-[#FFF1E2] text-[#FFBB70]"
                      }`}
                    >
                      {r.status}
                      <CaretDown size={12} weight="bold" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
