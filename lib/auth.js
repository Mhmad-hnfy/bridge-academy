const SECRET = process.env.SESSION_SECRET || "fahem_super_secure_session_secret_key_2026_jwt_fallback_key";

export async function signCookieValue(value) {
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(SECRET);
  const dataBuf = encoder.encode(value);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
  const hexSignature = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${value}.${hexSignature}`;
}

export async function verifyCookieValue(cookieValue) {
  if (!cookieValue || !cookieValue.includes(".")) return null;
  const [value, signature] = cookieValue.split(".");
  const expectedSigned = await signCookieValue(value);
  if (cookieValue === expectedSigned) {
    return value;
  }
  return null;
}
