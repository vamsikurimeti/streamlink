'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, register, signInWithGoogle } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.42 0-8.03-3.6-8.03-8.02s3.6-8.02 8.03-8.02c2.45 0 4.02.98 4.96 1.9l2.84-2.76C20.02 1.92 16.7 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.04 0 12.08-4.76 12.08-12.08 0-.8-.08-1.6-.2-2.4H12.48z"/>
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary"
    >
      <path d="m12 8-8 5 8 5 8-5-8-5Z" />
      <path d="M20 13v4c0 1.1-.9 2-2 2H6a2 2 0 0 1-2-2v-4" />
      <path d="m4 13 8 5 8-5" />
    </svg>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === 'login' ? login : register;
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto flex items-center justify-center space-x-2">
          <BrandIcon />
          <h1 className="text-2xl font-bold">StreamLink</h1>
        </div>
        <CardTitle className="mt-4 text-2xl">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' ? 'Sign in to continue to StreamLink.' : 'Enter your details to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state?.error?.email && <p className="text-xs text-destructive">{state.error.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.error?.password && <p className="text-xs text-destructive">{state.error.password[0]}</p>}
          </div>
          {state?.error?.form && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {state.error.form[0]}
                </AlertDescription>
            </Alert>
          )}
          <SubmitButton>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </SubmitButton>
        </form>
        <Separator className="my-6" />
        <form action={signInWithGoogle}>
            <Button variant="outline" className="w-full">
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign in with Google
            </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <Link href={mode === 'login' ? '/register' : '/login'} className="font-medium text-primary hover:underline">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Submitting...' : children}
    </Button>
  );
}
