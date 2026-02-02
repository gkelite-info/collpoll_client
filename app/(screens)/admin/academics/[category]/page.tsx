import { ClientAcademicsWrapper } from "./clientPage";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ year?: string }>;
};

export default async function AcademicsPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const category = decodeURIComponent(params.category);
  const year = searchParams.year || "1st Year";

  return <ClientAcademicsWrapper category={category} year={year} />;
}
