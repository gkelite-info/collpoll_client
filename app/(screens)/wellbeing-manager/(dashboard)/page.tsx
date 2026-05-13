"use client";

import Image from "next/image";
import { useUser } from "@/app/utils/context/UserContext";

export default function Page() {
  const { fullName, gender, identifierId, profilePhoto, loading } = useUser();
  const avatarImage =
    profilePhoto || (gender === "Female" ? "/female-hr.png" : "/male-hr.png");

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#E8F8EF]">
          {!loading && (
            <Image
              src={avatarImage}
              alt={fullName ?? "Wellbeing manager"}
              fill
              className="object-cover"
              sizes="64px"
            />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#282828]">
            {fullName ?? "Wellbeing Manager"}
          </h1>
          <p className="text-sm text-[#626262]">
            Gender: {gender ?? "Loading"}
          </p>
          <p className="text-sm text-[#626262]">
            Employee ID: {identifierId ?? "Loading"}
          </p>
        </div>
      </div>
    </div>
  );
}
