import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import GoLiveCard from '@/components/dashboard/go-live-card';
import VideoHistory from '@/components/dashboard/video-history';
import DashboardLayoutWrapper from './layout';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayoutWrapper session={session}>
      <GoLiveCard />
      <VideoHistory />
    </DashboardLayoutWrapper>
  );
}
