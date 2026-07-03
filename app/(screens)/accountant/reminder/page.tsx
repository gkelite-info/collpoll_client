import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantReminderPage() {
  return (
    <AccountantPageShell
      title="Reminder"
      subtitle="View and manage accountant reminders."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No reminders available.</p>
      </section>
    </AccountantPageShell>
  );
}
