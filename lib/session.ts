import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  sessionCookieName,
  sessionCookieOptions,
  verifySessionToken,
} from "./auth";

/** Returns the authenticated username or null. */
export async function getSessionUser(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;
  return verifySessionToken(token)?.username ?? null;
}

/** For server components/pages: redirect to /login when not authenticated. */
export async function requireSessionUser(): Promise<string> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function setSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(
    sessionCookieName,
    createSessionToken(username),
    sessionCookieOptions()
  );
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}