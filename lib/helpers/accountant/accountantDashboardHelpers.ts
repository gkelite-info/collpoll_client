import type { AccountantExpense } from "./accountantExpensesAPI";

export const ACCOUNTANT_CARD_VISUALS = [
  { iconBgColor: "#43C17A", iconColor: "#FFFFFF", softBg: "#DDF8E9" },
  { iconBgColor: "#3F7DF4", iconColor: "#FFFFFF", softBg: "#E1ECFF" },
  { iconBgColor: "#A64FF2", iconColor: "#FFFFFF", softBg: "#EEE1FF" },
  { iconBgColor: "#FF9238", iconColor: "#FFFFFF", softBg: "#FFE8D3" },
] as const;

export function parseAccountantExpenseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function isExpenseInMonth(expense: AccountantExpense, date = new Date()) {
  const expenseDate = parseAccountantExpenseDate(expense.expenseDate);
  return expenseDate.getFullYear() === date.getFullYear()
    && expenseDate.getMonth() === date.getMonth();
}

export function getAccountantExpenseMetrics(expenses: AccountantExpense[], now = new Date()) {
  const thisMonthExpenses = expenses.filter((expense) => isExpenseInMonth(expense, now));
  const categories = [...new Set(expenses.map((expense) => expense.category.trim()).filter(Boolean))].sort();
  return {
    totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    thisMonthAmount: thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    transactionCount: expenses.length,
    thisMonthCount: thisMonthExpenses.length,
    todayCount: expenses.filter((expense) => expense.expenseDate === now.toLocaleDateString("en-CA")).length,
    categories,
    thisMonthExpenses,
  };
}

export function groupAccountantExpensesByCategory(expenses: AccountantExpense[]) {
  const groups = new Map<string, { amount: number; count: number }>();
  expenses.forEach((expense) => {
    const current = groups.get(expense.category) ?? { amount: 0, count: 0 };
    groups.set(expense.category, { amount: current.amount + expense.amount, count: current.count + 1 });
  });
  return [...groups.entries()]
    .map(([category, values]) => ({ category, ...values }))
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyWeeklySpending(expenses: AccountantExpense[], date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil(daysInMonth / 7);

  return Array.from({ length: weekCount }, (_, index) => ({
    week: `Week ${index + 1}`,
    amount: expenses
      .filter((expense) => {
        const day = parseAccountantExpenseDate(expense.expenseDate).getDate();
        return Math.floor((day - 1) / 7) === index;
      })
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));
}
