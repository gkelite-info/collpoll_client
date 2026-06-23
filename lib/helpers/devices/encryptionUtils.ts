/**
 * AES-GCM encryption/decryption utility for device passwords.
 * Uses Web Crypto API (native, no dependencies).
 *
 * Encrypted format: base64( IV(12 bytes) + ciphertext )
 */

const ENV_KEY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_DEVICE_ENCRYPTION_KEY
    : undefined;

const DEFAULT_KEY = "collpoll-biometric-enc-key-0032!";

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

function getKeyBytes(): ArrayBuffer {
  const raw = ENV_KEY || DEFAULT_KEY;
  const padded = raw.padEnd(32, "0").slice(0, 32);
  return toArrayBuffer(new TextEncoder().encode(padded));
}

async function getCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", getKeyBytes(), { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a plain-text password.
 * Returns a base64 string safe to store in the database.
 */
export async function encryptPassword(plainText: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoded),
  );
  const cipher = new Uint8Array(cipherBuf);

  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv);
  combined.set(cipher, iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a previously encrypted password.
 * Accepts the base64 string produced by `encryptPassword`.
 */
export async function decryptPassword(encryptedBase64: string): Promise<string> {
  const key = await getCryptoKey();
  const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(ciphertext),
  );
  return new TextDecoder().decode(plainBuf);
}
