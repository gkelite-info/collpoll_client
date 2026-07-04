import {
  Bank,
  CalendarBlank,
  CalendarDots,
  CheckSquare,
  Clock,
  CreditCard,
} from "@phosphor-icons/react";

export const stats = [
  {
    label: "Today's Meetings",
    value: "3",
    icon: CalendarBlank,
  },
  {
    label: "This Week",
    value: "8",
    icon: CalendarDots,
  },
  {
    label: "Upcoming",
    value: "12",
    icon: Clock,
  },
];

export const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export const june2026Events: Record<number, number> = {
  3: 1,
  5: 1,
  10: 2,
  12: 2,
  18: 3,
  22: 2,
  26: 1,
};

export type CalendarCell = {
  day: string;
  muted?: boolean;
  danger?: boolean;
  selected?: boolean;
  dots?: number;
};

export function buildCalendarRows(monthDate: Date): CalendarCell[][] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);
  const isJune2026 = year === 2026 && month === 5;

  return Array.from({ length: 6 }, (_, rowIndex) =>
    Array.from({ length: 7 }, (_, columnIndex) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + rowIndex * 7 + columnIndex);
      const day = date.getDate();
      const isCurrentMonth = date.getMonth() === month;

      return {
        day: `${day}`,
        muted: !isCurrentMonth,
        danger: isCurrentMonth && date.getDay() === 0 && day === 15,
        selected: isJune2026 && isCurrentMonth && day === 18,
        dots: isJune2026 && isCurrentMonth ? june2026Events[day] : undefined,
      };
    }),
  );
}

export const meetings = [
  {
    title: "Budget Review Q3",
    time: "10:00 AM - 11:00 AM",
    icon: CreditCard,
    organizer: "Accountant (You)",
    participants: "Finance Manager + 2",
  },
  {
    title: "Audit Preparation",
    time: "02:00 PM - 03:00 PM",
    icon: CheckSquare,
    organizer: "Finance Manager",
    participants: "Accountant, Internal Auditor",
  },
  {
    title: "Vendor Payment Reconciliation",
    time: "04:30 PM - 05:30 PM",
    icon: Bank,
    organizer: "Accountant (You)",
    participants: "Finance Manager",
  },
];

export const scheduleParticipants = [
  {
    name: "Arthur Sterling",
    avatar: "/maleuser.png",
  },
  {
    name: "Sarah Jenkins",
    avatar: "/meenareddy.png",
  },
  {
    name: "David Chen",
    avatar: "/male-admin.png",
  },
];

export const detailParticipants = [
  {
    name: "Sarah Jenkins",
    role: "Finance Manager",
    avatar: "/meenareddy.png",
    organizer: true,
  },
  {
    name: "David Chen",
    role: "Internal Auditor",
    avatar: "/male-admin.png",
  },
  {
    name: "Anaya Rao",
    role: "Accounts Executive",
    avatar: "/sa-f.png",
  },
  {
    name: "Michael Ross",
    role: "Purchase Officer",
    avatar: "/male-ca.png",
  },
  {
    name: "Elena Rodriguez",
    role: "Director",
    avatar: "/sa-m.png",
  },
];
