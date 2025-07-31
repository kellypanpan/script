// Application configuration - Cloudflare Optimized
export const appConfig = {
  // API settings
  api: {
    baseUrl: "https://openrouter.ai/api/v1/chat/completions", // 直接使用 OpenRouter API
  },
  
  // Script generation settings
  generation: {
    // 强制使用AI API生成高质量脚本，不使用本地生成
    useAPI: true, // 启用AI API生成
    
    // 禁用本地生成回退，确保只使用AI
    fallbackToLocal: false, // 禁用本地回退，强制使用API
    
    // API timeout (ms) - 增加超时时间以适应AI生成
    apiTimeout: 45000, // 45秒超时
    
    // 重试配置
    retryCount: 2,
    retryDelay: 2000
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
