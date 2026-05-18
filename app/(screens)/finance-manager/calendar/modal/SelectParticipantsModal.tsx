"use client";

import { X, MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";

interface Participant {
  id: number;
  name: string;
  participantId: string;
  avatar?: string;
}

interface SelectParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onSelectParticipants: (selected: Participant[]) => void;
  selectedParticipants?: Participant[];
}

export default function SelectParticipantsModal({
  isOpen,
  onClose,
  participants,
  onSelectParticipants,
  selectedParticipants = [],
}: SelectParticipantsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelected, setLocalSelected] = useState<number[]>(
    selectedParticipants.map((p) => p.id)
  );

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleParticipant = (id: number) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (localSelected.length === filteredParticipants.length) {
      setLocalSelected([]);
    } else {
      setLocalSelected(filteredParticipants.map((p) => p.id));
    }
  };

  const handleSave = () => {
    const selected = participants.filter((p) => localSelected.includes(p.id));
    onSelectParticipants(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="w-[480px] max-h-[80vh] rounded-xl bg-white shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Participants
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded hover:bg-slate-900 cursor-pointer transition"
            >
              Select All
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by Faculty Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-3">
            {filteredParticipants.map((participant) => (
              <label
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={localSelected.includes(participant.id)}
                  onChange={() => toggleParticipant(participant.id)}
                  className="w-4 h-4 cursor-pointer accent-slate-800"
                />
                <img
                  src={participant.avatar || `https://via.placeholder.com/40`}
                  alt={participant.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {participant.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID - {participant.participantId}
                  </div>
                </div>
              </label>
            ))}

            {filteredParticipants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No participants found
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
