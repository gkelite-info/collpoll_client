import {
  GraduationCap,
  Briefcase,
  Megaphone,
  Buildings,
} from "@phosphor-icons/react";

export default function DashboardStats() {
  const stats = [
    {
      title: "Eligible Students",
      value: "05",
      bgColor: "bg-[#E5DEFF]",
      iconColor: "#8B5CF6",
      Icon: GraduationCap,
    },
    {
      title: "Students Placed",
      value: "05",
      bgColor: "bg-[#FFEEDD]",
      iconColor: "#F97316",
      Icon: Briefcase,
    },
    {
      title: "Active Drives",
      value: "14",
      bgColor: "bg-[#E0FCE0]",
      iconColor: "#22C55E",
      Icon: Megaphone,
    },
    {
      title: "Partner Companies",
      value: "5,480",
      bgColor: "bg-[#D0E8FF]",
      iconColor: "#3B82F6",
      Icon: Buildings,
    },
  ];

  return (
    <div className="min-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex flex-col justify-between p-5 h-[120px] rounded-lg ${stat.bgColor}`}
          >
            <div className="w-8 h-8 aspect-square bg-white rounded-md flex items-center justify-center">
              <stat.Icon size={20} weight="duotone" color={stat.iconColor} />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#1F2937] leading-none tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs font-medium text-[#4B5563]">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
