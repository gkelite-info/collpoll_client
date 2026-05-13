import { notFound } from "next/navigation";
import StudentsOverviewPage from "../../../finance-analytics/students/page";

type PageProps = {
  params: Promise<{ studentId: string; rest: string[] }>;
};

export default async function FinanceStudentCatchAllPage(props: PageProps) {
  const params = await props.params;
  const studentId = params.studentId;
  const rest = params.rest || [];

  if (studentId === "finance-analytics" && rest.length === 1 && rest[0] === "students") {
    return <StudentsOverviewPage />;
  }

  notFound();
}

