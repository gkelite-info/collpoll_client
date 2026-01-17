import Image from "next/image";

interface Faculty {
  id: string;
  name: string;
  department: string;
  subjects: string;
  lastUpdate: string;
  image: string;
  year?: string;
}

interface Props {
  faculty: Faculty;
  onSelect: (faculty: Faculty) => void;
}

export default function FacultyCard({ faculty, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
      <div>
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-full bg-gray-300 shrink-0">
            {/* <Image
              src={faculty.image}
              alt={faculty.id}
              width={56}
              height={56}
              className="rounded-full object-cover"
            /> */}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-base text-[#282828] flex-1 truncate">
              {faculty.name}
            </h3>
            <p className="text-xs text-[#525252] mb-2">ID - {faculty.id}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <p className="text-sm text-[#282828] mb-1">
          Department –{" "}
          <span className="inline-block bg-[#43C17A42] text-[#00C757] px-4 py-0.5 rounded-full text-xs">
            {faculty.department}
          </span>
        </p>

        <p className="text-sm text-[#282828] mb-1 flex items-center">
          Subjects Handled –{" "}
          <span
            className="
                         text-[#525252]
                           flex-1          
                           min-w-0         
                          max-w-[220px]
                          overflow-x-auto
                          whitespace-nowrap
                           ml-1       
                        "
          >
            {faculty.subjects}
          </span>
        </p>

        <p className="text-sm text-[#282828]">
          Last Update –{" "}
          <span className="text-[#525252]">{faculty.lastUpdate}</span>
        </p>
      </div>

      <button
        onClick={() => onSelect(faculty)}
        className="mt-5 bg-[#14234B] cursor-pointer text-white text-sm py-2 rounded-full w-[90%] mx-auto"
      >
        View Calendar
      </button>
    </div>
  );
}
