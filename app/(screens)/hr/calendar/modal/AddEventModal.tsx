"use client";

import { X } from "@phosphor-icons/react";
import { useState } from "react";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

const BRANCHES = [
  { id: 1, name: "CSE" },
  { id: 2, name: "ECE" },
  { id: 3, name: "IT" },
];

const YEARS = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
];

const SECTIONS = ["A", "B", "C", "D"];

export default function AddEventModal({ isOpen, onClose, editData }: AddEventModalProps) {

  const [eventTitle, setEventTitle] = useState("");
  const [eventTopic, setEventTopic] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [roomNo, setRoomNo] = useState("");

  const [fromHour, setFromHour] = useState("08");
  const [fromMinute, setFromMinute] = useState("00");
  const [fromAmPm, setFromAmPm] = useState("AM");

  const [toHour, setToHour] = useState("09");
  const [toMinute, setToMinute] = useState("00");
  const [toAmPm, setToAmPm] = useState("AM");

  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const handleSave = () => {
    const event = {
      eventTitle,
      eventTopic,
      eventDate,
      roomNo,
      fromHour,
      fromMinute,
      fromAmPm,
      toHour,
      toMinute,
      toAmPm,
      branch,
      year,
      section,
      assignTo,
    };

    console.log("STATIC EVENT DATA:", event);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col">
        <div className="flex justify-between items-center p-5 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Add Event
          </h2>

          <button onClick={onClose}>
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <div className="p-5 pt-0 space-y-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Title
            </label>

            <input
              type="text"
              placeholder="Enter title"
              className={INPUT}
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Topic
            </label>

            <input
              type="text"
              placeholder="Enter topic"
              className={INPUT}
              value={eventTopic}
              onChange={(e) => setEventTopic(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Date
              </label>

              <input
                type="date"
                className={INPUT}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Room No.
              </label>

              <input
                type="text"
                placeholder="Enter Room no."
                className={INPUT}
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
              />
            </div>

          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Time
            </label>

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">From</span>

                <div className="flex gap-2">

                  <select className={`${INPUT} w-16`} value={fromHour} onChange={(e) => setFromHour(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return <option key={h} value={h}>{h}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16`} value={fromMinute} onChange={(e) => setFromMinute(e.target.value)}>
                    {["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select className={`${INPUT} w-16`} value={fromAmPm} onChange={(e) => setFromAmPm(e.target.value)}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>

                </div>
              </div>

              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">To</span>

                <div className="flex gap-2">

                  <select className={`${INPUT} w-16`} value={toHour} onChange={(e) => setToHour(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return <option key={h} value={h}>{h}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16`} value={toMinute} onChange={(e) => setToMinute(e.target.value)}>
                    {["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select className={`${INPUT} w-16`} value={toAmPm} onChange={(e) => setToAmPm(e.target.value)}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>

                </div>
              </div>

            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Branch
              </label>

              <select className={INPUT} value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="">Select Branch</option>

                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Year
              </label>

              <select className={INPUT} value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>

                {YEARS.map((y) => (
                  <option key={y.id} value={y.name}>{y.name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Section
              </label>

              <select className={INPUT} value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="">Select Section</option>

                {SECTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Assign To
              </label>

              <select
                className={INPUT}
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
              >
                <option value="">Select User Type</option>

                <option value="all">All</option>
                <option value="faculty">Faculty</option>
                <option value="students">Students</option>
                <option value="finance">Finance Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 bg-[#43C17A] text-white py-3 rounded-lg font-semibold transition hover:bg-[#3aad69]"
          >
            Save
          </button>

        </div>
      </div>
    </div>
  );
}