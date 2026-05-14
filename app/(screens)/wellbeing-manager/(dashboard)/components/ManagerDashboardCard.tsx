import { ReactNode } from "react";

export default function ManagerDashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}
