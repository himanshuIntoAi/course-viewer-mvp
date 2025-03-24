'use client';
import { useState } from 'react';
import { initiateOAuthLogin } from '../../services/login/auth';
import { useOnboarding } from '../../state/context/login/OnboardingContext';
import Image from 'next/image';
import styles from './auth.module.css';

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

interface State {
  stateId: string;
  redirectPath: string;
  timestamp: number;
}

export default function LoginForm(): React.ReactElement {
  const { login, register } = useOnboarding();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<UserPath>('student');

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

  const currentTheme = themes[selectedPath];

  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px 12px 80px',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderRadius: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    fontSize: '16px',
    fontFamily: 'inherit',
    height: '48px',
    borderColor: error ? '#EF4444' : currentTheme.borderColor
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

  const validateForm = (): boolean => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Check backend health before attempting auth
      const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!healthCheck.ok) {
        throw new Error('Authentication service is currently unavailable. Please try again later.');
      }

      if (isSignUp) {
        // Extract first name from email (text before @)
        const firstName = email.split('@')[0];
        await register(email, password, firstName);
        setSuccess('Registration successful! Please sign in.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      initiateOAuthLogin('google', '/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to initialize Google login');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      initiateOAuthLogin('facebook', '/dashboard');
    } catch (error) {
      console.error('Facebook login error:', error);
      setError('Failed to initialize Facebook login');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = (): void => {
    // Ensure code only runs on client side
    if (typeof window === 'undefined') return;
    
    try {
      const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/github`;
      
      // Use a safer approach for generating UUID
      let stateId = '';
      try {
        stateId = crypto.randomUUID();
      } catch {
        // Fallback if randomUUID is not available
        stateId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      }
      
      const state: State = {
        stateId,
        redirectPath: '/dashboard',
        timestamp: Date.now()
      };
      
      const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email&state=${encodeURIComponent(JSON.stringify(state))}`;
      
      window.location.href = githubUrl;
    } catch (error) {
      console.error('GitHub login error:', error);
      setError('Failed to initialize GitHub login');
    }
  };

  const handleSocialAuth = async (provider: 'github' | 'facebook' | 'google' | 'linkedin' | 'apple'): Promise<void> => {
    if (provider === 'github') {
      handleGitHubLogin();
      return;
    }
    if (provider === 'facebook') {
      await handleFacebookLogin();
      return;
    }
    if (provider === 'google') {
      await handleGoogleLogin();
      return;
    }
    if (provider === 'linkedin') {
      // Implement LinkedIn login
      console.log('LinkedIn login not implemented yet');
      return;
    }
    if (provider === 'apple') {
      // Implement Apple login
      console.log('Apple login not implemented yet');
      return;
    }
    setError(`${provider} login not implemented yet`);
  };

  return (
    <div className="w-full flex justify-center items-center px-4">
      {/* Main Card */}
      <div className={styles['main-card']}>
        {/* Toggle Buttons */}
        <div className={styles['toggle-container']}>
          <button
            onClick={() => handlePathClick('student')}
            className={styles['path-toggle-button']}
            style={{
              backgroundColor: selectedPath === 'student' ? themes.student.primary : 'transparent',
              color: selectedPath === 'student' ? 'white' : '#6B7280'
            }}
          >
            LEARNER
          </button>
          <button
            onClick={() => handlePathClick('instructor')}
            className={styles['path-toggle-button']}
            style={{
              backgroundColor: selectedPath === 'instructor' ? themes.instructor.primary : 'transparent',
              color: selectedPath === 'instructor' ? 'white' : '#6B7280'
            }}
          >
            EARNER
          </button>
        </div>

        <div className="text-center mb-4 w-full">
          <h2 className="text-2xl font-bold text-gray-900 flex flex-col items-center">
            <span>Join Our Extra-Ordinary</span>
            <span>Journey</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sign-up and Start learning with AI
          </p>
        </div>

        <div className={styles['form-container']}>
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-2">
            {error && (
              <div className={styles['error-message']}>
                {error}
              </div>
            )}
            
            {success && (
              <div className={styles['success-message']}>
                {success}
              </div>
            )}

            <div className={styles['input-container']}>
              <Image
                src="/email.svg"
                alt="Email"
                width={18}
                height={18}
                className="absolute left-6 top-1/2 -translate-y-1/2 opacity-60"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles['form-input']}
                style={baseInputStyle}
                required
                placeholder="email@mail.com"
              />
            </div>

            <div className={styles['input-container']}>
              <Image
                src="/lock.svg"
                alt="Password"
                width={18}
                height={18}
                className="absolute left-6 top-1/2 -translate-y-1/2 opacity-60"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles['form-input']}
                style={baseInputStyle}
                required
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-transparent cursor-pointer"
              >
                <Image
                  src={showPassword ? "/eye-off.svg" : "/eye.svg"}
                  alt={showPassword ? "Hide password" : "Show password"}
                  width={18}
                  height={18}
                  className="opacity-50"
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles['submit-button']}
              style={{
                backgroundColor: currentTheme.buttonBg,
                color: currentTheme.buttonText,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : isSignUp ? 
                (selectedPath === 'student' ? 'Become A Superstar (Sign Up)' : "Let's Start Earning (Sign Up)") :
                'Sign In'}
            </button>

            <div className={styles['toggle-account-text']}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={styles['toggle-account-button']}
                style={{ color: currentTheme.primary }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>

            <div className={styles['divider-container']}>
              <div className={styles['divider-line']} />
              <div className={styles['divider-text']}>
                <span className={styles['divider-text-inner']}>
                  OR
                </span>
              </div>
            </div>

            <div className={styles['social-login-container']}>
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className={styles['social-button']}
                aria-label="Continue with Google"
              >
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={24}
                  height={24}
                />
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className={styles['social-button']}
                aria-label="Continue with GitHub"
              >
                <Image
                  src="/github.svg"
                  alt="GitHub"
                  width={24}
                  height={24}
                />
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSocialAuth('facebook')}
                className={styles['social-button']}
                aria-label="Continue with Facebook"
              >
                <Image
                  src="/facebook.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                />
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleSocialAuth('apple')}
                className={styles['social-button']}
                aria-label="Continue with Apple"
              >
                <Image
                  src="/apple.svg"
                  alt="Apple"
                  width={24}
                  height={24}
                />
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleSocialAuth('linkedin')}
                className={styles['social-button']}
                aria-label="Continue with LinkedIn"
              >
                <Image
                  src="/linkedin.svg"
                  alt="LinkedIn"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 