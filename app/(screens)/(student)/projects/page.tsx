"use client";

import { useState } from "react";
import { ProjectCard, ProjectDetailsModal } from "./projectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export type ProjectCardProps = {
  title: string;
  teamMembers: string[];
  description: string;
  duration: string;
  techStack: string;
  mentor: string;
  marks: number;
  attachment: string;
};

const projects: ProjectCardProps[] = [
  {
    title: "Smart Attendance System using Face Recognition",
    description:
      "A web based platform designed to simplify attendance tracking on campus. Faculty can track student presence in real time with secure face recognition.",
    duration: "11/01/2025 - 25/01/2025",
    techStack: "Python, Flask, OpenCV, MySQL",
    mentor: "Shravan Josh",
    marks: 10,
    attachment: "https://example.com/files/project-guide.pdf",
    teamMembers: [
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1525130413817-d45c1d127c42?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=150&q=80",
    ],
  },

  {
    title: "Campus Smart Parking System",
    description:
      "An IoT-based parking automation platform that detects available parking slots using ultrasonic sensors and displays real-time availability on a web dashboard.",
    duration: "10/01/2025 - 24/01/2025",
    techStack: "Arduino, NodeMCU, MQTT, React, Firebase",
    mentor: "Dr. Kavitha Rao",
    marks: 9,
    attachment: "https://example.com/files/smart-parking-report.pdf",
    teamMembers: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop",
    ],
  },

  {
    title: "AI Chatbot for Student Query Assistance",
    description:
      "An NLP-powered chatbot that answers academic and administrative queries for students. It uses a trained intent classification model with contextual replies.",
    duration: "12/01/2025 - 26/01/2025",
    techStack: "Python, TensorFlow, FastAPI, React",
    mentor: "Sunil Patil",
    marks: 10,
    attachment: "https://example.com/files/chatbot-guide.pdf",
    teamMembers: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop",
    ],
  },

  {
    title: "College Event Management Portal",
    description:
      "A centralized platform for registering and managing college events, enabling clubs to host events and students to sign up effortlessly.",
    duration: "09/01/2025 - 22/01/2025",
    techStack: "Next.js, TypeScript, TailwindCSS, MongoDB",
    mentor: "Dr. Shwetha S",
    marks: 8,
    attachment: "https://example.com/files/event-portal-doc.pdf",
    teamMembers: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=150&q=80",
    ],
  },
];

const Page = () => {
  const [selectedProject, setSelectedProject] =
    useState<ProjectCardProps | null>(null);

  return (
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <h1 className="text-black text-2xl font-semibold">
          Projects - CSE 2nd Year
        </h1>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <ProjectCard
        data={projects}
        onViewDetails={(project) => setSelectedProject(project)}
      />

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </main>
  );
};

export default Page;
