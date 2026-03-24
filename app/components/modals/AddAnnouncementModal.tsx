"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAnnouncementRoles, saveAnnouncementRole } from "@/lib/helpers/announcements/announcementRoles";
import { deactivateCollegeAnnouncement, saveCollegeAnnouncement, updateCollegeAnnouncement } from "@/lib/helpers/announcements/announcementAPI";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
  refreshAnnouncements?: () => Promise<void>;
  editData?: any;
};



const typeIcons: Record<string, string> = {
  class: "/class.png",
  exam: "/exam.png",
  meeting: "/meeting.png",
  holiday: "/calendar-3d.png",
  event: "/event.png",
  notice: "/clip.png",
  result: "/result.jpg",
  timetable: "/timetable.png",
  placement: "/placement.png",
  emergency: "/emergency.png",
  finance: "/finance.jpg",
  other: "/others.png",
};


const roleOptionsMap: Record<string, string[]> = {
  Finance: [
    "CollegeAdmin",
    "Faculty",
    "Admin",
    "Student",
    "Parent",
  ],

  CollegeAdmin: [
    "Admin",
    "Faculty",
    "Student",
    "Parent",
    "Finance",
    "Finance Manager",
    "Placement",
    "CollegeHr",
  ],

  Admin: [
    "CollegeAdmin",
    "Faculty",
    "Student",
    "Parent",
    "Finance",
    "Finance Manager",
    "Placement",
    "CollegeHr",
  ],

  Faculty: [
    "CollegeAdmin",
    "Admin",
    "Student",
    "Parent",
  ],

  Student: [
    "Admin",
    "Faculty",
    "Finance",
    "Placement",
    "CollegeHr",
  ],

  Parent: [
    "Admin",
    "Faculty",
    "Finance",
    "Placement",
  ],

  CollegeHr: [
    "CollegeAdmin",
    "Admin",
    "Faculty",
    "Placement",
  ]
};

const formatRole = (role: string) =>
  role
    ?.replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());


