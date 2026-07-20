export interface Meeting {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM (24-hour format internally for sorting/positioning) or "HH:MM AM/PM"
    endTime: string; // HH:MM
    organizer: string;
    type: "Internal" | "External" | "Staff" | "Management";
    agenda: string;
    attendees: string[];
    meetingLink?: string;
    collegeId?: number; // Added for optional college-based filtering later
    isEditable?: boolean;
}
