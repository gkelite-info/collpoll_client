// import { Check, UsersThree, X } from "@phosphor-icons/react";
// import { useState } from "react";
// import toast from "react-hot-toast";

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const Checkbox = ({
//   label,
//   count,
//   checked,
//   onToggle,
// }: {
//   label: string;
//   count?: string;
//   checked: boolean;
//   onToggle: () => void;
// }) => (
//   <div
//     onClick={onToggle}
//     className="flex items-center gap-2 cursor-pointer select-none group"
//   >
//     <div
//       className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all ${
//         checked
//           ? "bg-[#43C17A] border-transparent"
//           : "border border-gray-300 bg-white"
//       }`}
//     >
//       {checked && <Check weight="bold" className="text-white w-3 h-3" />}
//     </div>
//     <span className="text-xs text-gray-700 font-medium">
//       {label}{" "}
//       {count && (
//         <span className="text-[#43C17A] font-bold ml-0.5">{count}</span>
//       )}
//     </span>
//   </div>
// );

// export const SendFeeReminderModal = ({ isOpen, onClose }: ModalProps) => {
//   const [studentsChecked, setStudentsChecked] = useState(true);
//   const [parentsChecked, setParentsChecked] = useState(true);
//   const [emailChecked, setEmailChecked] = useState(true);
//   const [smsChecked, setSmsChecked] = useState(true);
//   const [sent, setSent] = useState(false);

//   if (!isOpen) return null;

//   const handleSend = () => {
//     if (sent) return;

//     setSent(true);
//     toast.success("Reminder sent successfully");

//     setTimeout(() => {
//       onClose();
//       setSent(false);
//     }, 2000);
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
//         onClick={onClose}
//       />

//       <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[520px] p-5 animate-scale-in">
//         <div className="flex justify-between items-start mb-3">
//           <div>
//             <h2 className="text-lg font-bold text-gray-900 leading-tight">
//               Send Fee Reminder
//             </h2>
//             <p className="text-xs text-gray-500 mt-1">
//               This reminder will sent to all students and parents.
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 -mt-1 -mr-1"
//           >
//             <X size={20} weight="bold" />
//           </button>
//         </div>

//         <div className="border border-gray-200 rounded-md p-2.5 flex items-center justify-between mb-3 bg-white">
//           <div className="flex items-center gap-2.5">
//             <div className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center">
//               <UsersThree weight="fill" className="text-white w-4 h-4" />
//             </div>
//             <span className="font-bold text-gray-800 text-xs">Recipients</span>
//           </div>

//           <div className="flex items-center gap-4 mr-1">
//             <Checkbox
//               label="Students :"
//               count="2,450"
//               checked={studentsChecked}
//               onToggle={() => setStudentsChecked((p) => !p)}
//             />
//             <Checkbox
//               label="Parents :"
//               count="2,450"
//               checked={parentsChecked}
//               onToggle={() => setParentsChecked((p) => !p)}
//             />
//           </div>
//         </div>

//         <div className="bg-[#f3f4f6] rounded-md p-4 text-[11px] text-[#282828] leading-relaxed font-medium mb-3 border border-gray-100">
//           <p className="mb-3">Dear Parent/Student,</p>
//           <p className="mb-2">
//             This is a gentle reminder regarding the payment of the current
//             semester fees.
//           </p>
//           <p className="mb-3 text-justify">
//             Our records indicate that the fee payment is currently pending. If
//             you have already completed the payment, please ignore this message.
//             If not, we kindly request you to complete the payment at the
//             earliest to avoid any inconvenience.
//           </p>
//           <p className="mb-3">
//             For any queries or assistance, please contact the college finance
//             office.
//           </p>
//           <p>— College Finance Office</p>
//         </div>

//         <div className="flex flex-col gap-4">
//           <div className="flex gap-5 px-1">
//             <Checkbox
//               label="Email"
//               checked={emailChecked}
//               onToggle={() => setEmailChecked((p) => !p)}
//             />
//             <Checkbox
//               label="SMS"
//               checked={smsChecked}
//               onToggle={() => setSmsChecked((p) => !p)}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-3 mt-1">
//             <button
//               onClick={onClose}
//               className="w-full py-2.5 cursor-pointer rounded text-xs font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
//             >
//               Schedule
//             </button>

//             <button
//               onClick={handleSend}
//               disabled={sent}
//               className="w-full py-2.5 cursor-pointer rounded text-xs font-bold bg-[#43C17A] text-white hover:bg-[#10b981] shadow-sm transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
//             >
//               {sent ? "Sent" : "Confirm & Send"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import { Check, UsersThree, X } from "@phosphor-icons/react";
import { useState } from "react";
import toast from "react-hot-toast";

// ==========================================
// Checkbox Component
// ==========================================
const Checkbox = ({
  label,
  count,
  checked,
  onToggle,
  children,
}: {
  label: string;
  count?: string;
  checked: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) => (
  <div
    onClick={onToggle}
    className="flex items-center gap-2 cursor-pointer select-none group"
  >
    <div
      className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all ${
        checked
          ? "bg-[#43C17A] border-transparent"
          : "border border-gray-300 bg-white"
      }`}
    >
      {checked && <Check weight="bold" className="text-white w-3 h-3" />}
    </div>
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
        {label}{" "}
        {count && (
          <span className="text-[#43C17A] font-bold ml-0.5">{count}</span>
        )}
      </span>
      {children}
    </div>
  </div>
);

// ==========================================
// Multi-variant SendFeeReminderModal
// ==========================================
interface ModalProps {
  isOpen: boolean;
  variant?: "student" | "faculty";
  onClose: () => void;
  onScheduleClick: () => void;
}

export const SendFeeReminderModal = ({
  isOpen,
  variant = "student",
  onClose,
  onScheduleClick,
}: ModalProps) => {
  const [studentsChecked, setStudentsChecked] = useState(true);
  const [parentsChecked, setParentsChecked] = useState(true);
  const [facultyChecked, setFacultyChecked] = useState(true);
  const [emailChecked, setEmailChecked] = useState(true);
  const [smsChecked, setSmsChecked] = useState(true);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const isFaculty = variant === "faculty";

  const handleSend = () => {
    if (sent) return;

    setSent(true);
    toast.success("Reminder sent successfully");

    setTimeout(() => {
      onClose();
      setSent(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[520px] p-5 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              Send Fee Reminder
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isFaculty
                ? "This reminder will sent to Faculty"
                : "This reminder will sent to all students and parents."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 -mt-1 -mr-1"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Recipients Bar */}
        <div className="border border-gray-200 rounded-md p-2.5 flex items-center justify-between mb-3 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center">
              <UsersThree weight="fill" className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-gray-800 text-xs">
              {isFaculty ? "Faculty" : "Recipients"}
            </span>
          </div>

          <div className="flex items-center gap-4 mr-1">
            {!isFaculty ? (
              <>
                <Checkbox
                  label="Students :"
                  count="2,450"
                  checked={studentsChecked}
                  onToggle={() => setStudentsChecked((p) => !p)}
                />
                <Checkbox
                  label="Parents :"
                  count="2,450"
                  checked={parentsChecked}
                  onToggle={() => setParentsChecked((p) => !p)}
                />
              </>
            ) : (
              <Checkbox
                label="Faculty :"
                checked={facultyChecked}
                onToggle={() => setFacultyChecked((p) => !p)}
              >
                <div className="flex items-center gap-1.5 ml-1">
                  <img
                    src="/faculty.png"
                    alt="Faculty"
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    Anil Josh
                  </span>
                </div>
              </Checkbox>
            )}
          </div>
        </div>

        {/* Message Content (Scrollable if needed) */}
        <div className="bg-[#f3f4f6] rounded-md p-4 text-[11px] text-[#282828] leading-relaxed font-medium mb-3 border border-gray-100 overflow-y-auto">
          {!isFaculty ? (
            <>
              <p className="mb-3">Dear Parent/Student,</p>
              <p className="mb-2">
                This is a gentle reminder regarding the payment of the current
                semester fees.
              </p>
              <p className="mb-3 text-justify">
                Our records indicate that the fee payment is currently pending.
                If you have already completed the payment, please ignore this
                message. If not, we kindly request you to complete the payment
                at the earliest to avoid any inconvenience.
              </p>
              <p className="mb-3">
                For any queries or assistance, please contact the college
                finance office.
              </p>
              <p>— College Finance Office</p>
            </>
          ) : (
            <>
              <p className="mb-3">Dear Faculty Advisor,</p>
              <p className="mb-3">
                This is to inform you that a fee payment reminder has been sent
                to all students under your mentorship who currently have pending
                dues for the ongoing academic term.
              </p>
              <p className="mb-3">
                Kindly take note of the details below:
                <br />
                Department: [CSE]
                <br />
                Year/Semester: [3rd year/ 5th Sem]
                <br />
                Total Students Notified: [30]
              </p>
              <p className="mb-3">
                We request your cooperation in encouraging the students to
                complete their fee payments at the earliest to avoid any late
                charges or academic access restrictions.
              </p>
              <p className="mb-3">
                Should you require the detailed list of students notified or
                have any queries regarding specific cases, please feel free to
                reach out to the Accounts & Finance Office.
              </p>
              <p>
                Thank you for your continued support and coordination.
                <br />
                Warm regards,
                <br />
                Accounts & Finance Office
              </p>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-4 shrink-0">
          <div className="flex gap-5 px-1">
            <Checkbox
              label="Email"
              checked={emailChecked}
              onToggle={() => setEmailChecked((p) => !p)}
            />
            <Checkbox
              label="SMS"
              checked={smsChecked}
              onToggle={() => setSmsChecked((p) => !p)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={onScheduleClick}
              className="w-full py-2.5 cursor-pointer rounded text-xs font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Schedule
            </button>

            <button
              onClick={handleSend}
              disabled={sent}
              className="w-full py-2.5 cursor-pointer rounded text-xs font-bold bg-[#43C17A] text-white hover:bg-[#10b981] shadow-sm transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {sent ? "Sent" : "Confirm & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
