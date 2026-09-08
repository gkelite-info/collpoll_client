/** Preserve useful diagnostics even when a response has an empty error body. */
export function createQueryError(
  operation: string,
  error: { message?: string; code?: string; details?: string; hint?: string },
  status: number,
  statusText: string,
): Error {
  const details = [error.message, error.details, error.hint]
    .filter((value) => value?.trim())
    .join("; ");
  const response = [status ? `HTTP ${status}` : "Network request failed", statusText, error.code]
    .filter(Boolean)
    .join(" / ");

  return new Error(`${operation}: ${details || "No error details returned"} (${response})`, {
    cause: error,
  });
}
