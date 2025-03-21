'use client';
import { useEffect } from 'react';
import Script from 'next/script';

// Extend Window interface to include FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function FacebookSDK(): React.ReactElement {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        window.FB.AppEvents.logPageView();
      };
    }
  }, []);

  return (
    <Script
      id="facebook-sdk"
      strategy="lazyOnload"
      src="https://connect.facebook.net/en_US/sdk.js"
    />
  );
} 