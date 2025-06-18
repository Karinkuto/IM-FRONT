/**
 * Converts a data URL (e.g., from an image preview) into a Blob/File object.
 * This is useful when you have a Base64-encoded image in the frontend and need to send it as a binary file to the backend.
 * @param dataurl The data URL string (e.g., "data:image/png;base64,...").
 * @param filename The desired filename for the resulting File object.
 * @returns A File object.
 */
export const dataURLtoBlob = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'; // Default to png if mime not found
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

/**
 * Builds a FormData object from a plain JavaScript object,
 * handling File objects and converting data URLs to Blobs.
 * It nests all fields under a 'payload' key (e.g., payload[fieldName]),
 * which is a common convention for backends expecting multipart/form-data.
 *
 * @param data The plain JavaScript object containing form values.
 * @param fileKeys An array of keys whose values might be File objects or data URL strings that need conversion (e.g., ['logo', 'avatar']).
 * @returns A FormData object ready for submission.
 */
export const buildFormDataPayload = (
    data: Record<string, any>,
    fileKeys: string[] = [],
): FormData => {
    const formData = new FormData();

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            let value = data[key];

            // Check if the key is in fileKeys and if the value is a data URL string
            if (fileKeys.includes(key) && typeof value === "string" && value.startsWith("data:")) {
                // Convert data URL to Blob/File
                value = dataURLtoBlob(value, `${key}_${Date.now()}.png`);
            }

            if (value instanceof File) {
                // Append File objects directly, including their original name
                formData.append(`payload[${key}]`, value, value.name);
            } else if (value !== null && value !== undefined) {
                // Convert other non-null, non-undefined values to string and append
                formData.append(`payload[${key}]`, String(value));
            } else if (value === null) {
                // Explicitly send "null" string for null values if the backend expects it
                formData.append(`payload[${key}]`, "null");
            }
            // Undefined values are skipped (they won't be appended to FormData)
        }
    }
    return formData;
};

/**
 * Helper to safely convert form values to FormData with proper file handling.
 * This is a more specific version of buildFormDataPayload that's tailored for our API.
 *
 * @param values The form values object
 * @param fileFields Array of field names that should be treated as files
 * @returns FormData ready for submission
 */
export const createFormData = <T extends Record<string, any>>(
    values: T,
    fileFields: string[] = []
): FormData => {
    return buildFormDataPayload(values, fileFields);
};
