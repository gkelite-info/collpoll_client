import AccountantPageShell from "../components/AccountantPageShell";

const summaryCards = [
  { label: "Pending Expenses", value: "0" },
  { label: "Approved Expenses", value: "0" },
  { label: "Monthly Spend", value: "₹0" },
  { label: "Open Requests", value: "0" },
];

export default function AccountantDashboardPage() {
  return (
    <AccountantPageShell
      title="Accountant Dashboard"
      subtitle="Track expense requests, approvals, and spending summaries."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <section key={card.label} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#17213D]">
              {card.value}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#17213D]">Recent Activity</h2>
        <p className="mt-3 text-sm text-gray-500">No recent accountant activity.</p>
      </section>
    </AccountantPageShell>
  );
}
