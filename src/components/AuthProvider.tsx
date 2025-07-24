import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPlan, PLAN_FEATURES, PlanFeatures } from '../types/user';
import { supabase, getUserProfile, createUserProfile, updateUserProfile, UserProfile } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUserPlan: (plan: UserPlan) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canUseFeature: (feature: keyof PlanFeatures) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Supabase auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await handleUserSession(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle user session and profile
  const handleUserSession = async (supabaseUser: SupabaseUser) => {
    try {
      let profile = await getUserProfile(supabaseUser.id);
      
      // Create profile if it doesn't exist
      if (!profile) {
        const created = await createUserProfile(supabaseUser);
        if (created) {
          profile = await getUserProfile(supabaseUser.id);
        }
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          plan: profile.plan,
          createdAt: profile.created_at,
          avatar: supabaseUser.user_metadata?.avatar_url || null
        });
      }
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  // Authentication methods
  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    // handleUserSession will be called by onAuthStateChange
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // handleUserSession will be called by onAuthStateChange when confirmed
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    // User state will be cleared by onAuthStateChange
  };

  // Profile management
  const updateUserPlan = async (plan: UserPlan): Promise<void> => {
    if (!user) return;
    
    try {
      const success = await updateUserProfile(user.id, { plan });
      
      if (success) {
        setUser(prev => prev ? { ...prev, plan } : null);
      } else {
        throw new Error('Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const success = await updateUserProfile(user.id, updates);
      
      if (success) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
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
    updateUserPlan,
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
      logout: async () => {},
      register: async () => { throw new Error('Not in auth context'); },
      updateUserPlan: async () => {},
      updateProfile: async () => {},
      hasFeature: (feature: keyof PlanFeatures) => {
        // Guest users have very limited features
        const guestFeatures: Partial<PlanFeatures> = {
          canExportFDX: false,
          canExportPDF: false,
          canUseAudio: false,
          canPlayAudio: false,
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
          canPlayAudio: false,
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