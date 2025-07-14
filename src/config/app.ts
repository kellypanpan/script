// Application configuration
export const appConfig = {
  // Script generation settings
  generation: {
    // Set to true when API backend is ready
    useAPI: true,
    
    // Local generation delay (ms) for better UX
    localDelay: 800,
    
    // API timeout (ms)
    apiTimeout: 10000,
    
    // Fallback to local if API fails
    fallbackToLocal: true
  },
  
  // Usage limits
  limits: {
    freeDaily: 3,
    proDaily: 100
  },
  
  // UI settings
  ui: {
    animationDuration: 400,
    loadingMinDuration: 500
  }
};

export default appConfig;