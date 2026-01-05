import React from "react";
import { Pause, Play } from "@phosphor-icons/react";

export interface TableRowData {
  id: string;
  name: string;
  type: string;
  trigger: string;
  status: string;
  lastRun: string;
  nextRun: string;
}

interface RequestTableProps {
  data: TableRowData[];
  onRowClick?: (id: string) => void;
}

const ActiveAutomationsTable: React.FC<RequestTableProps> = ({
  data = [],
  onRowClick,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm font-sans">
      <table className="w-full text-left border-collapse table-auto min-w-max">
        <thead>
          <tr className="bg-[#EAEAEA] border-b border-gray-200">
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#525252] whitespace-nowrap">
              Automation Name
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#525252] whitespace-nowrap">
              Type
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#282828] whitespace-nowrap">
              Trigger
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#282828] whitespace-nowrap">
              Status
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#282828] whitespace-nowrap">
              Last Run
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#282828] whitespace-nowrap">
              Next Run
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-[#282828] text-center whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.id)}
              className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
            >
              <td className="px-3 py-3 text-[12px] text-[#525252] whitespace-nowrap">
                {row.name}
              </td>
              <td className="px-3 py-3 text-[12px] text-[#525252] whitespace-nowrap">
                {row.type}
              </td>
              <td className="px-3 py-3 text-[12px] text-[#525252] whitespace-nowrap">
                {row.trigger}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      row.status === "Running" ? "bg-[#43C17A]" : "bg-[#FFCC00]"
                    }`}
                  />
                  <span className="text-[12px] text-[#525252]">
                    {row.status}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-[12px] text-[#525252] whitespace-nowrap">
                {row.lastRun}
              </td>
              <td className="px-3 py-3 text-[12px] text-[#525252] whitespace-nowrap">
                {row.nextRun}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex justify-center items-center gap-1 text-[#2D3748]">
                  <Pause
                    size={14}
                    weight="fill"
                    className="cursor-pointer hover:text-blue-600"
                  />
                  <span className="text-[11px] text-gray-400 font-medium">
                    Pause /
                  </span>
                  <Play
                    size={14}
                    weight="fill"
                    className="cursor-pointer hover:text-blue-600"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveAutomationsTable;
