"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { recentExpenseRecords } from "./data";
import type { AccountantExpense } from "@/lib/helpers/accountant/accountantExpensesAPI";
import { formatAccountantRevenue } from "@/lib/helpers/accountant/accountantRevenueAPI";

function RecentExpenseRecords({ expenses }: { expenses: AccountantExpense[] }) {
  return (
    <section className="h-[380px] flex-none overflow-hidden rounded-2xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.10)]">
      <div className="flex items-center">
        <h2 className="text-base font-bold text-[#17213D]">
          Recent Expense Records
        </h2>
      </div>

      <div className="mt-5 flex h-[calc(100%-44px)] flex-col gap-4 overflow-y-auto pr-1">
        {expenses.map((expense, index) => {
          const visual = recentExpenseRecords.find(
            (item) => item.subtitle.toLocaleLowerCase("en-IN") === expense.category.toLocaleLowerCase("en-IN"),
          ) ?? recentExpenseRecords[index % recentExpenseRecords.length];
          const Icon = visual.icon;

          return (
            <article key={expense.accountantExpenseId} className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${visual.bg}`}
              >
                <Icon size={18} weight="fill" color={visual.color} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold leading-tight text-[#17213D]">
                  {expense.expenseName}
                </h3>
                <p className="text-[11px] leading-tight text-gray-500">{expense.category}</p>
                <p className="text-[11px] leading-tight text-gray-500">
                  {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${expense.expenseDate}T00:00:00`))}
                </p>
              </div>
              <p className="shrink-0 text-[13px] font-bold text-[#17213D]">
                {formatAccountantRevenue(expense.amount)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function AccountantDashboardRight({ recentExpenses }: { recentExpenses: AccountantExpense[] }) {
  return (
    <aside className="hidden flex-col gap-4 border-l border-gray-100 p-2 md:flex md:w-[32%]">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <RecentExpenseRecords expenses={recentExpenses} />
    </aside>
  );
}
