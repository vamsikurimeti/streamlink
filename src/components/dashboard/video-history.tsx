import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVideoHistory } from '@/lib/actions/youtube';
import VideoCard from './video-card';
import { History } from 'lucide-react';

export default async function VideoHistory() {
  const videos = await getVideoHistory();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <span>Video History</span>
        </CardTitle>
        <CardDescription>A list of your previously streamed videos on YouTube.</CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            <p>You haven't streamed any videos yet.</p>
            <p>Click "Go Live" to start your first stream!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
