'use client';

export default function MeetingCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col p-5 relative animate-pulse">
            
            <div className="flex justify-between items-center pb-2 sticky top-0 bg-white z-10">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            </div>

            <div className="pb-5 overflow-y-auto flex-1 mt-4">
                
                <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    
                    <div className="flex flex-col gap-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-32"></div>
                        </div>
                        {/* <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </div> */}
                    </div>

                    <div className="flex flex-col gap-y-4">
                        {/* <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-10"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                        </div> */}
                        
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="flex items-center">
                                <div className="flex -space-x-2">
                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-300"></div>
                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-300"></div>
                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-300"></div>
                                </div>
                                <div className="h-4 w-6 bg-gray-200 rounded ml-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}