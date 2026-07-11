import { notFound } from "next/navigation";
import ProcessPayment from "../components/ProcessPayment";
import { reimbursements } from "../data";

export default async function ReimbursementPaymentPage({params}:{params:Promise<{id:string}>}) {
  const { id } = await params;
  const request = reimbursements.find(item => item.id === id);
  if (!request) notFound();
  return <ProcessPayment request={request}/>;
}
