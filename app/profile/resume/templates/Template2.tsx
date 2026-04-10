"use client";

import { ReactNode } from "react";

export default function ResumeTemplate2() {
  return (
    <div className="bg-white max-w-2xl mx-auto font-sans text-sm shadow-lg px-10 py-8">
      {/* Header */}
      <div className="text-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-widest uppercase">Aarav Reddy</h1>
      </div>
      <div className="flex items-center justify-center gap-5 text-xs text-gray-500 mb-6 flex-wrap">
        <span className="flex items-center gap-1">📍 Hyderabad, Telangana</span>
        <span className="flex items-center gap-1">📞 9012345678</span>
        <span className="flex items-center gap-1">✉️ shravanireddy@gmail.com</span>
        <span className="flex items-center gap-1">🔗 linkedin.com/in/shravanireddy</span>
      </div>

      <hr className="border-gray-300 mb-5" />

      {/* Professional Summary */}
      <Section title="Professional Summary">
        <p className="text-gray-600 text-xs leading-relaxed">
          Results-driven Computer Science Engineering student with a strong foundation in software development, data structures, and web technologies. Skilled in full-stack development, problem-solving, and collaborative project execution. Passionate about building efficient and scalable digital solutions. Eager to contribute technical expertise and creative ideas to innovative real-world projects that drive meaningful user experiences, about continuous learning and adapting to emerging technologies in AI, cloud, and automation.
        </p>
      </Section>

      {/* Key Skills */}
      <Section title="Key Skills">
        <ul className="text-xs text-gray-700 space-y-1">
          <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
          <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
          <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
          <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
          <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
        </ul>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        <div className="space-y-4">
          <ExperienceBlock
            company="Hyderabad, Telangana"
            role="Infosys Ltd, Bengaluru"
            date="July 2024 – Oct 2024"
            bullets={[
              "Developed and maintained scalable web applications using React.js, Node.js, and Express.",
              "Designed RESTful APIs to integrate backend services with front-end systems.",
              "Collaborated with cross-functional teams to implement new product features and fix critical bugs in production.",
              "Automated testing and deployment pipelines using Jenkins and Git, reducing manual deployment effort by 40%.",
              "Conducted code reviews and performance optimization to ensure high-quality deliverables.",
            ]}
          />
          <ExperienceBlock
            company="Software Development Intern"
            role="TCS Digital Labs, Bengaluru"
            date="Jan 2024 – June 2024"
            bullets={[
              "Built a student performance tracking system using React.js and Firebase to visualize academic insights.",
              "Designed modular components and improved reusability by following component-driven architecture.",
              "Integrated Google APIs for authentication and cloud data sync, increasing reliability by 35%.",
              "Worked closely with senior engineers to identify and fix performance bottlenecks in web modules.",
              "Conducted unit testing using Jest and Postman, ensuring high-quality and secure API integrations.",
            ]}
          />
        </div>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-gray-800 text-xs">DigiCampus – College Management Portal</span>
            <span className="text-gray-400 text-xs">| React.js, Firebase, Node.js</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-0.5 mb-1">
            <li className="flex gap-1.5"><span>•</span>Built a centralized digital platform for students and faculty to manage attendance, assignments, and performance data.</li>
            <li className="flex gap-1.5"><span>•</span>Designed the UI/UX and implemented role-based access authentication.</li>
            <li className="flex gap-1.5"><span>•</span>Improved task tracking efficiency by 45%.</li>
          </ul>
          <p className="text-xs text-blue-600">🔗 GitHub: github.com/shravanireddy/digicampus</p>
        </div>
      </Section>

      {/* Research Papers */}
      <Section title="Research Papers">
        <div>
          <p className="font-semibold text-gray-800 text-xs mb-1">AI-Powered Student Performance Prediction Using Machine Learning Algorithms</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            <li className="flex gap-1.5"><span>•</span>Conducted research on predicting academic outcomes using Random Forest and Support Vector Machine (SVM) models.</li>
            <li className="flex gap-1.5"><span>•</span>Achieved an accuracy rate of 92.5% using optimized feature selection and dataset preprocessing.</li>
          </ul>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function ExperienceBlock({ company, role, date, bullets }: {
  company: string;
  role: string;
  date: string;
  bullets: string[];
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">{company}</p>
        <span className="text-xs text-gray-500 shrink-0 ml-2">{date}</span>
      </div>
      <p className="text-xs font-semibold text-gray-700 mb-1">{role}</p>
      <ul className="text-xs text-gray-600 space-y-0.5">
        {bullets.map((b: string, i: number) => (
          <li key={i} className="flex gap-1.5"><span>•</span><span>{b}</span></li>
        ))}
      </ul>
    </div>
  );
}