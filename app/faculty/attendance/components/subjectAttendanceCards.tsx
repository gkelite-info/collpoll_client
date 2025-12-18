"use client";

export default function SubjectAttendanceCards({
  summary,
  active,
  onChange,
}: {
  summary: {
    totalClasses: number;
    attended: number;
    absent: number;
    leave: number;
  };
  active: "ALL" | "Present" | "Absent" | "Leave";
  onChange: (v: "ALL" | "Present" | "Absent" | "Leave") => void;
}) {
  const cards = [
    { label: "Total Classes", value: summary.totalClasses, key: "ALL" },
    { label: "Attended", value: summary.attended, key: "Present" },
    { label: "Absent", value: summary.absent, key: "Absent" },
    { label: "Leave", value: summary.leave, key: "Leave" },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={`rounded-xl p-4 text-left ${
            active === c.key ? "ring-2 ring-green-500" : ""
          }`}
        >
          <p className="text-lg font-semibold">{c.value}</p>
          <p className="text-sm text-gray-500">{c.label}</p>
        </button>
      ))}
    </div>
  );
}
