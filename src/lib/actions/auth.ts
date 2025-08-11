'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';
import { google } from 'googleapis';
import { db } from '@/lib/firebase';
import bcrypt from 'bcrypt';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function login(prevState: any, formData: FormData) {
  if (!db) {
    console.error("Firebase Admin SDK is not initialized. Check server logs for GOOGLE_APPLICATION_CREDENTIALS.");
    return { error: { form: ['Server configuration error. Please contact support.'] } };
  }
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const usersRef = db.collection("users");
    const q = usersRef.where("email", "==", email);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return { error: { form: ['Invalid email or password'] } };
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (!user.password) {
        return { error: { form: ['Please sign in with Google for this account.'] } };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return { error: { form: ['Invalid email or password'] } };
    }

    await createSession({ userId: userDoc.id, email: user.email, picture: user.picture });
    
  } catch (error) {
    console.error("Login error:", error);
    return { error: { form: ['An unexpected error occurred. Please try again.'] } };
  }
  
  redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
    if (!db) {
        console.error("Firebase Admin SDK is not initialized. Check server logs for GOOGLE_APPLICATION_CREDENTIALS.");
        return { error: { form: ['Server configuration error. Please contact support.'] } };
    }
    const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
          error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const usersRef = db.collection("users");
        const q = usersRef.where("email", "==", email);
        const querySnapshot = await q.get();

        if (!querySnapshot.empty) {
            return { error: { form: ['User with this email already exists'] } };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserRef = usersRef.doc();
        await newUserRef.set({
            email,
            password: hashedPassword,
        });

        await createSession({ userId: newUserRef.id, email: email });
    } catch (error) {
        console.error("Registration error:", error);
        return { error: { form: ['An unexpected error occurred. Please try again.'] } };
    }

    redirect('/dashboard');
}


export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function signInWithGoogle() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI) {
    console.error("Google OAuth credentials are not set in .env file.");
    throw new Error('Server configuration error: Google OAuth credentials are not set up.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  redirect(url);
}
