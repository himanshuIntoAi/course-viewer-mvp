import { User } from '../../../services/login/auth';

export interface OnboardingContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export function useOnboarding(): OnboardingContextType;
export function OnboardingProvider({ children }: { children: React.ReactNode }): JSX.Element; 