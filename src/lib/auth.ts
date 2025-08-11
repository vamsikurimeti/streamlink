import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';

interface Session {
  userId: string;
  email: string;
}

export async function createSession(userId: string, email: string) {
  const session: Session = { userId, email };
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify(session), {
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
