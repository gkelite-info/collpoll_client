"use client";
import React, { useEffect, useState, Fragment } from "react";
import {
  CaretLeft,
  CaretDown,
  MagnifyingGlass,
  UserCircle,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import CardComponent from "./totalUsersCard";
import FacultyDetail from "./facultyDetail";
import { useFacultyByDepartment } from "../../hooks/useFacultyByDepartment";
import { useStudentsByDepartment } from "../../hooks/useStudentsByDepartment";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { supabase } from "@/lib/supabaseClient";

interface FacultyViewProps {
  departmentId: number;
  departmentName: string;
  collegeId: number;
  collegeEducationId: number;
  onBack: () => void;
}

const FilterDropdownChip = ({
  label,
  selectedValue,
  valueText,
  options,
  onChange,
  loading,
}: any) => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#525252]">
      <span className="text-sm">{label}</span>
      <Listbox value={selectedValue} onChange={onChange} disabled={loading}>
        <div className="relative">
          <Listbox.Button
            className={`relative flex items-center justify-between gap-2.5 pl-4 pr-3 py-1 text-white bg-[#3EAD6F] rounded-full transition-all  ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "cursor-pointer hover:bg-emerald-600"
            }`}
          >
            <span className="block truncate font-medium">
              {loading ? "Loading..." : valueText}
            </span>
            <span className="flex items-center pointer-events-none">
              <CaretDown
                size={14}
                weight="bold"
                color="white"
                className="mt-0.5"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute left-0 z-10 w-full min-w-[140px] mt-2 overflow-auto text-sm bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option: any) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none px-4 py-2.5 ${active ? "bg-gray-100 text-black" : "text-[#525252]"}`
                  }
                  value={option.id}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                    >
                      {option.label}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

const FacultyView: React.FC<FacultyViewProps> = ({
  departmentId,
  departmentName,
  collegeId,
  collegeEducationId,
  onBack,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "Faculty";

  const yearIdParam = searchParams.get("yearId");
  const activeYearId = yearIdParam ? parseInt(yearIdParam) : null;
  const sectionIdParam = searchParams.get("sectionId");
  const activeSectionId = sectionIdParam ? parseInt(sectionIdParam) : null;

  const [availableYears, setAvailableYears] = useState<any[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);

  useEffect(() => {
    async function fetchYears() {
      const { data, error } = await supabase
        .from("college_academic_year")
        .select("collegeAcademicYearId, collegeAcademicYear")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", departmentId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeAcademicYearId", { ascending: true });

      if (!error && data) {
        const yearOptions = data.map((yr) => ({
          id: yr.collegeAcademicYearId,
          label: yr.collegeAcademicYear,
        }));
        setAvailableYears(yearOptions);

        if (data.length > 0 && !activeYearId) {
          handleYearChange(data[0].collegeAcademicYearId);
        }
      }
      setYearsLoading(false);
    }
    fetchYears();
  }, [departmentId, collegeId, collegeEducationId]);

  useEffect(() => {
    if (!activeYearId || !collegeId || !collegeEducationId) {
      setAvailableSections([]);
      return;
    }

    async function fetchSections() {
      setSectionsLoading(true);
      const { data, error } = await supabase
        .from("college_sections")
        .select("collegeSectionsId, collegeSections")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", departmentId)
        .eq("collegeAcademicYearId", activeYearId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeSectionsId", { ascending: true });

      if (!error && data) {
        const sectionOptions = data.map((sec) => ({
          id: sec.collegeSectionsId,
          label: sec.collegeSections,
        }));
        setAvailableSections(sectionOptions);

        if (data.length > 0 && !activeSectionId) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sectionId", data[0].collegeSectionsId.toString());
          router.replace(`?${params.toString()}`);
        } else if (data.length === 0 && activeSectionId) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("sectionId");
          router.replace(`?${params.toString()}`);
        }
      } else {
        setAvailableSections([]);
      }
      setSectionsLoading(false);
    }
    fetchSections();
  }, [departmentId, collegeId, collegeEducationId, activeYearId]);

  const { faculty, loading: facLoading } = useFacultyByDepartment(
    departmentId,
    null,
    true,
    null,
    collegeId,
    collegeEducationId,
  );

  const { students, loading: stuLoading } = useStudentsByDepartment(
    departmentId,
    activeYearId,
    true,
    activeSectionId,
    collegeId,
    collegeEducationId,
  );

  const loading = activeTab === "Faculty" ? facLoading : stuLoading;

  const currentYearOption = availableYears.find((yr) => yr.id === activeYearId);
  const currentSectionOption = availableSections.find(
    (sec) => sec.id === activeSectionId,
  );

  const dynamicHeader =
    activeTab === "Faculty"
      ? `${departmentName} Faculty`
      : `${currentYearOption ? currentYearOption.label : "Academic Year"} – ${departmentName} Students`;

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  const handleYearChange = (yrId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("yearId", yrId.toString());
    params.delete("sectionId");
    router.replace(`?${params.toString()}`);
  };

  const handleSectionChange = (secId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sectionId", secId.toString());
    router.push(`?${params.toString()}`);
  };

  const facultyList = faculty.map((f: any) => ({
    name: f.users.fullName,
    subject: f.subject,
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
    attendance: s.attendance,
    performance: s.performance,
  }));

  const cardData = [
    {
      value: facLoading ? "…" : faculty.length.toString(),
      label: "Faculty",
      bgColor: "bg-[#E2DAFF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      value: stuLoading ? "…" : students.length.toString(),
      label: "Students",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      value: sectionsLoading ? "…" : availableSections.length.toString(),
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
    <div className="flex flex-col w-full min-h-screen">
      <div className="mb-3">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-bold text-[#282828]">{dynamicHeader}</h1>
        </div>

        {activeTab === "Faculty" ? (
          <p className="text-[#282828] mt-1 ml-8 text-sm">
            Overview of all faculty in this Branch
          </p>
        ) : (
          <div className="flex items-center gap-8 mt-5 ml-8">
            <FilterDropdownChip
              label="Year :"
              selectedValue={activeYearId}
              valueText={
                currentYearOption ? currentYearOption.label : "Select Year"
              }
              options={availableYears}
              onChange={handleYearChange}
              loading={yearsLoading}
            />

            {activeYearId && (
              <FilterDropdownChip
                label="Sec :"
                selectedValue={activeSectionId}
                valueText={
                  currentSectionOption
                    ? currentSectionOption.label
                    : "Select Sec"
                }
                options={availableSections}
                onChange={handleSectionChange}
                loading={sectionsLoading}
              />
            )}
          </div>
        )}
      </div>

      <article className="flex gap-3 justify-center items-center mt-2 mb-6">
        {cardData.map((item, index) => (
          <CardComponent key={index} {...item} />
        ))}
      </article>

      <div className="flex items-center gap-14 mb-3 border-b border-gray-100 px-2 relative z-0">
        {["Faculty", "Students"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px] z-0">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex justify-center pt-20">
            <Loader />
          </div>
        )}
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
            {!loading && activeTab === "Faculty" ? (
              facultyList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No faculty found in this department.
                  </td>
                </tr>
              ) : (
                facultyList.map((prof, idx) => (
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
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px] max-w-[150px] truncate">
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
              )
            ) : (
              !loading &&
              (studentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No students found in this section & year scope.
                  </td>
                </tr>
              ) : (
                studentList.map((stud, idx) => (
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
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px] font-semibold text-[#43C17A]">
                      {stud.attendance}
                    </td>
                    <td className="py-2 px-2 text-center text-[#4A5568] text-[13px]">
                      {stud.performance}
                    </td>
                    <td className="py-2 px-6 text-right font-bold text-[#2D3748] text-[13px] underline underline-offset-4 cursor-pointer hover:text-black">
                      View
                    </td>
                  </tr>
                ))
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyView;
