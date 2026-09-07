import { X, CalendarBlank, Clock, User, Note, Users } from '@phosphor-icons/react';

export default function MeetingViewModalShimmer() {
  return (
    <div className="px-5 sm:px-6 py-5 sm:py-6 flex-1 space-y-6 sm:space-y-8 animate-pulse">
        {/* Date and Time Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>

        {/* Organizer Shimmer */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <User size={18} weight="fill" className="text-gray-200 shrink-0" />
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>

        <hr className="border-gray-100" />

        {/* Agenda Shimmer */}
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Note size={18} weight="fill" className="text-gray-200" />
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100/50">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
        </div>

        {/* Attendees Shimmer */}
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Users size={18} weight="fill" className="text-gray-200" />
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-gray-200 shrink-0"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
