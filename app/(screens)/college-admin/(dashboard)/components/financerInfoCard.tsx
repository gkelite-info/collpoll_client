"use client";

import { useUser } from "@/app/utils/context/UserContext";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const bgBanner = '/dashboard-banner-bg.png'
  const avatarImage = gender === "Male" ? '/male-ca.png' : '/female-ca.png'
  return (
    <div className="w-full relative rounded-2xl h-[170px] shadow-sm"
      style={{ backgroundImage: `url(${bgBanner})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", }}
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
                  : " ₹0"}
              </span>
              {!item.show && " collected so far."}
            </p>
          </div>

          {/* {item.image && (
            <img
              src={item.image}
              alt="User"
              //   style={{ height: `${item.imageHeight ?? 150}px` }}
              className="absolute right-28 h-47.5 bottom-0 z-10"
            />
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

      {/* <div className="absolute top-4 right-4 z-20">
        <div className="bg-gradient-to-b from-[#C1FFDC] to-[#028039] text-white px-2 py-1 rounded-lg font-semibold text-sm tracking-wide">
          {today ? today : "Loading..."}
        </div>
      </div> */}

      <svg
        className="absolute right-0 bottom-0 z-0 h-full w-auto"
        width="186"
        height="170"
        viewBox="0 0 186 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M173.532 0C180.146 0 185.512 5.35094 185.532 11.9644L185.955 154.896C185.98 163.197 179.257 169.94 170.955 169.94H51.5453C46.2115 169.775 40.1483 169.848 34.1023 169.92C7.43518 170.24 -18.9265 170.556 18.8128 150.447C28.6823 144.861 52.2795 137.844 67.7118 154.469C74.142 158.938 101.032 145.673 130.82 112.96C139.793 102.681 157.737 73.8116 157.737 40.5622C156.99 31.1773 155.943 10.7256 157.737 0H171.9H173.532Z"
          fill="#BCE6D0"
        />
      </svg>
    </div>
  );
}
