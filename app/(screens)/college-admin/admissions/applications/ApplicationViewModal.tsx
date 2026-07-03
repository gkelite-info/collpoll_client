import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  MapPin, 
  GraduationCap, 
  Exam, 
  FileText, 
  Calendar, 
  Phone, 
  EnvelopeSimple,
  IdentificationCard,
  Money,
  CheckCircle,
  WarningCircle,
  XCircle,
  DownloadSimple
} from '@phosphor-icons/react';
import { getApplicationById } from '@/lib/api/gkeliteApi';
import Image from 'next/image';

interface ApplicationViewModalProps {
  applicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationViewModal({ applicationId, isOpen, onClose }: ApplicationViewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      setLoading(true);
      getApplicationById(applicationId).then((res) => {
        setData(res);
        setLoading(false);
      });
    } else {
      setData(null);
    }
  }, [applicationId, isOpen]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'selected':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
      case 'verification':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'failed':
      case 'regret':
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[#f8fafc] w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="flex-none px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <IdentificationCard size={24} weight="duotone" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <p className="text-sm text-gray-500 font-medium">
                  {data?.applicationNumber || (applicationId ? `APP-${applicationId}` : 'Loading...')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Fetching details...</p>
              </div>
            ) : data ? (
              <div className="space-y-5">
                
                {/* Top Section: Profile & Quick Info */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-50 border-4 border-white shadow-lg relative group">
                      {data.profileImage ? (
                        <img 
                          src={data.profileImage} 
                          alt={`${data.firstName} ${data.lastName}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <User size={48} weight="fill" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-gray-900">{data.firstName} {data.lastName}</h3>
                      <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {data.course}
                      </span>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <InfoCard icon={<EnvelopeSimple />} label="Email" value={data.emailId} />
                    <InfoCard icon={<Phone />} label="Phone" value={data.contactNo} />
                    <InfoCard icon={<Calendar />} label="Date of Birth" value={new Date(data.dateOfBirth).toLocaleDateString('en-GB')} />
                    <InfoCard icon={<User />} label="Gender" value={data.gender} className="capitalize" />
                    <InfoCard icon={<GraduationCap />} label="Application For" value={data.applicationFor} />
                    <InfoCard icon={<GraduationCap />} label="College" value={data.college} />
                    
                    {/* Status Badges */}
                    <div className="col-span-1 sm:col-span-2 flex gap-4 mt-2">
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Payment Status</p>
                        <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-lg border ${getStatusColor(data.computedStatus)}`}>
                          {data.computedStatus}
                        </span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Admission Status</p>
                        <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-lg border ${getStatusColor(data.admissionStatus)}`}>
                          {data.admissionStatus || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal & Address Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Personal */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={18} className="text-indigo-500" /> Personal Details
                    </h3>
                    <div className="flex flex-col">
                      <DetailRow label="Father's Name" value={data.fathersName} />
                      <DetailRow label="Mother's Name" value={data.mothersName} />
                      <DetailRow label="Nationality" value={data.nationality} />
                      <DetailRow label="Category" value={data.category} />
                      <DetailRow label="Aadhaar Number" value={data.aadhaarNumber || 'N/A'} />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-indigo-500" /> Address Details
                    </h3>
                    <div className="flex flex-col">
                      <DetailRow label="Address" value={data.postalAddress} />
                      <DetailRow label="City" value={data.city} />
                      <DetailRow label="State" value={data.state} />
                      <DetailRow label="Pincode" value={data.pinCode} />
                    </div>
                  </div>
                </div>

                {/* Education Qualifications */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GraduationCap size={18} className="text-indigo-500" /> Education Qualifications
                  </h3>
                  {data.education_qualifications && data.education_qualifications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Level</th>
                            <th className="px-4 py-3">Institution</th>
                            <th className="px-4 py-3">Board/Univ</th>
                            <th className="px-4 py-3">Year</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3 rounded-tr-lg">Certificate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.education_qualifications.map((edu: any) => (
                            <tr key={edu.educationId} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900">{edu.level}</td>
                              <td className="px-4 py-3 text-gray-600">{edu.schoolOrCollege}</td>
                              <td className="px-4 py-3 text-gray-600">{edu.boardOrUniversity}</td>
                              <td className="px-4 py-3 text-gray-600">{new Date(edu.passingYear).getFullYear()}</td>
                              <td className="px-4 py-3 font-semibold text-indigo-600">{edu.gradeOrPercentage}</td>
                              <td className="px-4 py-3">
                                {edu.certificateUrl ? (
                                  <a href={edu.certificateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                                    <FileText size={16} /> View Doc
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-xs">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No education qualifications provided.
                    </div>
                  )}
                </div>

                {/* Entrance Exams */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-500" /> Entrance Exams
                  </h3>
                  {data.entrance_exams && data.entrance_exams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.entrance_exams.map((exam: any) => (
                        <div key={exam.examId} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{exam.examName}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">HT No: {exam.htNumber}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-indigo-600 shadow-sm">
                              Rank: {exam.rank}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-200/60">
                            <span className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Calendar size={16} className="text-gray-400" /> {new Date(exam.year).getFullYear()}
                            </span>
                            {exam.certificateUrl && (
                              <a href={exam.certificateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                <DownloadSimple size={16} /> Scorecard
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No entrance exams provided.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <WarningCircle size={48} className="text-red-400" weight="duotone" />
                <p className="text-gray-500 font-medium text-lg">Application not found.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoCard({ icon, label, value, className = '' }: { icon: React.ReactNode, label: string, value: string | undefined, className?: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-indigo-50/50 text-indigo-500 rounded-lg shrink-0">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20, weight: "duotone" })}
      </div>
      <div className="overflow-hidden min-w-0">
        <p className="text-[11px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold text-gray-900 truncate ${className}`}>{value || 'N/A'}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 sm:w-1/3 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 mt-1 sm:mt-0 break-words">{value || 'N/A'}</span>
    </div>
  );
}
