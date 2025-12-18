type AttendanceItem = {
  subject: string;
  attended: number;
  total: number;
  status: string;
};

type AttendanceListProps = {
  data?: AttendanceItem[];
};
export function AttendanceList({ data }: AttendanceListProps) {
  return (
    <div className="w-full h-[400px] flex flex-col font-sans overflow-hidden ">
      <h2 className="p-5 pb-2 text-lg font-bold text-gray-800">
        Attendance by Subject
      </h2>

      <div className="flex-1 overflow-y-auto px-5 pb-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {data?.map((item, i) => {
          const pct = Math.round((item.attended / item.total) * 100);
          return (
            <div
              key={i}
              className="flex flex-col gap-3 py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex justify-between font-semibold text-gray-800">
                <h3>{item.subject}</h3>
                <span className="bg-green-100 text-green-500 px-3 py-1 rounded-md text-sm">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-green-500">
                <span className="min-w-[50px]">
                  {item.attended}/{item.total}
                </span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5bc236] to-[#88e050]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="min-w-[35px] text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
