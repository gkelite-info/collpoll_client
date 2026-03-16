export const STATIC_ACTIVE_DISCUSSIONS = Array.from({ length: 8 }, (_, i) => ({
    id: `active-disc-${i + 1}`,
    title: i % 2 === 0 ? "AI in Education" : "Future of Web3",
    description: `Research topic "${i % 2 === 0 ? 'Impact of AI on Education' : 'Decentralized Web Architecture'}"\nFollow the project guidelines in the attached document.`,
    uploadedOn: "07/01/2025",
    deadline: "10/01/2025",
    attachments: i % 3 === 0
        ? [
            "Project Guidelines.pdf",
            "Reference Material.pdf",
            "AI Research Notes.pdf",
            "Dataset Documentation.pdf"
        ]
        : ["Project Guidelines.pdf", "Reference Material.pdf"]
}));

export const STATIC_COMPLETED_DISCUSSIONS = Array.from({ length: 8 }, (_, i) => ({
    id: `comp-disc-${i + 1}`,
    title: i % 2 === 0 ? "Operating Systems Design" : "Data Structures Optimization",
    description: `Research topic "${i % 2 === 0 ? 'Kernel Architecture' : 'Graph Algorithms'}"\nReview the final reports submitted by groups.`,
    uploadedOn: "15/11/2024",
    deadline: "30/11/2024",
    attachments: i % 2 === 0
        ? [
            "OS_Project_Details.pdf",
            "Student_Submissions.pdf",
            "Evaluation_Report.pdf",
            "Architecture_Diagram.pdf"
        ]
        : ["OS_Project_Details.pdf"]
}));