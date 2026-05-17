"use client";

import WipOverlay from "@/app/utils/WipOverlay";
import { X, CaretDown } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

type AddEventModalProps = {
  isOpen: boolean;
  initialData: any;
  onClose: () => void;
  onSave: (payload: any) => void;
  mode: "create" | "edit";
  isSaving: boolean;
};

export default function AddEventModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  mode,
  isSaving,
}: AddEventModalProps) {
  // Form State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [roomNo, setRoomNo] = useState("");
  
  // Time State
  const [fromHour, setFromHour] = useState("09");
  const [fromMinute, setFromMinute] = useState("00");
  const [fromPeriod, setFromPeriod] = useState("AM");
  const [toHour, setToHour] = useState("10");
  const [toMinute, setToMinute] = useState("00");
  const [toPeriod, setToPeriod] = useState("AM");

  // Participants Dropdown State
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Participant list options
  const participantOptions = [
    "All Students",
    "All Faculty",
    "Club Presidents & Vice Presidents",
    "Core Committee Members",
    "Department HODs",
  ];

  // Sync initialData when in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setTopic(initialData.topic || "");
      setDate(initialData.date || "");
      setRoomNo(initialData.roomNo || "");
      setFromHour(initialData.fromHour || "09");
      setFromMinute(initialData.fromMinute || "00");
      setFromPeriod(initialData.fromPeriod || "AM");
      setToHour(initialData.toHour || "10");
      setToMinute(initialData.toMinute || "00");
      setToPeriod(initialData.toPeriod || "AM");
      setSelectedParticipant(initialData.participants || "");
    } else {
      // Clear values for dynamic creating context
      setTitle("");
      setTopic("");
      setDate("");
      setRoomNo("");
      setFromHour("09");
      setFromMinute("00");
      setFromPeriod("AM");
      setToHour("10");
      setToMinute("00");
      setToPeriod("AM");
      setSelectedParticipant("");
    }
    setIsDropdownOpen(false);
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const payload = {
      title,
      topic,
      date,
      roomNo,
      time: {
        from: `${fromHour}:${fromMinute} ${fromPeriod}`,
        to: `${toHour}:${toMinute} ${toPeriod}`,
      },
      participants: selectedParticipant,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white relative w-full max-w-[480px] max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        {/* <WipOverlay /> */}
        <div className="flex justify-between items-center p-5 pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {mode === "edit" ? "Edit Event" : "Add Event"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition">
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 pt-0 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Event Title</label>
            <input 
              type="text" 
              placeholder="Enter title" 
              className={INPUT} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Topic & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Event Topic</label>
              <input 
                type="text" 
                placeholder="Enter topic" 
                className={INPUT} 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
              <input 
                type="date" 
                className={INPUT} 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Time Title Label */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Time</label>
            
            {/* Time Pickers Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From Selectors */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">From</span>
                <div className="flex gap-1">
                  <select value={fromHour} onChange={(e) => setFromHour(e.target.value)} className={`${INPUT} px-1 text-center cursor-pointer`}>
                    {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={fromMinute} onChange={(e) => setFromMinute(e.target.value)} className={`${INPUT} px-1 text-center cursor-pointer`}>
                    {["00","15","30","45"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={fromPeriod} onChange={(e) => setFromPeriod(e.target.value)} className={`${INPUT} px-1 text-center cursor-pointer`}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* To Selectors */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">To</span>
                <div className="flex gap-1">
                  <select value={toHour} onChange={(e) => setToHour(e.target.value)} className={`${INPUT} px-1 text-center cursor-pointer`}>
                    {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={toMinute} onChange={(e) => setToMinute(e.target.value)} className={`${INPUT} px-1 text-center cursor-pointer`}>
                    {["00","15","30","45"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={toPeriod} onChange={(e) => setToPeriod(e.target.value)} className={`${INPUT} px-1 text-center cursor-pointer`}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Room Number Area */}
          {/* <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Room No.</label>
            <input 
              type="text" 
              placeholder="Enter Room no." 
              className={INPUT} 
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
            />
          </div> */}

          {/* Brand New Custom Participants Dropdown */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Participants</label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${INPUT} flex justify-between items-center cursor-pointer h-[38px] select-none`}
            >
              <span className={selectedParticipant ? "text-gray-900" : "text-gray-400"}>
                {selectedParticipant || "Select Participants"}
              </span>
              <CaretDown size={16} className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown Options Drawer */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-[#C9C9C9] rounded-lg shadow-lg max-h-[160px] overflow-y-auto z-50 py-1">
                {participantOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setSelectedParticipant(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                      selectedParticipant === option 
                        ? "bg-emerald-50 text-emerald-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Action Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-2 bg-[#43C17A] text-white py-3 rounded-lg font-bold hover:bg-[#39a868] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition shadow-sm flex items-center justify-center gap-2"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}