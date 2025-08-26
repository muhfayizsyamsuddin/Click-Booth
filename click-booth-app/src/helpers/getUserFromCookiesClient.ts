import { verifyToken } from "@/helpers/jwt";

export type AuthUser = { id: string; email: string; role: string } | null;

export function getUserFromCookiesClient(): AuthUser {
  if (typeof window === "undefined") {
    return null; // Not in browser environment
  }

  // Get all cookies from browser
  const cookies = document.cookie.split(";");
  let token = null;

  // Find authorization cookie
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "authorization" || name === "Authorization") {
      token = value.startsWith("Bearer%20")
        ? decodeURIComponent(value).slice(7)
        : value.startsWith("Bearer ")
        ? value.slice(7)
        : value;
      break;
    }
  }

  if (!token) return null;

  try {
    return verifyToken(token) as { id: string; email: string; role: string };
  } catch (err) {
    console.warn("getUserFromCookiesClient: invalid token", err);
    return null;
  }
}

export function getAuthTokenFromCookies(): string | null {
  if (typeof window === "undefined") {
    return null; // Not in browser environment
  }

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "authorization" || name === "Authorization") {
      return value.startsWith("Bearer%20")
        ? decodeURIComponent(value).slice(7)
        : value.startsWith("Bearer ")
        ? value.slice(7)
        : value;
    }
  }

  return null;
}
