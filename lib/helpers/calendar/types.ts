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
    | "class"
    | "meeting"
    | "exam"
    | "quiz"

export type UiNamedItem = {
    uuid?: string;
    name: string;
};

export type DbNamedItem = {
    uuid: string;
    name: string;
};