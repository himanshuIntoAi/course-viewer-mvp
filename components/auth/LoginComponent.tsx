'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthForm from './AuthForm';
import { useOnboarding } from '../../state/context/login/OnboardingContext';
import { Poppins } from 'next/font/google';
import FacebookSDK from './FacebookSDK';
import styles from './auth.module.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

type UserPath = 'student' | 'instructor';

interface Theme {
  primary: string;
  buttonBg: string;
  buttonText: string;
  borderColor: string;
}

interface Themes {
  [key: string]: Theme;
}

// Define a type for auth user data
interface AuthUserData {
  credential?: string;
  accessToken?: string;
  code?: string;
  token?: string | null;
  provider?: string | null;
  is_student: boolean;
  is_instructor?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

// Create a client component that uses searchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useOnboarding();
  const [selectedPath, setSelectedPath] = useState<UserPath>('student');
  const isSigningOut = searchParams?.get('signout') === 'true';
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const errorParam = searchParams?.get('error');
  const redirectPath = searchParams?.get('redirect');
  const [errorMessage, setError] = useState('');

  // Set initial user type in sessionStorage and cookies when component mounts
  useEffect(() => {
    // Only run on client side
    const defaultUserType: UserPath = 'student';
    sessionStorage.setItem('user_type', defaultUserType);
    document.cookie = `temp_is_student=true; path=/`;
    document.cookie = `temp_is_instructor=false; path=/`;
    setSelectedPath(defaultUserType);
    
    console.log('Initial user type set:', {
      sessionStorage: sessionStorage.getItem('user_type'),
      cookies: {
        student: document.cookie.includes('temp_is_student=true'),
        instructor: document.cookie.includes('temp_is_instructor=true')
      }
    });
  }, []);

  // Handle successful authentication and redirect - memoized with useCallback
  const handleAuthSuccess = useCallback((userData: AuthUserData) => {
    if (redirectPath) {
      router.replace(redirectPath);
    } else {
      router.replace(userData.is_student ? '/student-dashboard' : '/mentor-dashboard');
    }
  }, [redirectPath, router]);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // The following handlers are used by auth providers but may not be directly called in this component
  // They're kept for API completeness and future use
  const handleGoogleAuthSuccess = (response: { credential: string }) => {
    handleAuthSuccess({
      credential: response.credential, 
      provider: 'google',
      is_student: typeof window !== 'undefined' ? sessionStorage.getItem('user_type') === 'student' : true
    });
  };

  const handleFacebookAuthSuccess = (response: { accessToken: string }) => {
    handleAuthSuccess({
      accessToken: response.accessToken, 
      provider: 'facebook',
      is_student: typeof window !== 'undefined' ? sessionStorage.getItem('user_type') === 'student' : true
    });
  };

  const handleGithubAuthSuccess = (code: string) => {
    handleAuthSuccess({
      code,
      provider: 'github',
      is_student: typeof window !== 'undefined' ? sessionStorage.getItem('user_type') === 'student' : true
    });
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  useEffect(() => {
    if (searchParams.get('token')) {
      handleAuthSuccess({
        token: searchParams.get('token'),
        provider: searchParams.get('provider'),
        is_student: typeof window !== 'undefined' ? sessionStorage.getItem('user_type') === 'student' : true
      });
    }
  }, [searchParams, handleAuthSuccess]);

  useEffect(() => {
    if (searchParams.get('error')) {
      setError(searchParams.get('error') || '');
    }
  }, [searchParams]);

  // Handle user state changes
  useEffect(() => {
    if (!loading && user && !isSigningOut) {
      // Convert User object to AuthUserData format
      handleAuthSuccess({
        ...user
      });
    }
  }, [user, loading, isSigningOut, redirectPath, handleAuthSuccess]);

  // Color themes
  const themes: Themes = {
    student: {
      primary: '#02baba',
      buttonBg: '#02baba',
      buttonText: 'white',
      borderColor: '#02baba'
    },
    instructor: {
      primary: '#16197c',
      buttonBg: '#16197c',
      buttonText: 'white',
      borderColor: '#16197c'
    }
  };

  const handlePathClick = (path: UserPath): void => {
    setSelectedPath(path);
    // Update sessionStorage and cookies with new selection
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user_type', path);
      document.cookie = `temp_is_student=${path === 'student' ? 'true' : 'false'}; path=/`;
      document.cookie = `temp_is_instructor=${path === 'instructor' ? 'true' : 'false'}; path=/`;
      console.log('User type updated to:', path);
      console.log('Cookies set:', {
        student: document.cookie.includes('temp_is_student=true'),
        instructor: document.cookie.includes('temp_is_instructor=true')
      });
    }
  };

  // Placeholder for future submit functionality
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const handleSubmit = async () => {
    try {
      // Handle submit logic will be implemented later
      console.log('Submit handler placeholder');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (user && !isSigningOut && !loading) {
    return <></>;
  }

  const currentTheme = themes[selectedPath === 'student' ? 'student' : 'instructor'];

  const getButtonStyle = (path: UserPath): React.CSSProperties => ({
    backgroundColor: selectedPath === path ? themes[path].primary : 'transparent',
    color: selectedPath === path ? 'white' : '#6B7280',
    flex: 1,
    padding: '8px 24px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: '500'
  });

  return (
    <div 
      className={`${poppins.className} min-h-screen flex items-center justify-center`}
      style={{ 
        backgroundColor: 'white',
        backgroundImage: 'url("/login_background.png")',
        backgroundBlendMode: 'multiply'
      }}
    >
      <FacebookSDK />
      <div className="w-full flex flex-col items-center px-4">
        {errorMessage && (
          <div className={styles['error-message']}>
            {errorMessage}
            <button 
              onClick={() => window.history.replaceState({}, '', '/')}
              className={styles['close-button']}
            >
              ✕
            </button>
          </div>
        )}

        <div className="w-full max-w-[580px] flex flex-col items-center">
          {/* Logo */}
          <div className={styles['logo-container']}>
            <Image
              src="/main_logo.png"
              alt="CloudOU Logo"
              width={200}
              height={80}
              priority
              onClick={() => router.push('/')}
              className="cursor-pointer"
            />
          </div>

          {/* Toggle Buttons */}
          <div className={styles['toggle-container']}>
            <button
              onClick={() => handlePathClick('student')}
              style={{
                ...getButtonStyle('student'),
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            >
              LEARNER
            </button>
            <button
              onClick={() => handlePathClick('instructor')}
              style={{
                ...getButtonStyle('instructor'),
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            >
              EARNER
            </button>
          </div>

          {/* Main Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 0 50px -12px rgba(0, 0, 0, 0.30)',
            width: '100%',
            paddingLeft: '60px',
            paddingRight: '60px',
            paddingTop: '16px',
            paddingBottom: '16px'
          }}>
            <div className="text-center mb-4">
              <h2 style={{ 
                fontSize: '22px',
                fontWeight: '680',
                marginBottom: '0px',
                color: '#111827',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span>Join Our Extra-Ordinary</span>
                <span>Journey</span>
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                marginTop: '4px'
              }}>
                Sign-up and Start learning with AI
              </p>
            </div>

            <AuthForm
              buttonStyle={{
                backgroundColor: currentTheme.buttonBg,
                color: currentTheme.buttonText,
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              inputStyle={{
                borderColor: currentTheme.borderColor
              }}
              selectedPath={selectedPath}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginComponent(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 