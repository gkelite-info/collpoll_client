import type { UsageRecord, VisitorEntry } from "./types";

export const visitorEntries: VisitorEntry[] = [
  { id: 1, initials: "RK", avatarTone: "bg-[#DDFBE7] text-[#16A85B]", student: "Rahul Kumar", course: "B.Tech CSE - 3rd Year", rollNo: "22CS101", takenAt: "10:00 AM", equipment: "Football", quantity: 1, returnStatus: "Returned", returnedAt: "12:30 PM" },
  { id: 2, initials: "PS", avatarTone: "bg-[#DDEBFF] text-[#3B82F6]", student: "Priya Sharma", course: "B.Tech ECE - 2nd Year", rollNo: "22EC021", takenAt: "11:00 AM", equipment: "Basketball", quantity: 1, returnStatus: "Pending", returnedAt: "-" },
  { id: 3, initials: "AM", avatarTone: "bg-[#F1E4FF] text-[#9B51E0]", student: "Arjun Mehta", course: "BBA - 1st Year", rollNo: "23BA045", takenAt: "12:15 PM", equipment: "Cricket Bat", quantity: 2, returnStatus: "Returned", returnedAt: "02:00 PM" },
  { id: 4, initials: "NK", avatarTone: "bg-[#FFE8CE] text-[#F97316]", student: "Neha Kapoor", course: "B.Tech IT - 3rd Year", rollNo: "22IT089", takenAt: "02:00 PM", equipment: "Volleyball", quantity: 1, returnStatus: "Pending", returnedAt: "-" },
  { id: 5, initials: "VS", avatarTone: "bg-[#D9FAF4] text-[#0F9F8F]", student: "Vikram Singh", course: "B.Com - 2nd Year", rollNo: "22BC067", takenAt: "03:10 PM", equipment: "Badminton Racket", quantity: 2, returnStatus: "Returned", returnedAt: "04:45 PM" },
  { id: 6, initials: "DS", avatarTone: "bg-[#FFE0E0] text-[#EF4444]", student: "Devanshi Shah", course: "B.Sc - 1st Year", rollNo: "24SC015", takenAt: "04:20 PM", equipment: "Training Cones", quantity: 5, returnStatus: "Pending", returnedAt: "-" },
];

export const usageRecords: UsageRecord[] = [
  { date: "Oct 24, 2023", equipment: "Football", quantity: 1, purpose: "Practice Session", takenAt: "10:00 AM", returnedAt: "12:30 PM", status: "Returned" },
  { date: "Oct 22, 2023", equipment: "Cricket Bat", quantity: 2, purpose: "Tournament Practice", takenAt: "02:00 PM", returnedAt: "05:00 PM", status: "Returned" },
  { date: "Oct 24, 2023", equipment: "Basketball", quantity: 1, purpose: "Friendly Match", takenAt: "09:30 AM", returnedAt: "—", status: "Pending" },
  { date: "Oct 24, 2023", equipment: "Football", quantity: 1, purpose: "Practice Session", takenAt: "10:00 AM", returnedAt: "12:30 PM", status: "Returned" },
  { date: "Oct 22, 2023", equipment: "Cricket Bat", quantity: 2, purpose: "Tournament Practice", takenAt: "02:00 PM", returnedAt: "05:00 PM", status: "Returned" },
  { date: "Oct 24, 2023", equipment: "Basketball", quantity: 1, purpose: "Friendly Match", takenAt: "09:30 AM", returnedAt: "—", status: "Pending" },
];
