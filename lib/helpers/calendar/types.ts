export interface Department {
    uuid?: string;
    name: string;
}

export interface Semester {
    uuid?: string;
    name: string;
}

export interface Section {
    uuid?: string;
    name: string;
}

export type CalendarEventType =
    | "class"
    | "meeting"
    | "exam"
    | "quiz"