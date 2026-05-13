import { useTranslations } from "next-intl";

export interface Transaction {
  id: number | string;
  items: string;
  qty: number;
  costCenter: string;
  amount: number;
  message: string;
  gateway: string;
  trxnId: string;
  paidOn: string;
  status: "Success" | "Failure" | "Pending";
}

interface HistoryProps {
  amountSpend: number;
  transactions: Transaction[];
}

export const History: React.FC<HistoryProps> = ({
  amountSpend,
  transactions,
}) => {
  const t = useTranslations("Payments.student"); // Hook

  return (
    <div className="space-y-6">
      <div className="w-full md:w-48 bg-gray-200 rounded-lg overflow-hidden text-center shadow-sm">
        <div className="bg-[#16284F] text-white py-2 text-sm font-medium">
          {t("Amount Spend")}
        </div>
        <div className="py-3 font-bold text-gray-800 text-xl md:text-lg">
          ₹ {amountSpend.toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-md:bg-transparent max-md:shadow-none max-md:border-none">
        {/*  DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-center whitespace-nowrap">
            <thead className="bg-gray-200/70 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">{t("Id")}</th>
                <th className="px-6 py-4">{t("Items")}</th>
                <th className="px-6 py-4">{t("Qty")}</th>
                <th className="px-6 py-4">{t("Cost Center")}</th>
                <th className="px-6 py-4">{t("Amount")}</th>
                <th className="px-6 py-4">{t("Message")}</th>
                <th className="px-6 py-4">{t("Gateway")}</th>
                <th className="px-6 py-4">{t("Trxn Id")}</th>
                <th className="px-6 py-4">{t("Paid On")}</th>
                <th className="px-6 py-4">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    {t("No Data Available")}
                  </td>
                </tr>
              ) : (
                transactions.map((trx, idx) => (
                  <tr key={trx.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{trx.id}</td>
                    <td className="px-6 py-4 text-gray-600">{trx.items}</td>
                    <td className="px-6 py-4 text-gray-600">{trx.qty}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {trx.costCenter}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {trx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {trx.message || "-"}
                    </td>
                    <td className="px-6 py-4 text-blue-800 font-bold italic">
                      {trx.gateway}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{trx.trxnId}</td>
                    <td className="px-6 py-4 text-gray-600">{trx.paidOn}</td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        trx.status === "Success"
                          ? "text-emerald-500"
                          : trx.status === "Failure"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {t(trx.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/*  MOBILE CARDS VIEW */}
        <div className="md:hidden flex flex-col gap-3 w-full">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 font-medium py-8 bg-white rounded-xl shadow-sm border border-gray-100">
              {t("No Data Available")}
            </p>
          ) : (
            transactions.map((trx, idx) => (
              <div
                key={trx.id || idx}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start border-b border-gray-50 pb-2 mb-1">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                      ID: {trx.id} • {trx.trxnId}
                    </p>
                    <h4 className="font-bold text-gray-800 text-[14px] mt-0.5">
                      {trx.items}{" "}
                      <span className="text-gray-500 font-normal ml-1">
                        (x{trx.qty})
                      </span>
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide
                          ${trx.status === "Success" ? "bg-emerald-100 text-emerald-700" : trx.status === "Failure" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}
                       `}
                  >
                    {t(trx.status)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-500">{t("Cost Center")}:</span>
                  <span className="font-medium text-gray-800">
                    {trx.costCenter}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-500">{t("Gateway")}:</span>
                  <span className="font-bold italic text-blue-700">
                    {trx.gateway}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-500">{t("Paid On")}:</span>
                  <span className="font-medium text-gray-600">
                    {trx.paidOn}
                  </span>
                </div>

                <div className="mt-1 flex justify-between items-center bg-gray-50 rounded-lg p-2.5">
                  <span className="font-bold text-gray-700 text-xs">
                    {t("Amount")}
                  </span>
                  <span className="font-black text-gray-900 text-[15px]">
                    ₹ {trx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
