'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';

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

  await createSession(user.id, user.email);
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

  await createSession(newUser.id, newUser.email);
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function signInWithGoogle() {
    // MOCK: In a real app, this would redirect to Google's OAuth consent screen
    // After consent, Google would redirect back to a callback URL in our app.
    // The callback would verify the user and create a session.
    // For this mock, we'll just create a session for a mock Google user.
    await createSession('google-user-1', 'google.user@example.com');
    redirect('/dashboard');
}
