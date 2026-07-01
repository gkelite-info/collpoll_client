import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantCalendarPage() {
  return (
    <AccountantPageShell
      title="Calendar"
      subtitle="View accountant schedules, reminders, and important dates."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No calendar events available.</p>
      </section>
    </AccountantPageShell>
  );
}
