import React from "react";

export interface ClassSession {
  section: string;
  subject: string;
  students: number;
  semester: string;
}

interface SessionTableProps {
  sessions: ClassSession[];
}

const SessionTable: React.FC<SessionTableProps> = ({ sessions }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100/80">
            <th className="px-6 py-3 text-gray-700 font-semibold text-base">
              Class / Section
            </th>
            <th className="px-6 py-3 text-gray-700 font-semibold text-base">
              Subject
            </th>
            <th className="px-6 py-3 text-gray-700 font-semibold text-base">
              Students
            </th>
            <th className="px-6 py-3 text-gray-700 font-semibold text-base">
              Semester
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sessions.map((session, index) => (
            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-3.5 text-[#525252] text-sm">
                {session.section}
              </td>
              <td className="px-6 py-3.5 text-[#525252] text-sm">
                {session.subject}
              </td>
              <td className="px-6 py-3.5 text-[#525252] text-sm">
                {session.students}
              </td>
              <td className="px-6 py-3.5 text-[#525252] text-sm">
                {session.semester}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
