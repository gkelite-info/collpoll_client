// 'use client';

// import TableComponent from "@/app/utils/table/table";
// import WipOverlay from "@/app/utils/WipOverlay";
// import { ArrowBendUpLeft } from "@phosphor-icons/react";

// type MidExamsProps = {
//     onBack: () => void;
// };

// type Subject = {
//     subject: string;
//     attendance: number;
// };

// export default function MidExams({ onBack }: MidExamsProps) {

//     const data = [
//         {
//             title: "Exam start date",
//             subTitle: "11 March 2025",
//         },
//         {
//             title: "Exam type",
//             subTitle: "Mid Term Exams (CSE Year 2)",
//         },
//     ];

//     const subjects: Subject[] = [
//         { subject: "Data Structures", attendance: 87 },
//         { subject: "OOPs using C++", attendance: 72 },
//         { subject: "Discrete Mathematics", attendance: 65 },
//     ];

//     const columns = [
//         { title: "Subject", key: "subject" },
//         { title: "Attendance", key: "attendance" },
//         { title: "Actions", key: "actions" },
//     ];

//     const tableData = subjects.map((item) => ({
//         subject: item.subject,

//         attendance: (
//             <div className="flex items-center justify-center gap-0.5">
//                 <p
//                     className={`text-xs font-medium ${item.attendance >= 75 ? "text-green-500" : "text-red-500"
//                         }`}
//                 >
//                     {item.attendance}%
//                 </p>
//                 <p className="text-xs">/100%</p>
//             </div>
//         ),

//         actions: (
//             <div className="flex items-center justify-center">
//                 <div
//                     className={`rounded-md px-2 py-0.5 ${item.attendance >= 75
//                         ? "bg-[#43C17A] cursor-pointer"
//                         : "bg-gray-300 cursor-not-allowed"
//                         }`}
//                 >
//                     <p className="text-white text-sm">
//                         {item.attendance >= 75 ? "ENROLL" : "NOT ELIGIBLE"}
//                     </p>
//                 </div>
//             </div>
//         ),
//     }));

//     return (
//         <div className="relative flex flex-col items-start justify-start gap-3">
//             <WipOverlay/>
//             <div className="flex items-center gap-3">
//                 <ArrowBendUpLeft size={22} weight="fill" onClick={onBack} className="text-[#282828] cursor-pointer" />
//                 <h3 className="text-[#282828] text-lg font-semibold">
//                     Mid Term Exam Enrollment
//                 </h3>
//             </div>

//             <p className="text-sm text-[#515151]">
//                 Enroll for your upcoming exams starting March 11, 2025.
//             </p>

//             <div className="bg-white rounded-lg p-3 shadow-md w-full flex flex-col gap-3 mt-0.5">
//                 {data.map((item, index) => (
//                     <div className="flex items-center gap-3" key={index}>
//                         <div className="w-[18%]">
//                             <h6 className="text-[#282828] text-md">{item.title}</h6>
//                         </div>
//                         <div className="rounded-full bg-[#E5F6EC] px-3 py-1.5">
//                             <p className="text-[#43C17A] font-medium">{item.subTitle}</p>
//                         </div>
//                     </div>
//                 ))}

//                 <div className="flex items-center">
//                     <div className="w-[20%]">
//                         <h6 className="text-[#282828] text-md">Note</h6>
//                     </div>
//                     <p className="text-[#282828] text-md">
//                         You’re eligible to enroll if your attendance ≥ 75%
//                     </p>
//                 </div>
//             </div>

//             <div className="bg-white w-full rounded-lg p-3 shadow-md mt-2">
//                 <div className="flex items-center justify-between mb-3">
//                     <h5 className="text-[#282828] font-medium">
//                         Select Subjects to Enroll
//                     </h5>
//                     <div className="rounded-lg bg-[#E5F6EC] px-3 py-1.5">
//                         <p className="text-[#43C17A] font-medium">Hall Ticket</p>
//                     </div>
//                 </div>

//                 <TableComponent
//                     columns={columns}
//                     tableData={tableData}
//                 />
//             </div>
//         </div>
//     );
// }

"use client";

