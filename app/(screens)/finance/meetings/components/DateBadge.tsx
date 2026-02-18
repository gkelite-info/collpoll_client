export default function DateBadge() {
    return (
        <div className="flex rounded-md overflow-hidden shadow-sm border border-gray-200 bg-white">
            <div className="bg-[#1e293b] text-white px-3 py-2 flex flex-col items-center justify-center min-w-[60px]">
                <span className="text-xs font-bold">23</span>
                <span className="text-[10px] uppercase">OCT</span>
            </div>
            <div className="bg-white text-gray-800 px-3 py-2 flex items-center justify-center min-w-[80px]">
                <span className="text-lg font-bold">08:23</span>
                <span className="text-xs ml-1 text-gray-500">am</span>
            </div>
        </div>
    )
}