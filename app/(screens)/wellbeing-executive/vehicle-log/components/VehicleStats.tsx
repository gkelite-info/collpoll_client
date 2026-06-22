import { Buildings, SignIn, SignOut, ClipboardText } from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";

const stats = [
  { label: "Vehicles Entered Today", value: "156", icon: SignIn, tone: "bg-[#EEF3FB] text-[#16284F]" },
  { label: "Vehicles Exited Today", value: "142", icon: SignOut, tone: "bg-[#EEF3FB] text-[#16284F]" },
  { label: "Currently Inside Campus", value: "14", icon: Buildings, tone: "bg-[#E6FAF1] text-[#18B978]" },
  { label: "Pending Exits", value: "4", icon: ClipboardText, tone: "bg-[#FFF2D9] text-[#F59E0B]" },
];

export function VehicleStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <CardComponent
          key={label}
          icon={<span className={`grid h-10 w-10 place-items-center rounded ${tone}`}><Icon size={21} weight="bold" /></span>}
          value={<span className="text-sm font-medium text-[#64748B]">{label}</span>}
          label={<span className="text-2xl font-extrabold text-[#16284F]">{value}</span>}
          style="min-h-[116px] !h-[116px] border border-[#D7DFEC] bg-white px-5 py-4 shadow-sm"
          iconBgColor="transparent"
          iconColor="inherit"
        />
      ))}
    </div>
  );
}
