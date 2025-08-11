import { Suspense } from 'react';
import AuthForm from '@/components/auth/auth-form';
import LoginFeedback from '@/components/auth/login-feedback';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthForm mode="login" />
      <Suspense fallback={null}>
        <LoginFeedback />
      </Suspense>
    </div>
  );
}
