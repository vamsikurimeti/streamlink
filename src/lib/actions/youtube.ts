'use server';

import { google } from 'googleapis';
import type { youtube_v3 } from 'googleapis';
import { Video } from '@/lib/types';
import { getSession } from '@/lib/auth';

// This is a placeholder for a function that would manage OAuth tokens.
// In a real application, you would need a robust way to store and refresh these.
async function getOAuthClient(userId: string) {
  // MOCK: In a real implementation, you would retrieve stored tokens from a database
  // associated with the user's session. The sign-in flow would need to be updated
  // to store these tokens upon authorization.
  console.log(`Retrieving tokens for userId: ${userId}`);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // This redirect URL must be registered in your Google Cloud Console project
    // for the given client ID.
    process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google` : 'http://localhost:9002/api/auth/callback/google'
  );

  // MOCK: Setting mock credentials. In a real app, you'd get these from your database
  // after the user has authorized your app.
  oauth2Client.setCredentials({
    access_token: 'mock_access_token_for_user_' + userId,
    refresh_token: 'mock_refresh_token_for_user_' + userId,
    // A real token would have an expiry date.
  });

  return oauth2Client;
}


export async function goLive(): Promise<{ streamUrl?: string; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: 'Authentication required. Please log in.' };
  }
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("YouTube API credentials are not set in .env file.");
    return { error: 'Server configuration error: YouTube API credentials are not set up.' };
  }
  
  try {
    const oauth2Client = await getOAuthClient(session.userId);
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
    if (err.message && err.message.includes('invalid_grant')) {
        return { error: 'Authentication with Google failed. Please re-authenticate to grant access to YouTube.' };
    }
    return { error: 'Failed to start live stream. Please ensure you have completed the OAuth2 authentication with YouTube.' };
  }
}

export async function getVideoHistory(): Promise<Video[]> {
  const session = await getSession();
  if (!session) {
    console.log('No session found, returning empty video history.');
    return [];
  }

  try {
    const oauth2Client = await getOAuthClient(session.userId);
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
      // We are throwing an error here instead of returning mock data so the UI can show a proper message.
      if (err.message && err.message.includes('invalid_grant')) {
        throw new Error('Authentication with Google failed. Please re-authenticate to grant access to YouTube.');
      }
      // Return mock data on other failures to prevent the UI from breaking
      // while you set up authentication.
      return [
        {
          id: '1',
          title: 'My First Awesome Live Stream (Mock Data)',
          thumbnailUrl: 'https://placehold.co/600x400.png',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          streamedAt: '2024-05-10T18:30:00Z',
        },
        {
          id: '2',
          title: 'Weekly Q&A Session (Mock Data)',
          thumbnailUrl: 'https://placehold.co/600x400.png',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          streamedAt: '2024-05-03T18:30:00Z',
        },
      ];
  }
}
