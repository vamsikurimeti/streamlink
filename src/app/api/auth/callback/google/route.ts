import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { createSession } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';


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
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
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

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userInfo.email));
    const querySnapshot = await getDocs(q);
    
    let userId: string;

    if (querySnapshot.empty) {
        const newUserDoc = await addDoc(usersRef, {
            email: userInfo.email,
            googleId: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture,
        });
        userId = newUserDoc.id;
    } else {
        userId = querySnapshot.docs[0].id;
    }
    
    await createSession({
        userId: userId,
        email: userInfo.email,
        tokens: tokens,
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err: any) {
    console.error('Failed to exchange auth code for tokens:', err.message);
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }
}
