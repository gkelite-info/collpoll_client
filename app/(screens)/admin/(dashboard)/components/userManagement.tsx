"use client";
import React, { useState } from "react";
import { CaretLeft, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyDetail from "./facultyDetail";

interface FacultyViewProps {
  department: string;
  onBack: () => void;
}

const UserManagement: React.FC<FacultyViewProps> = ({ department, onBack }) => {
  const [activeTab, setActiveTab] = useState<"Faculty" | "Students">("Faculty");

  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);

  const facultyList = [
    {
      name: "Arun Kumar",
      subject: "Data Structures",
      role: "Professor",
      id: "21CSE006",
      department: "CSE",
      phone: "+91 9012345678",
      email: "arunkumar@gmail.com",
      address: "245 Delo Street",
      experience: "8 Years",
      qualification: "M.Tech, PhD",
      avatar:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    },
    {
      name: "Sneha Rao",
      subject: "DBMS",
      role: "Asst. Professor",
      id: "21CSE007",
      department: "CSE",
      phone: "+91 9012345679",
      email: "sneha@college.edu",
      address: "246 Delo Street",
      experience: "5 Years",
      qualification: "M.Tech",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
    {
      name: "Rajesh",
      subject: "OS",
      role: "Lecturer",
      id: "21CSE008",
      department: "IT",
      phone: "+91 9012345680",
      email: "rajesh@college.edu",
      address: "247 Delo Street",
      experience: "3 Years",
      qualification: "B.Tech",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    },
    {
      name: "Kavya Sharma",
      subject: "Computer Networks",
      role: "Professor",
      id: "21CSE009",
      department: "CSE",
      phone: "+91 9012345681",
      email: "kavya@college.edu",
      address: "248 Delo Street",
      experience: "10 Years",
      qualification: "M.Tech, PhD",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
    },
    {
      name: "Rohit Mehta",
      subject: "Design & Analysis",
      role: "Asst. Professor",
      id: "21CSE010",
      department: "CSE",
      phone: "+91 9012345682",
      email: "rohit@college.edu",
      address: "249 Delo Street",
      experience: "6 Years",
      qualification: "M.Tech",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
    {
      name: "Divya Nair",
      subject: "SE",
      role: "Lecturer",
      id: "21CSE011",
      department: "IT",
      phone: "+91 9012345683",
      email: "divya@college.edu",
      address: "250 Delo Street",
      experience: "2 Years",
      qualification: "B.Tech",
      avatar:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=686&q=80",
    },
    {
      name: "Nitin Varma",
      subject: "Artificial Intelligence",
      role: "Professor",
      id: "21CSE012",
      department: "AI/ML",
      phone: "+91 9012345684",
      email: "nitin@college.edu",
      address: "251 Delo Street",
      experience: "12 Years",
      qualification: "PhD",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
  ];

  const studentList = [
    {
      rollNo: "21CSE001",
      name: "Rohan Patel",
      attendance: "92%",
      performance: "Excellent",
      avatar: "https://i.pravatar.cc/150?u=rohan",
    },
    {
      rollNo: "21CSE002",
      name: "Aarav Mehta",
      attendance: "67%",
      performance: "Good",
      avatar: "https://i.pravatar.cc/150?u=aarav",
    },
    {
      rollNo: "21CSE003",
      name: "Karthik Reddy",
      attendance: "55%",
      performance: "Average",
      avatar: "https://i.pravatar.cc/150?u=karthik",
    },
    {
      rollNo: "21CSE004",
      name: "Sneha Reddy",
      attendance: "76%",
      performance: "Excellent",
      avatar: "https://i.pravatar.cc/150?u=snehas",
    },
    {
      rollNo: "21CSE005",
      name: "Ananya Sharma",
      attendance: "87%",
      performance: "Good",
      avatar: "https://i.pravatar.cc/150?u=ananya",
    },
    {
      rollNo: "21CSE006",
      name: "Neha Sinha",
      attendance: "45%",
      performance: "Average",
      avatar: "https://i.pravatar.cc/150?u=neha",
    },
    {
      rollNo: "21CSE007",
      name: "Arjun Rao",
      attendance: "50%",
      performance: "Excellent",
      avatar: "https://i.pravatar.cc/150?u=arjun",
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
              {department} Faculty
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

export default UserManagement;
