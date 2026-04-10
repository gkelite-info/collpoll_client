"use client";

import {
  executeDirectFeeReminder,
  fetchFacultyForStudents,
} from "@/lib/helpers/finance/dashboard/reminders/financeReminders";
import { Check, UsersThree, X, CircleNotch } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Checkbox = ({
  label,
  count,
  checked,
  onToggle,
  children,
}: {
  label: string;
  count?: string | number;
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
        {count !== undefined && (
          <span className="text-[#43C17A] font-bold ml-0.5">{count}</span>
        )}
      </span>
      {children}
    </div>
  </div>
);

interface ModalProps {
  isOpen: boolean;
  variant?: "student" | "faculty";
  collegeId: number;
  selectedStudentIds: number[];
  onClose: () => void;
  onScheduleClick: () => void;
}

export const SendFeeReminderModal = ({
  isOpen,
  variant = "student",
  collegeId,
  selectedStudentIds,
  onClose,
  onScheduleClick,
}: ModalProps) => {
  const [studentsChecked, setStudentsChecked] = useState(true);
  const [parentsChecked, setParentsChecked] = useState(true);
  const [facultyChecked, setFacultyChecked] = useState(true);
  const [emailChecked, setEmailChecked] = useState(true);
  const [inAppChecked, setInAppChecked] = useState(true);

  const [isSending, setIsSending] = useState(false);

  const [faculties, setFaculties] = useState<any[]>([]);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);

  const isFaculty = variant === "faculty";
  const recipientCount = selectedStudentIds.length;

  useEffect(() => {
    const loadFaculty = async () => {
      if (isOpen && isFaculty && selectedStudentIds.length > 0) {
        setIsLoadingFaculty(true);
        const fetchedFaculties =
          await fetchFacultyForStudents(selectedStudentIds);
        setFaculties(fetchedFaculties);
        setIsLoadingFaculty(false);
      }
    };
    loadFaculty();
  }, [isOpen, isFaculty, selectedStudentIds]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (isSending) return;
    if (recipientCount === 0) return;

    if (!emailChecked && !inAppChecked) {
      toast.error("Please select at least one notification method");
      return;
    }

    setIsSending(true);
    toast.loading("Sending reminders...", { id: "send-reminder" });

    const response = await executeDirectFeeReminder({
      collegeId,
      studentIds: selectedStudentIds,
      variant,
      notifyStudents: studentsChecked,
      notifyParents: parentsChecked,
      viaEmail: emailChecked,
      viaInApp: inAppChecked,
    });

    if (response.success) {
      toast.success(`Reminders sent successfully to ${response.count} users`, {
        id: "send-reminder",
      });
      setTimeout(() => {
        onClose();
        setIsSending(false);
      }, 1500);
    } else {
      toast.error("Failed to send reminders.", { id: "send-reminder" });
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[520px] p-5 animate-scale-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              Send Fee Reminder
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isFaculty
                ? "This reminder will be sent to the mapped Faculty"
                : "This reminder will be sent to selected students and parents."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 -mt-1 -mr-1"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-md p-2.5 flex items-center justify-between mb-3 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center">
              <UsersThree weight="fill" className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-gray-800 text-xs">
              {isFaculty ? "Mapped Faculty" : "Recipients"}
            </span>
          </div>

          <div className="flex items-center gap-4 mr-1">
            {!isFaculty ? (
              <>
                <Checkbox
                  label="Students :"
                  count={recipientCount}
                  checked={studentsChecked}
                  onToggle={() => setStudentsChecked((p) => !p)}
                />
                <Checkbox
                  label="Parents :"
                  count={recipientCount}
                  checked={parentsChecked}
                  onToggle={() => setParentsChecked((p) => !p)}
                />
              </>
            ) : (
              <Checkbox
                label="Faculty :"
                count={faculties.length}
                checked={facultyChecked}
                onToggle={() => setFacultyChecked((p) => !p)}
              >
                <div className="flex items-center gap-2 ml-1">
                  {isLoadingFaculty ? (
                    <CircleNotch className="w-4 h-4 animate-spin text-gray-400" />
                  ) : faculties.length > 0 ? (
                    <div className="flex -space-x-1.5">
                      {faculties.slice(0, 3).map((f, i) => (
                        <img
                          key={f.facultyId}
                          src={f.avatar}
                          alt={f.name}
                          title={f.name}
                          className="w-6 h-6 rounded-full object-cover border border-white relative z-10"
                          style={{ zIndex: 3 - i }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ))}
                      {faculties.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] font-bold text-gray-600 relative z-0">
                          +{faculties.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">
                      None Mapped
                    </span>
                  )}
                </div>
              </Checkbox>
            )}
          </div>
        </div>

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
                to students under your mentorship who currently have pending
                dues for the ongoing academic term.
              </p>
              <p className="mb-3">
                We request your cooperation in encouraging the students to
                complete their fee payments at the earliest to avoid any late
                charges or academic access restrictions.
              </p>
              <p>
                Warm regards,
                <br />
                Accounts & Finance Office
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 shrink-0">
          <div className="flex gap-5 px-1">
            <Checkbox
              label="Email"
              checked={emailChecked}
              onToggle={() => setEmailChecked((p) => !p)}
            />
            <Checkbox
              label="In-app"
              checked={inAppChecked}
              onToggle={() => setInAppChecked((p) => !p)}
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
              disabled={isSending || (isFaculty && faculties.length === 0)}
              className="w-full py-2.5 cursor-pointer rounded text-xs font-bold bg-[#43C17A] text-white hover:bg-[#10b981] shadow-sm transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Confirm & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
