export type TopicResource = {
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

export async function getTopicResources(
  collegeSubjectUnitTopicId: number,
): Promise<TopicResource[]> {
  const response = await fetch(
    `/api/faculty/topic-resources?topicId=${collegeSubjectUnitTopicId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Failed to load resources");
  }

  return payload.resources as TopicResource[];
}

export async function uploadTopicResource(params: {
  file: File;
  collegeSubjectUnitTopicId: number;
}): Promise<TopicResource> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append(
    "topicId",
    String(params.collegeSubjectUnitTopicId),
  );

  const response = await fetch("/api/faculty/topic-resources", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Failed to upload resource");
  }

  return payload.resource as TopicResource;
}

export async function deleteTopicResource(params: { resourceId: number }) {
  const response = await fetch(
    `/api/faculty/topic-resources?resourceId=${params.resourceId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Failed to delete resource");
  }
}
