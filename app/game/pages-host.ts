export const pagesUrl = "https://animagix77.github.io/onetinyrevision/";
export const pagesOrigin = new URL(pagesUrl).origin;
export const tableOrigin =
  "https://one-tiny-revision-banquet.binhthere.chatgpt.site";

export function randomKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64url(bytes);
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export async function digestKey(key: string) {
  return base64url(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)),
    ),
  );
}

export const validKey = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{43}$/.test(value);
