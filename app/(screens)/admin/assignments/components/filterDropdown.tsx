import { CaretDown } from "@phosphor-icons/react";

type Option = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled,
}: FilterDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[13px] text-[#525252] font-medium">
        {label}
      </label>

      <div className="relative bg-[#43C17A1C] rounded-full pl-3 pr-7 py-1 flex items-center">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent text-[13px] font-semibold text-[#43C17A] focus:outline-none cursor-pointer w-full px-2"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <CaretDown
          size={12}
          className="absolute right-2.5 text-[#43C17A] pointer-events-none"
          weight="bold"
        />
      </div>
    </div>
  );
};

export const MOCK_DEPTS = [
  { id: 1, name: "CSE", year: "2", text: "#FF4B4B", color: "#FF4B4B", bgColor: "#FFE5E5", activeText: "Active Subjects with discussion", activeCount: "08", students: 320 },
  { id: 2, name: "ECE", year: "2", text: "#FF8A00", color: "#FF8A00", bgColor: "#FFEFE5", activeText: "Active Subjects with discussion", activeCount: "06", students: 320 },
  { id: 3, name: "MECH", year: "2", text: "#FFC700", color: "#FFC700", bgColor: "#FFF9E5", activeText: "Active Subjects with discussion", activeCount: "08", students: 320 },
  { id: 4, name: "CSE", year: "2", text: "#FF4B4B", color: "#FF4B4B", bgColor: "#FFE5E5", activeText: "Active Subjects with discussion", activeCount: "08", students: 320 },
  { id: 5, name: "ECE", year: "2", text: "#FF8A00", color: "#FF8A00", bgColor: "#FFEFE5", activeText: "Active Subjects with discussion", activeCount: "06", students: 320 },
  { id: 6, name: "MECH", year: "2", text: "#FFC700", color: "#FFC700", bgColor: "#FFF9E5", activeText: "Active Subjects with discussion", activeCount: "08", students: 320 },
  { id: 7, name: "AI & DS", year: "2", text: "#43C17A", color: "#43C17A", bgColor: "#E5F6ED", activeText: "Active Subjects with Assignments", activeCount: "08", students: 320 },
  { id: 8, name: "Biotech", year: "2", text: "#00D1FF", color: "#00D1FF", bgColor: "#E5FAFF", activeText: "Active Subjects with Assignments", activeCount: "06", students: 320 },
  { id: 9, name: "MBA", year: "2", text: "#6C8DFF", color: "#6C8DFF", bgColor: "#EAEFFF", activeText: "Active Subjects with Assignments", activeCount: "08", students: 320 },
];

export const MOCK_COURSES = [
  { id: 1, subject: "DATA STRUCTURES", facultyName: "Dr. Meena Reddy", facultyId: "89273648", avatar: "https://i.pravatar.cc/150?img=5", activeQuiz: 4, pendingSubmissions: 4 },
  { id: 2, subject: "DISCRETE MATHEMATICS", facultyName: "Ananya Rao", facultyId: "89273648", avatar: "https://i.pravatar.cc/150?img=9", activeQuiz: 4, pendingSubmissions: 4 },
  { id: 3, subject: "OOPS USING JAVA", facultyName: "Nikhil Verma", facultyId: "89273648", avatar: "https://i.pravatar.cc/150?img=11", activeQuiz: 4, pendingSubmissions: 4 },
  { id: 4, subject: "COMPUTER NETWORKS", facultyName: "Neha Singh", facultyId: "89273648", avatar: "https://i.pravatar.cc/150?img=20", activeQuiz: 4, pendingSubmissions: 4 },
  { id: 5, subject: "DBMS", facultyName: "Rahul Anand", facultyId: "89273648", avatar: "https://i.pravatar.cc/150?img=33", activeQuiz: 4, pendingSubmissions: 4 },
  { id: 6, subject: "OPERATING SYSTEMS", facultyName: "Priya Menon", facultyId: "89273648", avatar: "https://i.pravatar.cc/150?img=44", activeQuiz: 4, pendingSubmissions: 4 },
];