"use client";

import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { saveHrCalendarEvent } from "@/lib/helpers/Hr/calendar/hrCalendarEventsAPI";
import { X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none transition-all";

const convertTo24Hour = (hour: string, min: string, ampm: string) => {
  let h = parseInt(hour, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}:00`;
};
const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export default function AddEventModal({
  isOpen,
  onClose,
  editData,
  onSuccess,
}: any) {
  const { collegeId, collegeHrId } = useCollegeHr();

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
  const [assignTo, setAssignTo] = useState("");
  const [loading, setLoading] = useState(false);
  const TODAY = getTodayDateString();

  useEffect(() => {
    if (isOpen && editData) {
      setEventTitle(editData.title);
      setEventTopic(editData.topic);
      setEventDate(editData.eventDate);
      setRoomNo(editData.roomNo);
      setAssignTo(editData.role);

      const [fTime, fMod] = editData.fromTime.split(" ");
      const [fH, fM] = fTime.split(":");
      setFromHour(fH);
      setFromMinute(fM);
      setFromAmPm(fMod);

      const [tTime, tMod] = editData.toTime.split(" ");
      const [tH, tM] = tTime.split(":");
      setToHour(tH);
      setToMinute(tM);
      setToAmPm(tMod);
    } else {
      setEventTitle("");
      setEventTopic("");
      setEventDate("");
      setRoomNo("");
      setAssignTo("");
    }
  }, [isOpen, editData]);

  const handleSave = async () => {
    const title = eventTitle?.trim();
    const topic = eventTopic?.trim();

    if (!title) {
      return toast.error("Event title is required.");
    }

    if (!topic) {
      return toast.error("Event topic is required.");
    }

    if (!eventDate) {
      return toast.error("Event date is required.");
    }

    if (!assignTo) {
      return toast.error("Please select a role.");
    }

    if (
      !fromHour ||
      !fromMinute ||
      !fromAmPm ||
      !toHour ||
      !toMinute ||
      !toAmPm
    ) {
      return toast.error("Please select both start and end time.");
    }

    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return toast.error("Cannot schedule an event in the past.");
    }

    const from24 = convertTo24Hour(fromHour, fromMinute, fromAmPm);
    const to24 = convertTo24Hour(toHour, toMinute, toAmPm);

    if (from24 >= to24) {
      return toast.error("End time must be after start time.");
    }

    if (!collegeId || !collegeHrId) {
      return toast.error("HR context missing.");
    }

    setLoading(true);

    try {
      const payload = {
        hrCalendarEventId: editData?.hrCalendarEventId,
        title,
        topic,
        eventDate,
        fromTime: `${fromHour}:${fromMinute} ${fromAmPm}`,
        toTime: `${toHour}:${toMinute} ${toAmPm}`,
        roomNo, // optional
        collegeId,
        role: assignTo,
      };

      const res = await saveHrCalendarEvent(payload, collegeHrId);

      if (res.success) {
        toast.success(
          editData
            ? "Event updated successfully"
            : "Event created successfully",
        );
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to save event.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col">
        <div className="flex justify-between items-center p-5 pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {editData ? "Edit Event" : "Add Event"}
          </h2>
          <button onClick={onClose}>
            <X
              size={20}
              className="text-gray-500 hover:text-gray-800 cursor-pointer"
            />
          </button>
        </div>

        <div className="p-5 pt-0 space-y-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event title
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
              Event topic
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
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className={INPUT}
                value={eventDate}
                min={TODAY}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Room no.
              </label>
              <input
                type="text"
                placeholder="Enter room no."
                className={INPUT}
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Time</label>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">From</span>
                <div className="flex gap-2">
                  <select
                    className={`${INPUT} w-16`}
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
                    className={`${INPUT} w-16`}
                    value={fromMinute}
                    onChange={(e) => setFromMinute(e.target.value)}
                  >
                    {[
                      "00",
                      "05",
                      "10",
                      "15",
                      "20",
                      "25",
                      "30",
                      "35",
                      "40",
                      "45",
                      "50",
                      "55",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${INPUT} w-16`}
                    value={fromAmPm}
                    onChange={(e) => setFromAmPm(e.target.value)}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">To</span>
                <div className="flex gap-2">
                  <select
                    className={`${INPUT} w-16`}
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
                    className={`${INPUT} w-16`}
                    value={toMinute}
                    onChange={(e) => setToMinute(e.target.value)}
                  >
                    {[
                      "00",
                      "05",
                      "10",
                      "15",
                      "20",
                      "25",
                      "30",
                      "35",
                      "40",
                      "45",
                      "50",
                      "55",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${INPUT} w-16`}
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Assign to
            </label>
            <select
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none transition-all cursor-pointer"
            >
              <option value="">Select user type</option>
              <option value="Faculty">Faculty</option>
              <option value="Placement">Placement</option>
              <option value="Finance">Finance</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 cursor-pointer focus:outline-none bg-[#43C17A] text-white py-3 rounded-lg font-semibold transition hover:bg-[#3aad69]"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
