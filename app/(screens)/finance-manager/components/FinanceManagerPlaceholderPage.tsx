type FinanceManagerPlaceholderPageProps = {
  title: string;
};

export default function FinanceManagerPlaceholderPage({
  title,
}: FinanceManagerPlaceholderPageProps) {
  return (
    <main className="min-h-full p-4">
      <section className="flex min-h-[220px] items-center justify-center rounded-lg bg-white">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </section>
    </main>
  );
}
