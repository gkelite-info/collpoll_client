
import { useFaculty } from '@/app/utils/context/faculty/useFaculty';
import { useUser } from '@/app/utils/context/UserContext';
import { User } from '@phosphor-icons/react';

const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="flex items-start py-1.5 text-[14px] text-left w-full">
    <span className="w-[140px] sm:w-[180px] font-semibold text-[#333333]">
      {label}
    </span>
    <span className="text-[#666666] break-words flex-1">{value}</span>
  </div>
);

export default function SummaryPage() {

  const { role, fullName, facultyId, college_branch, mobile, email } = useFaculty();
  const { profilePhoto, dateOfJoining, professionalExperienceYears } = useUser();

  if (!role) return null;

  const isInter = ["Inter"].includes(role);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 text-left">
      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex flex-col items-center mb-6 mt-2">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              className="w-[84px] h-[84px] rounded-full object-cover mb-3 shadow-sm"
            />
          ) : (
            <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center bg-gray-100 mb-3 shadow-sm">
              <User size={40} className="text-gray-500" />
            </div>
          )}
          <h2 className="text-[17px] font-bold text-gray-800 text-center">{fullName}</h2>
        </div>
        <div className="bg-yellow-00 flex flex-col items-center justify-center space-y-0.5 bg-pink-00">
          <InfoRow label="Id" value={facultyId} />
          <InfoRow label={isInter ? "Group" : "Branch"} value={college_branch} />
          <InfoRow label="Mobile" value={mobile} />
          <InfoRow label="Email" value={email} />
          <InfoRow label="Date of Joining" value={dateOfJoining ?? "-"} />
          <InfoRow label="Experience" value={professionalExperienceYears ?? "-"} />
        </div>
      </div>


      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="text-[16px] font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 text-left">
          Payment Information
        </h2>

        <div className="mb-5">
          <InfoRow label="Salary Payment Mode:" value="Bank Transfer" />
        </div>

        <h3 className="text-[15px] font-bold text-gray-800 mb-3 text-left">Bank Information</h3>

        <div className="flex flex-col space-y-0.5">
          <InfoRow label="Bank Name:" value="Bank of baroda" />
          <InfoRow label="Account Number:" value="2345678906789" />
          <InfoRow label="IFSC Code:" value="234567890" />
          <InfoRow label="Name on the Account:" value="Alexander" />
          <InfoRow label="Branch:" value="N/A" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="text-[16px] font-bold text-gray-800 mb-4 text-left">Identity Information</h2>
        <h3 className="text-[15px] font-bold text-gray-800 mb-3 text-left">Photo ID</h3>

        <div className="flex items-center justify-start space-x-2.5 mb-5">
          <img src="/india.png" alt="Flag of India" className="h-[14px] w-auto object-contain rounded-[1px]" />
          <span className="text-[16px] font-bold text-gray-800">Aadhar Card</span>
          <span className="bg-[#85C271] text-white text-[10px] px-2 py-0.5 rounded-[4px] font-semibold tracking-wide ml-1">
            Verified
          </span>
        </div>

        <div className="flex flex-col space-y-0.5">
          <InfoRow label="Aadhar Number:" value="49087579678" />
          <InfoRow label="Date of Birth:" value="19 Feb 2003" />
          <InfoRow label="Address:" value="Flat 502, Sun...." />
          <InfoRow label="Enrollment Number:" value="49087579678" />
          <InfoRow label="Name:" value="Alexander" />
          <InfoRow label="Gender:" value="Male" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex items-center justify-start space-x-2.5 mb-5 mt-1">
          <img src="/india.png" alt="Flag of India" className="h-[14px] w-auto object-contain rounded-[1px]" />
          <span className="text-[16px] font-bold text-gray-800">Pan Card</span>
          <span className="bg-[#85C271] text-white text-[10px] px-2 py-0.5 rounded-[4px] font-semibold tracking-wide ml-1">
            Verified
          </span>
        </div>

        <div className="flex flex-col space-y-0.5 mt-2">
          <InfoRow label="Permanent Account Number:" value="XXXXXXX9678" />
          <InfoRow label="Date of Birth:" value="19 Feb 2003" />
          <InfoRow label="Name:" value="Alexander" />
          <InfoRow label="Father's Name:" value="Jones" />
        </div>
      </div>

    </div>
  );
}