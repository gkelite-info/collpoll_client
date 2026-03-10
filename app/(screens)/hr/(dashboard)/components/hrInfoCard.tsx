"use client";

export type HrInfoCardProps = {
  show?: boolean;
  user: string;
  studentsTaskPercentage?: number;
  facultySubject?: string;
  image?: string;
  top?: string;
  imageHeight?: string;
  right?: string;
};

interface UserInfoProps {
  cardProps: HrInfoCardProps[];
}

export function HrInfoCard({ cardProps }: UserInfoProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {cardProps.map((item, index) => (
        <div
          key={index}
          className="w-full relative bg-[#E6F3E6] rounded-2xl h-[150px] shadow-sm flex items-center overflow-visible"
        >
          <div className="flex flex-col z-10 pl-8 lg:pl-10 max-w-[70%] gap-1">
            <h1 className="text-[#282828] text-lg font-medium leading-tight">
              Welcome back,
              <span className="text-[#089144] font-bold">{item.user}</span>
            </h1>

            <div className="flex flex-col gap-1.5 mt-2">
              <p className="text-[#454545] text-xs font-medium leading-snug">
                94% attendance rate this week with 4 late check-ins and 2
                approved leaves.
              </p>
              <p className="text-[#454545] text-xs font-medium leading-snug">
                View insights, send reminders, and manage your faculty with
                ease.
              </p>
            </div>
          </div>

          {item.image && (
            <div
              className={`absolute bottom-0 z-20 ${item.right || "right-6"} h-[115%] flex items-end`}
            >
              <img
                src={item.image}
                alt={`${item.user} Avatar`}
                className={`${item.imageHeight || "h-full"} ${item.top || ""} object-contain object-bottom`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
