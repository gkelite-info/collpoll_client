import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantAnalyticsPage() {
  return (
    <AccountantPageShell
      title="Analytics"
      subtitle="Review accountant expense and payment analytics."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No analytics available.</p>
      </section>
    </AccountantPageShell>
  );
}
