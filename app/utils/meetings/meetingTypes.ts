export interface Meeting {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM (24-hour format internally for sorting/positioning) or "HH:MM AM/PM"
    endTime: string; // HH:MM
    organizer: string;
    organizerAvatar?: string | null;
    type: "Internal" | "External" | "Staff" | "Management" | "Class" | "Exam" | "Meeting" | string;
    agenda: string;
    attendees: string[];
    meetingLink?: string;
    platform?: 'Google Meet' | 'Zoom Meeting' | 'Others';
    zoomId?: string;
    zoomPassword?: string;
    collegeId?: number; // Added for optional college-based filtering later
    userId?: number; // Added for user-specific meetings filtering
    isEditable?: boolean;
    createdBy?: number;
    participantDetails?: {
        userId: number;
        name: string;
        role: string;
        avatar: string | null;
    }[];
}
