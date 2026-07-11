"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import { Avatar } from "@/app/utils/Avatar";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AttendancePerformanceChart from "@/app/(screens)/finance/my-attendance/charts/AttendancePerformanceChart";
import AttendanceTable from "@/app/(screens)/finance/my-attendance/tables/attendanceTable";
import type { AttendanceRecord } from "@/app/(screens)/finance/my-attendance/types";
import { CheckSquare, DownloadSimple } from "@phosphor-icons/react";
import ReimbursementsClient from "@/app/components/SharedReimbursements/ReimbursementsClient";

const attendanceRecords: AttendanceRecord[] = [
  {
    date: "04 Jul 2026",
    checkIn: "09:12 AM",
    checkOut: "05:15 PM",
    totalHours: "08h 03m",
    status: "PRESENT",
    reason: "—",
    lateBy: "00m",
    earlyOut: "—",
    classDetail: "Accounts",
  },
  {
    date: "03 Jul 2026",
    checkIn: "09:28 AM",
    checkOut: "05:05 PM",
    totalHours: "07h 37m",
    status: "LATE",
    reason: "Traffic delay",
    lateBy: "13m",
    earlyOut: "—",
    classDetail: "Accounts",
  },
  {
    date: "02 Jul 2026",
    checkIn: "—",
    checkOut: "—",
    totalHours: "—",
    status: "LEAVE",
    reason: "Personal leave",
    lateBy: "—",
    earlyOut: "—",
    classDetail: "Accounts",
  },
  {
    date: "01 Jul 2026",
    checkIn: "09:05 AM",
    checkOut: "05:00 PM",
    totalHours: "07h 55m",
    status: "PRESENT",
    reason: "—",
    lateBy: "00m",
    earlyOut: "—",
    classDetail: "Accounts",
  },
];

const chartData = [
  { month: "Jan", performance: 74, attendance: 18 },
  { month: "Feb", performance: 88, attendance: 21 },
  { month: "Mar", performance: 92, attendance: 22 },
  { month: "Apr", performance: 79, attendance: 19 },
  { month: "May", performance: 84, attendance: 20 },
  { month: "Jun", performance: 91, attendance: 23 },
  { month: "Jul", performance: 82, attendance: 16 },
];

const profile = {
  name: "Accountant Gk",
  id: "E-34098765",
  educationType: "B.Tech",
  mobile: "9876432134",
  email: "accountant@gk.edu",
  joiningDate: "12 July 2019",
  experience: "6 years",
};

function AccountantMyAttendanceContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeMain =
    (searchParams.get("main") as "attendance" | "payroll" | "analytics") ||
    "payroll";
  const activeSub =
    (searchParams.get("sub") as "summary" | "myPay" | "manageTax" | "reimbursements") ||
    "summary";

  const setQuery = (main: string, sub?: string) => {
    const params = new URLSearchParams();
    params.set("main", main);
    if (sub) params.set("sub", sub);
    router.push(`${pathname}?${params.toString()}`);
  };

  const showRightSidebar = !(activeMain === "payroll" && activeSub === "reimbursements");

  return (
    <div className="flex items-start justify-between relative">
      <main className="min-h-150 w-full min-w-0 flex-1 px-2.5 pt-4 font-sans relative">
        <div className="mb-8 flex w-full justify-center px-20">
          <div className="relative flex w-full max-w-[700px] items-center justify-between rounded-full bg-[#E5E5E5] p-1">
            {[
              ["attendance", "Attendance"],
              ["payroll", "Payroll"],
              ["analytics", "Attendance Analytics"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setQuery(id, id === "payroll" ? activeSub : undefined)
                }
                className={`relative z-10 w-1/3 cursor-pointer rounded-full py-1.5 text-[15px] transition-colors duration-300 ${
                  activeMain === id
                    ? "bg-[#43C17A] font-medium text-white"
                    : "text-[#5A5A5A] hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeMain === "attendance" && <AttendancePanel />}
        {activeMain === "payroll" && (
          <PayrollPanel
            activeSub={activeSub as any}
            onSubChange={(sub) => setQuery("payroll", sub)}
          />
        )}
        {activeMain === "analytics" && <AnalyticsPanel />}
      </main>

      {showRightSidebar && <AttendanceRightPanel />}
    </div>
  );
}

function AttendancePanel() {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex w-full gap-4">
        <ProfileCard />
        <StatusCard />
      </div>
      <AttendanceTable
        records={attendanceRecords}
        month="JUL"
        year="2026"
        totalItems={attendanceRecords.length}
        currentPage={1}
        onPageChange={() => undefined}
      />
    </div>
  );
}

function ProfileCard() {
  return (
    <div className="flex w-[70%] items-center gap-8 overflow-auto rounded-xl border border-gray-100/50 bg-white p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2 pl-2">
        <Avatar src="" alt={profile.name} size={85} />
        <p className="whitespace-nowrap text-[15px] font-bold text-[#282828]">
          {profile.name}
        </p>
      </div>
      <div className="grid grid-cols-[130px_1fr] gap-y-2 text-[13px]">
        <Info label="Accountant ID" value={profile.id} />
        <Info label="Education Type" value={profile.educationType} />
        <Info label="Mobile" value={profile.mobile} />
        <Info label="Email" value={profile.email} />
        <Info label="Date of Joining" value={profile.joiningDate} />
        <Info label="Experience" value={profile.experience} />
      </div>
    </div>
  );
}

function StatusCard() {
  return (
    <div className="flex w-[30%] flex-col justify-between overflow-auto rounded-xl border border-gray-100/50 bg-white p-4 text-[12.5px] shadow-sm">
      <div>
        <p className="font-medium text-[#282828]">Attendance Status (Today)</p>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] text-gray-700">
          <CheckSquare size={16} weight="fill" className="text-[#22C55E]" />
          <span>PRESENT</span>
        </div>
      </div>
      <Info label="Total Working Days" value="24" compact />
      <Info label="Leaves Taken" value="2" compact />
      <Info label="Remaining Leaves" value="10" compact />
    </div>
  );
}

function PayrollPanel({
  activeSub,
  onSubChange,
}: {
  activeSub: "summary" | "myPay" | "manageTax" | "reimbursements";
  onSubChange: (sub: "summary" | "myPay" | "manageTax" | "reimbursements") => void;
}) {
  return (
    <div className="flex w-full flex-col items-center p-2">
      <div className="mb-4 flex w-full justify-center gap-12">
        {[
          ["summary", "Summary"],
          ["myPay", "My Pay"],
          ["manageTax", "Manage Tax"],
          ["reimbursements", "Reimbursements"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onSubChange(id as "summary" | "myPay" | "manageTax" | "reimbursements")}
            className={`cursor-pointer border-b-[2px] pb-1.5 text-[15px] transition-all duration-300 ${
              activeSub === id
                ? "border-[#43C17A] text-[#43C17A]"
                : "border-transparent font-medium text-[#5A5A5A] hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="w-full">
        {activeSub === "summary" && <SummaryPanel />}
        {activeSub === "myPay" && <MyPayPanel />}
        {activeSub === "manageTax" && <ManageTaxPanel />}
        {activeSub === "reimbursements" && <ReimbursementsClient />}
      </div>
    </div>
  );
}

function SummaryPanel() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 text-left xl:grid-cols-2">
      <section className="rounded-2xl border border-gray-50 bg-white p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div className="mb-6 mt-2 flex flex-col items-center">
          <Avatar src="" alt={profile.name} size={84} />
          <h2 className="mt-3 text-center text-[17px] font-bold text-gray-800">
            {profile.name}
          </h2>
          <span className="mt-1 rounded bg-[#43C17A]/10 px-2 py-0.5 text-xs font-semibold text-[#43C17A]">
            Accountant
          </span>
        </div>
        <div className="flex flex-col space-y-0.5">
          <InfoRow label="Accountant ID" value={profile.id} />
          <InfoRow label="Education Type" value={profile.educationType} />
          <InfoRow label="Mobile" value={profile.mobile} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Date of Joining" value={profile.joiningDate} />
          <InfoRow label="Experience" value={profile.experience} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-50 bg-white p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <h2 className="mb-4 border-b border-gray-100 pb-4 text-left text-[16px] font-bold text-gray-800">
          Payment Information
        </h2>
        <div className="mb-5">
          <InfoRow label="Salary Payment Mode:" value="Bank Transfer" />
        </div>
        <h3 className="mb-3 mt-5 text-left text-[15px] font-bold text-gray-800">
          Bank Information
        </h3>
        <div className="flex flex-col space-y-0.5">
          <InfoRow label="Bank Name:" value="State Bank of India" />
          <InfoRow label="Account Number:" value="XXXX XXXX 2451" />
          <InfoRow label="IFSC Code:" value="SBIN0001234" />
          <InfoRow label="Name on Account:" value={profile.name} />
          <InfoRow label="Branch:" value="City Campus" />
        </div>
      </section>

      <IdentityCard
        title="Aadhaar Card"
        rows={[
          ["Aadhaar Number:", "XXXX XXXX 2104"],
          ["Date of Birth:", "12 Jul 1992"],
          ["Address:", "City Campus"],
          ["Enrollment Number:", "2189/20451/22"],
        ]}
      />
      <IdentityCard
        title="PAN Card"
        rows={[
          ["Permanent Account Number:", "ABCPG2451K"],
          ["Date of Birth:", "12 Jul 1992"],
          ["Name on PAN:", profile.name],
          ["Father's Name:", "Suresh Kumar"],
        ]}
      />
    </div>
  );
}

function MyPayPanel() {
  const slips = ["January 2026", "February 2026", "March 2026", "April 2026"];
  return (
    <div className="mx-auto flex h-[550px] w-full max-w-5xl flex-col text-left">
      <div className="mb-4 text-[14px] font-bold">
        <span className="cursor-pointer text-[#43C17A] underline decoration-2 underline-offset-4">
          My Salary & Pay Slips
        </span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="cursor-pointer text-[#333333] hover:text-[#43C17A]">
          Income TAX
        </span>
      </div>
      <h2 className="mb-3 text-[16px] font-extrabold text-[#333333]">
        My Salary
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <SalaryMetric title="Current Compensation" value="INR 6,40,000/Annum" />
        <SalaryMetric title="Payroll" value="Till Date Pay 1,92,000" />
        <SalaryMetric title="Take Home" value="INR 48,500" />
      </div>
      <h2 className="mb-3 text-[16px] font-extrabold text-[#333333]">
        Pay Slips
      </h2>
      <div className="custom-scrollbar min-h-[108vh] space-y-4 overflow-y-auto rounded-xl pr-2">
        {slips.map((month) => (
          <div
            key={month}
            className="rounded-xl border border-gray-50 bg-white p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#333333]">{month}</h3>
              <button className="flex cursor-pointer items-center text-[13px] font-bold text-[#333333] hover:text-[#43C17A]">
                Download <DownloadSimple size={15} className="ml-1.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 text-[13px] md:grid-cols-2">
              <Info label="Pay Date :" value="23/07/2026" />
              <Info label="Deductions :" value="5,800.00" />
              <Info label="Gross Pay :" value="54,300.00" />
              <Info label="Net Pay :" value="48,500.00" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManageTaxPanel() {
  return (
    <div className="mx-auto flex h-[600px] w-full max-w-5xl flex-col text-left">
      <div className="mb-6 text-[14px] font-bold">
        <span className="cursor-pointer text-[#43C17A] underline decoration-2 underline-offset-4">
          Declaration
        </span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="cursor-pointer text-[#333333] hover:text-[#43C17A]">
          Forms
        </span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="cursor-pointer text-[#333333] hover:text-[#43C17A]">
          Tax Filing
        </span>
        <span className="mx-2 text-gray-400">/</span>
        <span className="cursor-pointer text-[#333333] hover:text-[#43C17A]">
          Tax Saving Investment
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#43C17A]">
            Investment Declaration
          </h3>
          <p className="font-bold text-[#1F2937]">Current windows</p>
          <p className="text-[#1F2937]">Till Aug 25, 2026</p>
        </div>
        <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#43C17A]">
            Proof Submission
          </h3>
          <p className="font-bold text-[#1F2937]">Current windows</p>
          <p className="text-[#1F2937]">Till Aug 25, 2026</p>
        </div>
        <SalaryMetric title="Net Taxable Income" value="INR 3,39,200" />
        <SalaryMetric title="Total Tax Payable" value="INR 0" />
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="flex w-full flex-col overflow-auto pb-5">
      <div className="mb-5 w-full text-[14px]">
        <h2 className="mb-4 text-[17px] font-bold text-[#282828]">
          Accountant Information
        </h2>
        <div className="grid w-full grid-cols-3 gap-y-3.5">
          <Info label="Name :" value={profile.name} />
          <Info label="Education Type :" value={profile.educationType} />
          <Info label="Employee ID :" value={profile.id} />
          <Info label="Experience :" value={profile.experience} />
          <Info label="Leaves Taken:" value="2" />
          <Info label="Working Days :" value="24" />
        </div>
      </div>
      <AttendancePerformanceChart data={chartData} />
      <AttendanceTable
        title="Daily Attendance Record"
        records={attendanceRecords}
        month="JUL"
        year="2026"
        totalItems={attendanceRecords.length}
        currentPage={1}
        onPageChange={() => undefined}
      />
    </div>
  );
}

function AttendanceRightPanel() {
  return (
    <aside className="flex w-[32%] flex-col p-2">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <AnnouncementsCard
        announceCard={[]}
        height="80vh"
        currentView="others"
        readOnly
      />
    </aside>
  );
}

function Info({
  label,
  value,
  compact,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div>
        <p className="mb-0.5 font-medium text-[#282828]">{label}</p>
        <p className="text-[#525252]">{value}</p>
      </div>
    );
  }

  return (
    <>
      <span className="font-semibold text-[#333333]">{label}</span>
      <span className="text-[#666666]">{value}</span>
    </>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex w-full items-start py-1.5 text-left text-[14px]">
      <span className="w-[140px] shrink-0 font-semibold text-[#333333] sm:w-[180px]">
        {label}
      </span>
      <span className="min-w-0 flex-1 break-words text-[#666666]">
        {value}
      </span>
    </div>
  );
}

function IdentityCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <section className="rounded-2xl border border-gray-50 bg-white p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
      <h2 className="mb-5 text-[16px] font-bold text-gray-800">{title}</h2>
      <div className="flex flex-col space-y-0.5">
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function SalaryMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex min-h-[110px] flex-col justify-center rounded-xl border border-gray-50 bg-white p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
      <p className="text-[13px] font-semibold text-[#666666]">{title}</p>
      <p className="mt-1 text-[17px] font-bold text-[#333333]">{value}</p>
    </div>
  );
}

export default function AccountantMyAttendancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <AccountantMyAttendanceContent />
    </Suspense>
  );
}
