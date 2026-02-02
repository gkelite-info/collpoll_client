import ClientSubjectDetails from "./clientSubjectDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubjectDetailsPage(props: PageProps) {
  const params = await props.params;

  const subjectId = parseInt(params.id, 10);

  if (isNaN(subjectId)) {
    return <div>Invalid Subject ID</div>;
  }

  return <ClientSubjectDetails subjectId={subjectId} />;
}
