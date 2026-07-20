import { Meeting } from "./meetingTypes";

// Helper to get a date offset by 'days', strictly skipping weekends
const getWeekdayDate = (daysOffset: number): string => {
    const d = new Date();
    
    // First, if today is weekend, move it to the nearest weekday
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + (daysOffset >= 0 ? 1 : -1));
    }
    
    let remaining = Math.abs(daysOffset);
    const step = daysOffset >= 0 ? 1 : -1;
    
    while (remaining > 0) {
        d.setDate(d.getDate() + step);
        if (d.getDay() !== 0 && d.getDay() !== 6) {
            remaining--;
        }
    }
    
    return d.toISOString().split('T')[0];
};

const collegeMeetings: Meeting[] = [
    {
        id: "c1",
        title: "Management Board Meeting",
        date: getWeekdayDate(0), // Today
        startTime: "14:00",
        endTime: "16:00",
        organizer: "Chairman",
        type: "Management",
        agenda: "Quarterly budget review and strategic planning for the next academic year.",
        attendees: ["Board Members", "College Admin", "Finance Manager"],
        meetingLink: "https://zoom.us/j/123456789",
        isEditable: true
    },
    {
        id: "c2",
        title: "Curriculum Review Committee",
        date: getWeekdayDate(-1), // Yesterday
        startTime: "10:00",
        endTime: "12:00",
        organizer: "Academic Dean",
        type: "Management",
        agenda: "Reviewing proposed changes to the engineering curriculum.",
        attendees: ["Dean", "Department Heads"]
    },
    {
        id: "c3",
        title: "IT Infrastructure Planning",
        date: getWeekdayDate(-2), // Day before yesterday
        startTime: "15:00",
        endTime: "16:00",
        organizer: "IT Head",
        type: "Internal",
        agenda: "Planning network upgrades for the upcoming semester.",
        attendees: ["IT Department", "Network Engineers"]
    },
    {
        id: "c4",
        title: "Faculty Orientation Planning",
        date: getWeekdayDate(1), // Tomorrow
        startTime: "11:00",
        endTime: "12:30",
        organizer: "HR Department",
        type: "Staff",
        agenda: "Finalizing the schedule and resources for the new faculty orientation.",
        attendees: ["HR Team", "Senior Faculty"]
    },
    {
        id: "c5",
        title: "External Vendor Discussion",
        date: getWeekdayDate(2),
        startTime: "11:30",
        endTime: "12:15",
        organizer: "Admin Department",
        type: "External",
        agenda: "Negotiating new contract terms for campus security services.",
        attendees: ["Admin Head", "Vendor Representative", "Security Chief"]
    }
];

const schoolMeetings: Meeting[] = [
    {
        id: "s1",
        title: "Weekly Teachers Sync",
        date: getWeekdayDate(0), // Today
        startTime: "10:00",
        endTime: "11:00",
        organizer: "Principal",
        type: "Staff",
        agenda: "Discuss weekly goals, upcoming events, and general administrative updates.",
        attendees: ["All Teachers", "Principal", "Vice Principal"],
        meetingLink: "https://meet.google.com/abc-defg-hij",
        isEditable: true
    },
    {
        id: "s2",
        title: "Internal Operations Check-in",
        date: getWeekdayDate(-1), // Yesterday
        startTime: "09:00",
        endTime: "09:30",
        organizer: "Operations Manager",
        type: "Internal",
        agenda: "Quick sync on daily operations and facility maintenance status.",
        attendees: ["Operations Team", "Maintenance Head"]
    },
    {
        id: "s3",
        title: "Parent-Teacher Association Connect",
        date: getWeekdayDate(-2), // Day before yesterday
        startTime: "14:30",
        endTime: "15:30",
        organizer: "Student Welfare Officer",
        type: "External",
        agenda: "Discussing student wellbeing initiatives and upcoming events.",
        attendees: ["PTA Members", "Student Welfare Team"]
    },
    {
        id: "s4",
        title: "School Policy Update",
        date: getWeekdayDate(-3), 
        startTime: "13:00",
        endTime: "14:30",
        organizer: "School Director",
        type: "Staff",
        agenda: "Reviewing the new remote learning policy and attendance guidelines.",
        attendees: ["All Staff", "Admin Team"]
    },
    {
        id: "s5",
        title: "Facilities Audit Review",
        date: getWeekdayDate(1), // Tomorrow
        startTime: "09:30",
        endTime: "10:30",
        organizer: "Facilities Manager",
        type: "Internal",
        agenda: "Reviewing the quarterly safety and maintenance audit reports.",
        attendees: ["Facilities Team", "Safety Officer"]
    }
];

export const dummyMeetings: Meeting[] = [...collegeMeetings, ...schoolMeetings];
