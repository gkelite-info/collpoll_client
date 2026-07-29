"use client";

import React from "react";

interface MeetingFieldsProps {
  selectedType: string;
  title: string;
  setTitle: (t: string) => void;
  meetingPlatform: "meet" | "zoom" | "others";
  setMeetingPlatform: (p: "meet" | "zoom" | "others") => void;
  meetingId: string;
  setMeetingId: (id: string) => void;
  meetingPassword: string;
  setMeetingPassword: (p: string) => void;
  meetingLink: string;
  setMeetingLink: (l: string) => void;
}

const MeetingFields: React.FC<MeetingFieldsProps> = ({
  selectedType,
  title, setTitle,
  meetingPlatform, setMeetingPlatform,
  meetingId, setMeetingId,
  meetingPassword, setMeetingPassword,
  meetingLink, setMeetingLink,
}) => {
  if (selectedType !== "meeting") return null;

  return (
    <>
      <div className="space-y-1">
        <label className="block text-gray-700 font-medium text-sm">
          Meeting Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Parent Meeting / Dept Review"
          className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2 mt-2 mb-2">
        <label className="block text-gray-700 font-medium text-sm">
          Meeting Platform
        </label>
        <div className="flex gap-4">
          {[
            { id: "meet", label: "Google Meet" },
            { id: "zoom", label: "Zoom Meeting" },
            { id: "others", label: "Others" },
          ].map((platform) => (
            <label key={platform.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meetingPlatform"
                value={platform.id}
                checked={meetingPlatform === platform.id}
                onChange={() => setMeetingPlatform(platform.id as any)}
                className="accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">{platform.label}</span>
            </label>
          ))}
        </div>
      </div>

      {meetingPlatform === "zoom" ? (
        <div className="flex gap-4 animate-in fade-in duration-200 mt-4">
          <div className="flex-1 space-y-1">
            <label className="block text-gray-700 font-medium text-sm">
              Zoom ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter Zoom ID"
              className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="block text-gray-700 font-medium text-sm">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={meetingPassword}
              onChange={(e) => setMeetingPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1 animate-in fade-in duration-200 mt-4">
          <label className="block text-gray-700 font-medium text-sm">
            {meetingPlatform === "meet" ? "Google Meet Link" : "Meeting Link"} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder={meetingPlatform === "meet" ? "https://meet.google.com/..." : "https://..."}
            className="w-full border border-[#C9C9C9] rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500"
          />
        </div>
      )}
    </>
  );
};

export default MeetingFields;
