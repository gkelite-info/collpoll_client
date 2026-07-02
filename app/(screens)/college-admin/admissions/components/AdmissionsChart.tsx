"use client";

import { useState, useEffect } from "react";
import { TrendUp, CaretDown, SpinnerGap } from "@phosphor-icons/react";
import { formatKpiNumber } from "@/lib/helpers/numberFormatter";
import { getApplicationsByYear, subscribeToSubmissions, unsubscribeChannel } from "@/lib/api/gkeliteApi";

export default function AdmissionsChart() {
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const endYear = currentYear + 2;
  
  const years = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  
  const [monthlyData, setMonthlyData] = useState<number[]>(new Array(12).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      
      const data = await getApplicationsByYear(selectedYear);
        
      if (data) {
        const counts = new Array(12).fill(0);
        data.forEach(item => {
          const date = new Date(item.createdAt);
          const month = date.getMonth();
          counts[month] += 1;
        });
        setMonthlyData(counts);
      }
      setLoading(false);
    };

    fetchMonthlyData();

    const sub = subscribeToSubmissions((payload: any) => {
      if (!payload) return;
      const date = new Date(payload.createdAt || Date.now());
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        setMonthlyData(prev => {
          const newCounts = [...prev];
          newCounts[month] += 1;
          return newCounts;
        });
      }
    });

    return () => unsubscribeChannel(sub);
  }, [selectedYear]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxVal = Math.max(...monthlyData, 1); // Avoid division by zero

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col h-full min-h-[500px] relative">
      <div className="flex justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Admissions Trend</h3>
          <p className="text-sm text-gray-500">Monthly form submissions overview</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {selectedYear}
              <CaretDown size={14} weight="bold" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-100 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto custom-scrollbar">
                  {years.map(year => (
                    <div 
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedYear === year ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
            <TrendUp size={20} weight="bold" />
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
          <SpinnerGap className="animate-spin text-blue-500" size={32} />
        </div>
      )}

      <div className="flex-1 w-full bg-gray-50 rounded-xl border border-dashed border-gray-200 overflow-x-auto custom-scrollbar min-h-[250px]">
        <div className="min-w-[500px] h-full flex flex-col p-4 pt-10 gap-3 min-h-[250px]">
          <div className="flex items-end gap-2 flex-1 w-full">
            {monthlyData.map((count, i) => {
              const heightPercent = maxVal === 1 && count === 0 ? 0 : (count / maxVal) * 100;
              return (
                <div 
                  key={i} 
                  onClick={() => setActiveBar(activeBar === i ? null : i)}
                  className="flex-1 flex flex-col justify-end h-full gap-2 relative group cursor-pointer"
                >
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity z-10 pointer-events-none whitespace-nowrap ${activeBar === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {formatKpiNumber(count)}
                  </div>
                  <div 
                    className={`${activeBar === i ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} rounded-t-sm transition-colors w-full`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }} // Give at least 2% height so empty bars are slightly visible
                  ></div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs font-medium text-gray-400 gap-2 w-full px-1">
            {months.map(m => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
