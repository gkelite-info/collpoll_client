export function TaxSection() {
  return (
    <div className="flex-1 relative min-h-[60vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
      {/* Tax UI remains unchanged */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
        <div><p className="text-[#333333] font-bold text-[14px]">Net Taxable Income</p><p className="text-[#43C17A] font-medium text-[13px] mt-1">INR 3,39,200</p></div>
        <div><p className="text-[#333333] font-bold text-[14px]">Gross Income Tax</p><p className="text-[#43C17A] font-medium text-[13px] mt-1">INR 3,39,200</p></div>
        <div><p className="text-[#333333] font-bold text-[14px]">Total Surcharge & Cess</p><p className="text-[#43C17A] font-medium text-[13px] mt-1">INR 3,39,200</p></div>
        <div><p className="text-[#333333] font-bold text-[14px]">Net Income Tax Payable</p><p className="text-[#43C17A] font-medium text-[13px] mt-1">INR 3,39,200</p></div>
        <div><p className="text-[#333333] font-bold text-[14px]">TAX paid Till Now</p><p className="text-[#43C17A] font-medium text-[13px] mt-1">INR 0</p></div>
        <div><p className="text-[#333333] font-bold text-[14px]">Remaining Tax To Be Paid</p><p className="text-[#43C17A] font-medium text-[13px] mt-1">INR 0</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-[#333333] font-bold">Salary Breakup</th>
                <th className="py-4 px-6 text-[#333333] font-bold">Total</th>
                <th className="py-4 px-6 text-[#333333] font-bold">Apr 25</th>
                <th className="py-4 px-6 text-[#333333] font-bold">May 25</th>
                <th className="py-4 px-6 text-[#333333] font-bold">Jun 25</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[#666666] font-medium">Basic</td>
                <td className="py-4 px-6 text-[#333333] font-medium">2,12,500</td>
                <td className="py-4 px-6 text-[#333333] font-medium">37,417</td>
                <td className="py-4 px-6 text-[#333333] font-medium">37,417</td>
                <td className="py-4 px-6 text-[#333333] font-medium">37,417</td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[#666666] font-medium">HRA</td>
                <td className="py-4 px-6 text-[#333333] font-medium">85,000</td>
                <td className="py-4 px-6 text-[#333333] font-medium">14,234</td>
                <td className="py-4 px-6 text-[#333333] font-medium">14,234</td>
                <td className="py-4 px-6 text-[#333333] font-medium">14,234</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
