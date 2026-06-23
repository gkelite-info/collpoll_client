"use client";

import Image from "next/image";
import { useUser } from "./context/UserContext";
import { useStudent } from "./context/student/useStudent";
import { useTranslations } from "next-intl";

export default function UserInfoCard() {
  const {
    fullName,
    gender,
    collegeEducationType,
    collegeBranchCode,
    identifierId,
  } = useUser();
  const { collegeAcademicYear } = useStudent();
  console.log("What is year", collegeAcademicYear);

  const t = useTranslations("Dashboard.student");

  const bgBanner = "/dashboard-banner-bg.png";

  const currentDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());


  return (
    <>
      <div
        className="w-full relative rounded-2xl h-[170px] shadow-sm max-md:h-[170px]"
        style={{
          backgroundImage: `url(${bgBanner})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col justify-start p-3 gap-5 bg-yellow-00 rounded-l-lg h-[100%] max-md:p-4 max-md:gap-3">
          <div className="flex flex-col gap-3 max-w-[65%] my-auto lg:pl-5 max-md:max-w-[65%] max-md:gap-1.5">
            <div className="flex items-center gap-3 max-md:flex-wrap max-md:gap-1">
              <p className="text-[#714EF2] text-sm font-medium max-md:text-[11px] max-md:font-bold">
                {collegeEducationType && collegeBranchCode
                  ? `${collegeEducationType} ${collegeBranchCode}`
                  : "—"}{" "}
                - {collegeAcademicYear ? `${collegeAcademicYear}` : "—"}
              </p>
              <p className="text-[#089144] text-sm font-medium max-md:text-[11px] max-md:font-bold max-md:italic">
                {t("Student Id - ")}{" "}
                <span className="text-[#282828] text-sm max-md:text-[11px] max-md:font-bold">
                  {identifierId}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-md text-[#282828] max-md:text-[15px] max-md:leading-snug">
                {t("Welcome Back, ")}{" "}
                <span className="text-[#089144] text-md font-medium max-md:text-[15px] max-md:font-bold md:inline">
                  {fullName}
                </span>
              </p>
            </div>

            <div className="flex flex-col max-md:mt-1">
              <p className="text-sm text-[#454545] max-md:text-[10px]">
                {t("You’ve completed ")}{" "}
                <span className="text-[#089144] font-semibold">0</span>{" "}
                {t(" of your tasks")}
              </p>
              <p className="text-sm text-[#454545] max-md:text-[10px] max-md:-mt-0.5">
                {t("Keep up the great progress!")}
              </p>
            </div>

            <div className="hidden max-md:inline-flex mt-1 bg-[#BFEFCD] px-2 py-0.5 rounded text-[#089144] text-[10px] font-semibold w-max">
              {currentDate}
            </div>
          </div>

          {gender && (
            <div className="absolute md:-right-3 lg:right-10 bottom-0 h-[105%] w-[180px] max-md:w-[150px] max-md:-right-0 max-md:h-[95%]">
              <Image
                src={
                  gender === "Female"
                    ? "/female-student.png"
                    : "/male-student.png"
                }
                alt="Avatar"
                fill
                className="object-contain object-bottom pointer-events-none"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
