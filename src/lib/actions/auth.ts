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
  console.log("Attempting to log in user...");
  if (!db) {
    console.error("Login failed: Firestore is not initialized. Check server logs for GOOGLE_APPLICATION_CREDENTIALS.");
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
    console.log(`Finding user with email: ${email}`);
    const usersRef = db.collection("users");
    const q = usersRef.where("email", "==", email);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.log(`Login failed: No user found for email ${email}.`);
      return { error: { form: ['Invalid email or password'] } };
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();
    console.log(`User found: ${userDoc.id}`);

    if (!user.password) {
        console.log(`Login failed: User ${email} signed up with Google. No password exists.`);
        return { error: { form: ['Please sign in with Google for this account.'] } };
    }

    console.log("Comparing passwords...");
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      console.log("Login failed: Passwords do not match.");
      return { error: { form: ['Invalid email or password'] } };
    }

    console.log("Passwords match. Creating session...");
    await createSession({ userId: userDoc.id, email: user.email, picture: user.picture });
    console.log("Session created successfully.");
    
  } catch (error) {
    console.error("Login error:", error);
    return { error: { form: ['An unexpected error occurred. Please try again.'] } };
  }
  
  console.log("Redirecting to dashboard.");
  redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
    console.log("Attempting to register new user...");
    if (!db) {
        console.error("Registration failed: Firestore is not initialized. Check server logs for GOOGLE_APPLICATION_CREDENTIALS.");
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
        console.log(`Checking if user with email ${email} already exists.`);
        const usersRef = db.collection("users");
        const q = usersRef.where("email", "==", email);
        const querySnapshot = await q.get();

        if (!querySnapshot.empty) {
            console.log("Registration failed: User already exists.");
            return { error: { form: ['User with this email already exists'] } };
        }

        console.log("User does not exist. Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating new user in Firestore...");
        const newUserRef = usersRef.doc();
        await newUserRef.set({
            email,
            password: hashedPassword,
        });
        console.log(`New user created with ID: ${newUserRef.id}`);

        console.log("Creating session for new user...");
        await createSession({ userId: newUserRef.id, email: email });
        console.log("Session created successfully.");
    } catch (error) {
        console.error("Registration error:", error);
        return { error: { form: ['An unexpected error occurred. Please try again.'] } };
    }

    console.log("Redirecting to dashboard.");
    redirect('/dashboard');
}


export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function signInWithGoogle() {
  console.log("Initiating Google Sign-In...");
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  console.log(`Using Redirect URI: ${redirectUri}`);

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !redirectUri) {
    console.error("Google OAuth credentials or Redirect URI are not set in .env file.");
    throw new Error('Server configuration error: Google OAuth credentials are not set up.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
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

  console.log("Redirecting to Google for authentication at URL:", url);
  redirect(url);
}
