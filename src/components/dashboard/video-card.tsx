import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Video } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const streamedAtDate = new Date(video.streamedAt);
  const timeAgo = formatDistanceToNow(streamedAtDate, { addSuffix: true });

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={video.thumbnailUrl}
            alt={`Thumbnail for ${video.title}`}
            width={600}
            height={400}
            className="aspect-video w-full object-cover"
            data-ai-hint="live stream"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-base font-semibold leading-tight">
          <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {video.title}
          </Link>
        </CardTitle>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <Badge variant="secondary">{timeAgo}</Badge>
        <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open on YouTube">
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </Link>
      </CardFooter>
    </Card>
  );
}
