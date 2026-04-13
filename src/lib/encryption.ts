import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

// AES-256-GCM for authenticated encryption. The key is derived from the
// ENCRYPTION_KEY env var (hex-encoded 32 bytes / 64 chars).
//
// Storage format: <iv (24 hex)><auth tag (32 hex)><ciphertext (hex)>
// All three concatenated as a single string. 24 + 32 = 56 byte prefix.

const ALG = "aes-256-gcm" as const;
const IV_LENGTH = 12; // GCM standard

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    // Fallback: derive a stable key from the Supabase service role key.
    // Not ideal — you should set ENCRYPTION_KEY explicitly — but lets the
    // app work in dev without extra setup.
    const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!fallback) {
      throw new Error(
        "ENCRYPTION_KEY not set and no fallback available. Set ENCRYPTION_KEY to a 64-character hex string."
      );
    }
    return createHash("sha256").update(fallback).digest();
  }
  if (raw.length === 64) {
    return Buffer.from(raw, "hex");
  }
  // Not hex-encoded — hash it to get exactly 32 bytes.
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALG, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return iv.toString("hex") + authTag.toString("hex") + encrypted.toString("hex");
}

export function decryptSecret(stored: string): string {
  if (!stored || stored.length < 56) {
    throw new Error("Invalid encrypted value");
  }
  const iv = Buffer.from(stored.slice(0, 24), "hex");
  const authTag = Buffer.from(stored.slice(24, 56), "hex");
  const ciphertext = Buffer.from(stored.slice(56), "hex");
  const decipher = createDecipheriv(ALG, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
