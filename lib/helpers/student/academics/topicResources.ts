export type StudentTopicResource = {
  collegeSubjectUnitTopicResourceId: number;
  resourceType: string | null;
  resourceName: string;
  resourceUrl: string;
  collegeSubjectUnitTopicId: number;
  collegeId: number;
  createdBy: number | null;
  isAdmin: number | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export async function getStudentTopicResources(
  collegeSubjectUnitTopicId: number,
): Promise<StudentTopicResource[]> {
  const response = await fetch(
    `/api/student/topic-resources?topicId=${collegeSubjectUnitTopicId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Failed to load resources");
  }

  return payload.resources as StudentTopicResource[];
}
