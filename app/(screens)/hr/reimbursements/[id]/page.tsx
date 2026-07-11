import { notFound } from "next/navigation";
import ReimbursementReview from "../components/ReimbursementReview";
import { mockReimbursementRequests } from "../data/mockData";

export default async function ReimbursementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = mockReimbursementRequests.find((item) => item.id === id);
  if (!request) notFound();
  return <ReimbursementReview request={request} />;
}
