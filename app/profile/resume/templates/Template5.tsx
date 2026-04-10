"use client";

import { ReactNode } from "react";

export default function ResumeTemplate5() {
  return (
    <div className="bg-white max-w-2xl mx-auto font-sans text-sm shadow-lg">
      {/* Header with contact info on right */}
      <div className="flex justify-between items-start px-8 pt-8 pb-5 border-b-2 border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase leading-tight">David<br />Anderson</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-medium">B.A Graduate | Web Developer</p>
        </div>
        <div className="text-right text-xs text-gray-600 space-y-1 mt-1">
          <p>📞 9012345678</p>
          <p>✉️ davidanderson@gmail.com</p>
          <p>📍 Hyderabad, Telangana</p>
          <p>🔗 linkedin.com/in/davidanderson</p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* About Me */}
        <Section5 title="About Me">
          <p className="text-gray-700 text-xs leading-relaxed">
            Results-driven Computer Science Engineering student with a strong foundation in software development, data structures, and web technologies. Skilled in full-stack development, problem-solving and collaborative project execution. Passionate about building efficient and scalable digital solutions. Eager to contribute technical expertise and creative ideas to innovative real-world projects that drive meaningful user experiences.
          </p>
        </Section5>

        {/* Experience */}
        <Section5 title="Experience">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-xs font-bold text-gray-900">Infosys Ltd, Bengaluru</p>
                <span className="text-xs text-gray-400">2024 – 2024</span>
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
                <span className="text-xs text-gray-400">2024 – 2024</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li className="flex gap-1.5"><span>•</span>Built a student performance tracking system using React.js and Firebase to visualize academic insights.</li>
                <li className="flex gap-1.5"><span>•</span>Designed modular components and improved reusability by following component-driven architecture.</li>
                <li className="flex gap-1.5"><span>•</span>Integrated Google APIs for authentication and cloud data sync, increasing reliability by 35%.</li>
              </ul>
            </div>
          </div>
        </Section5>

        {/* Education */}
        <Section5 title="Education">
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
        </Section5>

        {/* Key Skills */}
        <Section5 title="Key Skills">
          <ul className="text-xs text-gray-700 space-y-1">
            <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
            <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
            <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
            <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
            <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
          </ul>
        </Section5>

        {/* Additional Information */}
        <Section5 title="Additional Information">
          <ul className="text-xs text-gray-700 space-y-1">
            <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
            <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
            <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
            <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
            <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
          </ul>
        </Section5>
      </div>
    </div>
  );
}

function Section5({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      {children}
    </div>
  );
}