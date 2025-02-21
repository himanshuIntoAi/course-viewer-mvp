export interface User {
  id: string;
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
  full_name?: string;
  username?: string;
}

export function initiateOAuthLogin(provider: 'google' | 'facebook' | 'github', redirectPath: string): void;
export function auth(token: string): Promise<User>;
export function login(email: string, password: string): Promise<User>;
export function register(email: string, password: string, firstName: string): Promise<User>; 