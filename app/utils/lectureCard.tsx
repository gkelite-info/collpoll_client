type LectureCardProps = {
  time: string;
  title: string;
  professor: string;
  description: string;
};

export default function LectureCard({
  time,
  title,
  professor,
  description,
}: LectureCardProps) {
  return (
    <div className="flex gap-1 mb-2">
      <div className="w-[20%] flex items-center justify-center bg-pink-00">
        <p className="text-xs font-semibold text-black">{time}</p>
      </div>
      <div className="w-[80%] flex justify-end bg-[#16284F] rounded-md rounded-r-lg">
        <div className="bg-[#E8E9ED] w-[98%] rounded-r-md flex flex-col justify-between gap-1 px-2 py-1">
          <div className="flex justify-between items-center">
            <p style={{ color: "#16284F", fontSize: 14, fontWeight: 600 }}>
              {title}
            </p>
            <p style={{ color: "#43C17A", fontSize: 10 }}>({professor})</p>
          </div>
          <p style={{ color: "#454545", fontSize: 10 }}>{description}</p>
        </div>
      </div>
    </div>
  );
}
