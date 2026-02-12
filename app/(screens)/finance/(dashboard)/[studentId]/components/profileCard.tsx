"use client";

interface ProfileData {
  name: string;
  course: string;
  year: string;
  rollNo: string;
  email: string;
  mobile: string;
  imageUrl: string;
}

const ProfileDetails = ({ data }: { data: ProfileData }) => {
  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-center gap-6 h-full">
      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center gap-2 min-w-[110px]">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100">
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-[#282828] font-bold text-[15px] text-center leading-tight">
          {data.name}
        </h2>
      </div>

      {/* Details Grid */}
      <div className="flex-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] items-center">
        <span className="text-gray-600 font-semibold">Course :</span>
        <span className="text-gray-600">{data.course}</span>

        <span className="text-gray-600 font-semibold">Year :</span>
        <span className="text-gray-600">{data.year}</span>

        <span className="text-gray-600 font-semibold">Roll No :</span>
        <span className="text-gray-600">{data.rollNo}</span>

        <span className="text-gray-600 font-semibold">Email :</span>
        <span className="text-gray-500 break-all">{data.email}</span>

        <span className="text-gray-600 font-semibold">Mobile :</span>
        <span className="text-gray-600">{data.mobile}</span>
      </div>
    </div>
  );
};

export default ProfileDetails;
