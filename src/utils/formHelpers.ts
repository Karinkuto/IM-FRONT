/**
 * Converts a data URL (e.g., from an image preview) into a Blob object.
 * This is useful when you have a Base64-encoded image in the frontend and need to send it as a binary file to the backend.
 * @param dataURL The data URL string (e.g., "data:image/png;base64,...").
 * @returns A Blob object.
 */
export const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Builds a FormData object from a plain JavaScript object,
 * handling File objects and converting data URLs to Blobs.
 * It nests all fields under a 'payload' key (e.g., payload[fieldName]),
 * which is a common convention for backends expecting multipart/form-data.
 *
 * @param payload The plain JavaScript object containing form values.
 * @param fileFields An array of keys whose values might be File objects or data URL strings that need conversion (e.g., ['logo', 'avatar']).
 * @returns A FormData object ready for submission.
 */
export const createFormData = (
  payload: Record<string, any>,
  fileFields: string[] = []
): FormData => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (fileFields.includes(key)) {
      // Handle file fields
      if (value instanceof File) {
        // Directly append the File object without modification
        formData.append(`payload[${key}]`, value);
      } else if (value instanceof Blob) {
        // Convert Blob to File with proper metadata
        const file = new File([value], `${key}.${getFileExtension(value)}`, {
          type: value.type || "application/octet-stream",
          lastModified: Date.now(),
        });
        formData.append(`payload[${key}]`, file);
      } else if (
        value &&
        typeof value === "string" &&
        value.startsWith("data:")
      ) {
        // Handle data URLs - convert to File
        try {
          const blob = dataURLtoBlob(value);
          const file = new File(
            [blob],
            `${key}.${getFileExtensionFromDataURL(value)}`,
            {
              type: blob.type,
              lastModified: Date.now(),
            }
          );
          formData.append(`payload[${key}]`, file);
        } catch (error) {
          console.error("Error converting data URL to file:", error);
        }
      }
      // Skip null/undefined/string URL values for file fields
    } else {
      // Handle non-file fields
      if (value !== null && value !== undefined) {
        formData.append(`payload[${key}]`, String(value));
      }
    }
  });

  return formData;
};

// Helper functions
const getFileExtension = (blob: Blob): string => {
  const type = blob.type;
  if (type.includes("image/jpeg") || type.includes("image/jpg")) return "jpg";
  if (type.includes("image/png")) return "png";
  if (type.includes("image/gif")) return "gif";
  if (type.includes("image/webp")) return "webp";
  return "bin"; // fallback
};

const getFileExtensionFromDataURL = (dataURL: string): string => {
  const mimeMatch = dataURL.match(/data:([^;]+);/);
  if (mimeMatch) {
    const mimeType = mimeMatch[1];
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
    if (mimeType.includes("png")) return "png";
    if (mimeType.includes("gif")) return "gif";
    if (mimeType.includes("webp")) return "webp";
  }
  return "png"; // default fallback
};
