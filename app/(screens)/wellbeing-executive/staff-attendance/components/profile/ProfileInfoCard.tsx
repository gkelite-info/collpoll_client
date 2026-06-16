import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react";
import Image from "next/image";
import type { ReactNode } from "react";
import type { StaffAttendanceRecord } from "../../data";

type ProfileInfoCardProps = {
  staff: StaffAttendanceRecord;
};

export default function ProfileInfoCard({ staff }: ProfileInfoCardProps) {
  return (
    <aside className="rounded-lg border border-[#D7DFEC] bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg bg-[#F1F5F9]">
          <Image
            src="/male-student.png"
            alt={staff.name}
            fill
            sizes="84px"
            className="object-contain p-1"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-extrabold text-[#16284F]">{staff.name}</h2>
            <span className="rounded bg-[#DFF7EA] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#009B55]">
              Active
            </span>
          </div>
          <p className="mt-1 text-[12px] font-medium text-[#64748B]">{staff.designation}</p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-b border-[#E5EAF2] pb-5">
        <InfoItem label="Employee ID" value={staff.staffId} />
        <InfoItem label="Department" value={staff.department} />
        <InfoItem label="Designation" value={staff.designation} />
        <InfoItem label="Shift" value={staff.shift} />
        <InfoItem label="Joining Date" value={staff.joiningDate} />
        <InfoItem label="Reporting" value={staff.reportingTo} />
      </div>

      <div className="mt-5 space-y-3">
        <ContactItem icon={<Phone size={15} weight="bold" />} label="Contact" value={staff.phone} />
        <ContactItem icon={<EnvelopeSimple size={15} weight="bold" />} label="Email" value={staff.email} />
        <ContactItem icon={<MapPin size={15} weight="bold" />} label="Address" value={staff.address} />
      </div>
    </aside>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#7D8CA5]">{label}</p>
      <p className="mt-1 text-[12px] font-extrabold text-[#2D3748]">{value}</p>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#7D8CA5]">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-[12px] font-bold text-[#2D3748]">
        <span className="text-[#2B76D2]">{icon}</span>
        {value}
      </div>
    </div>
  );
}
