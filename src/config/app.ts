// Application configuration - Cloudflare Optimized
export const appConfig = {
  // API settings
  api: {
    baseUrl: '', // Use relative paths for Cloudflare Functions
  },
  
  // Script generation settings
  generation: {
    // 使用真正的AI API生成高质量脚本
    useAPI: true, // 启用AI API生成
    
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