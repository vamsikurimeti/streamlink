// 'use client';

// import { ReactNode, useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import Header from '@/components/dashboard/header';
// import type { Session } from '@/lib/auth';
// import { useToast } from '@/hooks/use-toast';

// // This is a client-side wrapper to use hooks for session and toasts
// export default function DashboardLayoutWrapper({ children, session }: { children: ReactNode, session: Session | null }) {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { toast } = useToast();

//   useEffect(() => {
//     if (searchParams.get('success') === 'true') {
//       toast({
//         title: 'Signed in successfully!',
//         description: `Welcome back, ${session?.email || 'user'}!`,
//       });
//       // Clean up the URL
//       router.replace('/dashboard', { scroll: false });
//     }
//   }, [searchParams, toast, router, session]);
  
//   if (!session) {
//     // This should be caught by middleware, but as a fallback:
//     if (typeof window !== 'undefined') {
//       router.push('/login');
//     }
//     return null;
//   }

//   return (
//     <div className="flex min-h-screen w-full flex-col">
//       <Header user={session} />
//       <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
//         {children}
//       </main>
//     </div>
//   );
// }
'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/dashboard/header';
import type { Session } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayoutWrapper({ children, session }: { children: ReactNode, session: Session | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const hasHandledSuccess = useRef(false);

  // Redirect to login if no session
  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  // Show toast once on success
  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true';

    if (isSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;

      toast({
        title: 'Signed in successfully!',
        description: `Welcome back, ${session?.email || 'user'}!`,
      });

      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, toast, router, session]);

  if (!session) {
    return null; // Redirect effect will trigger
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
