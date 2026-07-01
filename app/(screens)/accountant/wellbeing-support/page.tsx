import AccountantPageShell from "../components/AccountantPageShell";

export default function AccountantWellbeingSupportPage() {
  return (
    <AccountantPageShell
      title="Well being / Support"
      subtitle="View wellbeing and support resources."
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">No support items available.</p>
      </section>
    </AccountantPageShell>
  );
}
