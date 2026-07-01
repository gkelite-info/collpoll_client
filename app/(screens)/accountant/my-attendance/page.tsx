import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantMyAttendancePage() {
  return (
    <AccountantPageShell
      title="My Attendance"
      subtitle="Track accountant attendance and payroll details."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No attendance records available.</p>
      </section>
    </AccountantPageShell>
  );
}
