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
};


export default function AddAnnouncementModal({
  open,
  onClose,
  refreshAnnouncements,
  editData,
}: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [targetRole, setTargetRole] = useState<string>("");
  const [customType, setCustomType] = useState("");
  const [type, setType] = useState<string>("notice");
  const { userId, collegeId, role } = useUser();

  const roles = ["CollegeAdmin", "Admin", "Student", "Parent"];
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
      setTargetRole(editData.targetRole || "");
    }
  }, [open, editData]);

  console.log("User Context:", { userId, collegeId, role });

  const handleSave = async () => {

    const titleRegex = /^[A-Za-z\s]+$/;
    const today = new Date().toISOString().split("T")[0];

    if (!title || !date || !targetRole || !type) {
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

      /* ==============================
         UPDATE ANNOUNCEMENT
      ============================== */

      if (editData) {

        const updateRes = await updateCollegeAnnouncement(
          editData.collegeAnnouncementId,
          {
            announcementTitle: title,
            date,
            type
          }
        );

        if (!updateRes.success) {
          toast.error("Failed to update announcement");
          return;
        }

        // 🔥 UPDATE EXISTING ROLE (NO NEW ROW)
        const existingRoles = await fetchAnnouncementRoles(
          editData.collegeAnnouncementId
        );

        if (existingRoles.length > 0) {
          await supabase
            .from("college_announcements_roles")
            .update({
              role: targetRole,
              updatedAt: new Date().toISOString(),
              deletedAt: null // safety
            })
            .eq(
              "collegeAnnouncementRolesId",
              existingRoles[0].collegeAnnouncementRolesId
            );
        }

        toast.success("Announcement updated successfully");

        resetForm();
        await refreshAnnouncements?.();
        return;
      }

      // if (editData) {

      //   const updateRes = await updateCollegeAnnouncement(
      //     editData.collegeAnnouncementId,
      //     {
      //       announcementTitle: title,
      //       date,
      //        type
      //     }
      //   );

      //   if (!updateRes.success) {
      //     toast.error("Failed to update announcement");
      //     return;
      //   }

      //   toast.success("Announcement updated successfully");

      //   resetForm();
      //   await refreshAnnouncements?.();
      //   return;
      // }

      /* ==============================
         CREATE ANNOUNCEMENT
      ============================== */

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

      const roleRes = await saveAnnouncementRole({
        collegeAnnouncementId: announcementId,
        role: targetRole
      });

      if (!roleRes.success) {
        toast.error("Failed to assign announcement role");
        return;
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
      setTargetRole("");
      setCustomType("");
    }
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setTargetRole("");
    setType("");
    setCustomType("");
    onClose();
  };

  if (!open) return null;


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
            className="text-[#6B7280] hover:text-black"
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
                <option value="other">Others</option>
              </select>

              {/* Show custom input when Other selected */}
              {type === "other" && (
                <input
                  type="text"
                  placeholder="Enter custom type"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="mt-2 border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F]"
                />
              )}

              {/* Icon Preview (only for predefined types) */}
              {type && type !== "other" && typeIcons[type] && (
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

            {/* Select Roles */}
            <div className="flex flex-col w-1/2">
              <label className="text-base font-medium text-[#2F2F2F] mb-1">
                Select Roles
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="border border-[#E4E4E4] rounded-md px-3 py-2 text-[14px] text-[#2F2F2F] "
              >
                <option value="">Select Role</option>
                <option value="CollegeAdmin">College Admin</option>
                <option value="Admin">Admin</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
              </select>
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