import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import GoLiveCard from '@/components/dashboard/go-live-card';
import VideoHistory from '@/components/dashboard/video-history';
import DashboardClientWrapper from './dashboard-client-wrapper';
 
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClientWrapper session={session} videoHistory={<VideoHistory />}>
        <GoLiveCard />
      </DashboardClientWrapper>
    </Suspense>
  );
}