import { useState } from "react";
import TableComponent from "@/app/utils/table/table";
import { ArrowBendUpLeft, X, User, CaretLeftIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type MidExamsProps = {
  onBack: () => void;
};

type Subject = {
  subject: string;
  attendance: number;
};

export default function MidExams({ onBack }: MidExamsProps) {
  const t = useTranslations("Dashboard.student");
  const { identifierId, fullName } = useUser();
  const { collegeBranchCode, collegeAcademicYear } = useStudent();

  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [viewingHallTicket, setViewingHallTicket] = useState(false);

  const downloadHallTicketPdf = () => {
    const doc = new jsPDF();

    // Top border line
    doc.setFillColor(67, 193, 122); // #43C17A
    doc.rect(0, 0, 210, 6, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(22, 40, 79); // #16284F
    doc.text("HALL TICKET", 105, 30, { align: "center" });

    // Student Specs
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");

    doc.text(`Student ID : ${identifierId ?? "26228975"}`, 14, 45);
    doc.text(`Hall Ticket Code: HT-MID-2025-A1B2C3`, 130, 45);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 40, 79);
    doc.text(fullName ?? "Shravani Reddy", 14, 53);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`B.Tech ${collegeBranchCode ?? "CSE"} - Year ${collegeAcademicYear ?? "2"}`, 14, 60);

    // Exam Info
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 68, 182, 14, "F");
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text(`Exam Type: Mid Term Exams - ${collegeBranchCode ?? "CSE"} Year ${collegeAcademicYear ?? "2"}`, 18, 76);
    doc.text(`Room No: B-302`, 160, 76);

    // Table Mapping
    const tableHeaders = ["Subject Code", "Subject Name", "Exam Date", "Time"];
    const rows = [
      ["CS - 101", "Data Structures", "12/09/2026", "11:49 AM"],
      ["CS - 101", "OOPs Using C++", "13/09/2026", "11:49 AM"],
      ["CS - 101", "Discrete mathematics", "14/09/2026", "11:49 AM"],
      ["CS - 101", "Digital logistics", "15/09/2026", "11:49 AM"],
      ["CS - 101", "Environmental Science", "-", "-"],
      ["CS - 101", "OOPs Lab", "-", "-"]
    ];

    autoTable(doc, {
      startY: 88,
      head: [tableHeaders],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [22, 40, 79] }, // #16284F
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "normal", cellWidth: 32 },
        1: { fontStyle: "bold" },
        2: { halign: "center", cellWidth: 36 },
        3: { halign: "center", cellWidth: 36 }
      }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    // Instructions Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("INSTRUCTIONS TO CANDIDATES", 14, finalY);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);

    const instructions = [
      "1. Arrival Policy: Candidates must report to the examination hall at least 30 minutes before start time.",
      "2. Identification: A valid College ID card and this Hall Ticket are mandatory for entry.",
      "3. Prohibited Items: Mobile phones, smartwatches, calculators, and other electronic devices are strictly banned.",
      "4. Stationery: Candidates are permitted to bring only transparent stationery items. No sharing is allowed.",
      "5. Academic Integrity: Malpractice (copying, notes possession, etc.) leads to immediate disqualification.",
      "6. Behavioral Conduct: Candidates must maintain silence and follow all instructions from the invigilators.",
      "7. Seating Arrangement: Occupy only the seat assigned to your specific Hall Ticket number.",
      "8. Submission: Hand over all answer sheets to the invigilator before leaving. No materials to be taken out."
    ];

    let currentY = finalY + 5;
    instructions.forEach((inst) => {
      doc.text(inst, 14, currentY);
      currentY += 4.5;
    });

    doc.save("Hall_Ticket.pdf");
  };

  const data = [
    {
      title: t("Exam start date"),
      subTitle: "11 March 2026",
    },
    {
      title: t("Exam type"),
      subTitle: "Mid Term Exams (CSE Year 2)",
    },
  ];

  const subjects: Subject[] = [
    { subject: "Data Structures", attendance: 87 },
    { subject: "OOPs using C++", attendance: 72 },
    { subject: "Discrete Mathematics", attendance: 65 },
  ];

  const columns = [
    { title: t("Subject"), key: "subject" },
    { title: t("Attendance"), key: "attendance" },
    { title: t("Actions"), key: "actions" },
  ];

  const tableData = subjects.map((item) => {
    const isEnrolled = enrolledSubjects.includes(item.subject);
    return {
      subject: item.subject,

      attendance: (
        <div className="flex items-center justify-center gap-0.5">
          <p
            className={`text-xs font-medium ${item.attendance >= 75 ? "text-green-500" : "text-red-500"
              }`}
          >
            {item.attendance}%
          </p>
          <p className="text-xs">/100%</p>
        </div>
      ),

      actions: (
        <div className="flex items-center justify-center">
          {isEnrolled ? (
            <div className="rounded-md bg-gray-100 border border-gray-200 px-3 py-1 cursor-not-allowed">
              <p className="text-gray-400 text-sm font-semibold">
                ENROLLED
              </p>
            </div>
          ) : item.attendance >= 75 ? (
            <button
              onClick={() => {
                setSelectedSubject(item);
                setShowConfirmModal(true);
              }}
              className="rounded-md bg-[#43C17A] hover:bg-[#35a868] text-white text-sm font-semibold px-3 py-1 cursor-pointer transition-colors"
            >
              {t("ENROLL")}
            </button>
          ) : (
            <div className="rounded-md bg-gray-200 text-gray-400 text-sm font-semibold px-3 py-1 cursor-not-allowed">
              {t("NOT ELIGIBLE")}
            </div>
          )}
        </div>
      ),
    };
  });

  if (viewingHallTicket) {
    return (
      <div className="max-w-4xl mx-auto w-full flex flex-col pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <ArrowBendUpLeft
            size={22}
            weight="fill"
            onClick={() => setViewingHallTicket(false)}
            className="text-[#282828] cursor-pointer"
          />
          <h3 className="text-[#282828] text-lg font-semibold">
            Hall Ticket
          </h3>
        </div>

        {/* Paper Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 flex flex-col gap-6 w-full relative overflow-hidden">
          {/* Top border decor */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#43C17A]"></div>

          {/* Top Logo / PDF row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#16284F] text-white flex items-center justify-center font-bold text-lg">
                C
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-[#16284F] tracking-widest">
              HALL TICKET
            </h1>
            <button
              onClick={downloadHallTicketPdf}
              className="bg-[#43C17A] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#35a868] transition-colors shadow-sm cursor-pointer"
            >
              Download PDF
            </button>
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Student details */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar placeholder */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-xl text-gray-400 shrink-0 shadow-inner">
              <User size={56} weight="light" />
            </div>

            {/* Info grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <div>
                <span className="text-gray-500 font-medium">Student ID :</span>{" "}
                <span className="text-gray-800 font-semibold">{identifierId ?? "26228975"}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Hall Ticket Code</span>
              </div>
              <div className="sm:col-span-2 mt-1">
                <span className="text-xl font-bold text-[#16284F]">{fullName ?? "Shravani Reddy"}</span>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">
                  B.Tech {collegeBranchCode ?? "CSE"} - Year {collegeAcademicYear ?? "2"}
                </span>
              </div>
              <div>
                <span className="text-gray-800 font-mono font-bold">HT-MID-2025-A1B2C3</span>
                <span className="ml-4 text-gray-400 text-xs font-semibold">Register</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Exam info row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Exam Type</span>
              <span className="text-md font-bold text-[#16284F]">
                Mid Term Exams - {collegeBranchCode ?? "CSE"} Year {collegeAcademicYear ?? "2"}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Room No</span>
              <span className="text-md font-extrabold text-[#16284F]">B-302</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-300 rounded-lg mt-2">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
                  <th className="py-2.5 px-4 border-r border-gray-300 w-32">Subject Code</th>
                  <th className="py-2.5 px-4 border-r border-gray-300">Subject Name</th>
                  <th className="py-2.5 px-4 border-r border-gray-300 text-center w-36">Exam Date</th>
                  <th className="py-2.5 px-4 text-center w-36">Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "CS - 101", name: "Data Structures", date: "12/09/2026", time: "11:49 AM", isRed: false },
                  { code: "CS - 101", name: "OOPs Using C++", date: "13/09/2026", time: "11:49 AM", isRed: false },
                  { code: "CS - 101", name: "Discrete mathematics", date: "14/09/2026", time: "11:49 AM", isRed: false },
                  { code: "CS - 101", name: "Digital logistics", date: "15/09/2026", time: "11:49 AM", isRed: false },
                  { code: "CS - 101", name: "Environmental Science", date: "", time: "", isRed: true },
                  { code: "CS - 101", name: "OOPs Lab", date: "", time: "", isRed: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 border-r border-gray-300 font-mono text-gray-600">
                      {row.code}
                    </td>
                    <td className={`py-2.5 px-4 border-r border-gray-300 font-semibold ${row.isRed ? "text-red-500" : "text-gray-800"}`}>
                      {row.name}
                    </td>
                    <td className="py-2.5 px-4 border-r border-gray-300 text-center font-mono text-gray-700">
                      {row.date || "-"}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-gray-700">
                      {row.time || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div className="mt-4 flex flex-col gap-3">
            <h4 className="text-center text-sm font-bold text-gray-800 tracking-wider">
              INSTRUCTIONS TO CANDIDATES
            </h4>
            <ol className="list-decimal list-outside text-[11px] sm:text-xs text-gray-600 flex flex-col gap-2 pl-4">
              <li>
                <strong>Arrival Policy</strong>: Candidates must report to the examination hall at least 30 minutes before the scheduled start time. Late entry beyond 15 minutes is strictly prohibited.
              </li>
              <li>
                <strong>Identification</strong>: A valid College ID card and this Hall Ticket are mandatory for entry. Digital versions on mobile devices will not be accepted unless explicitly authorized by the Branch.
              </li>
              <li>
                <strong>Prohibited Items</strong>: Mobile phones, smartwatches, tablets, programmable calculators, and any other electronic communication devices are strictly banned inside the examination hall.
              </li>
              <li>
                <strong>Stationery</strong>: Candidates are permitted to bring only transparent stationery items (pens, pencils, erasers). Borrowing or sharing of materials during the examination is not allowed.
              </li>
              <li>
                <strong>Academic Integrity</strong>: Any form of malpractice, including copying, possession of unauthorized notes, or communicating with other candidates, will lead to immediate disqualification and disciplinary action.
              </li>
              <li>
                <strong>Behavioral Conduct</strong>: Candidates must maintain silence and follow all instructions provided by the invigilators throughout the duration of the exam.
              </li>
              <li>
                <strong>Seating Arrangement</strong>: Please occupy only the seat assigned to your specific Hall Ticket number. Changing seats without the explicit permission of the invigilator is forbidden.
              </li>
              <li>
                <strong>Submission</strong>: All answer sheets must be handed over to the invigilator before leaving the examination hall. Taking any exam materials, including rough sheets, outside the hall is strictly prohibited.
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-start justify-start gap-3 w-full">
      <div className="flex items-center gap-3">
        <CaretLeftIcon
          size={22}
          weight="bold"
          onClick={onBack}
          className="text-[#282828] cursor-pointer"
        />
        <h3 className="text-[#282828] text-lg font-semibold">
          {t("Mid Term Exam Enrollment")}
        </h3>
      </div>

      <p className="text-sm text-[#515151]">
        {t("Enroll for your upcoming exams starting March 11, 2026")}
      </p>

      <div className="bg-white rounded-lg p-3 shadow-md w-full flex flex-col gap-3 mt-0.5">
        {data.map((item, index) => (
          <div className="flex items-center gap-3" key={index}>
            <div className="w-[18%]">
              <h6 className="text-[#282828] text-md">{item.title}</h6>
            </div>
            <div className="rounded-full bg-[#E5F6EC] px-3 py-1.5">
              <p className="text-[#43C17A] font-medium">{item.subTitle}</p>
            </div>
          </div>
        ))}

        <div className="flex items-center">
          <div className="w-[20%]">
            <h6 className="text-[#282828] text-md">{t("Note")}</h6>
          </div>
          <p className="text-[#282828] text-md">
            {t("You’re eligible to enroll if your attendance ≥ 75%")}
          </p>
        </div>
      </div>

      <div className="bg-white w-full rounded-lg p-3 shadow-md mt-2">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[#282828] font-medium">
            {t("Select Subjects to Enroll")}
          </h5>
          <button
            onClick={() => setViewingHallTicket(true)}
            className="rounded-lg bg-[#E5F6EC] hover:bg-[#d4f2df] px-3 py-1.5 text-[#43C17A] font-medium cursor-pointer transition-colors text-sm"
          >
            {t("Hall Ticket")}
          </button>
        </div>

        <TableComponent columns={columns} tableData={tableData} />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
            {/* Close button */}
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedSubject(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-gray-800">
                Confirm Enrollment
              </h3>
              <p className="text-sm text-gray-500">
                Once confirmed, this subject will be added to your hall ticket.
              </p>

              <div className="flex flex-col gap-2.5 mt-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex gap-2">
                  <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Subject:</span>
                  <span className="text-sm text-gray-700">{selectedSubject.subject}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Subject Code:</span>
                  <span className="text-sm font-mono text-gray-700">
                    {selectedSubject.subject === "Data Structures"
                      ? "CS-101"
                      : selectedSubject.subject === "OOPs using C++"
                        ? "CS-102"
                        : "CS-103"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Attendance:</span>
                  <span className="text-sm text-gray-700">{selectedSubject.attendance}%</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold text-gray-800 w-28 shrink-0">Status:</span>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                    ✅ Eligible
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 w-full">
                <button
                  onClick={() => {
                    if (selectedSubject) {
                      setEnrolledSubjects((prev) => [...prev, selectedSubject.subject]);
                    }
                    setShowConfirmModal(false);
                    setSelectedSubject(null);
                  }}
                  className="w-[49%] bg-[#43C17A] text-white py-2.5 rounded-lg font-bold hover:bg-[#35a868] transition-colors cursor-pointer shadow-sm text-sm text-center"
                >
                  Confirm Enrollment
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedSubject(null);
                  }}
                  className="w-[49%] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
