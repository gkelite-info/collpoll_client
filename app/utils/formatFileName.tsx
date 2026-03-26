export function formatFileName(fileUrl: string) {
    if (!fileUrl) return "";

    const rawFileName = fileUrl.split("/").pop() || "";

    const decoded = decodeURIComponent(rawFileName);

    const withoutTimestamp = decoded.replace(/^\d+_/, "");

    const match = withoutTimestamp.match(/([A-Za-z0-9_-]+)\.(\w+)$/);

    return match
        ? `${match[1].toLowerCase()}.${match[2]}`
        : withoutTimestamp;
}