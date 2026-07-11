export type Reimbursement = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  amount: string;
  submitted: string;
  title: string;
  category: string;
};

export const reimbursements: Reimbursement[] = [
  ["RB-2026-0145", "Rahul Verma", "rahul.verma@tekton.com", "/faculty-male.png", "4,580.00", "14 Jun 2026, 10:20 AM", "Business Dinner with Clients", "Client Meeting"],
  ["RB-2026-0144", "Priya Nair", "priya.nair@tekton.com", "/female-hr.png", "2,350.00", "14 Jun 2026, 09:15 AM", "Travel to Branch Office", "Travel"],
  ["RB-2026-0143", "Arjun Mehta", "arjun.mehta@tekton.com", "/faculty-m.png", "1,890.00", "13 Jun 2026, 06:45 PM", "Team Lunch", "Meals"],
  ["RB-2026-0142", "Sneha Iyer", "sneha.iyer@tekton.com", "/female-faculty.png", "3,120.00", "13 Jun 2026, 04:30 PM", "Software License Renewal", "Software"],
  ["RB-2026-0141", "Vikram Singh", "vikram.singh@tekton.com", "/admin-male.png", "2,750.00", "13 Jun 2026, 11:05 AM", "Office Supplies", "Office"],
  ["RB-2026-0140", "Meera Joshi", "meera.joshi@tekton.com", "/female-admin.png", "1,450.00", "12 Jun 2026, 03:20 PM", "Client Gifts", "Client Meeting"],
  ["RB-2026-0139", "Karan Patel", "karan.patel@tekton.com", "/college-admin-m.png", "5,600.00", "12 Jun 2026, 10:40 AM", "Conference Tickets", "Training"],
].map(([id, name, email, avatar, amount, submitted, title, category]) => ({ id, name, email, avatar, amount, submitted, title, category }));
