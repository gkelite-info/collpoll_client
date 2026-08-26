"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TableShimmer } from "../../utils/TableShimmer";
import { Pagination } from "../../../academic-setup/components/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const paginatedSessions = useMemo(
    () => sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [sessions, currentPage, itemsPerPage],
  );

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(sessions.length / itemsPerPage));
    if (currentPage > lastPage) setCurrentPage(lastPage);
  }, [sessions.length, itemsPerPage, currentPage]);

  return (
    <div className="relative w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-100/80">
            <th className="px-6 py-3 text-gray-700 font-semibold text-base">
              Branch / Section
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
            paginatedSessions.map((session, index) => (
              <tr key={`${session.section}-${session.subject}-${index}`} className="hover:bg-gray-50/50 transition-colors">
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
      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalItems={sessions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemsPerPageOptions={[5, 10, 20]}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
          alwaysShow
          roundedBottom="rounded-b-xl"
        />
      )}
    </div>
  );
};

export default SessionTable;
