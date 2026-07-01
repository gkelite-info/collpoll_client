import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantMeetingsPage() {
  return (
    <AccountantPageShell
      title="Meetings"
      subtitle="View accountant meetings and discussions."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No meetings available.</p>
      </section>
    </AccountantPageShell>
  );
}
