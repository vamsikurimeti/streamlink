import { cookies } from 'next/headers';
import type { Credentials } from 'google-auth-library';

const SESSION_COOKIE_NAME = 'session';

export interface Session {
  userId: string;
  email: string;
  tokens?: Credentials;
}

export async function createSession(sessionData: Session) {
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (cookie) {
    try {
      return JSON.parse(cookie.value);
    } catch (error) {
      return null;
    }
  }
  return null;
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}