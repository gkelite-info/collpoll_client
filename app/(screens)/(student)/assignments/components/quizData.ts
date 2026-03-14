export const MOCK_QUESTIONS = [
    {
        id: 1,
        question: "Q1. Which of the following is not a valid CPU scheduling algorithm?",
        options: ["Round Robin", "Shortest Job Next", "FCFS (First Come First Serve)", "Bubble Sort"],
        correctAnswer: "Bubble Sort"
    },
    {
        id: 2,
        question: "Q2. Which scheduling algorithm allocates the CPU first to the process that requests the CPU first?",
        options: ["Round Robin", "Shortest Job Next", "FCFS (First Come First Serve)", "Priority Scheduling"],
        correctAnswer: "FCFS (First Come First Serve)"
    },
    {
        id: 3,
        question: "Q3. Time quantum is defined in which scheduling algorithm?",
        options: ["Shortest Job Next", "Round Robin", "Priority Scheduling", "Multilevel Queue Scheduling"],
        correctAnswer: "Round Robin"
    },
    {
        id: 4,
        question: "Q4. A process is a _______.",
        options: ["program in high level language", "contents of main memory", "program in execution", "job in secondary memory"],
        correctAnswer: "program in execution"
    },
    {
        id: 5,
        question: "Q5. What is the full form of PCB?",
        options: ["Process Control Block", "Process Communication Block", "Process Context Block", "Process Command Block"],
        correctAnswer: "Process Control Block"
    },
    {
        id: 6,
        question: "Q6. Context switching is _______.",
        options: ["part of polling", "saving the state of the old process and loading the saved state of the new process", "part of spooling", "interrupt handling"],
        correctAnswer: "saving the state of the old process and loading the saved state of the new process"
    },
    {
        id: 7,
        question: "Q7. A deadlock occurs when _______.",
        options: ["processes are starved", "processes are sleeping", "processes wait for each other to release resources", "process is terminated"],
        correctAnswer: "processes wait for each other to release resources"
    },
    {
        id: 8,
        question: "Q8. Which of the following is a synchronization tool?",
        options: ["Thread", "Pipe", "Semaphore", "Socket"],
        correctAnswer: "Semaphore"
    },
    {
        id: 9,
        question: "Q9. Virtual memory is _______.",
        options: ["large secondary memory", "large main memory", "illusion of a large main memory", "None of the above"],
        correctAnswer: "illusion of a large main memory"
    },
    {
        id: 10,
        question: "Q10. Thrashing occurs when _______.",
        options: ["page fault rate is high", "page fault rate is low", "process is blocked", "process completes execution"],
        correctAnswer: "page fault rate is high"
    }
];

// Mocking the user's past attempt (Score 25/30: 8 Correct, 1 Wrong, 1 Unanswered)
export const MOCK_USER_ANSWERS: Record<number, string> = {
    1: "Bubble Sort", // Correct
    2: "Round Robin", // Wrong
    4: "program in execution", // Correct
    5: "Process Control Block", // Correct
    6: "saving the state of the old process and loading the saved state of the new process", // Correct
    7: "processes wait for each other to release resources", // Correct
    8: "Semaphore", // Correct
    9: "illusion of a large main memory", // Correct
    10: "page fault rate is high" // Correct
    // Question 3 is unanswered
};

export const STATIC_ONGOING_QUIZZES = [
    { id: 1, courseName: "Operating Systems", topic: "Process Scheduling & Deadlocks", facultyName: "Dr. Priya Sharma", attemptsLeft: 3, quizDuration: "07/01/2025", timeLimit: "30 mins", bgColor: "bg-[#481451]" },
    { id: 2, courseName: "Web Technologies", topic: "Process Scheduling & Deadlocks", facultyName: "Dr. Priya Sharma", attemptsLeft: 3, quizDuration: "07/01/2025", timeLimit: "30 mins", bgColor: "bg-[#182142]" },
    { id: 3, courseName: "Data Structures", topic: "Process Scheduling & Deadlocks", facultyName: "Dr. Priya Sharma", attemptsLeft: 3, quizDuration: "07/01/2025", timeLimit: "30 mins", bgColor: "bg-[#1B1A40]" },
    { id: 4, courseName: "Database Management Systems", topic: "Process Scheduling & Deadlocks", facultyName: "Dr. Priya Sharma", attemptsLeft: 3, quizDuration: "07/01/2025", timeLimit: "30 mins", bgColor: "bg-[#1D17A]" }
];

export const STATIC_ATTEMPTED_QUIZZES = [
    { id: 1, courseName: "Operating Systems", topic: "Process Scheduling & Deadlocks", facultyName: "Dr. Priya Sharma", attemptedOn: "08/01/2025", questionsAttempted: "28/30", attemptsUsed: "1 of 3", score: "25/30", percentage: 83, correct: 25, wrong: 3, unanswered: 2, total: 30, bgColor: "bg-[#481451]" },
    { id: 2, courseName: "Web Technologies", topic: "HTML, CSS & JavaScript Basics", facultyName: "Dr. Priya Sharma", attemptedOn: "08/01/2025", questionsAttempted: "30/30", attemptsUsed: "1 of 3", score: "28/30", percentage: 93, correct: 28, wrong: 2, unanswered: 0, total: 30, bgColor: "bg-[#182142]" }
];