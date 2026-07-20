import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface MonthPickerProps {
    isOpen: boolean;
    currentDate: Date;
    onChangeDate: (date: Date) => void;
    onClose: () => void;
}

export default function MonthPicker({ isOpen, currentDate, onChangeDate, onClose }: MonthPickerProps) {
    if (!isOpen) return null;

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        const grid = [];
        // Prev month trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            grid.push({ day: prevMonthDays - i, isCurrentMonth: false });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ day: i, isCurrentMonth: true });
        }
        // Next month leading days
        const remaining = 42 - grid.length;
        for (let i = 1; i <= remaining; i++) {
            grid.push({ day: i, isCurrentMonth: false });
        }
        return grid;
    };
    
    const grid = generateCalendarGrid();
    
    return (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4">
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800">{monthName}</span>
                <div className="flex gap-1">
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const d = new Date(currentDate); 
                            d.setMonth(d.getMonth() - 1); 
                            onChangeDate(d); 
                        }} 
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded text-gray-500"
                    >
                        <CaretLeft size={16} weight="bold" />
                    </button>
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const d = new Date(currentDate); 
                            d.setMonth(d.getMonth() + 1); 
                            onChangeDate(d); 
                        }} 
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded text-gray-500"
                    >
                        <CaretRight size={16} weight="bold" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-bold text-gray-400">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {grid.map((d, i) => {
                    const isSelected = d.isCurrentMonth && d.day === currentDate.getDate();
                    return (
                        <button 
                            key={i} 
                            onClick={() => {
                                if (d.isCurrentMonth) {
                                    const next = new Date(currentDate);
                                    next.setDate(d.day);
                                    onChangeDate(next);
                                    onClose();
                                }
                            }}
                            className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors
                                ${!d.isCurrentMonth ? 'text-gray-300 cursor-default' : 
                                  isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}`}
                        >
                            {d.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
