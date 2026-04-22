"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { upsertResumeInternship } from "@/lib/helpers/student/Resume/resumeInternshipsAPI";
import { useEffect, useRef, useState } from "react";

export interface InternshipFormData {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  projectName: string;
  projectUrl: string;
  location: string;
  domain: string;
  description: string;
}

export interface InternshipFormActions {
  handleSave: () => Promise<void>;
  handleNext: () => Promise<void>;
  isSaving: boolean;
  isNavigating: boolean;
}

// ── Sanitizers ────────────────────────────────────────────────────────────────

const sanitizeOrganization = (value: string) =>
  value.replace(/[^a-zA-Z0-9\s\-&.,()']/g, "");

const sanitizeProjectName = (value: string) =>
  value.replace(/[^a-zA-Z0-9\s\-_().'"]/g, "");

const sanitizeProjectUrl = (value: string) =>
  value.replace(/[^a-zA-Z0-9:/._\-~?#[\]@!$&'()*+,;=%]/g, "");

const sanitizeDate = (value: string): string => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const cappedYear = (year || "").slice(0, 4);
  return [cappedYear, month, day].join("-");
};

// ── Validators ────────────────────────────────────────────────────────────────

const isValidDateString = (val: string): boolean => {
  if (!val || val.trim() === "") return false;
  const parts = val.split("-");
  if (parts.length !== 3) return false;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (yearStr.length !== 4) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const isValidUrl = (val: string): boolean => {
  try {
    const url = new URL(val);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = [
  // ── IT & Software ──
  "Software Developer Intern",
  "Frontend Developer Intern",
  "Backend Developer Intern",
  "Full Stack Developer Intern",
  "Mobile Developer Intern",
  "Android Developer Intern",
  "iOS Developer Intern",
  "Data Science Intern",
  "Data Analyst Intern",
  "Machine Learning Intern",
  "AI/ML Intern",
  "DevOps Intern",
  "Cloud Computing Intern",
  "Cybersecurity Intern",
  "QA / Testing Intern",
  "UI/UX Designer Intern",
  "Graphic Designer Intern",
  "Product Designer Intern",
  "Embedded Systems Intern",
  "IoT Intern",
  "Blockchain Intern",
  "Game Developer Intern",
  "IT Support Intern",
  "Network Engineer Intern",
  "Database Intern",
  // ── Non-IT ──
  "Mechanical Engineering Intern",
  "Civil Engineering Intern",
  "Electrical Engineering Intern",
  "Electronics Intern",
  "Chemical Engineering Intern",
  "Biotechnology Intern",
  "Research Intern",
  "Operations Intern",
  "Supply Chain Intern",
  "Logistics Intern",
  "Manufacturing Intern",
  "Quality Control Intern",
  // ── Sales ──
  "Sales Intern",
  "Business Development Intern",
  "Inside Sales Intern",
  "Pre-Sales Intern",
  "Retail Sales Intern",
  "B2B Sales Intern",
  // ── Marketing ──
  "Marketing Intern",
  "Digital Marketing Intern",
  "Social Media Marketing Intern",
  "Content Marketing Intern",
  "SEO Intern",
  "Performance Marketing Intern",
  "Brand Management Intern",
  "Market Research Intern",
  "Email Marketing Intern",
  // ── Design ──
  "Graphic Design Intern",
  "Product Design Intern",
  "Motion Graphics Intern",
  "Video Editing Intern",
  "Photography Intern",
  "Fashion Design Intern",
  "Interior Design Intern",
  // ── Finance & Accounting ──
  "Finance Intern",
  "Accounting Intern",
  "Investment Banking Intern",
  "Equity Research Intern",
  "Audit Intern",
  "Tax Intern",
  "Financial Analysis Intern",
  // ── HR ──
  "HR Intern",
  "Talent Acquisition Intern",
  "Recruitment Intern",
  "HR Operations Intern",
  "Learning & Development Intern",
  // ── Management & Strategy ──
  "Business Analyst Intern",
  "Strategy Intern",
  "Management Intern",
  "Consulting Intern",
  "Project Management Intern",
  "Product Management Intern",
  // ── Legal & Compliance ──
  "Legal Intern",
  "Compliance Intern",
  "Paralegal Intern",
  // ── Media & Communication ──
  "Content Writing Intern",
  "Journalism Intern",
  "Public Relations Intern",
  "Copywriting Intern",
  "Video Production Intern",
  "Podcast Intern",
  // ── Education ──
  "Teaching Intern",
  "Curriculum Development Intern",
  "EdTech Intern",
  // ── Healthcare ──
  "Healthcare Intern",
  "Pharmacy Intern",
  "Clinical Research Intern",
  "Hospital Management Intern",
  // ── Other ──
  "Event Management Intern",
  "NGO / Social Work Intern",
  "Agriculture Intern",
  "Architecture Intern",
];

const LOCATIONS = [
  // ── Metro Cities ──
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  // ── Tier 2 Cities ──
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Amritsar",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Chandigarh",
  "Guwahati",
  "Solapur",
  "Hubli",
  "Tiruchirappalli",
  "Bareilly",
  "Mysuru",
  "Tiruppur",
  "Gurgaon",
  "Aligarh",
  "Jalandhar",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Nellore",
  "Dehradun",
  "Mangalore",
  "Belgaum",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Jalgaon",
  "Udaipur",
  "Maheshtala",
  "Davanagere",
  "Kozhikode",
  "Akola",
  "Kurnool",
  "Rajpur Sonarpur",
  "Rajahmundry",
  "Bokaro",
  "South Dumdum",
  "Bellary",
  "Patiala",
  "Gopalpur",
  "Agartala",
  "Bhagalpur",
  "Muzaffarnagar",
  "Bhatpara",
  "Panihati",
  "Latur",
  "Dhule",
  "Rohtak",
  "Korba",
  "Bhilwara",
  "Brahmapur",
  "Muzaffarpur",
  "Ahmednagar",
  "Mathura",
  "Kollam",
  "Avadi",
  "Kadapa",
  "Kamarhati",
  "Bilaspur",
  "Shahjahanpur",
  "Bijapur",
  "Rampur",
  "Shimla",
  "Durgapur",
  "Thrissur",
  "Alwar",
  "Bardhaman",
  "Kulti",
  "Kakinada",
  "Nizamabad",
  "Parbhani",
  "Tumkur",
  "Hisar",
  "Ozhukarai",
  "Panipat",
  "Secunderabad",
  // ── Remote ──
  "Remote",
];


const DEFAULT_DOMAINS = [
  // ── IT & Software ──
  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile App Development",
  "Android Development",
  "iOS Development",
  "Data Science",
  "Data Analytics",
  "Machine Learning",
  "Artificial Intelligence",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "DevOps & Cloud",
  "Cloud Computing",
  "Cybersecurity",
  "Software Testing & QA",
  "Embedded Systems",
  "Internet of Things (IoT)",
  "Blockchain",
  "Game Development",
  "Database Administration",
  "Networking & IT Infrastructure",
  "AR / VR Development",
  // ── Design ──
  "UI/UX Design",
  "Graphic Design",
  "Product Design",
  "Motion Graphics",
  "Video Editing",
  "Photography",
  "Fashion Design",
  "Interior Design",
  // ── Sales ──
  "Sales",
  "Business Development",
  "Inside Sales",
  "B2B Sales",
  "Retail Sales",
  // ── Marketing ──
  "Digital Marketing",
  "Social Media Marketing",
  "Content Marketing",
  "SEO / SEM",
  "Performance Marketing",
  "Brand Management",
  "Market Research",
  "Email Marketing",
  "Public Relations",
  // ── Finance & Accounting ──
  "Finance",
  "Accounting",
  "Investment Banking",
  "Equity Research",
  "Audit & Taxation",
  "Financial Analysis",
  // ── HR ──
  "Human Resources",
  "Talent Acquisition",
  "HR Operations",
  "Learning & Development",
  // ── Management & Strategy ──
  "Business Analysis",
  "Strategy & Consulting",
  "Project Management",
  "Product Management",
  "Operations Management",
  "Supply Chain & Logistics",
  // ── Engineering (Non-IT) ──
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Electronics & Communication",
  "Chemical Engineering",
  "Biotechnology",
  "Manufacturing & Production",
  "Quality Control",
  // ── Media & Communication ──
  "Content Writing",
  "Journalism",
  "Copywriting",
  "Video Production",
  "Podcast & Broadcasting",
  // ── Education ──
  "Education & Teaching",
  "EdTech",
  "Curriculum Development",
  // ── Healthcare ──
  "Healthcare",
  "Pharmacy",
  "Clinical Research",
  "Hospital Management",
  // ── Legal ──
  "Legal & Compliance",
  // ── Other ──
  "Event Management",
  "Agriculture",
  "Architecture",
  "Research & Development",
  "NGO / Social Work",
];
// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#282828] mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SelectWithCustomBadge({
  value,
  options,
  placeholder,
  isCustom,
  showOther,
  otherValue,
  disabled,
  onSelectChange,
  onOtherChange,
  onOtherKeyDown,
  onOtherAdd,
  onOtherCancel,
  onBadgeClear,
  otherPlaceholder,
  error,
}: {
  value: string;
  options: string[];
  placeholder: string;
  isCustom: boolean;
  showOther: boolean;
  otherValue: string;
  disabled: boolean;
  onSelectChange: (val: string) => void;
  onOtherChange: (val: string) => void;
  onOtherKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtherAdd: () => void;
  onOtherCancel: () => void;
  onBadgeClear: () => void;
  otherPlaceholder: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref}>
      <div className="relative">
        {isCustom && !showOther ? (
          <div className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 flex items-center justify-between min-h-[38px]">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-green-50 border border-[#43C17A] rounded-md">
              <span className="text-sm text-[#282828]">{value}</span>
              <button
                type="button"
                onClick={onBadgeClear}
                className="text-gray-400 hover:text-red-500 text-xs cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>
            <span className="text-[#525252] ml-2">▾</span>
          </div>
        ) : (
          <>
            {/* Trigger */}
            <div
              onClick={() => !disabled && setOpen((prev) => !prev)}
              className={`w-full border border-[#CCCCCC] rounded-md px-3 py-2 text-sm flex justify-between ${disabled ? "bg-gray-50 cursor-not-allowed" : "cursor-pointer"
                }`}
            >
              <span className={value ? "text-[#282828]" : "text-[#9CA3AF]"}>
                {value || placeholder}
              </span>
              <span>▾</span>
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#CCCCCC] rounded-md shadow-md max-h-48 overflow-y-auto">

                {/* Placeholder */}
                <div
                  onClick={() => {
                    onSelectChange("");
                    setOpen(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                >
                  {placeholder}
                </div>

                {/* Options */}
                {options.map((o) => (
                  <div
                    key={o}
                    onClick={() => {
                      onSelectChange(o);
                      setOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors
      ${value === o
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {o}
                  </div>
                ))}

                {/* Other */}
                <div
                  onClick={() => {
                    onSelectChange("__other__");
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-green-600 hover:bg-gray-100 cursor-pointer font-medium"
                >
                  + Other
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Custom Input */}
      {showOther && (
        <div className="flex gap-2 items-center mt-2">
          <input
            autoFocus
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            onKeyDown={onOtherKeyDown}
            placeholder={otherPlaceholder}
            className="flex-1 h-10 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none focus:border-[#43C17A]"
          />
          <button
            type="button"
            onClick={onOtherAdd}
            className="px-4 h-10 bg-[#43C17A] text-white text-sm font-medium rounded-md hover:bg-[#16A34A]"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onOtherCancel}
            className="px-4 h-10 border border-[#CCCCCC] text-[#525252] text-sm font-medium rounded-md hover:bg-[#F5F5F5]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────

export default function InternshipForm({
  studentId,
  onSubmitted,
  initialData,
  internshipId,
  onNext,
  hideActions = false,
  registerActions,
}: {
  studentId: number;
  onSubmitted: (data: InternshipFormData, dbId?: number) => void;
  initialData?: InternshipFormData;
  internshipId?: number;
  onNext?: (nextRoute: string) => void;
  hideActions?: boolean;
  registerActions?: (actions: InternshipFormActions) => void;
}) {
  const router = useRouter();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    return "Unknown error";
  };

  // ── field state ──────────────────────────────────────────────────────────────
  const [organization, setOrganization] = useState(initialData?.organization || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [projectName, setProjectName] = useState(initialData?.projectName || "");
  const [projectUrl, setProjectUrl] = useState(initialData?.projectUrl || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [domain, setDomain] = useState(initialData?.domain || "");
  const [description, setDescription] = useState(initialData?.description || "");


  // ── other / custom select state ──────────────────────────────────────────────
  const [showOtherRole, setShowOtherRole] = useState(false);
  const [otherRoleValue, setOtherRoleValue] = useState("");
  const [showOtherLocation, setShowOtherLocation] = useState(false);
  const [otherLocationValue, setOtherLocationValue] = useState("");
  const [showOtherDomain, setShowOtherDomain] = useState(false);
  const [otherDomainValue, setOtherDomainValue] = useState("");


  // ── ui state ─────────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // ── Role helpers ─────────────────────────────────────────────────────────────
  const handleRoleSelectChange = (val: string) => {
    if (val === "__other__") { setShowOtherRole(true); setRole(""); }
    else { setShowOtherRole(false); setRole(val); }
  };
  const handleAddOtherRole = () => {
    const val = otherRoleValue.trim();
    if (!val) { toast.error("Please enter a role before adding."); return; }
    setRole(val); setOtherRoleValue(""); setShowOtherRole(false);
  };

  // ── Location helpers ─────────────────────────────────────────────────────────
  const handleLocationSelectChange = (val: string) => {
    if (val === "__other__") { setShowOtherLocation(true); setLocation(""); }
    else { setShowOtherLocation(false); setLocation(val); }
  };
  const handleAddOtherLocation = () => {
    const val = otherLocationValue.trim();
    if (!val) { toast.error("Please enter a location before adding."); return; }
    setLocation(val); setOtherLocationValue(""); setShowOtherLocation(false);
  };

  // ── Domain helpers ───────────────────────────────────────────────────────────
  const handleDomainSelectChange = (val: string) => {
    if (val === "__other__") { setShowOtherDomain(true); setDomain(""); }
    else { setShowOtherDomain(false); setDomain(val); }
  };
  const handleAddOtherDomain = () => {
    const val = otherDomainValue.trim();
    if (!val) { toast.error("Please enter a domain before adding."); return; }
    setDomain(val); setOtherDomainValue(""); setShowOtherDomain(false);
  };

  // ── Validate ─────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const trimmedOrg = organization.trim();
    const trimmedProject = projectName.trim();
    const trimmedUrl = projectUrl.trim();

    if (!trimmedOrg) {
      toast.error("Please fill all required fields"); return false;
    }
    if (trimmedOrg.length < 2) {
      toast.error("Organization name must be at least 2 characters"); return false;
    }
    if (trimmedOrg.length > 100) {
      toast.error("Organization name must not exceed 100 characters"); return false;
    }
    if (!role) {
      toast.error("Please fill all required fields"); return false;
    }
    if (!startDate) {
      toast.error("Please fill all required fields"); return false;
    }
    if (!isValidDateString(startDate)) {
      toast.error("Enter a valid start date (day 1–31, month 1–12, 4-digit year)"); return false;
    }
    if (endDate) {
      if (!isValidDateString(endDate)) {
        toast.error("Enter a valid end date (day 1–31, month 1–12, 4-digit year)"); return false;
      }
      if (new Date(endDate) <= new Date(startDate)) {
        toast.error("End date must be after start date"); return false;
      }
    }
    if (!trimmedProject) {
      toast.error("Please fill all required fields"); return false;
    }
    if (trimmedProject.length < 2) {
      toast.error("Project name must be at least 2 characters"); return false;
    }
    if (trimmedProject.length > 100) {
      toast.error("Project name must not exceed 100 characters"); return false;
    }
    if (!trimmedUrl) {
      toast.error("Please fill all required fields"); return false;
    }
    if (!isValidUrl(trimmedUrl)) {
      toast.error("Enter a valid project URL starting with http:// or https://"); return false;
    }
    if (!location) {
      toast.error("Please fill all required fields"); return false;
    }
    if (!domain) {
      toast.error("Please fill all required fields"); return false;
    }

    return true;
  };

  // ── API Call ─────────────────────────────────────────────────────────────────
  const callApi = async (): Promise<boolean> => {
    const trimmedOrg = organization.trim();
    const trimmedProject = projectName.trim();
    const trimmedUrl = projectUrl.trim();

    try {
      const result = await upsertResumeInternship({
        resumeInternshipId: internshipId,
        studentId,
        organizationName: trimmedOrg,
        role,
        startDate,
        endDate: endDate || null,
        projectName: trimmedProject,
        projectUrl: trimmedUrl,
        location,
        domain,
        description: description.trim() || null,
      });

      toast.success(internshipId ? "Internship updated successfully" : "Internship saved successfully");
      await Promise.resolve(
        onSubmitted(
        {
          organization: trimmedOrg,
          role,
          startDate,
          endDate,
          projectName: trimmedProject,
          projectUrl: trimmedUrl,
          location,
          domain,
          description: description.trim(),
        },
        result.resumeInternshipId
      ));
      return true;
    } catch (error: unknown) {
      toast.error(`Failed to save: ${getErrorMessage(error)}`);
      return false;
    }
  };

  // ── Save handler ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (isSaving || isNavigating) return;
    if (!validate()) return;
    setIsSaving(true);
    try {
      await callApi();
    } finally {
      setIsSaving(false);
    }
  };

  // ── Next handler ─────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (isSaving || isNavigating) return;
    const isFormEmpty =
      !organization.trim() &&
      !role &&
      !startDate &&
      !endDate &&
      !projectName.trim() &&
      !projectUrl.trim() &&
      !location &&
      !domain &&
      !description.trim();

    if (isFormEmpty) {
      if (onNext) {
        onNext("/profile?resume=projects&Step=6");
      } else {
        router.push("/profile?resume=projects&Step=6");
      }
      return;
    }

    if (!validate()) return;
    setIsNavigating(true);
    try {
      const success = await callApi();
      if (success) {
        if (onNext) {
          onNext("/profile?resume=projects&Step=6");
        } else {
          router.push("/profile?resume=projects&Step=6");
        }
      }
    } finally {
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    if (!registerActions) return;
    registerActions({
      handleSave,
      handleNext,
      isSaving,
      isNavigating,
    });
  }, [registerActions, isSaving, isNavigating, organization, role, startDate, endDate, projectName, projectUrl, location, domain, description]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4 space-y-4">

      {/* Row 1: Organization | Role */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Organization Name" required />
          <input
            value={organization}
            onChange={(e) => setOrganization(sanitizeOrganization(e.target.value))}
            placeholder="Organization Name"
            disabled={isSaving || isNavigating}
            maxLength={100}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div>
          <FieldLabel label="Role / Position" required />
          <SelectWithCustomBadge
            value={role}
            options={ROLES}
            placeholder="Select role"
            isCustom={!!role && !ROLES.includes(role)}
            showOther={showOtherRole}
            otherValue={otherRoleValue}
            disabled={isSaving || isNavigating}
            onSelectChange={handleRoleSelectChange}
            onOtherChange={setOtherRoleValue}
            onOtherKeyDown={(e) => e.key === "Enter" && handleAddOtherRole()}
            onOtherAdd={handleAddOtherRole}
            onOtherCancel={() => { setShowOtherRole(false); setOtherRoleValue(""); }}
            onBadgeClear={() => setRole("")}
            otherPlaceholder="Enter role"
          />
        </div>
      </div>

      {/* Row 2: Start Date | End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Start Date" required />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(sanitizeDate(e.target.value))}
            disabled={isSaving || isNavigating}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer"
          />
        </div>
        <div>
          <FieldLabel label="End Date" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(sanitizeDate(e.target.value))}
            disabled={isSaving || isNavigating || !startDate}
            min={startDate}
            className={`w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer ${!startDate ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
          />
        </div>
      </div>

      {/* Row 3: Project Name | Project URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Project Name" required />
          <input
            value={projectName}
            onChange={(e) => setProjectName(sanitizeProjectName(e.target.value))}
            placeholder="Enter the name of the project"
            disabled={isSaving || isNavigating}
            maxLength={100}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div>
          <FieldLabel label="Project URL" required />
          <input
            value={projectUrl}
            onChange={(e) => setProjectUrl(sanitizeProjectUrl(e.target.value))}
            placeholder="https://example.com"
            disabled={isSaving || isNavigating}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Row 4: Location | Domain */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Location" required />
          <SelectWithCustomBadge
            value={location}
            options={LOCATIONS}
            placeholder="Select location"
            isCustom={!!location && !LOCATIONS.includes(location)}
            showOther={showOtherLocation}
            otherValue={otherLocationValue}
            disabled={isSaving || isNavigating}
            onSelectChange={handleLocationSelectChange}
            onOtherChange={setOtherLocationValue}
            onOtherKeyDown={(e) => e.key === "Enter" && handleAddOtherLocation()}
            onOtherAdd={handleAddOtherLocation}
            onOtherCancel={() => { setShowOtherLocation(false); setOtherLocationValue(""); }}
            onBadgeClear={() => setLocation("")}
            otherPlaceholder="Enter location"
          />
        </div>
        <div>
          <FieldLabel label="Domain" required />
          <SelectWithCustomBadge
            value={domain}
            options={DEFAULT_DOMAINS}
            placeholder="Select domain"
            isCustom={!!domain && !DEFAULT_DOMAINS.includes(domain)}
            showOther={showOtherDomain}
            otherValue={otherDomainValue}
            disabled={isSaving || isNavigating}
            onSelectChange={handleDomainSelectChange}
            onOtherChange={setOtherDomainValue}
            onOtherKeyDown={(e) => e.key === "Enter" && handleAddOtherDomain()}
            onOtherAdd={handleAddOtherDomain}
            onOtherCancel={() => { setShowOtherDomain(false); setOtherDomainValue(""); }}
            onBadgeClear={() => setDomain("")}
            otherPlaceholder="Enter domain"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel label="Short Description" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving || isNavigating}
          placeholder="Describe your key responsibilities, achievements, and skills gained during the internship.........."
          rows={4}
          maxLength={500}
          className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
      </div>

      {/* Buttons */}
      {!hideActions && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || isNavigating}
            className={`px-6 py-2 rounded-md text-sm text-white ${(isSaving || isNavigating) ? "bg-[#43C17A]/50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
              }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSaving || isNavigating}
            className={`px-6 py-1.5 rounded-md text-sm font-medium text-white ${(isSaving || isNavigating) ? "bg-[#43C17A]/50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
              }`}
          >
            {isNavigating ? "Saving..." : "Next"}
          </button>
        </div>
      )}

    </div>
  );
}
