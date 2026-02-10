"use client";

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
          <span className="font-medium">Course:</span>{" "}
          <span className="text-[#4B5563]">{course}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">Year:</span>{" "}
          <span className="text-[#4B5563]">{year}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">Roll No:</span>{" "}
          <span className="text-[#4B5563]">{rollNo}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">Email:</span>{" "}
          <span className="text-[#4B5563]">{email}</span>
        </p>

        <p className="text-sm text-[#111827]">
          <span className="font-medium">Mobile:</span>{" "}
          <span className="text-[#4B5563]">{mobile}</span>
        </p>
      </div>
    </div>
  );
}
