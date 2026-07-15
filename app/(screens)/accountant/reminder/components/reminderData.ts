import {
  ArrowsLeftRight,
  BookOpen,
  Buildings,
  CalendarDots,
  CheckCircle,
  ClockClockwise,
  ExclamationMark,
  GraduationCap,
  Lightning,
  Users,
  WifiHigh,
} from "@phosphor-icons/react";

export const toneClasses = {
  green: "bg-[#E4FAED] text-[#1A9B55]",
  blue: "bg-[#E8F1FF] text-[#3478F6]",
  red: "bg-[#FFE8E7] text-[#FF4B4B]",
  purple: "bg-[#F0E7FF] text-[#7D4DFF]",
  orange: "bg-[#FFF0DF] text-[#FF8B25]",
  pink: "bg-[#FFE8F6] text-[#EF4DA2]",
};

export const summaryCards = [
  {
    label: "Due Today",
    value: "Rs 1,25,000",
    icon: CalendarDots,
    tone: "green",
  },
  {
    label: "Upcoming",
    value: "Rs 3,45,600",
    icon: ClockClockwise,
    tone: "blue",
  },
  {
    label: "Overdue",
    value: "Rs 75,000",
    icon: ExclamationMark,
    tone: "red",
  },
  {
    label: "Completed",
    value: "Rs 8,75,200",
    icon: CheckCircle,
    tone: "purple",
  },
] as const;

export const reminders = [
  {
    title: "Electricity Bill",
    type: "TO PAY",
    category: "Utility",
    amount: "Rs 12,500",
    dueDate: "25 Jun 2026",
    dueMeta: "DUE TODAY",
    status: "DUE TODAY",
    icon: Lightning,
    tone: "red",
  },
  {
    title: "Staff Salary - June 2026",
    type: "TO PAY",
    category: "Salary",
    amount: "Rs 3,20,000",
    dueDate: "30 Jun 2026",
    dueMeta: "UPCOMING",
    status: "UPCOMING",
    icon: Users,
    tone: "orange",
  },
  {
    title: "Student Fee Collection",
    type: "TO RECEIVE",
    category: "Fee Collection",
    amount: "Rs 5,80,000",
    dueDate: "15 Jun 2026",
    dueMeta: "OVERDUE BY 3 DAYS",
    status: "OVERDUE",
    icon: GraduationCap,
    tone: "green",
  },
  {
    title: "Internet Subscription",
    type: "TO PAY",
    category: "Subscription",
    amount: "Rs 6,500",
    dueDate: "10 Jul 2026",
    dueMeta: "UPCOMING",
    status: "UPCOMING",
    icon: WifiHigh,
    tone: "purple",
  },
  {
    title: "Transport Fee Collection",
    type: "TO RECEIVE",
    category: "Fee Collection",
    amount: "Rs 2,40,000",
    dueDate: "05 Jul 2026",
    dueMeta: "UPCOMING",
    status: "UPCOMING",
    icon: ArrowsLeftRight,
    tone: "orange",
  },
  {
    title: "TDS Payment",
    type: "TO PAY",
    category: "Tax",
    amount: "Rs 18,750",
    dueDate: "20 Jun 2026",
    dueMeta: "OVERDUE BY 2 DAYS",
    status: "OVERDUE",
    icon: Buildings,
    tone: "pink",
  },
  {
    title: "Library Book Purchase",
    type: "TO PAY",
    category: "Purchase",
    amount: "Rs 32,000",
    dueDate: "12 Jul 2026",
    dueMeta: "UPCOMING",
    status: "UPCOMING",
    icon: BookOpen,
    tone: "blue",
  },
] as const;

export type Reminder = {
  id?: number;
  title: string;
  type: string;
  category: string;
  amount: string;
  dueDate: string;
  dueMeta: string;
  status: "DUE TODAY" | "UPCOMING" | "OVERDUE" | "COMPLETED";
  icon: (typeof reminders)[number]["icon"];
  tone: keyof typeof toneClasses;
  repeat?: string;
  notifyBefore?: string;
  description?: string | null;
  rawDueDate?: string;
};
export type SummaryCardItem = {
  label: string;
  value: string;
  icon: (typeof summaryCards)[number]["icon"];
  tone: keyof typeof toneClasses;
};
