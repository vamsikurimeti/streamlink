import AuthForm from '@/components/auth/auth-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthForm mode="register" />
    </div>
  );
}
