"use client";

import { PlusCircle } from "@phosphor-icons/react";

interface Props {
  title: string;
  type: string;
  description: string;
  duration: string;
  tech: string;
  mentor: string;
  marks: string;
  status: string;
}

export default function ProjectCard({
  title,
  type,
  description,
  duration,
  tech,
  mentor,
  marks,
  status,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#282828]">{title}</h3>
        <span className="bg-[#E7F9F0] text-[#22C55E] px-3 py-0.5 rounded-full text-xs font-medium">
          {status}
        </span>
      </div>

      {/* Type */}
      <span className="bg-[#EEE9FF] text-[#7051E1] w-fit px-3 py-0.5 rounded-full text-xs">
        {type}
      </span>

      {/* Description */}
      <p className="text-sm text-[#525252]">{description}</p>

      {/* Details */}
      <div className="text-sm space-y-1">
        <Detail label="Duration" value={duration} />
        <Detail label="Tech Stack" value={tech} />
        <Detail label="Mentor" value={mentor} />
        <Detail label="Marks" value={marks} />
      </div>

      {/* Team */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/40?img=${i}`}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
          ))}
          <span className="text-xs bg-[#EAF6EF] text-[#22C55E] px-2 py-0.5 rounded-full ml-2">
            See all
          </span>
        </div>

        <PlusCircle
          size={28}
          className="text-[#7051E1] cursor-pointer"
          weight="fill"
        />
      </div>
    </div>
  );
}

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <p>
    <span className="font-medium text-[#282828]">{label} :</span>{" "}
    <span className="text-[#525252]">{value}</span>
  </p>
);
