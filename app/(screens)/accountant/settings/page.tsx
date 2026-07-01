import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantSettingsPage() {
  return (
    <AccountantPageShell
      title="Settings"
      subtitle="Manage accountant preferences and security settings."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No settings available.</p>
      </section>
    </AccountantPageShell>
  );
}
