type AccountantPageShellProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function AccountantPageShell({
  title,
  subtitle,
  children,
}: AccountantPageShellProps) {
  return (
    <main className="min-h-full w-full bg-[#F4F4F4] p-4">
      <section className="mb-4 rounded-lg bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#17213D]">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      </section>
      {children}
    </main>
  );
}
