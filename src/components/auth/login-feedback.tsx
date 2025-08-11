
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginFeedback() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [errorHandled, setErrorHandled] = useState(false);

  useEffect(() => {
    // Avoid re-triggering toast on every render
    if (errorHandled) return;

    const error = searchParams.get('error');
    if (error) {
      let description = 'An unexpected error occurred. Please try again.';

      switch (error) {
        case 'oauth_failed':
          description = 'Google sign-in failed. Please try again.';
          break;
        case 'server_config':
          description =
            'There is a server configuration issue. Please contact support.';
          break;
        case 'token_exchange_failed':
          description =
            'Could not verify your Google account. Please try again.';
          break;
      }

      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description,
      });

      setErrorHandled(true);
    }
  }, [searchParams, toast, errorHandled]);

  return null; // This component does not render any visible UI
}
