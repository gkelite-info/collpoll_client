import { useEffect, useState, useRef } from "react";
import { X, DownloadSimple, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { getPayrollEntryDetails } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { formatExactNumber } from "@/app/utils/numberFormat";
import { ModalDetailShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import toast from "react-hot-toast";

// @ts-ignore
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const numberToWords = (num: number): string => {
  if (!num) return "Zero";
  const safeNum = Math.round(Math.abs(num));
  if (safeNum === 0) return "Zero";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + safeNum.toString()).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] !== '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (n[2] !== '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (n[3] !== '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (n[4] !== '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  return str.trim();
};

const formatRole = (role: string) => {
  if (!role) return "";
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

interface PayslipPreviewModalProps {
  entryId: number | null;
  onClose: () => void;
}



export default function PayslipPreviewModal({ entryId, onClose }: PayslipPreviewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entryId) return;
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPayrollEntryDetails(entryId);

        // Parse the exact breakdown of leaves, holidays, weekoffs
        if (result && result.payroll_runs) {
          const month = result.payroll_runs.payrollMonth;
          const year = result.payroll_runs.payrollYear;
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);

          const allHolidays = result.holidaysInMonth || [];
          const explicitWeekoffDates = new Set(
            allHolidays
              .filter((h: any) => h.holidayType === 'weekly_off')
              .map((h: any) => h.holidayDate)
          );

          const holidayDates = new Set(
            allHolidays
              .filter((h: any) => h.holidayType !== 'weekly_off')
              .map((h: any) => h.holidayDate)
          );

          let actualHolidays = 0;
          let actualWeekoffs = 0;

          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            const isWeekoff = explicitWeekoffDates.has(dateStr) || (explicitWeekoffDates.size === 0 && d.getDay() === 0);
            const isHoliday = holidayDates.has(dateStr);

            if (isWeekoff) actualWeekoffs++;
            else if (isHoliday) actualHolidays++;
          }

          result.parsedBreakdown = {
            holidays: actualHolidays,
            weekoffs: actualWeekoffs,
          };
        }

        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) {
          setError("Unable to load payslip details. Please try again later.");
          toast.error("Failed to load payslip details", { id: "payslip-fetch-error" });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [entryId]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "payslip-pdf-borders";
    style.innerHTML = `
      .pdf-container [class*="border-"] {
        border-color: #000000 !important;
        border-style: solid !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById("payslip-pdf-borders");
      if (existing) existing.remove();
    };
  }, []);

  if (!entryId) return null;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = data ? monthNames[data.payroll_runs.payrollMonth - 1] : "";
  const year = data ? data.payroll_runs.payrollYear : "";

  // Safe compliance mapping
  const compliances = data?.user?.employee_pay_profiles?.[0]?.employee_payroll_compliance_values || [];
  const earnings = [
    { label: "Basic Pay / Gross Salary", amount: Number(data?.grossEarnings || 0) }
  ];

  let totalDeductionsCalc = 0;
  const deductionsList: Record<string, string | number> = {
    PT: "-",
    TDS: "-",
    PF: "-",
    Advance: "-",
    Other: "-",
    ESI: "-"
  };

  compliances.forEach((c: any) => {
    const title = c.payroll_compliance_types?.title?.toUpperCase() || "";
    const amount = Number(c.amount || 0);
    totalDeductionsCalc += amount;
    if (title === "PF" || title.includes("PROVIDENT FUND")) deductionsList.PF = amount;
    else if (title === "EF" || title === "ESI" || title.includes("EMPLOYEE FUND")) deductionsList.ESI = amount;
    else if (title === "PT" || title === "TDS" || title.includes("TAX")) deductionsList.PT = amount; // Map TAX to PT or TDS, mostly PT if general
  });

  const lopAmount = (Number(data?.lopDays || 0) * Number(data?.perDayRate || 0)) + (Number(data?.halfDays || 0) * Number(data?.perDayRate || 0) * 0.5);
  if (lopAmount > 0) {
    deductionsList.Other = lopAmount;
    totalDeductionsCalc += lopAmount;
  }

  const logoUrl = data?.collegeMedia?.logoUrl;
  const bucketUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/college-media/` : "";
  const fullLogoUrl = logoUrl ? (logoUrl.startsWith("http") ? logoUrl : `${bucketUrl}${logoUrl}`) : null;

  const handleDownload = async () => {
    if (!data || !payslipRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading("Generating PDF...");

    try {
      const canvas = await html2canvas(payslipRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const pdfHeight = (canvas.height * (pdfWidth - 2 * margin)) / canvas.width;

      pdf.addImage(imgData, "JPEG", margin, margin, pdfWidth - 2 * margin, pdfHeight, undefined, 'FAST');
      pdf.save(`Payslip_${data.user?.fullName}_${monthName}_${year}.pdf`.replace(/\s+/g, "_"));

      toast.success("Payslip downloaded successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">Payslip Preview</h2>
          <div className="flex items-center gap-3 shrink-0">
            {data && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[#43C17A] hover:bg-[#38A166] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <DownloadSimple size={18} weight="bold" />
                )}
                <span className="hidden sm:inline">{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200 cursor-pointer bg-white border border-gray-200"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-100/50 p-4 sm:p-8">
          {loading ? (
            <ModalDetailShimmer variant="payslip" />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
              <WarningCircle size={48} weight="duotone" />
              <p className="font-medium text-lg">{error}</p>
            </div>
          ) : data ? (
            <div className="max-w-3xl mx-auto">
              {/* THE PAYSLIP CONTAINER TO BE CAPTURED BY HTML2CANVAS */}
              <div className="overflow-x-auto w-full">
                <div
                  ref={payslipRef}
                  className="bg-white p-4 w-[850px] min-w-[850px] mx-auto pdf-container"
                >
                  <div className="text-[13px] text-black bg-white" style={{ border: '2px solid black' }}>
                    {/* Header */}
                    <div className="flex p-[16px] items-center relative justify-center min-h-[120px]" style={{ borderBottom: '2px solid black' }}>
                      <div className="absolute left-6">
                        {fullLogoUrl ? (
                          <img src={fullLogoUrl} alt="Company Logo" className="max-h-20" crossOrigin="anonymous" />
                        ) : (
                          <div className="text-xl font-bold">ENERGETIC INFO SOLUTIONS</div>
                        )}
                      </div>
                      <div className="text-center leading-tight">
                        <h2 className="font-bold text-[17px] mb-1">{data.college?.collegeName || "Energetic Info Solutions Private Limited"}</h2>
                        <p className="text-[13px]">{data.college?.address || "H.No. 1-90/2/46/1, 3rd Floor, Vittal Rao Nagar"}</p>
                        <p className="text-[13px]">{data.college ? `${data.college.city}, ${data.college.state} - ${data.college.pincode}` : "Madhapur, Hyderabad, Telangana - 500 081"}</p>
                        <p className="mt-2 text-[14px]">Payslip for the month of {monthName}, {year}</p>
                      </div>
                    </div>

                    {/* Employee Details Grid */}
                    <div className="grid grid-cols-2 py-[8px] px-[16px] gap-y-[4px] text-[13px]" style={{ borderBottom: '2px solid black' }}>
                      <div className="flex"><span className="w-[144px] font-bold">Employee Name</span><span>: {data.user?.fullName}</span></div>
                      <div className="flex"><span className="w-[144px] font-bold">Date of Joining</span><span>: {data.user?.dateOfJoining ? new Date(data.user.dateOfJoining).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : "N/A"}</span></div>

                      <div className="flex"><span className="w-[144px] font-bold">Employee ID</span><span>: {data.user?.employee_ids?.employeeId || "N/A"}</span></div>
                      <div className="flex"><span className="w-[144px] font-bold">Standard Days</span><span>: {data.payroll_runs.totalCalendarDays || 30}</span></div>

                      <div className="flex"><span className="w-[144px] font-bold">Gender</span><span>: {data.user?.gender || "N/A"}</span></div>
                      <div className="flex"><span className="w-[144px] font-bold">Days Worked</span><span>: {data.fullDaysWorked || 0}</span></div>

                      <div className="flex"><span className="w-[144px] font-bold">Designation</span><span>: {formatRole(data.user?.role) || "N/A"}</span></div>
                      <div className="flex"><span className="w-[144px] font-bold">Bank Name</span><span>: {data.user?.staff_bank_details?.[0]?.bankName || "N/A"}</span></div>

                      <div className="flex"><span className="w-[144px] font-bold">PAN No.</span><span>: {(Array.isArray(data.user?.staff_pan_details) ? data.user?.staff_pan_details[0]?.panNumber : data.user?.staff_pan_details?.panNumber) || "N/A"}</span></div>
                      <div className="flex"><span className="w-[144px] font-bold">Bank A/c Number</span><span>: {data.user?.staff_bank_details?.[0]?.accountNumber || "N/A"}</span></div>

                      <div className="flex"><span className="w-[144px] font-bold">PF / UAN No.</span><span className="uppercase">: {data.user?.staff_bank_details?.[0]?.pfNumber || data.user?.staff_bank_details?.[0]?.uanNumber || "N/A"}</span></div>
                      <div className="flex"><span className="w-[144px] font-bold">LOP Days</span><span>: {data.lopDays || 0}</span></div>
                    </div>

                    {/* Salary Breakdown Table */}
                    <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid black' }}>
                          <th className="text-left font-bold italic py-[6px] px-[12px] w-[35%]" style={{ borderRight: '2px solid black' }}>EARNINGS</th>
                          <th className="text-right font-bold italic py-[6px] px-[12px] w-[15%]" style={{ borderRight: '2px solid black' }}>RUPEES</th>
                          <th className="text-left font-bold italic py-[6px] px-[12px] w-[35%]" style={{ borderRight: '2px solid black' }}>DEDUCTIONS</th>
                          <th className="text-right font-bold italic py-[6px] px-[12px] w-[15%]">RUPEES</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Basic</td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}>{formatExactNumber(data.grossEarnings) || "-"}</td>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Professional Tax</td>
                          <td className="py-[6px] px-[12px] text-right">{deductionsList.PT !== "-" ? formatExactNumber(Number(deductionsList.PT)) : "-"}</td>
                        </tr>
                        <tr>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>HRA</td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}>-</td>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Tax Deducted at Source</td>
                          <td className="py-[6px] px-[12px] text-right">{deductionsList.TDS !== "-" ? formatExactNumber(Number(deductionsList.TDS)) : "-"}</td>
                        </tr>
                        <tr>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Travelling and Medical Allowance</td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}>-</td>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Provident Fund</td>
                          <td className="py-[6px] px-[12px] text-right">{deductionsList.PF !== "-" ? formatExactNumber(Number(deductionsList.PF)) : "-"}</td>
                        </tr>
                        <tr>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Special Allowances</td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}>-</td>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Salary Advance</td>
                          <td className="py-[6px] px-[12px] text-right">{deductionsList.Advance !== "-" ? formatExactNumber(Number(deductionsList.Advance)) : "-"}</td>
                        </tr>
                        <tr>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}></td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}></td>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Other Deductions</td>
                          <td className="py-[6px] px-[12px] text-right">{deductionsList.Other !== "-" ? formatExactNumber(Number(deductionsList.Other)) : "-"}</td>
                        </tr>
                        <tr>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}></td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}></td>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>ESI</td>
                          <td className="py-[6px] px-[12px] text-right">{deductionsList.ESI !== "-" ? formatExactNumber(Number(deductionsList.ESI)) : "-"}</td>
                        </tr>
                        <tr className="font-bold" style={{ borderTop: '2px solid black' }}>
                          <td className="py-[6px] px-[12px] italic" style={{ borderRight: '2px solid black' }}>Total Salary</td>
                          <td className="py-[6px] px-[12px] text-right" style={{ borderRight: '2px solid black' }}>{formatExactNumber(data.grossEarnings) || "0"}</td>
                          <td className="py-[6px] px-[12px] italic" style={{ borderRight: '2px solid black' }}>Total Deduction</td>
                          <td className="py-[6px] px-[12px] text-right">{formatExactNumber(totalDeductionsCalc) || "0"}</td>
                        </tr>
                        <tr className="font-bold" style={{ borderTop: '2px solid black' }}>
                          <td className="py-[6px] px-[12px]" style={{ borderRight: '2px solid black' }}>Net Salary</td>
                          <td className="py-[6px] px-[12px] text-left" colSpan={3}>{formatExactNumber(data.netPay) || "0"}</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid black' }}>
                          <td className="py-[6px] px-[12px] font-bold whitespace-nowrap" style={{ borderRight: '2px solid black' }}>Amount (in words) :</td>
                          <td className="py-[6px] px-[12px] italic" colSpan={3}>Rupees {numberToWords(data.netPay || 0)} Only</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid black' }}>
                          <td className="py-[6px] px-[12px] text-[12px]" colSpan={4}>This Payslip is computer generated and does not require signature</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
