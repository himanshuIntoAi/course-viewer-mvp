'use client'
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/state/context/login/OnboardingContext';

interface User {
    display_name: string;
    email: string;
    profile_image: string;
    is_student: boolean;
    is_instructor: boolean;
}

const NavbarWithSearch = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDashboardPage, setIsDashboardPage] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout } = useOnboarding();

    // Handle initial mount and check if dashboard page
    useEffect(() => {
        setMounted(true);
        setIsDashboardPage(
            pathname?.startsWith('/student-dashboard') ||
            pathname?.startsWith('/mentor-dashboard') || 
            false
        );
        return () => setMounted(false);
    }, [pathname]);

    useEffect(() => {
        if (!mounted) return;

        const checkUserState = () => {
            try {
                // Check for token and user in URL params (for redirect after auth)
                const token = searchParams?.get('token');
                const userParam = searchParams?.get('user');
                
                if (token && userParam) {
                    try {
                        const userData = JSON.parse(decodeURIComponent(userParam));
                        localStorage.setItem('access_token', token);
                        localStorage.setItem('user', JSON.stringify(userData));
                        setUser(userData);
                        // Clean URL without triggering refresh
                        window.history.replaceState({}, '', pathname);
                        return;
                    } catch (error) {
                        console.error('Failed to parse user data from URL:', error);
                    }
                }

                // Check for signout flag
                const isSigningOut = searchParams?.get('signout') === 'true';
                if (isSigningOut) {
                    setUser(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('access_token');
                    sessionStorage.clear();
                    return;
                }

                // Check access token
                const storedToken = localStorage.getItem('access_token');
                if (!storedToken) {
                    setUser(null);
                    localStorage.removeItem('user');
                    return;
                }

                // Check user data
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    setUser(null);
                    return;
                }

                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Validate user object has required fields
                    if (!parsedUser?.display_name || !parsedUser?.email) {
                        throw new Error('Invalid user data');
                    }
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Failed to parse user data:", error);
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("Error checking user state:", error);
                setUser(null);
            }
        };

        // Initial check
        checkUserState();
        
        // Listen for storage events to update state across tabs
        window.addEventListener('storage', checkUserState);
        
        // Check auth state periodically
        const interval = setInterval(checkUserState, 60000); // Check every minute
        
        return () => {
            window.removeEventListener('storage', checkUserState);
            clearInterval(interval);
        };
    }, [mounted, pathname, searchParams]);

    useEffect(() => {
        if (!mounted) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mounted]);

    const handleProfileClick = () => {
        if (isDashboardPage) {
            setShowDropdown(!showDropdown);
        }
    };

    const handleLogout = async () => {
        try {
            setShowDropdown(false);
            await logout();
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            sessionStorage.clear();
            window.location.replace('/?signout=true');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Base navbar content that's always shown
    const baseNavbar = (
        <nav className="relative flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-lg w-[90vw] m-auto">
            {/* Logo Section */}
            <div 
                className="relative z-20 flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95" 
                onClick={() => router.push("/")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push("/")}
            >
                <Image 
                    src="/cou-logo.svg" 
                    alt="CloudOU Logo" 
                    width={150} 
                    height={50}
                    priority
                    className="transition-opacity hover:opacity-80"
                />
            </div>

            {/* Search Bar */}
            <div className="relative z-10 hidden md:flex space-x-6 text-gray-700 font-medium w-[50%]">
                <input 
                    type="text" 
                    placeholder="Search for courses, mentors, topics..." 
                    className="border-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-teal-50 transition p-2 w-[70%]" 
                />
                <button className="px-10 py-2 text-sm bg-[#16197C] text-white rounded-lg flex items-center gap-2">
                    <Image src="/search.svg" alt="Search" width={20} height={20} />
                    Search
                </button>
            </div>

            {/* User Profile - Only shown after mounting and when user exists */}
            {mounted && user && (
                <div className="relative z-10" ref={dropdownRef}>
                    <div 
                        className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleProfileClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Welcome,</span>
                            <span className="font-bold text-blue-900 text-lg">{user.display_name}</span>
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                    src={user.profile_image || "/images/user-icon.svg"}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {isDashboardPage && (
                                <Image 
                                    src="/images/down-arrow2.svg" 
                                    alt="Menu" 
                                    width={8} 
                                    height={8} 
                                    className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isDashboardPage && showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );

    return baseNavbar;
};

export default NavbarWithSearch;
