export interface RoleMeeting {
    id: string;
    category: string;
    title: string;
    timeRange: string;
    educationType: string;
    branch: string;
    description: string;
    date: string;
    participants: number;
    year: string;
    section: string;
    tags: string;
    type: string;
    meetingLink: string;
    sections?: any[];
    hostName?: string;
    hostImage?: string;
    subject?: string;
    
    financeMeetingId?: number;
    financeMeetingSectionsId?: number;
    hrMeetingId?: number;
    hrMeetingSectionsId?: number;
    
    fromTime?: string;
    toTime?: string;
    rawDate?: string;
    participantAvatars?: string[];
}
