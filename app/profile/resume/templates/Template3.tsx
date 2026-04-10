"use client";

import { ReactNode } from "react";

export default function ResumeTemplate3() {
  return (
    <div className="bg-white max-w-2xl mx-auto font-sans text-sm shadow-lg px-10 py-8">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Aarav Reddy</h1>
        <p className="text-gray-600 text-xs font-medium mt-0.5">B.A Graduate | Web Developer | Problem Solver</p>
      </div>
      <div className="flex items-center gap-5 text-xs text-gray-500 mb-5 flex-wrap">
        <span>📍 Hyderabad, Telangana</span>
        <span>📞 9012345678</span>
        <span>✉️ shravanireddy@gmail.com</span>
        <span>🔗 linkedin.com/in/shravanireddy</span>
      </div>

      {/* Summary */}
      <GraySection title="Summary">
        <p className="text-gray-700 text-xs leading-relaxed">
          Results-driven Computer Science Engineering student with a strong foundation in software development, data structures, and web technologies. Skilled in full-stack development, problem-solving, and collaborative project execution. Passionate about building efficient and scalable digital solutions. Eager to contribute technical expertise and creative ideas to innovative real-world projects that drive meaningful user experiences.
        </p>
      </GraySection>

      {/* Technical Skills */}
      <GraySection title="Technical Skills">
        <ul className="text-xs text-gray-700 space-y-1">
          <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
          <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
          <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
          <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
          <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
        </ul>
      </GraySection>

      {/* Professional Experience */}
      <GraySection title="Professional Experience">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <p className="text-xs font-bold text-gray-900">Infosys Ltd, Bengaluru</p>
              <span className="text-xs text-gray-500">July 2024 – Oct 2024</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
              <li className="flex gap-1.5"><span>•</span>Developed and maintained scalable web applications using React.js, Node.js, and Express.</li>
              <li className="flex gap-1.5"><span>•</span>Designed restful APIs to integrate backend services with front-end systems.</li>
              <li className="flex gap-1.5"><span>•</span>Collaborated with cross-functional teams to implement new product features and fix critical bugs in production.</li>
              <li className="flex gap-1.5"><span>•</span>Automated testing and deployment pipelines using Jenkins and Git, reducing manual deployment effort by 40%.</li>
              <li className="flex gap-1.5"><span>•</span>Conducted code reviews and performance optimization to ensure high-quality deliverables.</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <p className="text-xs font-bold text-gray-900">TCS Digital Labs, Bengaluru</p>
              <span className="text-xs text-gray-500">Jan 2024 – June 2024</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
              <li className="flex gap-1.5"><span>•</span>Built a student performance tracking system using React.js and Firebase to visualize academic insights.</li>
              <li className="flex gap-1.5"><span>•</span>Designed modular components and improved reusability by following component-driven architecture.</li>
              <li className="flex gap-1.5"><span>•</span>Integrated Google APIs for authentication and cloud data sync, increasing reliability by 35%.</li>
              <li className="flex gap-1.5"><span>•</span>Worked closely with senior engineers to identify and fix performance bottlenecks in web modules.</li>
              <li className="flex gap-1.5"><span>•</span>Conducted unit testing using Jest and Postman, ensuring high-quality and secure API integrations.</li>
            </ul>
          </div>
        </div>
      </GraySection>

      {/* Education */}
      <GraySection title="Education">
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between items-baseline">
              <p className="font-bold text-gray-900">Bachelor of Technology (B.Tech) in Computer Science & Engineering</p>
              <span className="text-gray-500 shrink-0 ml-2">2021 – 2025</span>
            </div>
            <p className="text-gray-600">RV College of Engineering, Bengaluru</p>
            <p className="text-gray-600">Percentage : 85%</p>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <p className="font-bold text-gray-900">Senior Secondary (Class XII) – MPC (Mathematics, Physics, Chemistry)</p>
              <span className="text-gray-500 shrink-0 ml-2">2021 – 2025</span>
            </div>
            <p className="text-gray-600">RV College of Engineering, Bengaluru</p>
            <p className="text-gray-600">Percentage : 85%</p>
          </div>
        </div>
      </GraySection>

      {/* Additional Information */}
      <GraySection title="Additional Information">
        <ul className="text-xs text-gray-700 space-y-1">
          <li><span className="font-semibold">Languages:</span> English, French, Mandarin</li>
          <li><span className="font-semibold">Certifications:</span> Professional Design Engineering (PDF) License, Project Management tech (PMT).</li>
          <li><span className="font-semibold">Certifications:</span> Professional Design Engineering (PDF) License, Project Management tech (PMT).</li>
        </ul>
      </GraySection>
    </div>
  );
}

function GraySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="bg-gray-200 px-3 py-1 mb-3">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}