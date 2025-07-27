// Application configuration - Cloudflare Optimized
export const appConfig = {
  // API settings
  api: {
    baseUrl: 'http://localhost:4000', // Backend server URL
  },
  
  // Script generation settings
  generation: {
    // 强制使用本地生成，确保Cloudflare部署后永远可用
    useAPI: false, // 禁用AI API生成，使用本地生成
    
    // Local generation delay (ms) for better UX
    localDelay: 800,
    
    // API timeout (ms) - AI generation can take 15-30 seconds
    apiTimeout: 30000,
    
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