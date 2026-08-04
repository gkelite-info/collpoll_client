const Pulse = ({ className }: { className: string }) => <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-full w-full bg-[#F4F4F4] px-3 py-4"><div className="mx-auto max-w-[1180px] space-y-4">{children}</div></main>;
}

const Header = () => <div className="flex gap-3"><Pulse className="h-8 w-8" /><div className="space-y-2"><Pulse className="h-7 w-52" /><Pulse className="h-3 w-72" /></div></div>;
const Cards = () => <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Pulse key={index} className="h-[118px]" />)}</div>;

export function TotalExpensesShimmer() {
  return <Shell><Header /><Cards /><Pulse className="h-[76px]" /><Pulse className="h-[470px]" /></Shell>;
}

export function ThisMonthSpendingShimmer() {
  return <Shell><Header /><Pulse className="h-5 w-44" /><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Pulse key={index} className="h-[92px]" />)}</div><div className="grid gap-4 xl:grid-cols-[1.55fr_0.95fr]"><Pulse className="h-[330px]" /><Pulse className="h-[330px]" /></div></Shell>;
}

export function ExpenseCategoriesShimmer() {
  return <Shell><Header /><Cards /><Pulse className="h-5 w-44" /><Cards /><div className="grid gap-4 xl:grid-cols-[1fr_300px]"><Pulse className="h-[310px]" /><Pulse className="h-[310px]" /></div></Shell>;
}

export function TransactionsShimmer() {
  return <Shell><Header /><Cards /><Pulse className="h-[76px]" /><Pulse className="h-[430px]" /><Pulse className="h-[260px]" /></Shell>;
}
