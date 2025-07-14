import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ZOOM_ACCOUNT_ID = process.env.NEXT_PUBLIC_ZOOM_ACCOUNT_ID;
    const ZOOM_CLIENT_ID = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;
    const ZOOM_CLIENT_SECRET = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET;
    const ZOOM_API_BASE_URL = process.env.NEXT_PUBLIC_ZOOM_API_BASE_URL || 'https://api.zoom.us/v2';
    const ZOOM_USER_ID = process.env.NEXT_PUBLIC_ZOOM_USER_ID || 'me';

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Zoom configuration is missing' },
        { status: 400 }
      );
    }

    // First get the access token
    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: ZOOM_ACCOUNT_ID
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => null);
      return NextResponse.json(
        { error: `Zoom authentication failed: ${tokenResponse.status} ${tokenResponse.statusText}`, details: errorData },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Now fetch the recordings
    const recordingsResponse = await fetch(
      `${ZOOM_API_BASE_URL}/users/${ZOOM_USER_ID}/recordings?page_size=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!recordingsResponse.ok) {
      const errorData = await recordingsResponse.json().catch(() => null);
      return NextResponse.json(
        { error: `Failed to fetch Zoom recordings: ${recordingsResponse.status} ${recordingsResponse.statusText}`, details: errorData },
        { status: recordingsResponse.status }
      );
    }

    const recordingsData = await recordingsResponse.json();
    return NextResponse.json(recordingsData);
  } catch (error) {
    console.error('Error fetching Zoom recordings:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching Zoom recordings' },
      { status: 500 }
    );
  }
} 