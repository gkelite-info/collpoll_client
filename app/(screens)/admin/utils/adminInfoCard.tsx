"use client";

import { useUser } from "@/app/utils/context/UserContext";
import Image from "next/image";

type UserInfoCardProps = {
  show?: boolean;
  studentId?: number;
  studentBranch?: string;
  user: string;
  studentName?: string;
  adminSubject?: string;
  activeFacultyTasks?: number;
  pendingApprovals?: number;
  image?: string;
  top?: string;
  imageHeight?: number
};

type UserInfoProps = {
  cardProps: UserInfoCardProps[];
};

export function AdminInfoCard({ cardProps }: UserInfoProps) {
  const { gender } = useUser()
  const bgBanner = '/dashboard-banner-bg.png'
  const adminImage = gender && (gender === "Female" ? "/female-admin.png" : "/male-admin2.png");

  return (
    <div
      style={{ backgroundImage: `url(${bgBanner})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", }}
      className="w-full relative rounded-2xl h-[170px] shadow-sm"
    >
      {cardProps.map((item, index) => (
        <div
          className=" z-10 flex h-full items-center justify-between px-8"
          key={index}
        >
          <div className="bg-blue-00 flex flex-col max-w-[65%] mt-3">
            <div className="mb-2">
              <span className="text-lg text-[#282828] leading-tight ">
                Welcome Back,
              </span>
              <span className="text-lg font-semibold text-[#089144] leading-tight">
                {!item.show && " Mr."} {item.user}
              </span>
            </div>
            <div className="bg-red-00 flex items-baseline flex-wrap gap-2">
              <p className="text-[#454545] text-sm">{item.adminSubject}</p>
            </div>

            <p className="text-sm text-[#454545] mb-3 mt-2">
              {/* {!item.show && "You are managing "}
              <span>
                {item.activeFacultyTasks} active faculty tasks and
              </span>{" "}
              {!item.show && `${item.pendingApprovals} pending approvals`} */}
              Everything is clear at the moment.
            </p>
          </div>

          {cardProps[0].image &&
            <div className="absolute md:-right-3 lg:right-10 bottom-0 h-[105%] w-[180px]">
              <Image
                src={adminImage!}
                alt="Avatar"
                fill
                className="object-contain object-bottom pointer-events-none"
                priority
              />
            </div>
          }
        </div>
      ))}

      {/* {cardProps.map((item, index) => (
        <div
          className="w-[40%] bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center"
          key={index}
        >
         
          {item.image && (
            <img
              src={item.image}
              alt="Admin"
              className={`lg:relative left-95 ${item.top} z-10 h-[175px]`}
            />
          )}

        </div>
      ))} */}


    </div>
  );
}
