"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import SelectFacultyModal from "./SelectFacultyModal";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  saveHrMeeting,
  updateHrMeeting,
} from "@/lib/helpers/Hr/meetings/meetingsAPI";
import { addMeetingParticipants } from "@/lib/helpers/Hr/meetings/meetingParticipantsAPI";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { supabase } from "@/lib/supabaseClient";
import ConflictErrorModal from "./ConflictErrorModal";
import { fetchEducationTypes } from "@/lib/helpers/Hr/meetings/educationAPI";
import { scheduleMeetingReminder } from "@/lib/helpers/Hr/meetings/scheduleMeetingReminder";

const convertTo24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
  let h = parseInt(hour);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + parseInt(minute);
};

const MIN_TIME = 8 * 60;
const MAX_TIME = 22 * 60;

const MAX_MEETING_DURATION = 4 * 60;

const validateTimeRange = (
  sHour: string,
  sMinute: string,
  sPeriod: "AM" | "PM",
  eHour: string,
  eMinute: string,
  ePeriod: "AM" | "PM",
) => {
  const start = convertTo24Hour(sHour, sMinute, sPeriod);
  const end = convertTo24Hour(eHour, eMinute, ePeriod);

  const startInvalid = start < MIN_TIME || start > MAX_TIME;
  const endInvalid = end < MIN_TIME || end > MAX_TIME;

  if (startInvalid && endInvalid) {
    toast.error("Start and End time must be between 8:00 AM and 10:00 PM", {
      id: "time-error",
    });
    return false;
  }

  if (startInvalid) {
    toast.error("Start time must be between 8:00 AM and 10:00 PM", {
      id: "time-error",
    });
    return false;
  }

  if (endInvalid) {
    toast.error("End time must be between 8:00 AM and 10:00 PM", {
      id: "time-error",
    });
    return false;
  }

  if (start === end) {
    toast.error("Start and End time cannot be the same", { id: "time-error" });
    return false;
  }

  if (end < start) {
    toast.error("End time must be greater than start time", {
      id: "time-error",
    });
    return false;
  }

  const duration = end - start;

  if (duration > MAX_MEETING_DURATION) {
    toast.error("Meeting duration cannot exceed 4 hours", { id: "time-error" });
    return false;
  }

  return true;
};

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CreateMeetingModal({
  isOpen,
  onClose,
  onMeetingCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userId } = useUser();
  const { collegeHrId, collegeId } = useCollegeHr();
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [date, setDate] = useState("");
  const [educationTypes, setEducationTypes] = useState<any[]>([]);
  const [inAppNotification, setInAppNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  const [isScheduling, setIsScheduling] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedEducationType, setSelectedEducationType] = useState("");

  const [isPastTimeError, setIsPastTimeError] = useState(false);

  const [conflictData, setConflictData] = useState<{
    title: string;
    role: string;
  } | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);
  const selectModalRoleParam = searchParams.get("selectRole");
  const isSelectModalOpen = !!selectModalRoleParam;
  const editMeetingId = searchParams.get("editMeetingId");

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else if (isOpen && !editMeetingId) {
      resetForm();
    }
  }, [isOpen, editMeetingId]);

  useEffect(() => {
    const loadEducationTypes = async () => {
      if (!collegeId) return;

      const data = await fetchEducationTypes(collegeId);
      setEducationTypes(data);
    };

    loadEducationTypes();
  }, [collegeId]);

  const resetForm = () => {
    setTitle("");
    setAgenda("");
    setSelectedRole("Select Role");
    setSelectedEducationType("");
    setMeetingLink("");

    setSelectedUsers([]);

    setInAppNotification(false);
    setEmailNotification(false);
    setIsPastTimeError(false);

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
        a: a as "AM" | "PM",
      };
    };

    const fromP = getParts(start);
    const toP = getParts(end);

    setDate(getTodayDateString());
    setStartHour(fromP.h);
    setStartMinute(fromP.m);
    setStartPeriod(fromP.a);
    setEndHour(toP.h);
    setEndMinute(toP.m);
    setEndPeriod(toP.a);
  };

  const getDynamicSelectionText = () => {
    switch (selectedRole) {
      case "Admin":
        return "Select Admins";
      case "Faculty":
        return "Select Faculties";
      case "Placement":
        return "Select Placements";
      case "Finance":
        return "Select Finance";
      default:
        return "Select Participants";
    }
  };
  const dynamicText = getDynamicSelectionText();

  const getModalTitleFromUrl = () => {
    switch (selectModalRoleParam) {
      case "Admin":
        return "Select Admins";
      case "Faculty":
        return "Select Faculties";
      case "Placement":
        return "Select Placements";
      case "Finance":
        return "Select Finance";
      default:
        return "Select Participants";
    }
  };
  const validateTitle = (title: string) => {
    const regex = /^[A-Za-z0-9\s&:\-]+$/;

    if (!title.trim()) {
      toast.error("Meeting title is required");
      return false;
    }
    if (!regex.test(title.trim())) {
      toast.error(
        "Title can contain only letters, numbers, spaces, &, :, and -",
        { id: "title-error" },
      );
      return false;
    }
    return true;
  };

  const validateAgenda = (agenda: string) => {
    if (!agenda.trim()) {
      toast.error("Agenda is required");
      return false;
    }
    return true;
  };
  const validateDate = (date: string) => {
    if (!date) {
      toast.error("Please select meeting date");
      return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Meeting date cannot be in the past");
      return false;
    }

    return true;
  };
  const ALLOWED_MEETING_PROVIDERS = [
    "meet.google.com",
    "zoom.us",
    "teams.microsoft.com",
    "teams.live.com",
    "webex.com",
    "gotomeeting.com",
    "skype.com",
  ];

  useEffect(() => {
    const loadMeeting = async () => {
      if (!editMeetingId) return;

      try {
        const { data: meeting } = await supabase
          .from("hr_meetings")
          .select("*")
          .eq("hrMeetingId", Number(editMeetingId))
          .single();
        if (!meeting) return;

        setTitle(meeting.title);
        setAgenda(meeting.agenda);
        setDate(meeting.meetingDate);
        setMeetingLink(meeting.meetingLink);

        const parseTimeFromDB = (time24: string) => {
          if (!time24) return { hour: "09", minute: "00", period: "AM" };
          const [hStr, mStr] = time24.split(":");
          let h = parseInt(hStr, 10);
          const period = h >= 12 ? "PM" : "AM";
          h = h % 12;
          if (h === 0) h = 12;
          return {
            hour: String(h).padStart(2, "0"),
            minute: mStr,
            period: period as "AM" | "PM",
          };
        };

        const start = parseTimeFromDB(meeting.fromTime);
        const end = parseTimeFromDB(meeting.toTime);

        setStartHour(start.hour);
        setStartMinute(start.minute);
        setStartPeriod((start.period as "AM") || "PM");

        setEndHour(end.hour);
        setEndMinute(end.minute);
        setEndPeriod((end.period as "AM") || "PM");
        const { data: participants } = await supabase
          .from("hr_meeting_participants")
          .select("*")
          .eq("hrMeetingId", Number(editMeetingId));
        if (participants && participants.length > 0) {
          setSelectedUsers(
            participants.map((p) => ({
              userId: p.userId,
            })),
          );

          setSelectedRole(participants[0].role);
          setInAppNotification(participants[0].notifiedInApp);
          setEmailNotification(participants[0].notifiedEmail);
        }
      } catch (err) {
        console.error("Load meeting failed:", err);
      }
    };
    loadMeeting();
  }, [editMeetingId]);

  const validateMeetingUrl = (url: string): boolean => {
    try {
      // 🟢 FIX: Removed setIsScheduling(true) and toast.loading from here!
      // This function should ONLY validate and return boolean.
      const parsedUrl = new URL(url.trim());
      const hostname = parsedUrl.hostname.toLowerCase();

      const isAllowed = ALLOWED_MEETING_PROVIDERS.some(
        (provider) =>
          hostname === provider || hostname.endsWith(`.${provider}`),
      );

      if (parsedUrl.pathname.match(/\.(jpg|jpeg|png|gif|mp4|pdf)$/i))
        return false;

      return isAllowed;
    } catch {
      return false;
    }
  };

  const convertTo24HourString = (
    hour: string,
    minute: string,
    period: "AM" | "PM",
  ) => {
    let h = parseInt(hour);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minute}:00`;
  };

  const fromTime = `${startHour}:${startMinute} ${startPeriod}`;
  const toTime = `${endHour}:${endMinute} ${endPeriod}`;

  // Restored cascading dropdown validation rule
  const handleOpenSelectModal = () => {
    if (!selectedRole || selectedRole === "Select Role") {
      toast.error("Please select a role first");
      return;
    }
    if (!selectedEducationType) {
      toast.error("Please select an education type first");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("selectRole", selectedRole);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseSelectModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selectRole");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = async () => {
    if (!collegeId || !collegeHrId) {
      toast.error("HR context not loaded yet");
      return;
    }
    if (!validateTitle(title)) return;
    if (!validateAgenda(agenda)) return;
    if (!selectedRole || selectedRole === "Select Role") {
      toast.error("Please select a role", { id: "role-error" });
      return;
    }
    if (!validateDate(date)) return;

    if (
      !validateTimeRange(
        startHour,
        startMinute,
        startPeriod,
        endHour,
        endMinute,
        endPeriod,
      )
    )
      return;

    // Strict Past-Time Validation Check
    const fromTime24 = convertTo24HourString(
      startHour,
      startMinute,
      startPeriod,
    );
    const selectedDateTime = new Date(`${date}T${fromTime24}`);
    const now = new Date();

    if (selectedDateTime < now) {
      setIsPastTimeError(true);
      toast.error("Meeting time cannot be in the past", { id: "time-error" });
      return;
    }
    setIsPastTimeError(false);

    const trimmedLink = meetingLink.trim();

    if (!trimmedLink) {
      toast.error("Meeting link is required", { id: "meeting-link-error" });
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(trimmedLink);
    } catch {
      toast.error("Please enter a valid meeting URL", {
        id: "meeting-link-error",
      });
      return;
    }

    const isValidProvider = validateMeetingUrl(trimmedLink);

    if (!isValidProvider) {
      toast.error(
        "Only valid meeting platforms are allowed (Google Meet, Zoom, Microsoft Teams, Webex, Skype, GoToMeeting)",
        { id: "meeting-link-error" },
      );
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error(`Please select at least one ${selectedRole.toLowerCase()}`, {
        id: "participant-error",
      });
      return;
    }

    if (!inAppNotification && !emailNotification) {
      toast.error("Please select at least one notification option", {
        id: "notification-error",
      });
      return;
    }

    // 🟢 ALL VALIDATIONS PASSED: Trigger Loading State NOW
    try {
      setIsScheduling(true);
      toast.loading(
        editMeetingId ? "Updating meeting..." : "Scheduling meeting...",
        { id: "schedule-loading" },
      );

      let hrMeetingId;
      const toTime24 = convertTo24HourString(endHour, endMinute, endPeriod);

      if (editMeetingId) {
        const updateRes = await updateHrMeeting(Number(editMeetingId), {
          title,
          agenda,
          meetingDate: date,
          fromTime: fromTime24,
          toTime: toTime24,
          meetingLink: trimmedLink,
        });

        if (!updateRes.success) {
          if (updateRes.error?.code === "23505") {
            setConflictData({
              title: title,
              role: selectedRole,
            });

            setShowConflictModal(true);
            toast.dismiss("schedule-loading");

            return;
          }

          toast.error(updateRes.message || "Failed to update meeting", {
            id: "schedule-loading",
          });
          return;
        }

        hrMeetingId = Number(editMeetingId);
      } else {
        const meetingRes = await saveHrMeeting(
          {
            title,
            agenda,
            meetingDate: date,
            fromTime: fromTime24,
            toTime: toTime24,
            meetingLink: trimmedLink,
            collegeId,
          },
          collegeHrId,
          userId!,
        );

        if (!meetingRes.success) {
          toast.dismiss("schedule-loading");

          if (meetingRes.message?.includes("already scheduled")) {
            setConflictData({
              title,
              role: selectedRole,
            });

            setShowConflictModal(true);

            return;
          }

          toast.error(meetingRes.message || "Failed to create meeting");
          return;
        }

        hrMeetingId = meetingRes.hrMeetingId;
      }

      const participants = selectedUsers.map((u) => ({
        userId: u.userId,
        role: selectedRole as "Faculty" | "Admin" | "Finance" | "Placement",
        notifiedInApp: inAppNotification,
        notifiedEmail: emailNotification,
      }));

      if (editMeetingId) {
        const { error: deleteError } = await supabase
          .from("hr_meeting_participants")
          .delete()
          .eq("hrMeetingId", hrMeetingId);

        if (deleteError) {
          console.error("Delete participants failed:", deleteError);
        }
      }

      const participantRes = await addMeetingParticipants(
        hrMeetingId,
        participants,
      );

      if (!participantRes.success) {
        toast.error("Meeting saved but participants failed", {
          id: "schedule-loading",
        });
        return;
      }

      if (!editMeetingId) {
        const reminderRes = await scheduleMeetingReminder(
          hrMeetingId,
          date,
          fromTime24,
          reminderMinutes,
        );

        if (!reminderRes.success) {
          toast.error("Meeting saved, but reminder scheduling failed.", {
            id: "schedule-loading",
          });
        }
      }

      toast.success(
        editMeetingId
          ? "Meeting updated successfully"
          : "Meeting scheduled successfully",
        { id: "schedule-loading" },
      );

      onMeetingCreated?.();

      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: "schedule-loading" });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {(isOpen || !!editMeetingId) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-112 p-4 max-h-[90vh] shadow-xl custom-scrollbar overflow-y-auto "
            >
              <h2 className="text-[22px] font-bold text-[#282828] mb-6">
                {editMeetingId ? "Edit Meeting" : "Create Meeting"}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-base font-semibold text-[#282828] mb-1.5">
                    Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setTitle(value);
                      } else {
                        toast.error(
                          "Title can contain only letters and spaces",
                          { id: "title-error" },
                        );
                      }
                    }}
                    placeholder="e.g., Internal Assessment Discussion"
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-regular outline-none focus:border-gray-300 focus:ring-0 text-[#282828]"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#282828] mb-1.5">
                    Agenda<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Brief description of the meeting......!!!!"
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-1 text-sm font-regular outline-none resize-none text-[#282828]"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-[#282828] mb-1.5">
                    Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={getTodayDateString()}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setIsPastTimeError(false); // Reset validation on change
                    }}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-regular outline-none text-[#555555] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-[#282828] mb-1.5">
                    Time
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      {/* Past Time Error Highlighting */}
                      <span
                        className={`text-base block mb-1 font-semibold transition-colors ${isPastTimeError ? "font-bold text-red-600" : "text-[#282828]"}`}
                      >
                        From<span className="text-red-500">*</span>
                      </span>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={startHour}
                            onChange={(e) => {
                              setStartHour(e.target.value);
                              setIsPastTimeError(false);
                            }}
                            className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const h = String(i + 1).padStart(2, "0");
                              return (
                                <option
                                  key={h}
                                  value={h}
                                  className="text-[#282828]"
                                >
                                  {h}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={startMinute}
                            onChange={(e) => {
                              setStartMinute(e.target.value);
                              setIsPastTimeError(false);
                            }}
                            className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const m = String(i * 5).padStart(2, "0");
                              return (
                                <option
                                  key={m}
                                  value={m}
                                  className="text-[#282828]"
                                >
                                  {m}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={startPeriod}
                            onChange={(e) => {
                              setStartPeriod(e.target.value as "AM" | "PM");
                              setIsPastTimeError(false);
                            }}
                            className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      {/* Past Time Error Highlighting */}
                      <span
                        className={`text-base block mb-1 font-semibold transition-colors ${isPastTimeError ? "font-bold text-red-600" : "text-[#282828]"}`}
                      >
                        To<span className="text-red-500">*</span>
                      </span>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={endHour}
                            onChange={(e) => {
                              setEndHour(e.target.value);
                              setIsPastTimeError(false);
                            }}
                            className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const h = String(i + 1).padStart(2, "0");
                              return (
                                <option
                                  key={h}
                                  value={h}
                                  className="text-[#282828]"
                                >
                                  {h}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={endMinute}
                            onChange={(e) => {
                              setEndMinute(e.target.value);
                              setIsPastTimeError(false);
                            }}
                            className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const m = String(i * 5).padStart(2, "0");
                              return (
                                <option
                                  key={m}
                                  value={m}
                                  className="text-[#282828]"
                                >
                                  {m}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={endPeriod}
                            onChange={(e) => {
                              setEndPeriod(e.target.value as "AM" | "PM");
                              setIsPastTimeError(false);
                            }}
                            className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-[#282828] mb-1.5">
                      Role<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none appearance-none bg-white text-[#555555] cursor-pointer"
                      >
                        <option disabled value="Select Role">
                          Select Role
                        </option>
                        <option value="Admin">Admin</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Placement">Placement</option>
                        <option value="Finance">Finance</option>
                      </select>
                      <CaretDown
                        size={14}
                        className="absolute right-3 top-3.5 text-[#555555] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-[#282828] mb-1.5">
                      Education Type<span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        value={selectedEducationType}
                        onChange={(e) =>
                          setSelectedEducationType(e.target.value)
                        }
                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none appearance-none bg-white text-[#555555] cursor-pointer"
                      >
                        <option value="">Select Education Type</option>

                        {educationTypes.map((edu) => (
                          <option
                            key={edu.collegeEducationId}
                            value={edu.collegeEducationId}
                          >
                            {edu.collegeEducationType}
                          </option>
                        ))}
                      </select>

                      <CaretDown
                        size={14}
                        className="absolute right-3 top-3.5 text-[#555555] pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-[#282828] mb-1.5">
                      {selectedRole === "Select Role"
                        ? "Select Participants"
                        : dynamicText}
                      <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={handleOpenSelectModal}
                      className="relative cursor-pointer"
                    >
                      <div className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm bg-white text-[#555555]">
                        {selectedRole === "Select Role"
                          ? "Select Participants"
                          : dynamicText}
                      </div>
                      <CaretRight
                        size={14}
                        className="absolute right-3 top-3.5 text-[#555555] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-[#282828] mb-1.5">
                      Meeting Link<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3 py-2.5 border border-[#CCCCCC] rounded-lg focus:outline-none focus:ring-1 text-sm text-[#555555]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#282828] mb-1.5">
                    Notifications<span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-4">
                    <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 h-[42px] flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inAppNotification}
                        onChange={(e) => setInAppNotification(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#282828] whitespace-nowrap">
                        In-app notification
                      </span>
                    </label>

                    <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 h-[42px] flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotification}
                        onChange={(e) => setEmailNotification(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#282828] whitespace-nowrap">
                        Email notification
                      </span>
                    </label>

                    <div className="flex-1">
                      <select
                        value={reminderMinutes}
                        onChange={(e) =>
                          setReminderMinutes(Number(e.target.value))
                        }
                        className="w-full border font-medium border-[#E0E0E0] rounded-lg px-3 h-[42px] text-xs outline-none bg-white text-[#555555] cursor-pointer"
                      >
                        <option value={15}>15 minutes before</option>
                        <option value={30}>30 minutes before</option>
                        <option value={60}>1 hour before</option>
                        <option value={1440}>1 day before</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-1.5 bg-[#E9E9E9] rounded-lg font-semibold text-[#282828] hover:bg-[#d8d8d8] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isScheduling}
                    className={`flex-1 py-1.5 rounded-lg font-semibold text-white transition-colors shadow-sm
    ${isScheduling ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] hover:bg-[#38a869] cursor-pointer"}`}
                  >
                    {isScheduling
                      ? "Processing..."
                      : editMeetingId
                        ? "Update"
                        : "Schedule"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SelectFacultyModal
        isOpen={isSelectModalOpen}
        onClose={handleCloseSelectModal}
        onSelect={(users) => setSelectedUsers(users)}
        selectedUsers={selectedUsers}
        title={getModalTitleFromUrl()}
        roleName={
          (selectModalRoleParam as "Admin" | "Faculty" | "Finance") || "Faculty"
        }
        educationTypeId={Number(selectedEducationType)}
      />
      <ConflictErrorModal
        open={showConflictModal}
        conflictDetails={conflictData}
        onClose={() => setShowConflictModal(false)}
      />
    </>
  );
}
