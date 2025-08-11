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
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(new URL(`/login?error=oauth_failed&message=${error}`, request.url));
  }

  if (!code) {
    console.error('OAuth Callback Error: No code found');
    return NextResponse.redirect(new URL('/login?error=oauth_failed&message=No_code_found', request.url));
  }
  
  console.log("Received OAuth callback with authorization code.");

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI) {
    console.error("CRITICAL: Missing Google OAuth environment variables.");
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }
  
  if (!db) {
    console.error("CRITICAL: Firebase Admin SDK is not initialized. Check server logs for GOOGLE_APPLICATION_CREDENTIALS.");
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }
  
  try {
    console.log("Setting up Google OAuth2 client...");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    console.log("Exchanging authorization code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log("Successfully received OAuth tokens.");

    console.log("Fetching user info from Google...");
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
        console.error("Google user info response was missing email or id.");
        throw new Error("Failed to retrieve user information from Google.");
    }

    console.log(`User info received for email: ${userInfo.email}`);
    
    const usersRef = db.collection("users");
    const q = usersRef.where("email", "==", userInfo.email);
    const querySnapshot = await q.get();
    
    let userId: string;
    let userPicture: string | null | undefined = userInfo.picture;

    if (querySnapshot.empty) {
        console.log("User not found in Firestore. Creating new user...");
        const newUserRef = usersRef.doc();
        const newUser = {
            email: userInfo.email,
            googleId: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture,
        };
        await newUserRef.set(newUser);
        userId = newUserRef.id;
        console.log(`New user created with ID: ${userId}`);
    } else {
        const userDoc = querySnapshot.docs[0];
        userId = userDoc.id;
        console.log(`User found in Firestore with ID: ${userId}. Updating profile.`);
        const updatedData = {
            googleId: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture,
        };
        await userDoc.ref.update(updatedData);
    }
    
    console.log("Creating session for the user...");
    await createSession({
        userId: userId,
        email: userInfo.email,
        picture: userPicture,
        tokens: tokens, // Storing tokens is crucial for API calls
    });
    console.log("Session created successfully.");

    console.log("Redirecting to dashboard...");
    return NextResponse.redirect(new URL('/dashboard?success=true', request.url));
  } catch (err: any) {
    console.error('Failed to process Google OAuth callback:', err.message);
    const errorMessage = err.response?.data?.error || 'token_exchange_failed';
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
  }
}
