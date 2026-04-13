"use client";

import { useState } from "react";

interface ProfileData {
  name: string;
  course: string;
  year: string;
  rollNo: string;
  email: string;
  mobile: string;
  imageUrl?: string | null;
}

// Helper to extract initials (e.g., "Ashish Kumar" -> "AK")
const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const ProfileDetails = ({ data }: { data: ProfileData }) => {
  const [imgError, setImgError] = useState(false);

  const hasImage =
    Boolean(data.imageUrl && data.imageUrl.trim() !== "") && !imgError;
  const initials = getInitials(data.name);

  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-center gap-6 h-full">
      <div className="flex flex-col items-center justify-center gap-2 min-w-[110px]">
        {/* Dynamic Image or Initials Fallback */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-emerald-100 shrink-0">
          {hasImage ? (
            <img
              src={data.imageUrl as string}
              alt={data.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)} // Triggers fallback if image fails to load
            />
          ) : (
            <span className="text-emerald-700 font-bold text-2xl tracking-wide">
              {initials}
            </span>
          )}
        </div>

        <h2 className="text-[#282828] font-bold text-[15px] text-center leading-tight">
          {data.name}
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] items-center">
        <span className="text-gray-600 font-semibold">Course :</span>
        <span className="text-gray-600">{data.course}</span>

        <span className="text-gray-600 font-semibold">Year :</span>
        <span className="text-gray-600">{data.year}</span>

        <span className="text-gray-600 font-semibold">Roll No :</span>
        <span className="text-gray-600">{data.rollNo}</span>

        <span className="text-gray-600 font-semibold">Email :</span>
        <span className="text-gray-500 break-all">{data.email}</span>

        <span className="text-gray-600 font-semibold">Mobile :</span>
        <span className="text-gray-600">{data.mobile}</span>
      </div>
    </div>
  );
};

export default ProfileDetails;
