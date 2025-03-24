'use client';
import { useEffect, useState } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set isLoaded to true to indicate we're on the client
    setIsLoaded(true);
    
    // Define fbAsyncInit function for Facebook SDK
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

    // Cleanup function
    return () => {
      if (window.fbAsyncInit) {
        window.fbAsyncInit = () => {};
      }
    };
  }, []);

  // Only render the script on client-side
  if (!isLoaded) return <></>;

  return (
    <Script
      id="facebook-sdk"
      strategy="afterInteractive"
      src="https://connect.facebook.net/en_US/sdk.js"
    />
  );
} 