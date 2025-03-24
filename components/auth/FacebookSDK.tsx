'use client';
import { useEffect } from 'react';
import Script from 'next/script';

// Define a type for Facebook SDK
interface FacebookSDK {
  init: (params: {
    appId: string | undefined;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  AppEvents: {
    logPageView: () => void;
  };
}

// Extend Window interface to include FB
declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit: () => void;
  }
}

export default function FacebookSDK(): React.ReactElement {
  useEffect(() => {
    // Only set fbAsyncInit if it hasn't been set yet to prevent hydration conflicts
    if (typeof window !== 'undefined' && !window.fbAsyncInit) {
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          window.FB.AppEvents.logPageView();
        }
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