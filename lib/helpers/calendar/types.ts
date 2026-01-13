export interface Department {
    id: number;
    name: string;
}

export interface Semester {
    id: number;
    label: string;
}

export interface Section {
    id: number;
    name: string;
}

export type CalendarEventType =
    | "Class"
    | "Meeting"
    | "Exam"
    | "Quiz"