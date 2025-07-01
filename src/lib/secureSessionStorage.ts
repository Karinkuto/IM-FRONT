// Secure sessionStorage utility using AES-GCM encryption
// For production, use a dynamic key (e.g., per-session, from backend)
// Here, we use a static key for minimal code change and demo purposes

const STORAGE_PREFIX = "secure_";
const ENCRYPTION_KEY = "change_this_to_a_long_random_secret"; // Should be 32 chars for AES-256

// Helper: Convert string to ArrayBuffer
function strToBuf(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Helper: Convert ArrayBuffer to base64
function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

// Helper: Convert base64 to ArrayBuffer
function base64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  return Uint8Array.from([...bin].map((c) => c.charCodeAt(0))).buffer;
}

// Get CryptoKey from passphrase
async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    strToBuf(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function setItem(key: string, value: string): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await getKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    strToBuf(value)
  );
  // Store as base64(iv):base64(ciphertext)
  const stored = `${bufToBase64(iv)}:${bufToBase64(encrypted)}`;
  sessionStorage.setItem(STORAGE_PREFIX + key, stored);
}

export async function getItem(key: string): Promise<string | null> {
  const stored = sessionStorage.getItem(STORAGE_PREFIX + key);
  if (!stored) return null;
  const [ivB64, dataB64] = stored.split(":");
  if (!ivB64 || !dataB64) return null;
  const iv = new Uint8Array(base64ToBuf(ivB64));
  const data = base64ToBuf(dataB64);
  const cryptoKey = await getKey();
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    // Decryption failed (wrong key or tampered data)
    return null;
  }
}

export function removeItem(key: string): void {
  sessionStorage.removeItem(STORAGE_PREFIX + key);
}

// Usage example (async):
// await setItem('foo', 'bar');
// const value = await getItem('foo');
// removeItem('foo');
