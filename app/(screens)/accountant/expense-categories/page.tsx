import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantExpenseCategoriesPage() {
  return (
    <AccountantPageShell
      title="Expense Categories"
      subtitle="Create and manage accountant expense category records."
    >
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">No expense categories available.</p>
      </section>
    </AccountantPageShell>
  );
}
