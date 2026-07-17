"use client";

const Block = ({ className }: { className: string }) => <div className={`hr-reimbursement-shimmer rounded bg-slate-200 ${className}`} />;

function Styles() {
  return <style jsx global>{`
    .hr-reimbursement-shimmer { position: relative; overflow: hidden; }
    .hr-reimbursement-shimmer::after { position: absolute; inset: 0; content: ""; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent); animation: hr-reimbursement-sweep 1.35s ease-in-out infinite; }
    @keyframes hr-reimbursement-sweep { to { transform: translateX(100%); } }
    @media (prefers-reduced-motion: reduce) { .hr-reimbursement-shimmer::after { animation: none; } }
  `}</style>;
}

export function HRReimbursementDashboardShimmer() {
  return (
    <main className="min-h-full w-full bg-[#f3f4f6] p-2">
      <Styles />
      <header className="mb-5 space-y-2"><Block className="h-7 w-72" /><Block className="h-4 w-80 max-w-full" /></header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[160px] rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><Block className="h-9 w-9 rounded-md" /><Block className="mt-4 h-3 w-28" /><Block className="mt-3 h-7 w-12" /><Block className="mt-3 h-3 w-44 max-w-full" /></div>)}
      </section>
      <section className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4"><div className="space-y-2"><Block className="h-5 w-32" /><Block className="h-3 w-64 max-w-full" /></div><Block className="h-10 w-36 rounded-xl" /></div>
        <div className="h-12 bg-[#edf3ff] px-8 py-4"><Block className="h-3 w-full bg-slate-300" /></div>
        {Array.from({ length: 5 }).map((_, row) => <div key={row} className="grid min-w-[1100px] grid-cols-[50px_1.2fr_1.25fr_1.15fr_1.3fr_.8fr_.9fr_.7fr_.8fr] items-center gap-6 border-b border-gray-100 px-8 py-5"><Block className="h-4 w-4" /><div className="flex items-center gap-3"><Block className="h-8 w-8 rounded-full" /><Block className="h-3 w-24" /></div>{Array.from({ length: 7 }).map((__, cell) => <Block key={cell} className="h-3 w-full" />)}</div>)}
      </section>
    </main>
  );
}

export function HRReimbursementDetailShimmer() {
  return (
    <main className="min-h-full w-full bg-[#f3f4f6] p-3 sm:p-4">
      <Styles />
      <header className="mb-7 flex items-start justify-between"><div className="flex gap-3"><Block className="h-6 w-6" /><div className="space-y-3"><Block className="h-6 w-72 max-w-full" /><Block className="h-4 w-52" /></div></div><Block className="h-10 w-28 rounded-full" /></header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(285px,1fr)]">
        <div className="space-y-5"><Card height="h-[290px]" rows={6} /><Card height="h-[330px]" rows={4} /><Card height="h-[180px]" rows={4} /></div>
        <aside className="space-y-5"><Card height="h-[355px]" rows={5} /><Card height="h-[205px]" rows={3} /></aside>
      </div>
    </main>
  );
}

function Card({ height, rows }: { height: string; rows: number }) {
  return <section className={`${height} rounded-xl border border-[#e0e5eb] bg-white p-5 shadow-sm`}><div className="mb-8 flex gap-2"><Block className="h-5 w-5" /><Block className="h-5 w-44" /></div><div className="grid gap-7 sm:grid-cols-2">{Array.from({ length: rows }).map((_, i) => <div key={i} className="space-y-2"><Block className="h-3 w-24" /><Block className="h-4 w-full" /></div>)}</div></section>;
}
