import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { createSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth Error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }

  if (!code) {
    console.error('OAuth Error: No code found');
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Google OAuth credentials are not set in .env file.");
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google` : 'http://localhost:9002/api/auth/callback/google'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
        throw new Error("Failed to retrieve user information from Google.");
    }
    
    await createSession({
        userId: userInfo.id,
        email: userInfo.email,
        tokens: tokens,
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err: any) {
    console.error('Failed to exchange auth code for tokens:', err.message);
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }
}