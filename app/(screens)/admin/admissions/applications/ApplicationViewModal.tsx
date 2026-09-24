"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  MapPin, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Phone, 
  EnvelopeSimple,
  IdentificationCard,
  WarningCircle,
} from '@phosphor-icons/react';
import { formatCourseWithCode } from '@/lib/helpers/admin/achieversAdmissionsHelper';

type ApplicationViewModalProps = {
  application: {
    id: string;
    name: string;
    course: string;
    payment: string;
    admission: string;
    email: string;
    mobile: string;
    raw?: any;
  } | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ApplicationViewModal({ application, isOpen, onClose }: ApplicationViewModalProps) {
  if (!isOpen || !application) return null;

  const data = application.raw || {};
  const [firstName = "", ...lastNameParts] = application.name.split(" ");
  const lastName = lastNameParts.join(" ");

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
                <h2 className="text-xl font-bold text-gray-900">Achievers Application Details</h2>
                <p className="text-sm text-gray-500 font-medium">
                  {application.id}
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
            <div className="space-y-5">
              
              {/* Top Section: Profile & Quick Info */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-50 border-4 border-white shadow-lg relative group flex items-center justify-center text-gray-300">
                    {data.profileImageUrl || application.raw?.profileImageUrl ? (
                      <img
                        src={data.profileImageUrl || application.raw?.profileImageUrl}
                        alt={`${firstName} ${lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} weight="fill" />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">{firstName} {lastName}</h3>
                    <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {formatCourseWithCode(application.course)}
                    </span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <InfoCard icon={<EnvelopeSimple />} label="Email" value={application.email} />
                  <InfoCard icon={<Phone />} label="Phone" value={application.mobile} />
                  <InfoCard icon={<Calendar />} label="Date of Birth" value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'} />
                  <InfoCard icon={<User />} label="Gender" value={data.gender || 'N/A'} className="capitalize" />
                  <InfoCard icon={<GraduationCap />} label="Application For" value={data.applicationFor || 'Inter'} />
                  <InfoCard icon={<GraduationCap />} label="College" value="Achievers Junior College" />
                  
                  {/* Status Badges */}
                  <div className="col-span-1 sm:col-span-2 flex gap-4 mt-2">
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Payment Status</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-lg border ${getStatusColor(application.payment)}`}>
                        {application.payment}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Admission Status</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-lg border ${getStatusColor(application.admission)}`}>
                        {application.admission || 'Pending'}
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
                    <DetailRow label="Father's Name" value={data.fatherName || data.fathersName} />
                    <DetailRow label="Mother's Name" value={data.motherName || data.mothersName} />
                    <DetailRow label="Nationality" value={data.nationality || 'Indian'} />
                    <DetailRow label="Category" value={data.category} />
                    <DetailRow label="Aadhaar Number" value={data.aadhaarNumber || data.aadhaar || 'N/A'} />
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-500" /> Address Details
                  </h3>
                  <div className="flex flex-col">
                    <DetailRow label="Address" value={data.address || data.postalAddress} />
                    <DetailRow label="City" value={data.city} />
                    <DetailRow label="State" value={data.state} />
                    <DetailRow label="Pincode" value={data.pinCode || data.pincode} />
                  </div>
                </div>
              </div>

              {/* Education Qualifications */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-500" /> Education Qualifications (SSC / 10th)
                </h3>
                {data.education_qualifications && data.education_qualifications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg whitespace-nowrap">Level</th>
                          <th className="px-4 py-3 whitespace-nowrap">Institution</th>
                          <th className="px-4 py-3 whitespace-nowrap">Board/Univ</th>
                          <th className="px-4 py-3 whitespace-nowrap">Year</th>
                          <th className="px-4 py-3 whitespace-nowrap">Score</th>
                          <th className="px-4 py-3 rounded-tr-lg whitespace-nowrap">Certificate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.education_qualifications.map((edu: any) => (
                          <tr key={edu.educationId || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{edu.level || edu.qualificationLevel}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{edu.schoolOrCollege || edu.schoolName}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{edu.boardOrUniversity || edu.board}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{edu.passingYear}</td>
                            <td className="px-4 py-3 font-semibold text-indigo-600 whitespace-nowrap">{edu.gradeOrPercentage}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
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

            </div>
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
