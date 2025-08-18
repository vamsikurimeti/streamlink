import { cookies } from 'next/headers';
import type { Credentials } from 'google-auth-library';
import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'session';

export interface Session {
  userId: string;
  email: string;
  picture?: string | null;
  tokens?: Credentials;
}

export function createSession(response: NextResponse, sessionData: Session) {
  const sessionValue = JSON.stringify(sessionData);
  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME);
  if (cookie) {
    try {
      return JSON.parse(cookie.value);
    } catch (error) {
      return null;
    }
  }
  return null;
}

export function deleteSession(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
}
