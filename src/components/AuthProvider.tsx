import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPlan, PLAN_FEATURES, PlanFeatures } from '../types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePlan: (plan: UserPlan) => void;
  updateProfile: (updates: Partial<User>) => void;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canUseFeature: (feature: keyof PlanFeatures) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Local storage keys
const AUTH_STORAGE_KEY = 'scriptpro_auth';
const USER_STORAGE_KEY = 'scriptpro_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_STORAGE_KEY);
        const userData = localStorage.getItem(USER_STORAGE_KEY);
        
        if (authData === 'true' && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, create a mock user based on email
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        plan: email.includes('demo') ? 'pro' : 'free', // Demo users get pro plan
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store auth state
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        plan: 'free', // New users start with free plan
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store auth state
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      setUser(newUser);
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth state
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const updatePlan = (plan: UserPlan) => {
    if (user) {
      const updatedUser = {
        ...user,
        plan,
        updatedAt: new Date().toISOString(),
      };
      
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (!user) return false;
    return PLAN_FEATURES[user.plan][feature] as boolean;
  };

  const canUseFeature = (feature: keyof PlanFeatures): boolean => {
    return hasFeature(feature);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updatePlan,
    updateProfile,
    hasFeature,
    canUseFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Fallback hook for guest mode - returns mock guest user capabilities
export const useAuthWithFallback = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    // Return guest user capabilities
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => { throw new Error('Not in auth context'); },
      logout: () => {},
      register: async () => { throw new Error('Not in auth context'); },
      updatePlan: () => {},
      updateProfile: () => {},
      hasFeature: (feature: keyof PlanFeatures) => {
        // Guest users have very limited features
        const guestFeatures: Partial<PlanFeatures> = {
          canExportFDX: false,
          canExportPDF: false,
          canUseAudio: false,
          canUseAI: false,
          canUseStoryboard: false,
          canCollaborate: false,
          canSaveTemplates: false,
          canRewriteScenes: false,
          canUseScriptDoctor: true, // Basic script doctor for guests
          maxDailyGenerations: 2, // Limited for guests
          maxProjects: 0,
          maxDailyScriptAnalysis: 1,
        };
        return guestFeatures[feature] as boolean || false;
      },
      canUseFeature: (feature: keyof PlanFeatures) => {
        const guestFeatures: Partial<PlanFeatures> = {
          canExportFDX: false,
          canExportPDF: false,
          canUseAudio: false,
          canUseAI: false,
          canUseStoryboard: false,
          canCollaborate: false,
          canSaveTemplates: false,
          canRewriteScenes: false,
          canUseScriptDoctor: true,
          maxDailyGenerations: 2,
          maxProjects: 0,
          maxDailyScriptAnalysis: 1,
        };
        return guestFeatures[feature] as boolean || false;
      },
    };
  }
  
  return context;
};

// Hook that returns the current auth state without throwing if not in provider
export const useAuthSafe = (): AuthContextType | null => {
  const context = useContext(AuthContext);
  return context || null;
};