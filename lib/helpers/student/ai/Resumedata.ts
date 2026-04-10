// ─── Resume Templates Data ───────────────────────────────────────────────────
// Shared sample data injected into all templates
export const SAMPLE_DATA = {
  name: "Aarav Reddy",
  title: "B.A Graduate | Web Developer | Problem Solver",
  email: "AaravReddy@Gmail.Com",
  phone: "+91 98765 43210",
  linkedin: "Https://Www.Linkedin.Com/In/Aarav-Reddy",
  github: "Https://Github.Com/Aaravreddy",
  location: "Hyderabad, Telangana",
  photo: "/profile-photo.jpg", // replace with real path

  summary:
    "A Passionate Computer Science Student With A Strong Interest In Software Development And Problem-Solving, And Continuously Learn New Technologies To Grow As A Developer.",

  education: [
    {
      level: "State Board Of Secondary Education",
      school: "Joseph's High School",
      years: "2018–2026",
      percentage: "88%",
    },
    {
      level: "Under Graduate",
      school: "Malla Reddy Engineering College, 2025 – 2028",
      years: "2025–2028",
      percentage: "8.5",
    },
  ],

  internship: {
    company: "Google",
    role: "Software Developer Intern",
    description: "Internal Dashboard Optimization\nWeb Development",
    period: "01/06/2024 – 31/08/2024",
    github: "Https://Github.Com/Aaravreddy/Google-Internship",
  },

  accomplishments: {
    awards: ["Best Project Award – Final Year Project", "Academic Excellence Award (2023)"],
    clubs: ["Technical Club Member", "College Coding Society"],
    certifications: ["Python For Everybody – Coursera"],
    competitiveExams: ["GATE (Appeared)", "TCS CodeVita (Participant)"],
  },

  skills: {
    technical: ["HTML, CSS, JavaScript", "Python (Basics)", "SQL", "Web Development"],
    soft: ["Communication", "Teamwork", "Problem Solving"],
  },

  languages: ["English", "Telugu", "Hindi"],

  experience: [
    {
      company: "Infosys Ltd, Bengaluru",
      role: "Software Development Intern",
      period: "July 2024 – Oct 2024",
      points: [
        "Developed and maintained scalable web applications using React.js, Node.js, and Express.",
        "Designed RESTful APIs to integrate backend services with front-end systems.",
        "Collaborated with cross-functional teams to implement new product features and fix critical bugs in production.",
        "Automated testing and deployment pipelines using Jenkins and Git, reducing manual deployment effort by 40%.",
        "Conducted code reviews and performance optimization to ensure high-quality deliverables.",
      ],
    },
    {
      company: "TCS Digital Labs, Bengaluru",
      role: "Software Development Intern",
      period: "Jan 2024 – June 2024",
      points: [
        "Built a student performance tracking system using React.js and Firebase to visualize academic insights.",
        "Designed modular components and improved reusability by following component-driven architecture.",
        "Integrated Google APIs for authentication and real-time data sync, increasing reliability by 30%.",
        "Conducted unit testing using Jest and Postman, ensuring high-quality out-come of all API integrations.",
      ],
    },
  ],

  projects: [
    {
      name: "DigiCampus – College Management Portal",
      tech: "React.js, Firebase, Redux",
      points: [
        "Built a centralized platform for students and faculty to manage attendance, assignments, and performance data.",
        "Designed the UI/UX and implemented role-based access authentication.",
        "Improved task handling efficiency by 45%.",
      ],
      github: "Https://github.com/AaravReddy/DigiCampus",
    },
  ],

  researchPapers: [
    {
      title: "AI-Powered Student Performance Prediction Using Machine Learning Algorithms",
      points: [
        "Conducted research on predicting academic outcomes using Random Forest and Support Vector Machine (SVM) models.",
        "Improved an accuracy rate of 92.6% using optimized feature selection and dataset preprocessing.",
      ],
    },
  ],

  additionalInfo: {
    languages: "English, French, Mandarin",
    certifications:
      "Professional Design Engineering (PDF), License, Project Management cert (PDF)",
  },
};

export type ResumeData = typeof SAMPLE_DATA;