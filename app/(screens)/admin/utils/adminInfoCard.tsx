"use client";

import { useEffect, useState } from "react";

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
  const [today, setToday] = useState("");

  useEffect(() => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    setToday(`${day}/${month}/${year}`);
  }, []);

  return (
    <div className="w-full relative bg-[#DAEEE3] rounded-2xl h-[170px] shadow-sm">
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

            <p className="text-sm text-[#454545] mb-3">
              {!item.show && "You are managing "}
              <span>
                {item.activeFacultyTasks} active faculty tasks and
              </span>{" "}
              {!item.show && `${item.pendingApprovals} pending approvals`}
            </p>
            <div className="bg-[#A3FFCB] text-[#007533] mb-3 px-2 py-1 rounded-lg w-25 font-semibold text-sm">
              {today ? today : "Loading..."}
            </div>
          </div>

          <div className="w-[35%] h-full"></div>
        </div>
      ))}

      {cardProps.map((item, index) => (
        <div
          className="w-[40%] bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center"
          key={index}
        >
          {/* <img
            src={item.image}
            alt="Admin"
            //  style={{ height: `${item.imageHeight ?? 110}px` }}
            className={`lg:relative left-95 ${item.top} z-10 h-[175px]`}
          /> */}
          {item.image && (
            <img
              src={item.image}
              alt="Admin"
              className={`lg:relative left-95 ${item.top} z-10 h-[175px]`}
            />
          )}

        </div>
      ))}
    </div>
  );
}
