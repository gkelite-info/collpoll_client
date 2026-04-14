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
  events = [],
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

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const TODAY = getTodayDateString();

  // PORTED FROM FINANCE: Text Only validation
  const TextOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z\s]/g, "");
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    e.target.value = value;
    return value;
  };

  useEffect(() => {
    // 1. CLEAR DATA WHEN MODAL CLOSES
    if (!isOpen) {
      setEventTitle("");
      setEventTopic("");
      setEventDate("");
      setRoomNo("");
      setAssignTo("");
      setFromHour("08");
      setFromMinute("00");
      setFromAmPm("AM");
      setToHour("09");
      setToMinute("00");
      setToAmPm("AM");
      setShowConflictModal(false);
      setPendingPayload(null);
      return;
    }

    // 2. LOAD EDIT DATA
    if (editData) {
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
    }
    // 3. SMART DEFAULT TIME (Current + 15 mins) FOR NEW EVENTS
    else {
      const start = new Date();
      start.setMinutes(start.getMinutes() + 15);
      const rem = start.getMinutes() % 5;
      if (rem !== 0) start.setMinutes(start.getMinutes() + (5 - rem));

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      const getParts = (d: Date) => {
        let h = d.getHours();
        const a = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        const m = d.getMinutes();
        return {
          h: String(h).padStart(2, "0"),
          m: String(m).padStart(2, "0"),
          a,
        };
      };

      const fromP = getParts(start);
      const toP = getParts(end);

      setEventTitle("");
      setEventTopic("");
      setEventDate(start.toISOString().split("T")[0]); // Set strictly to today
      setFromHour(fromP.h);
      setFromMinute(fromP.m);
      setFromAmPm(fromP.a);
      setToHour(toP.h);
      setToMinute(toP.m);
      setToAmPm(toP.a);
      setRoomNo("");
      setAssignTo("");
    }
  }, [isOpen, editData]);

  const handleSave = async () => {
    // PORTED FROM FINANCE: Exact Validations
    if (!eventTitle.trim()) {
      toast.error("Please enter an event title.");
      return;
    }

    if (!eventTopic.trim()) {
      toast.error("Please enter an event topic.");
      return;
    }

    if (!eventDate) {
      toast.error("Please select a date for the event.");
      return;
    }

    if (!roomNo.trim()) {
      toast.error("Please enter a room no.");
      return;
    }

    if (!assignTo) {
      toast.error("Please select a role.");
      return;
    }

    if (!collegeId || !collegeHrId) {
      toast.error("HR context missing.");
      return;
    }

    const from24 = convertTo24Hour(fromHour, fromMinute, fromAmPm);
    const to24 = convertTo24Hour(toHour, toMinute, toAmPm);

    const now = new Date();
    const startDateTime = new Date(`${eventDate}T${from24}`);
    const endDateTime = new Date(`${eventDate}T${to24}`);

    // PORTED FROM FINANCE: Future Time Validations
    if (startDateTime <= now) {
      toast.error("Event time must be strictly in the future.");
      return;
    }
    if (startDateTime >= endDateTime) {
      toast.error("End time must be after the start time.");
      return;
    }

    const payload = {
      hrCalendarEventId: editData?.hrCalendarEventId,
      title: eventTitle.trim(),
      topic: eventTopic.trim(),
      eventDate,
      fromTime: `${fromHour}:${fromMinute} ${fromAmPm}`,
      toTime: `${toHour}:${toMinute} ${toAmPm}`,
      roomNo: roomNo.trim(),
      collegeId,
      role: assignTo,
    };

    const hasConflict = events.some((e: any) => {
      if (
        editData &&
        String(e.hrCalendarEventId) === String(editData.hrCalendarEventId)
      )
        return false;

      const eStart = new Date(e.startTime);
      const eEnd = new Date(e.endTime);

      return startDateTime < eEnd && endDateTime > eStart;
    });

    if (hasConflict) {
      setPendingPayload(payload);
      setShowConflictModal(true);
      return;
    }

    await submitEvent(payload);
  };

  const submitEvent = async (payload: any) => {
    setLoading(true);
    try {
      const res = await saveHrCalendarEvent(payload, collegeHrId!);
      if (res.success) {
        toast.success(
          editData
            ? "Event updated successfully"
            : "Event created successfully",
        );
        setShowConflictModal(false);
        setPendingPayload(null);
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
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col relative overflow-hidden">
        {showConflictModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/90 backdrop-blur-sm p-6">
            <div className="bg-white border border-gray-200 shadow-2xl rounded-xl p-6 max-w-sm text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <span className="text-orange-500 font-bold text-2xl">!</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Schedule Conflict
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Another event is already scheduled during this time slot. Do you
                still want to proceed and double-book?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowConflictModal(false);
                    setPendingPayload(null);
                  }}
                  disabled={loading}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitEvent(pendingPayload)}
                  disabled={loading}
                  className="flex-1 py-2 bg-[#43C17A] text-white rounded-lg font-semibold hover:bg-[#3ba869] transition cursor-pointer disabled:opacity-70"
                >
                  {loading ? "Saving..." : "Proceed Anyway"}
                </button>
              </div>
            </div>
          </div>
        )}

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
              Event title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter title"
              className={INPUT}
              value={eventTitle}
              onChange={(e) => setEventTitle(TextOnly(e))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event topic<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter topic"
              className={INPUT}
              value={eventTopic}
              onChange={(e) => setEventTopic(TextOnly(e))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Date<span className="text-red-500">*</span>
              </label>
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
                Room no.<span className="text-red-500">*</span>
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
                <span className="block text-gray-500 text-xs mb-1">
                  From<span className="text-red-500">*</span>
                </span>
                <div className="flex gap-2">
                  <select
                    className={`${INPUT} w-16 cursor-pointer`}
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
                    className={`${INPUT} w-16 cursor-pointer`}
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
                    className={`${INPUT} w-16 cursor-pointer`}
                    value={fromAmPm}
                    onChange={(e) => setFromAmPm(e.target.value)}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">
                  To<span className="text-red-500">*</span>
                </span>
                <div className="flex gap-2">
                  <select
                    className={`${INPUT} w-16 cursor-pointer`}
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
                    className={`${INPUT} w-16 cursor-pointer`}
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
                    className={`${INPUT} w-16 cursor-pointer`}
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

          <div className="flex flex-col gap-1 mt-2">
            <label className="text-sm font-medium text-gray-700">
              Assign to<span className="text-red-500">*</span>
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
            className="w-full mt-4 cursor-pointer focus:outline-none bg-[#43C17A] text-white py-3 rounded-lg font-semibold transition hover:bg-[#3aad69] disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
