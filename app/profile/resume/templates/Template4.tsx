"use client";

import { ReactNode } from "react";

export default function ResumeTemplate4() {
  return (
    <div className="bg-white max-w-2xl mx-auto font-sans text-sm shadow-lg px-10 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Aarav Reddy</h1>
        <p className="text-gray-600 text-xs mt-0.5">B.A Graduate | Web Developer</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
          <span>Hyderabad, Telangana</span>
          <span>|</span>
          <span>9012345678</span>
          <span>|</span>
          <span>shravanireddy@gmail.com</span>
          <span>|</span>
          <span>linkedin.com/in/shravanireddy</span>
        </div>
      </div>

      {/* Summary Row */}
      <LabelRow label="Summary">
        <p className="text-gray-700 text-xs leading-relaxed">
          Results-driven Computer Science Engineering student with a strong foundation in software development, data structures, and web technologies. Skilled in full-stack development, problem-solving and collaborative project execution. Passionate about building efficient and scalable digital solutions. Eager to contribute technical expertise and creative ideas to innovative real-world projects that drive meaningful user experiences.
        </p>
      </LabelRow>

      {/* Work Experience */}
      <LabelRow label="Work Experience">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-xs font-bold text-gray-900">Infosys Ltd, Bengaluru</p>
              <span className="text-xs text-gray-500">July 2024 – Oct 2024</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li className="flex gap-1.5"><span>•</span>Developed and maintained scalable web applications using React.js, Node.js, and Express.</li>
              <li className="flex gap-1.5"><span>•</span>Designed restful APIs to integrate backend services with front-end systems.</li>
              <li className="flex gap-1.5"><span>•</span>Collaborated with cross-functional teams to implement new product features and fix critical bugs in production.</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-xs font-bold text-gray-900">TCS Digital Labs, Bengaluru</p>
              <span className="text-xs text-gray-500">Jan 2024 – June 2024</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li className="flex gap-1.5"><span>•</span>Built a student performance tracking system using React.js and Firebase to visualize academic insights.</li>
              <li className="flex gap-1.5"><span>•</span>Designed modular components and improved reusability by following component-driven architecture.</li>
              <li className="flex gap-1.5"><span>•</span>Integrated Google APIs for authentication and cloud data sync, increasing reliability by 35%.</li>
            </ul>
          </div>
        </div>
      </LabelRow>

      {/* Education */}
      <LabelRow label="Education">
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between items-baseline">
              <p className="font-bold text-gray-900">Bachelor Of Technology (B.Tech) CSE</p>
              <span className="text-gray-500">2028-2026</span>
            </div>
            <p className="text-gray-600">RV College of Engineering, Bengaluru</p>
            <p className="text-gray-600">Percentage : 85%</p>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <p className="font-bold text-gray-900">Senior Secondary (Class XII) – <em>MPC (Mathematics, Physics, Chemistry)</em></p>
              <span className="text-gray-500">2028-2026</span>
            </div>
            <p className="text-gray-600">Narayana Junior College, Himayatnagar, Hyderabad, Telangana</p>
            <p className="text-gray-600">Percentage : 63%</p>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <p className="font-bold text-gray-900">Secondary (Class X) – SSC</p>
              <span className="text-gray-500">2028-2026</span>
            </div>
            <p className="text-gray-600">Sri Chaitanya High School, Dilsukhnagar, Hyderabad, Telangana</p>
            <p className="text-gray-600">CGPA : 8.7%</p>
          </div>
        </div>
      </LabelRow>

      {/* Key Skills */}
      <LabelRow label="Key Skills">
        <ul className="text-xs text-gray-700 space-y-1">
          <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
          <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
          <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
          <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
          <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
        </ul>
      </LabelRow>

      {/* Projects */}
      <LabelRow label="Projects">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-gray-800 text-xs">DigiCampus – College Management Portal</span>
            <span className="text-gray-400 text-xs">| React.js, Firebase, Node.js</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-0.5 mb-1">
            <li className="flex gap-1.5"><span>•</span>Built a centralized digital platform for students and faculty to manage attendance, assignments, and performance data.</li>
            <li className="flex gap-1.5"><span>•</span>Designed the UI/UX and implemented role-based access authentication.</li>
            <li className="flex gap-1.5"><span>•</span>Improved task tracking efficiency by 45%.</li>
          </ul>
          <p className="text-xs text-blue-600">🔗 GitHub: github.com/shravanireddy/digicampus</p>
        </div>
      </LabelRow>
    </div>
  );
}

function LabelRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 mb-5 border-t border-gray-100 pt-4">
      <div className="w-28 shrink-0">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
      </div>
      <div className="flex-1 border-l-2 border-gray-300 pl-4">
        {children}
      </div>
    </div>
  );
}