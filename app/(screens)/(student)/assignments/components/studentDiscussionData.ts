const MOCK_DETAILS = {
    overview: "Artificial Intelligence is rapidly transforming the education sector by improving learning experiences, automating administrative tasks, and providing personalized learning paths for students.\nIn this project, students will explore how AI technologies such as machine learning, intelligent tutoring systems, and automated grading are being used in modern educational environments.",
    objectives: [
        "Understand the role of Artificial Intelligence in education systems",
        "Analyze how AI can improve student engagement and personalized learning",
        "Explore AI tools used in modern educational platforms",
        "Conduct research and present findings effectively",
        "Collaborate with peers to build research-based solutions"
    ],
    requirements: [
        {
            title: "1. Research Phase",
            desc: "Study the provided PDF documents and additional online resources to understand the fundamentals of AI in education.\nTopics to explore:\n• AI-powered tutoring systems\n• Automated grading systems\n• Personalized learning algorithms\n• AI chatbots for student assistance\n• Predictive analytics in education"
        },
        {
            title: "2. Team Formation",
            desc: "Students must form groups of 3 members.\n• Automated grading systems\n• Personalized learning algorith"
        },
        {
            title: "3. Final Deliverables",
            desc: "Research Report (5-8 pages)\n• Presentation Slides (PPT/PDF)\n• Optional prototype or demonstration"
        },
    ]
};

export const STATIC_STUDENT_ACTIVE_DISCUSSIONS = Array.from({ length: 8 }, (_, i) => ({
    id: `active-disc-${i + 1}`,
    title: "AI in Education",
    subtitle: "Research topic \"Impact of AI on Education\"\nFollow the project guidelines in the attached document.",
    facultyName: "Dr. Priya Sharma",
    uploadedOn: "07/01/2025",
    attachments: ["Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf"],
    details: MOCK_DETAILS
}));

export const STATIC_STUDENT_COMPLETED_DISCUSSIONS = Array.from({ length: 8 }, (_, i) => ({
    id: `comp-disc-${i + 1}`,
    title: "AI in Education",
    subtitle: "Research topic \"Impact of AI on Education\"\nFollow the project guidelines in the attached document.",
    facultyName: "Dr. Priya Sharma",
    uploadedOn: "07/01/2025",
    attachments: ["Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf", "Project Guidelines.pdf"],
    uploadedFiles: [
        { name: "Ai in education.pdf", size: "60 KB" },
        { name: "Ai in education.pdf2", size: "60 KB" }
    ],
    details: MOCK_DETAILS
}));