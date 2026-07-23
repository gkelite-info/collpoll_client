import React from "react";

const SelectionModalShimmer: React.FC = () => {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border-b border-gray-100 last:border-0 animate-pulse bg-white">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="w-32 h-4 rounded bg-gray-200" />
            </div>
            <div className="w-4 h-4 rounded border border-gray-200 bg-gray-100" />
        </div>
    );
};

export default SelectionModalShimmer;
