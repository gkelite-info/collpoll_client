"use client";

import { useUser } from "@/app/utils/context/UserContext";
import Image from "next/image";

export type HrInfoCardProps = {
  show?: boolean;
  user: string;
  studentsTaskPercentage?: number;
  facultySubject?: string;
  image?: string;
  top?: string;
  imageHeight?: string;
  right?: string;
};

interface UserInfoProps {
  cardProps: HrInfoCardProps[];
}

export function HrInfoCard({ cardProps }: UserInfoProps) {
  const {gender, fullName} = useUser()
  const bgBanner = '/dashboard-banner-bg.png'
  const avatarImage = gender === "Male" ? '/male-hr.png' : '/female-hr.png'
  return (
    <div
      className="w-full relative rounded-2xl h-[170px] shadow-sm"
      style={{ backgroundImage: `url(${bgBanner})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", }}
    >
      {cardProps.map((item, index) => (
        <div
          key={index}
          className="w-full relative h-full rounded-2xl shadow-sm flex items-center overflow-visible"
        >
          <div className="flex flex-col z-10 pl-8 lg:pl-10 max-w-[65%] gap-1">
            <h1 className="text-[#282828] text-lg font-medium leading-tight">
              Welcome back, {" "}
              <span className="text-[#089144] font-bold">{fullName}</span>
            </h1>

            <div className="flex flex-col gap-1.5 mt-2">
              <p className="text-[#454545] text-xs font-medium leading-snug">
                94% attendance rate this week with 4 late check-ins and 2
                approved leaves.
              </p>
              <p className="text-[#454545] text-xs font-medium leading-snug">
                View insights, send reminders, and manage your faculty with
                ease.
              </p>
            </div>
          </div>

          {/* {item.image && (
            <div
              className={`absolute bottom-0 z-20 ${item.right || "right-6"} h-[115%] flex items-end`}
            >
              <img
                src={item.image}
                alt={`${item.user} Avatar`}
                className={`${item.imageHeight || "h-full"} ${item.top || ""} object-contain object-bottom`}
              />
            </div>
          )} */}

          {gender &&
            <div className="absolute md:-right-3 lg:right-10 bottom-0 h-[105%] w-[180px]">
              <Image
                src={avatarImage}
                alt="Avatar"
                fill
                className="object-contain object-bottom pointer-events-none"
                priority
              />
            </div>
          }
        </div>
      ))}
    </div>
  );
}
