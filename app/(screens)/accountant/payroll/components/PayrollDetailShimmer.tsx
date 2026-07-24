const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-[#e5e8ed] ${className}`} />
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-[#e2e5e9] bg-white p-5 ${className}`}>{children}</section>
);

export default function PayrollDetailShimmer() {
  return (
    <main className="min-h-[calc(100dvh-92px)] w-full bg-[#f4f4f4] p-3 sm:p-5" aria-label="Loading salary payment details" role="status">
      <header className="mb-5 flex items-center gap-3">
        <Shimmer className="h-9 w-9 rounded-full" />
        <div><Shimmer className="h-7 w-64" /><Shimmer className="mt-3 h-3 w-80 max-w-full" /></div>
      </header>
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <div className="flex items-center gap-4">
              <Shimmer className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="w-full"><Shimmer className="h-3 w-24" /><Shimmer className="mt-3 h-6 w-32" /><Shimmer className="mt-2 h-3 w-24" /></div>
            </div>
          </Card>
        ))}
      </section>
      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><Shimmer className="h-5 w-44" /><Shimmer className="mt-3 h-3 w-64" /></div>
          <Shimmer className="h-10 w-40 rounded-xl" />
        </div>
        <Shimmer className="mt-5 h-10 w-full rounded-none" />
        <div className="mt-3 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => <Shimmer key={index} className="h-16" />)}
        </div>
      </Card>
      <Card className="mb-5">
        <Shimmer className="h-5 w-48" />
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index}><Shimmer className="h-3 w-24" /><Shimmer className="mt-3 h-4 w-36" /></div>)}
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card key={cardIndex}>
            <Shimmer className="h-5 w-44" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => <div key={index}><Shimmer className="h-3 w-24" /><Shimmer className="mt-2 h-10 w-full" /></div>)}
            </div>
          </Card>
        ))}
      </div>
      <span className="sr-only">Loading payroll details</span>
    </main>
  );
}
