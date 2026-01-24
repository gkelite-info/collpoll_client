// "use client";

// import ProjectCard from "./ProjectCard";

// interface ProjectGridProps {
//   department: string;
// }

// const PROJECTS = [
//   {
//     title: "AI-Based Attendance System",
//     department: "CSE",
//     type: "Mobile App",
//     description:
//       "Automated facial recognition attendance app using Python & OpenCV",
//     duration: "11/01/2025 – 25/01/2025",
//     tech: "Python, Flask, OpenCV, MySQL",
//     mentor: "Dr. Anjani Verma",
//     marks: "9.2 / 10",
//     status: "Completed",
//   },
//   {
//     title: "Online Voting System",
//     department: "CSE",
//     type: "Mobile App",
//     description:
//       "A secure web app allowing students to vote online using OTP verification",
//     duration: "Oct 2024 – Dec 2024",
//     tech: "HTML, CSS, PHP, MySQL",
//     mentor: "Prof. Ramesh Naidu",
//     marks: "8.7 / 10",
//     status: "Completed",
//   },
//   {
//     title: "Smart Home IoT Controller",
//     department: "IT",
//     type: "Mobile App",
//     description:
//       "IoT-based system to control home appliances via web & voice commands",
//     duration: "Feb 2025 – Jun 2025",
//     tech: "NodeMCU, Arduino IDE, Firebase",
//     mentor: "Dr. Anjani Verma",
//     marks: "9.2 / 10",
//     status: "Completed",
//   },
// ];

// export default function ProjectGrid({ department }: ProjectGridProps) {
//   const filteredProjects = PROJECTS.filter(
//     (p) => p.department === department
//   );

//   if (filteredProjects.length === 0) {
//     return (
//       <div className="mt-10 text-center text-gray-400">
//         No projects found for {department}
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {filteredProjects.map((project, idx) => (
//         <ProjectCard key={idx} {...project} />
//       ))}
//     </div>
//   );
// }
