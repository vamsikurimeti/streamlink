'use server';

import { Video } from '@/lib/types';

export async function goLive(): Promise<{ streamUrl?: string; error?: string }> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!API_KEY || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("YouTube API credentials are not set in .env file.");
    return { error: 'Server configuration error. The administrator needs to set up YouTube API credentials.' };
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const success = Math.random() > 0.2; 

  if (success) {
    const streamId = Math.random().toString(36).substring(7);
    return { streamUrl: `https://www.youtube.com/watch?v=${streamId}` };
  } else {
    return { error: 'Failed to start live stream. Please try again.' };
  }
}

export async function getVideoHistory(): Promise<Video[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: '1',
      title: 'My First Awesome Live Stream',
      thumbnailUrl: 'https://placehold.co/600x400.png',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      streamedAt: '2024-05-10T18:30:00Z',
    },
    {
      id: '2',
      title: 'Weekly Q&A Session',
      thumbnailUrl: 'https://placehold.co/600x400.png',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      streamedAt: '2024-05-03T18:30:00Z',
    },
    {
      id: '3',
      title: 'Coding a Cool App Live!',
      thumbnailUrl: 'https://placehold.co/600x400.png',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      streamedAt: '2024-04-26T20:00:00Z',
    },
    {
      id: '4',
      title: 'Exploring New Features',
      thumbnailUrl: 'https://placehold.co/600x400.png',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      streamedAt: '2024-04-19T18:30:00Z',
    },
  ];
}
