import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { createSession } from '@/lib/auth';
import { db } from '@/lib/firebase';

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

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI) {
    console.error("Google OAuth credentials are not set in .env file.");
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }
  
  if (!db) {
    console.error("Firebase Admin SDK is not initialized. Check server logs.");
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

    const usersRef = db.collection("users");
    const q = usersRef.where("email", "==", userInfo.email);
    const querySnapshot = await q.get();
    
    let userId: string;
    let userPicture: string | null | undefined;

    if (querySnapshot.empty) {
        const newUserRef = usersRef.doc();
        const newUser = {
            email: userInfo.email,
            googleId: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture,
        };
        await newUserRef.set(newUser);
        userId = newUserRef.id;
        userPicture = newUser.picture;
    } else {
        const userDoc = querySnapshot.docs[0];
        userId = userDoc.id;
        const updatedData = {
            googleId: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture,
        };
        await userDoc.ref.update(updatedData);
        userPicture = updatedData.picture;
    }
    
    await createSession({
        userId: userId,
        email: userInfo.email,
        picture: userPicture,
        tokens: tokens,
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err: any) {
    console.error('Failed to exchange auth code for tokens:', err.message);
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }
}
