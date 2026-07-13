import imageCompression from "browser-image-compression";

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

const extensionOf = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

export type PreparedExpenseAttachment = {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export async function prepareExpenseAttachment(
  file: File,
): Promise<PreparedExpenseAttachment> {
  const extension = extensionOf(file.name);

  if (![...IMAGE_EXTENSIONS, "pdf"].includes(extension)) {
    throw new Error(`“${file.name}” must be a PDF, JPG, JPEG, or PNG file.`);
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new Error(`“${file.name}” is larger than 5MB.`);
  }

  // browser-image-compression cannot decode PDFs. PDFs are validated and kept
  // byte-for-byte intact; reliable PDF recompression belongs on the server.
  if (extension === "pdf") {
    return { file, wasCompressed: false, originalSize: file.size };
  }

  const compressedBlob = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type || (extension === "png" ? "image/png" : "image/jpeg"),
    initialQuality: 0.82,
  });

  if (compressedBlob.size >= file.size) {
    return { file, wasCompressed: false, originalSize: file.size };
  }

  return {
    file: new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: Date.now(),
    }),
    wasCompressed: true,
    originalSize: file.size,
  };
}

export async function prepareExpenseAttachments(files: File[]) {
  return Promise.all(files.map(prepareExpenseAttachment));
}
