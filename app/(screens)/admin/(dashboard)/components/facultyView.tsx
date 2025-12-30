"use client";
import React, { useState } from "react";
import { CaretLeft, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";

interface FacultyViewProps {
  department: string;
  onBack: () => void;
}

const FacultyView: React.FC<FacultyViewProps> = ({ department, onBack }) => {
  const [activeTab, setActiveTab] = useState<"Faculty" | "Students">("Faculty");

  const facultyList = [
    {
      name: "Mr. Arun Kumar",
      subject: "Data Structures",
      role: "Professor",
      contact: "arun@college.edu",
    },
    {
      name: "Ms. Sneha Rao",
      subject: "DBMS",
      role: "Asst. Professor",
      contact: "sneha@college.edu",
    },
    {
      name: "Mr. Rajesh",
      subject: "OS",
      role: "Lecturer",
      contact: "rajesh@college.edu",
    },
    {
      name: "Ms. Kavya Sharma",
      subject: "Computer Networks",
      role: "Professor",
      contact: "kavya@college.edu",
    },
    {
      name: "Mr. Rohit Mehta",
      subject: "Design & Analysis",
      role: "Asst. Professor",
      contact: "rohit@college.edu",
    },
    {
      name: "Ms. Divya Nair",
      subject: "SE",
      role: "Lecturer",
      contact: "divya@college.edu",
    },
    {
      name: "Mr. Nitin Varma",
      subject: "Artificial Intelligence",
      role: "Professor",
      contact: "nitin@college.edu",
    },
  ];

  const studentList = [
    {
      rollNo: "21CSE001",
      name: "Rohan Patel",
      attendance: "92%",
      performance: "Excellent",
    },
    {
      rollNo: "21CSE002",
      name: "Aarav Mehta",
      attendance: "67%",
      performance: "Good",
    },
    {
      rollNo: "21CSE003",
      name: "Karthik Reddy",
      attendance: "55%",
      performance: "Average",
    },
    {
      rollNo: "21CSE004",
      name: "Sneha Reddy",
      attendance: "76%",
      performance: "Excellent",
    },
    {
      rollNo: "21CSE005",
      name: "Ananya Sharma",
      attendance: "87%",
      performance: "Good",
    },
    {
      rollNo: "21CSE006",
      name: "Neha Sinha",
      attendance: "45%",
      performance: "Average",
    },
    {
      rollNo: "21CSE007",
      name: "Arjun Rao",
      attendance: "50%",
      performance: "Excellent",
    },
  ];

  const cardData: CardProps[] = [
    {
      value: "80",
      label: "Faculty",
      bgColor: "bg-[#E2DAFF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      value: "220",
      label: "Students",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      value: "10",
      label: "Sections",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#3DAD6E]",
    },
  ];

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
            <h1 className="text-2xl font-bold text-[#282828]">CSE Faculty</h1>
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

      <div className="flex items-center gap-6 mb-3 border-b border-gray-100 px-2">
        {["Faculty", "Students"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 text-xs font-bold transition-all relative ${
              activeTab === tab ? "text-[#3EAD6F]" : "text-gray-400"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#3EAD6F] rounded-t-full" />
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
                      <div className="w-8 h-8 rounded-full bg-gray-100 inline-block overflow-hidden border border-gray-100">
                        <UserCircle
                          size={34}
                          weight="fill"
                          className="text-gray-300 -ml-[3px] -mt-[3px]"
                        />
                      </div>
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
                      {prof.contact}
                    </td>
                  </tr>
                ))
              : studentList.map((stud, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 inline-block overflow-hidden border border-gray-100">
                        <UserCircle
                          size={34}
                          weight="fill"
                          className="text-gray-300 -ml-[3px] -mt-[3px]"
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
