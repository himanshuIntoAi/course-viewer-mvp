import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ZOOM_ACCOUNT_ID = process.env.NEXT_PUBLIC_ZOOM_ACCOUNT_ID;
    const ZOOM_CLIENT_ID = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;
    const ZOOM_CLIENT_SECRET = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET;

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Zoom configuration is missing' },
        { status: 400 }
      );
    }

    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://zoom.us/oauth/token', {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: `Zoom authentication failed: ${response.status} ${response.statusText}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Zoom authentication:', error);
    return NextResponse.json(
      { error: 'Internal server error during Zoom authentication' },
      { status: 500 }
    );
  }
} 