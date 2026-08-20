"use client";

import { useState } from "react";
import { FilePdf } from "@phosphor-icons/react";

interface SecureMediaProps {
  path: string;
  type: "image" | "pdf";
  isMe?: boolean;
}

export default function SecureMedia({ path, type, isMe = false }: SecureMediaProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  let secureUrl = path;
  const bucketMarker = "/storage/v1/object/public/";
  const idx = path.indexOf(bucketMarker);
  
  if (idx !== -1) {
    // Convert full URL to proxy API
    const relativePath = path.slice(idx + bucketMarker.length); // e.g., "leave_request_chats_attachments/123/..."
    secureUrl = `/api/files/${relativePath}`;
  } else if (!path.startsWith("http") && !path.startsWith("/api/")) {
    // fallback for legacy paths which only had the file path
    secureUrl = `/api/files/progress_chat_attachments/${path}`;
  }

  if (type === "image") {
    return (
      <div 
        className={`relative max-w-[240px] rounded-md overflow-hidden bg-black/5 ${
          !imageLoaded ? "min-h-[120px]" : ""
        }`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-black/10 animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-gray-500 font-medium">Loading...</span>
          </div>
        )}
        <img
          src={secureUrl}
          alt="Secure attachment"
          onLoad={() => setImageLoaded(true)}
          className={`w-full object-contain cursor-pointer hover:opacity-90 transition-opacity duration-300 ${
            imageLoaded ? "opacity-100 relative block" : "opacity-0 absolute inset-0"
          }`}
          onClick={() => window.open(secureUrl, "_blank")}
        />
      </div>
    );
  }

  // PDF / Document
  return (
    <a
      href={secureUrl}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition ${
        isMe ? "bg-black/10 hover:bg-black/20" : "bg-gray-100 hover:bg-gray-200 text-[#282828]"
      }`}
    >
      <FilePdf size={16} weight="fill" />
      <span className="text-[12px] underline font-medium">Document</span>
    </a>
  );
}
