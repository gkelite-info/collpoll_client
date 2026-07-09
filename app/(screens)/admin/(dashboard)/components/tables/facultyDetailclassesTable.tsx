import React from "react";
import { TableShimmer } from "../../utils/TableShimmer";

export interface ClassSession {
  section: string;
  subject: string;
  students: number;
}

interface SessionTableProps {
  sessions: ClassSession[];
  loading?: boolean;
}

const SessionTable: React.FC<SessionTableProps> = ({ sessions, loading }) => {
  return (
    <div className="relative w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <TableShimmer columns={3} rows={3} />
          ) : sessions.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                No classes assigned to this faculty.
              </td>
            </tr>
          ) : (
            sessions.map((session, index) => (
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
