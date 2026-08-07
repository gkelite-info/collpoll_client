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

export async function getTopicResources(params: {
  collegeSubjectUnitTopicId: number;
  page?: number;
  limit?: number;
}): Promise<{ resources: TopicResource[], hasNextPage: boolean, nextCursor?: number }> {
  let response: Response;

  try {
    const url = new URL("/api/faculty/topic-resources", window.location.origin);
    url.searchParams.append("topicId", String(params.collegeSubjectUnitTopicId));
    if (params.page) url.searchParams.append("page", String(params.page));
    if (params.limit) url.searchParams.append("limit", String(params.limit));

    response = await fetch(
      url.toString().replace(window.location.origin, ""),
      {
        method: "GET",
        credentials: "include",
      },
    );
  } catch (error: unknown) {
    throw new Error(
      `Network error while loading topic resources: ${getErrorMessage(error)}`,
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload.error || "Failed to load resources");
  }

  return {
    resources: payload.resources as TopicResource[],
    hasNextPage: payload.hasNextPage as boolean,
    nextCursor: payload.nextCursor as number | undefined,
  };
}

export async function uploadTopicResource(params: {
  file: File;
  collegeSubjectUnitTopicId: number;
  replaceExisting?: boolean;
}): Promise<TopicResource> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append(
    "topicId",
    String(params.collegeSubjectUnitTopicId),
  );
  if (params.replaceExisting) {
    formData.append("replaceExisting", "true");
  }

  let response: Response;

  try {
    response = await fetch("/api/faculty/topic-resources", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  } catch (error: unknown) {
    throw new Error(
      `Network error while uploading topic PDF (${formatBytes(params.file.size)}): ${
        getErrorMessage(error)
      }`,
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload.error || "Failed to upload resource");
  }

  return payload.resource as TopicResource;
}

export async function deleteTopicResource(params: { resourceId: number }) {
  let response: Response;

  try {
    response = await fetch(
      `/api/faculty/topic-resources?resourceId=${params.resourceId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
  } catch (error: unknown) {
    throw new Error(
      `Network error while deleting topic resource: ${getErrorMessage(error)}`,
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload.error || "Failed to delete resource");
  }
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Unexpected response from topic resource API (${response.status} ${response.statusText})`,
    );
  }
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "request failed";
}
