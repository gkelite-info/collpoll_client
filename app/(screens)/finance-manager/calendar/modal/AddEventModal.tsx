"use client";
import { useState } from "react";
import { X, WarningCircle } from "@phosphor-icons/react";
import SelectParticipantsModal from "./SelectParticipantsModal";
import { MOCK_PARTICIPANTS } from "../financeManagerCalendarData";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Participant {
  id: number;
  name: string;
  participantId: string;
}

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

export default function AddEventModal({ isOpen, onClose }: AddEventModalProps) {
  const [eventTitle, setEventTitle] = useState("");
  const [eventTopic, setEventTopic] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [fromHour, setFromHour] = useState("08");
  const [fromMinute, setFromMinute] = useState("00");
  const [fromAmPm, setFromAmPm] = useState("AM");
  const [toHour, setToHour] = useState("09");
  const [toMinute, setToMinute] = useState("00");
  const [toAmPm, setToAmPm] = useState("AM");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEducationType, setSelectedEducationType] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const TextOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z\s]/g, "");
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    e.target.value = value;
    return value;
  };

  const mockBranches = [
    { id: 1, code: "CSE" },
    { id: 2, code: "ECE" },
    { id: 3, code: "MECH" },
  ];

  const mockYears = [
    { id: 1, year: "2024" },
    { id: 2, year: "2025" },
    { id: 3, year: "2026" },
  ];

  const mockSemesters = [
    { id: 1, semester: 1 },
    { id: 2, semester: 2 },
    { id: 3, semester: 3 },
  ];

  const mockSections = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
    { id: 3, name: "C" },
  ];

  const mockRoles = [
    { id: 1, name: "Faculty" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Coordinator" },
  ];

  const mockEducationTypes = [
    { id: 1, name: "Lecture" },
    { id: 2, name: "Lab" },
    { id: 3, name: "Tutorial" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col relative">
          <div className="flex justify-between items-center p-5 pb-2">
            <h2 className="text-lg font-semibold text-gray-800">Add Event</h2>
            <button onClick={onClose} className="cursor-pointer">
              <X size={20} className="text-gray-500 hover:text-gray-800" />
            </button>
          </div>
          <div className="p-5 pt-0 space-y-2 overflow-y-auto">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Event Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                className={INPUT}
                value={eventTitle}
                onChange={(e) => setEventTitle(TextOnly(e))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Event Topic<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter topic"
                className={INPUT}
                value={eventTopic}
                onChange={(e) => setEventTopic(TextOnly(e))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={INPUT}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Time</label>
              <div className="flex gap-4 mt-2">
                <div className="flex-1">
                  <span className="block text-[#282828] text-xs font-medium mb-1">
                    From<span className="text-red-500">*</span>
                  </span>
                  <div className="flex gap-2">
                    <select
                      className={`${INPUT} w-16 px-2 cursor-pointer`}
                      value={fromHour}
                      onChange={(e) => setFromHour(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = String(i + 1).padStart(2, "0");
                        return (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      className={`${INPUT} w-16 px-2 cursor-pointer`}
                      value={fromMinute}
                      onChange={(e) => setFromMinute(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i * 5).padStart(2, "0");
                        return (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      className={`${INPUT} w-16 px-2 cursor-pointer`}
                      value={fromAmPm}
                      onChange={(e) => setFromAmPm(e.target.value)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="block text-[#282828] text-xs font-medium mb-1">
                    To<span className="text-red-500">*</span>
                  </span>
                  <div className="flex gap-2">
                    <select
                      className={`${INPUT} w-16 px-2 cursor-pointer`}
                      value={toHour}
                      onChange={(e) => setToHour(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = String(i + 1).padStart(2, "0");
                        return (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      className={`${INPUT} w-16 px-2 cursor-pointer`}
                      value={toMinute}
                      onChange={(e) => setToMinute(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i * 5).padStart(2, "0");
                        return (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      className={`${INPUT} w-16 px-2 cursor-pointer`}
                      value={toAmPm}
                      onChange={(e) => setToAmPm(e.target.value)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Role<span className="text-red-500">*</span>
                </label>
                <select
                  className={`${INPUT} cursor-pointer`}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  {mockRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Education Type<span className="text-red-500">*</span>
                </label>
                <select
                  className={`${INPUT} cursor-pointer`}
                  value={selectedEducationType}
                  onChange={(e) => setSelectedEducationType(e.target.value)}
                >
                  <option value="">Select Education Type</option>
                  {mockEducationTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Select Participant<span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setIsParticipantsModalOpen(true)}
                className="w-full py-2 px-3 border border-[#C9C9C9] rounded-lg text-sm text-gray-700 hover:border-emerald-500 transition-all cursor-pointer text-left flex items-center justify-between"
              >
                <span>
                  {selectedParticipants.length > 0
                    ? `${selectedParticipants.length} participant(s) selected`
                    : "Select Participants"}
                </span>
              </button>
            </div>

            {selectedParticipants.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  Selected Participants:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                    >
                      <span>{participant.name}</span>
                      <button
                        onClick={() =>
                          setSelectedParticipants(
                            selectedParticipants.filter(
                              (p) => p.id !== participant.id
                            )
                          )
                        }
                        className="cursor-pointer hover:text-emerald-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 bg-[#43C17A] cursor-pointer text-white py-3 rounded-lg font-semibold transition hover:bg-[#34a564]"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <SelectParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={MOCK_PARTICIPANTS}
        selectedParticipants={selectedParticipants}
        onSelectParticipants={setSelectedParticipants}
      />
    </>
  );
}
