import type { ReactNode } from 'react';
import Header from '@/components/dashboard/header';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    // This is a failsafe, middleware should handle this.
    redirect('/login');
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