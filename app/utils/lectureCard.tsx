type LectureCardProps = {
  time: string;
  title: string;
  professor: string;
  description: string;
  status?: string;
};

export default function LectureCard({
  time,
  title,
  professor,
  description,
  status,
}: LectureCardProps) {
  return (
    <div className="flex gap-1 mb-2">
      <div className="w-[20%] flex items-center justify-center bg-pink-00">
        <p className="text-xs font-semibold text-black whitespace-pre-line text-center">
          {time}
        </p>
      </div>
      <div className="w-[80%] flex justify-end bg-[#16284F] rounded-md rounded-r-lg">
        <div className="bg-[#E8E9ED] w-[98%] rounded-r-md flex flex-col justify-between gap-1 px-2 py-1">
          <div className="flex justify-between items-center">
            <p style={{ color: "#16284F", fontSize: 14, fontWeight: 600 }}>
              {title}
            </p>
            <p style={{ color: "#43C17A", fontSize: 10 }}>({professor})</p>
          </div>

          <>
            <p style={{ color: "#454545", fontSize: 10 }}>
              {description.split(" • ")[0]}
            </p>

            <p style={{ color: "#454545", fontSize: 10 }}>
              {description.split(" • ")[1]}
            </p>
          </>

          {status && (
            <p className="text-red-500 text-xs font-semibold">{status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
