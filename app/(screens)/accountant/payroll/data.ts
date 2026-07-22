export type StaticPayrollEmployee = {
  payrollEntryId: number;
  payrollRunId: number;
  userId: number;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  payrollMonth: number;
  payrollYear: number;
  monthlySalary: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  fullDaysWorked: number;
  halfDays: number;
  lopDays: number;
  status: "paid";
  bank: { bankName: string; accountNumber: string; ifscCode: string; accountHolderName: string; branch: string };
  payment: { paymentMethod: string; transactionId: string; paymentDate: string; remarks: string; recordedByRole: string; createdAt: string };
};

const people = [
  ["20AD08A0010", "Ashish", "ashishkellie@gmail.com", "Admin", 15000],
  ["20AD08A0011", "Vamshi", "vamshi@college.edu", "Admin", 28000],
  ["20FA08A0012", "Sai Saraswathi", "saraswathi@college.edu", "Faculty", 42000],
  ["20FA08A0013", "Ramu FB", "ramu@college.edu", "Faculty", 39000],
  ["20FN08A0015", "Ashish Tomar", "ashish.tomar@college.edu", "Finance Executive", 35000],
  ["20HR08A0018", "Kavya Reddy", "kavya@college.edu", "HR Executive", 38000],
  ["20PL08A0021", "Rahul Verma", "rahul@college.edu", "Placement Officer", 41000],
  ["20FA08A0024", "Priya Nair", "priya@college.edu", "Faculty", 45000],
  ["20AC08A0027", "Arjun Mehta", "arjun@college.edu", "Accountant", 36000],
  ["20FA08A0030", "Sneha Iyer", "sneha@college.edu", "Faculty", 44000],
  ["20AD08A0033", "Vikram Singh", "vikram@college.edu", "Admin", 32000],
  ["20FA08A0036", "Meera Joshi", "meera@college.edu", "Faculty", 40000],
] as const;

export const staticPayrollEmployees: StaticPayrollEmployee[] = people.map((person, index) => {
  const salary = person[4];
  const deductions = 1200 + index * 75;
  return {
    payrollEntryId: 1001 + index,
    payrollRunId: 501,
    userId: 201 + index,
    employeeId: person[0],
    name: person[1],
    email: person[2],
    role: person[3],
    payrollMonth: 7,
    payrollYear: 2026,
    monthlySalary: salary,
    grossEarnings: salary,
    totalDeductions: deductions,
    netPay: salary - deductions,
    fullDaysWorked: 22 - (index % 3),
    halfDays: index % 2,
    lopDays: index % 3,
    status: "paid",
    bank: { bankName: index % 2 ? "HDFC Bank" : "State Bank of India", accountNumber: `62100000${String(1200 + index)}`, ifscCode: index % 2 ? "HDFC0001234" : "SBIN0004567", accountHolderName: person[1], branch: "Hyderabad" },
    payment: { paymentMethod: "Bank Transfer", transactionId: `TXN-PAY-202607-${1001 + index}`, paymentDate: "2026-07-20", remarks: "July salary payment completed", recordedByRole: "Accountant", createdAt: "2026-07-20T10:30:00.000Z" },
  };
});

export function getStaticAttendance(employee: StaticPayrollEmployee) {
  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    const date = new Date(2026, 6, day);
    let status = date.getDay() === 0 ? "weekoff" : "present";
    if (day === 9 + (employee.userId % 4)) status = "absent";
    if (day === 17 + (employee.userId % 3)) status = "halfday";
    if (day === 24) status = "leave";
    return { day, status };
  });
}
