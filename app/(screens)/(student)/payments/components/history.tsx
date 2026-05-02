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
      <div className="w-48 bg-gray-200 rounded-lg overflow-hidden text-center shadow-sm">
        <div className="bg-slate-800 text-white py-2 text-sm font-medium">
          {t("Amount Spend")}
        </div>
        <div className="py-3 font-bold text-gray-800 text-lg">
          {amountSpend.toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
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
      </div>
    </div>
  );
};

export default History;
