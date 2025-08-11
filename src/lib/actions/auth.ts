'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';
import { google } from 'googleapis';

// MOCK database of users
const users = [
  { id: '1', email: 'user@example.com', password: 'password123' }
];

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { email, password } = validatedFields.data;

  // MOCK: In a real app, you'd check hashed password against DB
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return {
      error: { form: ['Invalid email or password'] },
    };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // MOCK: Check if user exists
  if (users.find(u => u.email === email)) {
    return {
      error: { form: ['User with this email already exists'] },
    };
  }

  // MOCK: Create user
  const newUser = { id: String(users.length + 1), email, password };
  users.push(newUser);

  await createSession({ userId: newUser.id, email: newUser.email });
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function signInWithGoogle() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Google OAuth credentials are not set in .env file.");
    throw new Error('Server configuration error: Google OAuth credentials are not set up.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google` : 'http://localhost:9002/api/auth/callback/google'
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