import React from "react";
import { motion } from "framer-motion";

export default function UserSearchShimmer() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div 
          key={item} 
          className="flex items-center gap-3 p-2 rounded-lg mb-1 animate-pulse"
        >
          {/* Avatar Shimmer */}
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
          
          {/* Text Shimmer */}
          <div className="flex flex-col min-w-0 flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
            <div className="h-2.5 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
}
