export const STATIC_ACTIVE_QUIZZES = Array.from({ length: 8 }, (_, i) => ({
    id: `active-${i + 1}`,
    title: "Deadlocks",
    subtitle: "Avoidance & Detection Techniques",
    duration: "11/01/2025 - 25/01/2025",
    totalQuestions: 10,
    totalMarks: 30
}));

export const STATIC_DRAFT_QUIZZES = Array.from({ length: 8 }, (_, i) => ({
    id: `draft-${i + 1}`,
    title: "Memory Management",
    subtitle: "Paging & Segmentation Concepts",
    duration: "Unscheduled",
    totalQuestions: 15,
    totalMarks: 45
}));

export const STATIC_COMPLETED_QUIZZES = Array.from({ length: 8 }, (_, i) => ({
    id: `completed-${i + 1}`,
    title: "Process Synchronization",
    subtitle: "Semaphores & Mutex Locks",
    duration: "01/12/2024 - 15/12/2024",
    totalQuestions: 20,
    totalMarks: 60
}));