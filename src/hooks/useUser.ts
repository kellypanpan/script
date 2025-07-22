import { useState, useEffect, createContext, useContext } from 'react';
import { User, UserPlan, PLAN_FEATURES, PlanFeatures } from '../types/user';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePlan: (plan: UserPlan) => void;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canUseFeature: (feature: keyof PlanFeatures) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user for development
const MOCK_USER: User = {
  id: 'user_1',
  email: 'demo@scriptproshot.com',
  name: 'Demo User',
  plan: 'free', // Change this to test different plans
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    // Return mock implementation for development/compatibility
    return useMockUser();
  }
  return context;
};

// Mock implementation for development
export const useMockUser = (): UserContextType => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ ...MOCK_USER, email });
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const updatePlan = (plan: UserPlan) => {
    if (user) {
      setUser({ ...user, plan });
    }
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (!user) return false;
    return PLAN_FEATURES[user.plan][feature] as boolean;
  };

  const canUseFeature = (feature: keyof PlanFeatures): boolean => {
    return hasFeature(feature);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    updatePlan,
    hasFeature,
    canUseFeature,
  };
};

// Real Supabase implementation (for future use)
export const useSupabaseUser = (): UserContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement Supabase auth
    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       const { data: profile } = await supabase
    //         .from('users')
    //         .select('*')
    //         .eq('id', session.user.id)
    //         .single();
    //       setUser(profile);
    //     } else {
    //       setUser(null);
    //     }
    //     setIsLoading(false);
    //   }
    // );
    
    setIsLoading(false);
    
    // return () => {
    //   authListener?.unsubscribe();
    // };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement Supabase login
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      // if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // TODO: Implement Supabase logout
    // await supabase.auth.signOut();
    setUser(null);
  };

  const updatePlan = async (plan: UserPlan) => {
    if (!user) return;
    
    try {
      // TODO: Update user plan in Supabase
      // const { error } = await supabase
      //   .from('users')
      //   .update({ plan })
      //   .eq('id', user.id);
      // if (error) throw error;
      
      setUser({ ...user, plan });
    } catch (error) {
      console.error('Update plan error:', error);
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

  return {
    user,
    isLoading,
    login,
    logout: () => logout(),
    updatePlan,
    hasFeature,
    canUseFeature,
  };
};