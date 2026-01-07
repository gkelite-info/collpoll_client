"use client";
import React, { useState } from "react";
import { CaretLeft, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyDetail from "./facultyDetail";
import { useFacultyByDepartment } from "../../hooks/useFacultyByDepartment";
import { useStudentsByDepartment } from "../../hooks/useStudentsByDepartment";
// import { useFacultyByDepartment } from "../../hooks/useFacultyByDepartment";
// import { useStudentsByDepartment } from "../../hooks/useStudentsByDepartment";

interface FacultyViewProps {
  departmentId: number;
  departmentName: string;
  onBack: () => void;
}

const FacultyView: React.FC<FacultyViewProps> = ({
  departmentId,
  departmentName,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"Faculty" | "Students">("Faculty");

  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);

  // const { faculty, students, stats, loading } =
  //   useFacultyCardView(departmentId);
  const { faculty } = useFacultyByDepartment(departmentId);
  const { students } = useStudentsByDepartment(departmentId);

  const facultyList = faculty.map((f: any) => ({
    name: f.users.fullName,
    subject: f.subject ?? "—",
    role: f.designation,
    contact: f.users.email,

    email: f.users.email,
    avatar:
      f.users.avatar ??
      `https://api.dicebear.com/9.x/initials/svg?seed=${f.users.fullName}`,

    raw: f,
  }));

  const studentList = students.map((s: any) => ({
    name: s.users.fullName,

    rollNo: s.rollNumber,
    semester: s.semester,

    avatar:
      s.users.avatar ??
      `https://api.dicebear.com/9.x/initials/svg?seed=${s.users.fullName}`,
    attendance: s.attendance ?? "—",
    performance: s.performance ?? "—",
  }));

  const loading = false;
  const cardData = [
    {
      value: loading ? "…" : faculty.length.toString(),
      label: "Faculty",
      bgColor: "bg-[#E2DAFF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      value: loading ? "…" : students.length.toString(),
      label: "Students",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      value: loading ? "…" : "1",
      label: "Sections",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#3DAD6E]",
    },
  ];

  if (selectedFaculty) {
    return (
      <FacultyDetail
        faculty={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-3">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />

          {activeTab === "Faculty" ? (
            <h1 className="text-2xl font-bold text-[#282828]">
              {departmentName} Faculty
            </h1>
          ) : (
            <h1 className="text-xl font-semibold text-[#1A202C]">
              Year 2 – CSE Students
            </h1>
          )}
        </div>

        {activeTab === "Faculty" ? (
          <p className="text-[#282828] mt-1 ml-8 text-sm">
            Overview of all user roles in the system
          </p>
        ) : (
          <div className="flex gap-2 mt-3 ml-8">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#43C17A] text-white">
              Section A
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#DFDFDF] text-[#4A5568]">
              Section B
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#DFDFDF] text-[#4A5568]">
              Section C
            </span>
          </div>
        )}
      </div>

      <article className="flex gap-3 justify-center items-center mb-6">
        {cardData.map((item, index) => (
          <CardComponent key={index} {...item} />
        ))}
      </article>

      <div className="flex items-center gap-14 mb-3 border-b border-gray-100 px-2">
        {["Faculty", "Students"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-1 transition-all relative cursor-pointer ${
              activeTab === tab ? "text-[#43C17A]" : "text-[#525252]"
            }`}
          >
            <span className="w-full ml-8">{tab}</span>
            {activeTab === tab ? (
              <div className="absolute bottom-0 left-0 w-[120px] h-[1.5px]  bg-[#43C17A] rounded-full" />
            ) : (
              <div className="absolute bottom-0 left-0 w-[120px] h-[1.5px]  bg-[#525252] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1F2F4]">
              <th className="py-3 px-4 w-10 text-center flex ">
                <div className="bg-[#3EAD6F] p-2 ml-2 rounded-full inline-block">
                  <MagnifyingGlass size={14} weight="bold" color="white" />
                </div>
              </th>
              {activeTab === "Faculty" ? (
                <>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Name
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Subject
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Role
                  </th>
                  <th className="py-2.5 px-6 font-semibold text-[#4A5568] text-md text-right">
                    Contact
                  </th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Roll No.
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Student Name
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Attendance
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-[#4A5568] text-md text-center">
                    Performance
                  </th>
                  <th className="py-2.5 px-6 font-semibold text-[#4A5568] text-md text-right">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeTab === "Faculty"
              ? facultyList.map((prof, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => setSelectedFaculty(prof)}
                        className="w-8 h-8 cursor-pointer rounded-full bg-gray-100 inline-flex items-center justify-center overflow-hidden border border-gray-100 hover:ring-2 hover:ring-[#3EAD6F] transition"
                      >
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-[#2D3748] text-[14px]">
                      {prof.name}
                    </td>
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px]">
                      {prof.subject}
                    </td>
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px]">
                      {prof.role}
                    </td>
                    <td className="py-2 px-6 text-right text-[#4A5568] text-[13px]">
                      {prof.email}
                    </td>
                  </tr>
                ))
              : studentList.map((stud, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 inline-block overflow-hidden border border-gray-100">
                        <img
                          src={stud.avatar}
                          alt={stud.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px]">
                      {stud.rollNo}
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-[#2D3748] text-[14px]">
                      {stud.name}
                    </td>
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px]">
                      {stud.attendance}
                    </td>
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px]">
                      {stud.performance}
                    </td>
                    <td className="py-2 px-6 text-right font-bold text-[#2D3748] text-[13px] underline underline-offset-4 cursor-pointer hover:text-black">
                      View
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyView;
