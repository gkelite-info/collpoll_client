import { useMemo, useState } from "react";

type Assignment = {
  subject: string;
  task: string;
  dueDate: string;
  status: "Pending" | "Incomplete" | "Completed";
  obtainedMarks?: number;
  totalMarks?: number;
};

type Quiz = {
  subject: string;
  task: string;
  dueDate: string;
  status: "Not Attempted" | "Attempted" | "Evaluated";
  obtainedMarks?: number;
  totalMarks?: number;
};

type Discussion = {
  subject: string;
  task: string;
  dueDate: string;
  status: "Not Submitted" | "Submitted" | "Evaluated";
  obtainedMarks?: number;
  totalMarks?: number;
};

type TaskTab = "assignments" | "quizzes" | "discussions";

interface AssignmentsTableProps {
  assignments?: Assignment[];
  quizzes?: Quiz[];
  discussions?: Discussion[];
  weightages?: {
    assignments: number;
    quizzes: number;
    discussions: number;
  };
  insights?: {
    assignments: { obtained: number; total: number; weightedScore: number };
    quizzes: { obtained: number; total: number; weightedScore: number };
    discussions: { obtained: number; total: number; weightedScore: number };
  };
}

const TAB_LABELS: Record<TaskTab, string> = {
  assignments: "Assignments",
  quizzes: "Quizzes",
  discussions: "Discussion Forum",
};

const EMPTY_MESSAGES: Record<TaskTab, string> = {
  assignments: "No assignments available for this student.",
  quizzes: "No quizzes available for this student.",
  discussions: "No discussion forums available for this student.",
};

const getStatusColor = (status: string) => {
  if (
    status === "Pending" ||
    status === "Not Attempted" ||
    status === "Not Submitted"
  ) {
    return "text-[#FF3B30]";
  }
  if (
    status === "Incomplete" ||
    status === "Attempted" ||
    status === "Submitted"
  ) {
    return "text-[#F59E0B]";
  }
  return "text-[#4CAF50]";
};

export default function AssignmentsTable({
  assignments = [],
  quizzes = [],
  discussions = [],
  weightages,
  insights,
}: AssignmentsTableProps) {
  const [activeTab, setActiveTab] = useState<TaskTab>("assignments");

  const rows = useMemo(() => {
    if (activeTab === "quizzes") return quizzes;
    if (activeTab === "discussions") return discussions;
    return assignments;
  }, [activeTab, assignments, discussions, quizzes]);

  const activeWeightage = useMemo(() => {
    if (activeTab === "quizzes") return weightages?.quizzes ?? 0;
    if (activeTab === "discussions") return weightages?.discussions ?? 0;
    return weightages?.assignments ?? 0;
  }, [activeTab, weightages]);

  const activeInsight = useMemo(() => {
    if (activeTab === "quizzes") {
      return insights?.quizzes ?? { obtained: 0, total: 0, weightedScore: 0 };
    }
    if (activeTab === "discussions") {
      return (
        insights?.discussions ?? { obtained: 0, total: 0, weightedScore: 0 }
      );
    }
    return insights?.assignments ?? { obtained: 0, total: 0, weightedScore: 0 };
  }, [activeTab, insights]);

  const derivedInsight = useMemo(() => {
    const aggregated = rows.reduce(
      (acc, item) => {
        acc.obtained += item.obtainedMarks ?? 0;
        acc.total += item.totalMarks ?? 0;
        return acc;
      },
      { obtained: 0, total: 0 },
    );
    const weightedScore =
      aggregated.total > 0 && activeWeightage > 0
        ? Math.round((aggregated.obtained / aggregated.total) * activeWeightage)
        : 0;

    return {
      obtained: aggregated.obtained,
      total: aggregated.total,
      weightedScore,
    };
  }, [activeWeightage, rows]);

  const displayInsight =
    derivedInsight.total > 0 || derivedInsight.obtained > 0
      ? derivedInsight
      : activeInsight;

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 font-sans shadow-sm flex flex-col">
      <div className="mb-4 md:mb-6 space-y-4">
        <div className="flex flex-col gap-3 md:gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-[16px] md:text-xl font-bold text-[#333333]">
            Academic Tasks
          </h2>

          <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex min-w-max items-center gap-2 px-1">
              {(Object.keys(TAB_LABELS) as TaskTab[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 text-[11px] md:text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#43C17A1C] text-[#43C17A]"
                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex min-w-max items-center gap-2 px-1">
            <div className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-[#F8FBF9] px-2.5 md:px-3 py-1.5 md:py-2">
              <span className="text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.1em] md:tracking-[0.18em] text-[#8E8E8E]">
                Weightage
              </span>
              <span className="rounded-full bg-[#43C17A1C] px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-bold text-[#43C17A]">
                {activeWeightage}%
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-[#FFF7ED] px-2.5 md:px-3 py-1.5 md:py-2">
              <span className="text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.1em] md:tracking-[0.18em] text-[#B45309]">
                Marks
              </span>
              <span className="rounded-full bg-[#FFEDD5] px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-bold text-[#D97706]">
                {displayInsight.obtained}/{displayInsight.total}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-[#EEF6FF] px-2.5 md:px-3 py-1.5 md:py-2">
              <span className="text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.1em] md:tracking-[0.18em] text-[#4B5563]">
                Added
              </span>
              <span className="rounded-full bg-[#DBEAFE] px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-bold text-[#2563EB]">
                {displayInsight.weightedScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        {rows.length ? (
          <div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar pr-1">
            <table className="min-w-[600px] w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[35%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="sticky top-0 bg-white">
                <tr className="text-[12px] md:text-sm font-medium text-[#8E8E8E]">
                  <th className="pb-3 md:pb-4 font-normal bg-white">Subject</th>
                  <th className="pb-3 md:pb-4 font-normal bg-white">Task</th>
                  <th className="pb-3 md:pb-4 font-normal bg-white">
                    Due Date
                  </th>
                  <th className="pb-3 md:pb-4 text-right font-normal bg-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-[12px] md:text-sm">
                {rows.map((item, idx) => (
                  <tr
                    key={`${activeTab}-${item.subject}-${item.task}-${idx}`}
                    className="border-b border-gray-50 text-[#333333] last:border-0 hover:bg-gray-50/50"
                  >
                    <td
                      className="py-3 md:py-4 pr-3 md:pr-4 font-medium truncate"
                      title={item.subject}
                    >
                      {item.subject}
                    </td>
                    <td
                      className="py-3 md:py-4 pr-3 md:pr-4 text-[#666666] truncate"
                      title={item.task}
                    >
                      {item.task}
                    </td>
                    <td className="py-3 md:py-4 pr-3 md:pr-4 text-[#666666] whitespace-nowrap">
                      {item.dueDate}
                    </td>
                    <td
                      className={`py-3 md:py-4 text-right font-medium whitespace-nowrap ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-[200px] md:h-[300px] items-center justify-center px-4 text-center text-xs md:text-sm text-[#6B7280]">
            {EMPTY_MESSAGES[activeTab]}
          </div>
        )}
      </div>
    </div>
  );
}
