'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let description = 'An unexpected error occurred. Please try again.';
      switch (error) {
        case 'oauth_failed':
          description = 'Google sign-in failed. Please try again.';
          break;
        case 'server_config':
          description = 'There is a server configuration issue. Please contact support.';
          break;
        case 'token_exchange_failed':
            description = 'Could not verify your Google account. Please try again.';
            break;
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: description,
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthForm mode="login" />
    </div>
  );
}
