'use client';
import { useState, useEffect } from 'react';
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

export default function LoginComponent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useOnboarding();
  const [selectedPath, setSelectedPath] = useState<UserPath>('student');
  const isSigningOut = searchParams?.get('signout') === 'true';
  const error = searchParams?.get('error');

  // Set initial user type in sessionStorage and cookies when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always set the default values when the page loads
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
    }
  }, []);

  // Handle authentication data when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userStr = params.get('user');

      if (token && userStr) {
        try {
          // Parse and store user data
          const userData = JSON.parse(userStr);
          
          // Store token
          localStorage.setItem('access_token', token);
          
          // Set user type based on backend response ONLY
          if (userData.is_student === true) {
            sessionStorage.setItem('user_type', 'student');
            document.cookie = `temp_is_student=true; path=/`;
            document.cookie = `temp_is_instructor=false; path=/`;
          } else if (userData.is_instructor === true) {
            sessionStorage.setItem('user_type', 'instructor');
            document.cookie = `temp_is_student=false; path=/`;
            document.cookie = `temp_is_instructor=true; path=/`;
          }

          // Store complete user data
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Clean up URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('user');
          window.history.replaceState({}, '', newUrl.toString());
          
          // Redirect to dashboard
          router.replace(userData.is_student ? '/student-dashboard' : '/mentor-dashboard');
        } catch (error) {
          console.error('Error processing authentication data:', error);
        }
      }
    }
  }, [router]);

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

  // Handle error messages
  let errorMessage = '';
  if (error && !isSigningOut) {
    try {
      const errorData = JSON.parse(decodeURIComponent(error));
      errorMessage = errorData.detail || 'Authentication failed';
    } catch (e) {
      errorMessage = error === 'Authentication required' ? '' : error;
    }
  }

  useEffect(() => {
    if (!loading && user && !isSigningOut) {
      router.replace(user.is_student ? '/student-dashboard' : '/mentor-dashboard');
    }
  }, [user, router, loading, isSigningOut]);

  useEffect(() => {
    if (error && typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [error]);

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

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (user && !isSigningOut && !loading) {
    return null;
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