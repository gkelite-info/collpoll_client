import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantDrivePage() {
  return (
    <AccountantPageShell
      title="Drive"
      subtitle="Access accountant files and documents."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No drive files available.</p>
      </section>
    </AccountantPageShell>
  );
}
