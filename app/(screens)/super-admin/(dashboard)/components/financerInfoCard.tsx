"use client";

import { useUser } from "@/app/utils/context/UserContext";
import Image from "next/image";
import { useEffect } from "react";

export type UserInfoCardProps = {
  show?: boolean;
  // user: string;
  todayCollection: number;
  image?: string;
  top: string;
  imageHeight?: number;
  imageAlign?: "center" | "bottom";
};

type UserInfoProps = {
  cardProps: UserInfoCardProps[];
};

export function UserInfoCard({ cardProps }: UserInfoProps) {

  const { fullName, gender } = useUser();

  const avatarImage = gender === "Male" ? '/sa-m.png' : '/sa-f.png'
  const bgBanner = '/dashboard-banner-bg.png'

  useEffect(() => { }, [gender])

  return (
    <div
      style={{ backgroundImage: `url(${bgBanner})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}
      className="w-full relative rounded-2xl h-[170px] shadow-sm"
    >
      {cardProps.map((item, index) => (
        <div
          className="relative z-10 flex h-full items-center px-8"
          key={index}
        >
          <div className="bg-blue-00 flex flex-col max-w-[65%] gap-2">
            <p className="text-lg text-[#282828] leading-tight mt-3">
              Welcome Back, {""}
              <span className="text-lg font-semibold text-[#089144] leading-tight">
                {fullName || "User"}
              </span>
            </p>

            <p className="text-md text-[#454545] mt-0">
              Here’s a summary of fee collections & student payments
            </p>

            <p className="text-md text-[#454545] mt-0 font-medium">
              Today’s Collections,
              <span className="text-[#089144] font-bold">
                {item.todayCollection
                  ? ` ₹${item.todayCollection.toLocaleString("en-IN")}`
                  : ""}
              </span>
              {!item.show && " collected so far."}
            </p>
          </div>
          {gender &&
            <div className={`absolute md:-right-3 lg:right-10 bottom-0 ${gender === "Male" ? "h-[105%]" : "h-[107%]"}  w-[180px]`}>
              <Image
                src={avatarImage}
                alt="Avatar"
                fill
                className="object-contain object-bottom bg-red-00 pointer-events-none"
                priority
              />
            </div>
          }
        </div>
      ))}
    </div>
  );
}
