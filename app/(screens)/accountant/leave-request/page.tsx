import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantLeaveRequestPage() {
  return (
    <AccountantPageShell
      title="Leave Request"
      subtitle="Manage accountant leave requests."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No leave requests available.</p>
      </section>
    </AccountantPageShell>
  );
}
