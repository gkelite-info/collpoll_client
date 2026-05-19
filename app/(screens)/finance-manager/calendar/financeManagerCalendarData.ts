import { CalendarEvent } from "./types";

export const FINANCE_MANAGER_WEEK_DAYS = [
  { day: "MON", date: 24, fullDate: "2026-01-24" },
  { day: "TUE", date: 25, fullDate: "2026-01-25" },
  { day: "WED", date: 26, fullDate: "2026-01-26" },
  { day: "THU", date: 27, fullDate: "2026-01-27" },
  { day: "FRI", date: 28, fullDate: "2026-01-28" },
  { day: "SAT", date: 29, fullDate: "2026-01-29" },
];

export const MOCK_PARTICIPANTS = [
  { 
    id: 1, 
    name: "Shravani", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" 
  },
  { 
    id: 2, 
    name: "Rohan Sharma", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" 
  },
  { 
    id: 3, 
    name: "Ananya Verma", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop" 
  },
  { 
    id: 4, 
    name: "Karthik Reddy", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" 
  },
  { 
    id: 5, 
    name: "Sneha Patel", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" 
  },
  { 
    id: 6, 
    name: "Arjun Mehta", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" 
  },
  { 
    id: 7, 
    name: "Pooja Nair", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop" 
  },
  { 
    id: 8, 
    name: "Nikhil Jain", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" 
  },
  { 
    id: 9, 
    name: "Aishwarya Kulkarni", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" 
  },
  { 
    id: 10, 
    name: "Rahul Singh", 
    participantId: "5478246", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" 
  },
];

export const STATIC_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Meeting with Admin",
    calendarEventId: 43269,
    type: "meeting",
    startTime: "2026-05-11T08:00",
    endTime: "2026-05-11T09:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "MON 11",
    participantName: "Shravani",
    participantId: "43269",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
  {
    id: "2",
    title: "Meeting with Admin",
    calendarEventId: 43270,
    type: "meeting",
    startTime: "2026-05-11T10:00",
    endTime: "2026-05-11T11:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "MON 11",
    participantName: "Dr. Anil Kumar",
    participantId: "43270",
    participantAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
  {
    id: "3",
    title: "Meeting with Admin",
    calendarEventId: 43271,
    type: "meeting",
    startTime: "2026-05-12T08:00",
    endTime: "2026-05-12T09:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "TUE 12",
    participantName: "Shravani",
    participantId: "43269",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
  {
    id: "4",
    title: "Meeting with Admin",
    calendarEventId: 43272,
    type: "meeting",
    startTime: "2026-05-12T11:00",
    endTime: "2026-05-12T12:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "TUE 12",
    participantName: "Dr. Anil Kumar",
    participantId: "43270",
    participantAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
  {
    id: "5",
    title: "Meeting with Admin",
    calendarEventId: 43273,
    type: "meeting",
    startTime: "2026-05-13T08:00",
    endTime: "2026-05-13T09:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "WED 13",
    participantName: "Shravani",
    participantId: "43269",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
  {
    id: "6",
    title: "CSE Teach Design Principles",
    calendarEventId: 43274,
    type: "class",
    startTime: "2026-05-13T12:00",
    endTime: "2026-05-13T13:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "WED 13",
    participantName: "Dr. Anil Kumar",
    participantId: "43270",
    participantAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
  {
    id: "7",
    title: "Meeting with Admin",
    calendarEventId: 43275,
    type: "meeting",
    startTime: "2026-05-14T08:00",
    endTime: "2026-05-14T09:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "THU 14",
    participantName: "Shravani",
    participantId: "43269",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
  {
    id: "8",
    title: "CSE Teach Design Principles",
    calendarEventId: 43276,
    type: "class",
    startTime: "2026-05-14T09:00",
    endTime: "2026-05-14T10:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "THU 14",
    participantName: "Dr. Anil Kumar",
    participantId: "43270",
    participantAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
  {
    id: "9",
    title: "Meeting with Admin",
    calendarEventId: 43277,
    type: "meeting",
    startTime: "2026-05-15T08:00",
    endTime: "2026-05-15T09:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "FRI 15",
    participantName: "Shravani",
    participantId: "43269",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
  {
    id: "10",
    title: "CSE Teach Design Principles",
    calendarEventId: 43278,
    type: "class",
    startTime: "2026-05-16T09:00",
    endTime: "2026-05-16T10:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "SAT 16",
    participantName: "Dr. Anil Kumar",
    participantId: "43270",
    participantAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
  {
    id: "11",
    title: "Quarterly Budget Review",
    calendarEventId: 43279,
    type: "meeting",
    startTime: "2026-05-16T08:00",
    endTime: "2026-05-16T09:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "SAT 16",
    participantName: "Shravani",
    participantId: "43269",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
  {
    id: "12",
    title: "Student Fee Audit",
    calendarEventId: 43280,
    type: "meeting",
    startTime: "2026-05-16T10:00",
    endTime: "2026-05-16T11:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "SAT 16",
    participantName: "Rohan Sharma",
    participantId: "5478246",
    participantAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
  {
    id: "13",
    title: "Vendor Payment Follow-up",
    calendarEventId: 43281,
    type: "meeting",
    startTime: "2026-05-16T13:00",
    endTime: "2026-05-16T14:00",
    year: "All",
    branch: "All",
    section: "All",
    day: "SAT 16",
    participantName: "Aishwarya Kulkarni",
    participantId: "5478246",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  },
];
