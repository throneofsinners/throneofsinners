// Tracking tokens: THRONE-XXXX-XXXX-XXXX
// Crockford-style alphabet (no 0/O/1/I/L) to reduce transcription errors.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSegment(len: number): string {
  // Use Web Crypto when available (server + browser), fallback to Math.random.
  const bytes = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateTrackingToken(): string {
  return `THRONE-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}`;
}

const TOKEN_RE = /^THRONE-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export function normalizeToken(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidToken(input: string): boolean {
  return TOKEN_RE.test(normalizeToken(input));
}
