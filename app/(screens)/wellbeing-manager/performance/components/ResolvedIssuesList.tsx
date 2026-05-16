"use client";

import { CaretDown, ListDashes, FilePdf } from "@phosphor-icons/react";

export default function ResolvedIssuesList() {
  const issues = [
    {
      id: 1,
      title: "Projector not working in CR - 2",
      category: "Infrastructure",
      priority: "Urgent",
      date: "03/27/2026",
      desc: "The projector in Classroom CR-2 is not working and is unable to display content during lectures. Faculty tried reconnecting the cables and restarting the system, but the issue still persists. This is affecting ongoing classes, so maintenance support is required as soon as possible.",
      attachments: [{ name: "Project_error.jpg", size: "60 KB" }, { name: "Project_error.jpg2", size: "60 KB" }]
    },
    {
      id: 2,
      title: "AC cooling issue in Faculty Room 3",
      category: "Infrastructure",
      priority: "High",
      date: "03/28/2026",
      desc: "The air conditioning unit is making a loud noise and not cooling effectively. Multiple faculty members have reported discomfort. Requires urgent technician check.",
      attachments: [{ name: "AC_Unit_Panel.jpg", size: "1.2 MB" }]
    }
  ];

  return (
    <div className="flex flex-col gap-4 shrink-0 mb-4">
      <h2 className="text-[18px] mt-2 -mb-2 font-bold text-[#16284F]">Resolved Issues</h2>
      
      <div className="flex flex-col gap-6">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-gray-50 pb-5">
              <div className="flex items-center gap-3 bg-[#E8F8EF] px-3.5 py-2 rounded-lg">
                <ListDashes size={20} color="#43C17A" weight="bold" />
                <span className="text-[14px] font-extrabold text-[#16284F]">Issue Details</span>
              </div>
              <button className="flex justify-center items-center gap-1.5 bg-[#43C17A] text-white text-[13px] font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-[#34A362] transition-colors w-full sm:w-auto">
                Resolved <CaretDown size={16} weight="bold" />
              </button>
            </div>

            <h3 className="text-[18px] font-bold text-[#16284F] mb-4">{issue.title}</h3>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#16284F]">Category :</span>
                <span className="px-3 py-1 rounded-[6px] bg-gray-50 font-bold text-gray-600 border border-gray-200 text-[12px]">{issue.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#16284F]">Priority :</span>
                <span className="px-3 py-1 rounded-[6px] bg-white border border-gray-200 font-bold text-gray-600 shadow-sm text-[12px]">{issue.priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#16284F]">Date Reported :</span>
                <span className="px-3 py-1 rounded-[6px] bg-white border border-gray-200 font-bold text-gray-600 shadow-sm text-[12px]">{issue.date}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 mb-5">
              <span className="text-[13px] font-bold text-[#16284F] flex-shrink-0 pt-0.5">Description :</span>
              <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
                {issue.desc}
              </p>
            </div>

            {issue.attachments.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <span className="text-[13px] font-bold text-[#16284F] flex-shrink-0 pt-3">Attachments :</span>
                <div className="flex flex-wrap gap-3 w-full">
                  {issue.attachments.map((file, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-[10px] p-2 flex items-center gap-3 w-full sm:w-[200px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer">
                      <div className="bg-[#FFE4E4] p-2 rounded-[8px] text-[#EF4444]">
                        <FilePdf size={24} weight="fill" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[13px] font-bold text-[#16284F] truncate">{file.name}</p>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">{file.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}