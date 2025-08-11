'use server';

import { google } from 'googleapis';
import type { youtube_v3 } from 'googleapis';
import { Video } from '@/lib/types';
import { getSession } from '@/lib/auth';

async function getOAuthClient() {
  const session = await getSession();
  if (!session?.tokens) {
    throw new Error('Authentication required. Please log in.');
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("YouTube API credentials are not set in .env file.");
    throw new Error('Server configuration error: YouTube API credentials are not set up.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(session.tokens);

  return oauth2Client;
}


export async function goLive(): Promise<{ streamUrl?: string; error?: string }> {
  try {
    const oauth2Client = await getOAuthClient();
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const broadcastResponse = await youtube.liveBroadcasts.insert({
      part: ['snippet,contentDetails,status'],
      requestBody: {
        snippet: {
          title: `My StreamLink Broadcast - ${now.toLocaleString()}`,
          scheduledStartTime: now.toISOString(),
          description: "A new live stream from StreamLink!",
        },
        contentDetails: {
          isReusable: false,
          enableAutoStart: true,
          enableAutoStop: true,
          monitorStream: {
            enableMonitorStream: true,
          }
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      }
    });

    const broadcastId = broadcastResponse.data.id;
    if (!broadcastId) {
      throw new Error('Failed to create broadcast.');
    }

    const streamResponse = await youtube.liveStreams.insert({
        part: ['snippet,cdn,status'],
        requestBody: {
            snippet: {
                title: `StreamLink Stream - ${now.toLocaleString()}`,
            },
            cdn: {
                format: '1080p',
                ingestionType: 'rtmp',
                resolution: '1080p',
                frameRate: '60fps'
            },
        }
    });

    const streamId = streamResponse.data.id;
    if (!streamId) {
        throw new Error('Failed to create live stream.');
    }
    
    await youtube.liveBroadcasts.bind({
        part: ['id,contentDetails'],
        id: broadcastId,
        streamId: streamId,
    });
    
    const liveUrl = `https://www.youtube.com/watch?v=${broadcastId}`;
    console.log(`Successfully created live stream: ${liveUrl}`);
    return { streamUrl: liveUrl };

  } catch (err: any) {
    console.error('Error creating YouTube live stream:', err.message);
    if (err.code === 401 || (err.response?.data?.error === 'invalid_grant')) {
        return { error: 'Authentication with Google failed. Please sign out and sign in again.' };
    }
    return { error: `Failed to start live stream: ${err.message}` };
  }
}

export async function getVideoHistory(): Promise<Video[]> {
  try {
    const oauth2Client = await getOAuthClient();
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.search.list({
      part: ['snippet'],
      forMine: true,
      type: ['video'],
      eventType: 'completed',
      maxResults: 20,
    });

    const items = response.data.items || [];
    return items.map((item: youtube_v3.Schema$SearchResult) => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || 'No Title',
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || 'https://placehold.co/600x400.png',
      videoUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      streamedAt: item.snippet?.publishedAt || new Date().toISOString(),
    })).filter(video => video.id);

  } catch (err: any) {
      console.error('Error fetching video history:', err.message);
      if (err.code === 401 || (err.response?.data?.error === 'invalid_grant')) {
        throw new Error('Authentication with Google failed. Please sign out and sign in again.');
      }
      throw new Error(`Failed to fetch video history: ${err.message}`);
  }
}
