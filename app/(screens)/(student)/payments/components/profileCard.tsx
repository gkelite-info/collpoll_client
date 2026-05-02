"use client";

import { useTranslations } from "next-intl";

type ProfileCardProps = {
  name: string;
  course: string;
  year: string;
  rollNo: string;
  email: string;
  mobile: string;
  image: string;
};

export default function ProfileCard({
  name,
  course,
  year,
  rollNo,
  email,
  mobile,
  image,
}: ProfileCardProps) {
  const t = useTranslations("Payments.student");

  return (
    <div className="flex rounded-xl bg-white p-6 shadow-sm mb-8 items-center gap-6">
      <img
        src={image}
        alt={name}
        className="h-28 w-28 rounded-full object-cover"
      />

      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-[#1F2937]">{name}</h2>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">{t("Course:")}</span>{" "}
          <span className="text-[#4B5563]">{course}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">{t("Year:")}</span>{" "}
          <span className="text-[#4B5563]">{year}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">{t("Roll No:")}</span>{" "}
          <span className="text-[#4B5563]">{rollNo}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">{t("Email:")}</span>{" "}
          <span className="text-[#4B5563]">{email}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">{t("Mobile:")}</span>{" "}
          <span className="text-[#4B5563]">{mobile}</span>
        </p>
      </div>
    </div>
  );
}
