'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useOnboarding } from '../../state/context/login/OnboardingContext';

interface UserData {
  user_id: string;
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
  full_name?: string;
  username?: string;
}

interface ProfileImageProps {
  imageData: string;
}

type UserType = 'student' | 'instructor' | null;

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout, isAuthenticated, setUser } = useOnboarding();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    const handleInitialLoad = async () => {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');

      if (token) {
        // Store the token
        localStorage.setItem('access_token', token);
        
        // Store user data if available
        if (userStr) {
          try {
            const userData: UserData = JSON.parse(userStr);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set user type based on backend response
            if (userData.is_student === true) {
              sessionStorage.setItem('user_type', 'student');
              document.cookie = `temp_is_student=true; path=/`;
              document.cookie = `temp_is_instructor=false; path=/`;
              setUserType('student');
            } else if (userData.is_instructor === true) {
              sessionStorage.setItem('user_type', 'instructor');
              document.cookie = `temp_is_student=false; path=/`;
              document.cookie = `temp_is_instructor=true; path=/`;
              setUserType('instructor');
            }

            // Update user context with the backend data
            setUser({
              id: userData.user_id,
              display_name: userData.display_name,
              email: userData.email,
              profile_image: userData.profile_image,
              is_student: userData.is_student,
              is_instructor: userData.is_instructor
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }

        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('user');
        router.replace(url.pathname);
      } else {
        // If no token in URL, try to get user type from existing data
        const existingUser = localStorage.getItem('user');
        if (existingUser) {
          try {
            const userData: UserData = JSON.parse(existingUser);
            if (userData.is_student === true) {
              setUserType('student');
              sessionStorage.setItem('user_type', 'student');
              document.cookie = `temp_is_student=true; path=/`;
              document.cookie = `temp_is_instructor=false; path=/`;
            } else if (userData.is_instructor === true) {
              setUserType('instructor');
              sessionStorage.setItem('user_type', 'instructor');
              document.cookie = `temp_is_student=false; path=/`;
              document.cookie = `temp_is_instructor=true; path=/`;
            }
          } catch (error) {
            console.error('Failed to parse existing user data:', error);
          }
        }
      }

      // Wait for authentication check to complete
      if (!loading && !isAuthenticated) {
        router.push('/?error=' + encodeURIComponent('Authentication required'));
        return;
      }
      
      setIsPageLoading(false);
    };

    handleInitialLoad();
  }, [searchParams, router, isAuthenticated, loading, setUser]);

  // Profile Section with base64 image handling
  const ProfileSection = (): JSX.Element | null => {
    if (!user) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center gap-6">
          {user.profile_image && (
            <ProfileImage imageData={user.profile_image} />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.full_name || user.username || user.display_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              {userType === 'student' ? 'Start your learning journey' : 'Begin your teaching journey'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Learning Component
  const LearningComponent = (): JSX.Element => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 relative">
        <div className="absolute top-8 right-8 -mt-3 -mr-3 bg-teal-400 rounded-full p-3 shadow-lg">
          <svg 
            className="w-7 h-7 text-white"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Never Stop Learning</h2>
        <p className="text-teal-100 mt-2">Start your learning journey</p>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          Access personalized learning paths and grow your skills with expert guidance.
        </p>
        <button
          onClick={() => router.push('/onboarding/student')}
          className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors"
        >
          Start Learning
        </button>
      </div>
    </div>
  );

  // Teaching Component
  const TeachingComponent = (): JSX.Element => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 relative">
        <div className="absolute top-8 right-8 -mt-3 -mr-3 bg-purple-400 rounded-full p-3 shadow-lg">
          <svg 
            className="w-7 h-7 text-white"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Never Stop Earning</h2>
        <p className="text-purple-100 mt-2">Begin your teaching journey</p>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          Share your expertise, mentor others, and earn while making an impact.
        </p>
        <button
          onClick={() => router.push('/onboarding/instructor')}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
        >
          Start Teaching
        </button>
      </div>
    </div>
  );

  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ProfileSection />

        {/* Show only the relevant component based on user type */}
        <div className="max-w-lg mx-auto">
          {userType === 'student' ? <LearningComponent /> : <TeachingComponent />}
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

const ProfileImage = ({ imageData }: ProfileImageProps): JSX.Element | null => {
  const [imageError, setImageError] = useState<boolean>(false);

  if (!imageData) return null;

  const handleImageError = (): void => {
    console.error('Failed to load profile image');
    setImageError(true);
  };

  if (imageError) {
    return null;
  }

  return (
    <div className="relative w-24 h-24 rounded-full overflow-hidden">
      <Image
        src={imageData}
        alt="Profile"
        layout="fill"
        objectFit="cover"
        onError={handleImageError}
      />
    </div>
  );
}; 