import { google } from 'googleapis';

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}. Please set it in your .env file or hosting provider's configuration.`);
  }
}

// Construct the redirect URI from the base app URL
const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`;

/**
 * A pre-configured Google OAuth2 client.
 * This is the single source of truth for Google authentication configuration.
 */
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

/**
 * The scopes required for the application.
 * This includes access to user profile, email, and YouTube data.
 */
export const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
];
