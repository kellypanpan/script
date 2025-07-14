// Usage limit management for free users
export interface UsageLimit {
  count: number;
  lastReset: string;
  dailyLimit: number;
}

const STORAGE_KEY = 'scriptproshot_usage';
const DAILY_LIMIT = 3; // Free users get 3 generations per day

export class UsageLimitManager {
  private static instance: UsageLimitManager;
  
  static getInstance(): UsageLimitManager {
    if (!UsageLimitManager.instance) {
      UsageLimitManager.instance = new UsageLimitManager();
    }
    return UsageLimitManager.instance;
  }

  // Get current usage data
  getUsage(): UsageLimit {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const usage = JSON.parse(stored) as UsageLimit;
        
        // Check if we need to reset daily count
        const today = new Date().toDateString();
        const lastReset = new Date(usage.lastReset).toDateString();
        
        if (today !== lastReset) {
          // Reset daily count
          return this.resetDailyCount();
        }
        
        return usage;
      }
    } catch (error) {
      console.error('Error reading usage data:', error);
    }
    
    // Initialize for first time
    return this.resetDailyCount();
  }

  // Reset daily count
  private resetDailyCount(): UsageLimit {
    const usage: UsageLimit = {
      count: 0,
      lastReset: new Date().toISOString(),
      dailyLimit: DAILY_LIMIT
    };
    
    this.saveUsage(usage);
    return usage;
  }

  // Save usage data
  private saveUsage(usage: UsageLimit): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  // Check if user can generate a script
  canGenerate(): boolean {
    const usage = this.getUsage();
    return usage.count < usage.dailyLimit;
  }

  // Get remaining generations
  getRemainingGenerations(): number {
    const usage = this.getUsage();
    return Math.max(0, usage.dailyLimit - usage.count);
  }

  // Use one generation
  useGeneration(): boolean {
    const usage = this.getUsage();
    
    if (usage.count >= usage.dailyLimit) {
      return false; // Limit reached
    }
    
    usage.count += 1;
    this.saveUsage(usage);
    return true;
  }

  // Get time until reset
  getTimeUntilReset(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60));
    
    if (hoursUntilReset === 1) {
      return '1 hour';
    }
    return `${hoursUntilReset} hours`;
  }

  // Clear usage data (for testing/admin)
  clearUsage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing usage data:', error);
    }
  }
}

// Hook for React components
export const useUsageLimit = () => {
  const manager = UsageLimitManager.getInstance();
  
  const canGenerate = manager.canGenerate();
  const remainingGenerations = manager.getRemainingGenerations();
  const timeUntilReset = manager.getTimeUntilReset();
  
  const tryUseGeneration = () => {
    return manager.useGeneration();
  };
  
  return {
    canGenerate,
    remainingGenerations,
    useGeneration: tryUseGeneration,
    timeUntilReset,
    dailyLimit: DAILY_LIMIT
  };
};