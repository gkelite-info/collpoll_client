"use client";

export default function ResumeTemplate1() {
  return (
    <div className="bg-white max-w-2xl mx-auto font-sans text-sm shadow-lg">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex items-start justify-between border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Aarav Reddy</h1>
          <p className="text-gray-500 text-xs mt-1">B.A Graduate | Web Developer | Problem Solver</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden shrink-0 ml-4">
          <img src="/avatar.jpg" alt="Profile" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-gray-600 text-xl font-bold">AR</div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="px-8 py-4 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Profile Summary</h2>
        <p className="text-gray-600 leading-relaxed text-xs">
          A Passionate Computer Science Student With A Strong Interest In Software Development And Problem-Solving. And Continuously Learn New Technologies To Grow As A Developer.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex">
        {/* Left Column */}
        <div className="w-2/5 px-6 py-4 border-r border-gray-100 space-y-6">
          {/* Personal Details */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Personal Details</h2>
            <div className="space-y-1 text-gray-600 text-xs">
              <p>Aarav.Reddy@Gmail.Com</p>
              <p>+91 98765 43210</p>
              <p>Https://Www.Linkedin.Com/In/Aarav-Reddy</p>
              <p>Hyderabad, Telangana</p>
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Education</h2>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-gray-500">State Board Of Secondary Education</p>
                <p className="font-medium text-gray-800">Joseph's High School</p>
                <p className="text-gray-500">2018 - 2026</p>
                <p className="text-gray-500">88%</p>
              </div>
              <div>
                <p className="text-gray-500">Under Graduate</p>
                <p className="font-medium text-gray-800">Malla Reddy Engineering College.</p>
                <p className="text-gray-500">2025 – 2028</p>
                <p className="text-gray-500">8.5</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Skills</h2>
            <div className="text-xs space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Technical Skills</p>
                <p className="text-gray-600">HTML, CSS, JavaScript</p>
                <p className="text-gray-600">Python (Basics)</p>
                <p className="text-gray-600">SQL</p>
                <p className="text-gray-600">Web Development</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Soft Skills</p>
                <p className="text-gray-600">Communication</p>
                <p className="text-gray-600">Teamwork</p>
                <p className="text-gray-600">Problem Solving</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-3/5 px-6 py-4 space-y-6">
          {/* Internship */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Internship</h2>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-gray-800">Google</p>
              <p className="text-gray-600">Software Developer Intern</p>
              <p className="text-gray-600">Internal Dashboard Optimization</p>
              <p className="text-gray-600">Bangalore</p>
              <p className="text-gray-600">Web Development</p>
              <p className="text-gray-500">01/06/2024 - 31/08/2024</p>
              <p className="text-blue-600 break-all">Https://Github.Com/Aaravreddy/Google-Internship</p>
            </div>
          </div>

          {/* Accomplishments */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Accomplishments</h2>
            <div className="text-xs space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Awards</p>
                <ul className="text-gray-600 space-y-0.5">
                  <li className="flex items-start gap-1"><span>•</span><span>Best Project Award – Final Year Project</span></li>
                  <li className="flex items-start gap-1"><span>•</span><span>Academic Excellence Award (2023)</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Clubs & Committees</p>
                <ul className="text-gray-600 space-y-0.5">
                  <li className="flex items-start gap-1"><span>•</span><span>Technical Club Member</span></li>
                  <li className="flex items-start gap-1"><span>•</span><span>College Coding Society</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Certifications</p>
                <ul className="text-gray-600 space-y-0.5">
                  <li className="flex items-start gap-1"><span>•</span><span>Python For Everybody – Coursera</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Competitive Exams</p>
                <ul className="text-gray-600 space-y-0.5">
                  <li className="flex items-start gap-1"><span>•</span><span>GATE (Appeared)</span></li>
                  <li className="flex items-start gap-1"><span>•</span><span>TCS CodeVita (Participant)</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Languages</h2>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li className="flex items-center gap-1"><span>•</span>English</li>
              <li className="flex items-center gap-1"><span>•</span>Telugu</li>
              <li className="flex items-center gap-1"><span>•</span>Hindi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}