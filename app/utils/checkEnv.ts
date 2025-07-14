export function checkYouTubeConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY &&
    process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  );
}

export function checkZoomConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_ZOOM_ACCOUNT_ID &&
    process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID &&
    process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET
  );
} 