export default function AddAnnouncementModal({
  open,
  onClose,
  refreshAnnouncements,
  editData,
}: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [customType, setCustomType] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [type, setType] = useState<string>("notice");
  const { userId, collegeId, role } = useUser();
  const availableRoles = role ? roleOptionsMap[role] || [] : [];


  // const roles = ["CollegeAdmin", "Admin", "Student", "Parent"];
  const selectedIcon = typeIcons[type];

  useEffect(() => {
    if (open && editData) {
      setTitle(editData.title ?? "");

      setDate(
        editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : ""
      );

      setType(editData.type || "");
      setTargetRoles(editData.targetRoles || []);
    }
  }, [open, editData]);

  const handleSave = async () => {

    const titleRegex = /^[A-Za-z\s]+$/;
    const today = new Date().toISOString().split("T")[0];

    if (!title || !date || targetRoles.length === 0 || !type) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!titleRegex.test(title.trim())) {
      toast.error("Title should contain only letters");
      return;
    }

    if (date < today) {
      toast.error("Past dates are not allowed");
      return;
    }

    if (!userId || !collegeId || !role) {
      toast.error("User session not loaded");
      return;
    }

    try {

      setSaving(true);
      if (editData) {

        const updateRes = await updateCollegeAnnouncement(
          editData.collegeAnnouncementId,
          {
            announcementTitle: title,
            date,
            type,
            targetRoles,
          }
        );

        if (!updateRes.success) {
          toast.error("Failed to update announcement");
          return;
        }
        await supabase
          .from("college_announcements_roles")
          .update({
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq("collegeAnnouncementId", editData.collegeAnnouncementId)
          .is("deletedAt", null);
        for (const roleItem of targetRoles) {
          await saveAnnouncementRole({
            collegeAnnouncementId: editData.collegeAnnouncementId,
            role: roleItem,
          });
        }

        toast.success("Announcement updated successfully");

        resetForm();
        await refreshAnnouncements?.();
        return;
      }
      const announcementRes = await saveCollegeAnnouncement(
        {
          announcementTitle: title,
          date,
          type,
          collegeId
        },
        userId,
        role
      );

      if (!announcementRes.success) {
        toast.error("Failed to create announcement");
        return;
      }

      const announcementId = announcementRes.collegeAnnouncementId;

      for (const roleItem of targetRoles) {
        const roleRes = await saveAnnouncementRole({
          collegeAnnouncementId: announcementId,
          role: roleItem,
        });

        if (!roleRes.success) {
          toast.error("Failed to assign announcement role");
          return;
        }
      }
      toast.success("Announcement created successfully");

      resetForm();
      await refreshAnnouncements?.();

    } catch (error) {

      console.error("handleSave error:", error);
      toast.error("Something went wrong");

    } finally {

      setSaving(false);

    }
  };

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDate("");
      setType("");
      setTargetRoles([]);
      setCustomType("");
    }
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setTargetRoles([]);
    setType("");
    setCustomType("");
    onClose();
  };

  if (!open) return null;

  const handleRoleToggle = (roleValue: string) => {
    setTargetRoles((prev) =>
      prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  const handleSelectAll = () => {
    setTargetRoles(availableRoles);
  };

  const handleClearAll = () => {
    setTargetRoles([]);
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

      <div
        className="bg-white w-[540px] rounded-xl shadow-xl p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold text-[#2F2F2F]">
            Add Announcement
          </h2>

          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-black cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-base font-medium text-[#2F2F2F]">
            Title
          </label>

          <input
            type="text"
            placeholder="Short title of the announcement"
            value={title}
            onChange={(e) => {
              const value = e.target.value;

              if (/^[A-Za-z\s]*$/.test(value)) {
                setTitle(value);
              }
            }}
            className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F] placeholder:text-[#B0B0B0] outline-none focus:ring-2 focus:ring-[#43C17A]"
          />
        </div>

        {/* Schedule */}
        <div className="mb-6">
          <p className="text-base font-semibold text-[#2F2F2F] mb-3">
            Schedule
          </p>

          <div className="flex flex-col gap-1 mb-5">
            <label className="text-base font-medium text-[#2F2F2F] mb-1">
              Date
            </label>

            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F]"
            />

          </div>

          <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
              <label className="text-base font-medium text-[#2F2F2F] mb-1">
                Type
              </label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F]"
              >
                <option value="">Select Type</option>
                <option value="class">Class</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="holiday">Holiday</option>
                <option value="event">Event</option>
                <option value="notice">Notice</option>
                <option value="result">Result</option>
                <option value="timetable">Timetable</option>
                <option value="placement">Placement</option>
                <option value="emergency">Emergency</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>

              {/* Show custom input when Other selected */}
              {/* {type === "other" && (
                <input
                  type="text"
                  placeholder="Enter type"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="mt-2 border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F]"
                />
              )} */}

              {/* Icon Preview (only for predefined types) */}
              {type && typeIcons[type] && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-10 h-10 rounded-md bg-[#F2F6FF] flex items-center justify-center">
                    <img src={typeIcons[type]} alt={type} className="h-6" />
                  </div>

                  <span className="text-sm capitalize text-[#2F2F2F]">
                    {type} announcement
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col w-1/2 relative role-dropdown">
              <label className="text-base font-medium text-[#2F2F2F] mb-1">
                Select Roles
              </label>

              {/* Trigger */}
              <div
                onClick={() => setShowRoleDropdown((prev) => !prev)}
                className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F] cursor-pointer flex justify-between items-center bg-white"
              >
                <span className="truncate">
                  {targetRoles.length > 0
                    ? targetRoles.map(formatRole).join(", ")
                    : "Select Roles"}
                </span>

                {/* Caret Down */}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${showRoleDropdown ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showRoleDropdown && (
                <div className="absolute bottom-[110%] left-0 w-full bg-white border border-[#E4E4E4] rounded-md shadow-lg z-[999] max-h-[110px] overflow-y-auto p-3">

                  {/* 🔥 Select All / Clear */}
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-[#43C17A] font-medium hover:underline cursor-pointer"
                    >
                      Select All
                    </button>

                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-500 font-medium hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-2" />

                  {availableRoles.length === 0 && (
                    <p className="text-sm text-gray-400">No roles available</p>
                  )}

                  {availableRoles.map((r: string) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer text-sm mb-2 text-[#2F2F2F] hover:bg-gray-50 px-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={targetRoles.includes(r)}
                        onChange={() => handleRoleToggle(r)}
                        className="accent-[#43C17A] cursor-pointer"
                      />
                      {formatRole(r)}
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">

          <button
            onClick={onClose}
            className="flex-1 border border-[#CBD5E1] rounded-md py-2 text-[14px] text-[#4B5563] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-2 rounded-md text-[14px] text-white ${saving
              ? "bg-[#A7DDBE] cursor-not-allowed"
              : "bg-[#43C17A] hover:bg-[#3AAA6B] cursor-pointer"
              }`}
          >
            {saving ? "Saving..." : "Save Announcement"}
          </button>

        </div>

      </div>
    </div>
  );
}