# 🔧 环境变量配置指南

## 📋 快速开始

你的 `.env` 文件已经更新完成！当前配置支持：

### ✅ 已配置的功能：
- **AI 脚本生成** - OpenRouter API 已配置
- **语音合成** - Google TTS API 已配置  
- **演示登录** - 无需额外配置
- **脚本医生** - AI 分析功能已启用
- **本地开发** - 前后端通信已配置

### 🎯 当前可用功能：

1. **立即可用** (无需修改):
   - 登录/注册系统 (演示模式)
   - AI 脚本生成
   - 脚本医生 AI 分析
   - 语音合成 (如果需要)
   - 完整的仪表板功能

2. **生产环境配置** (可选):
   - Supabase 数据库集成
   - 真实用户认证
   - 邮件服务

## 🚀 如何使用

### 当前设置（开箱即用）：
```bash
# 启动后端服务器
cd server && npx tsx index.ts

# 启动前端开发服务器  
npm run dev
```

### 访问地址：
- **前端**: http://localhost:5175
- **后端 API**: http://localhost:4000

## ⚙️ 环境变量说明

### 🔑 必需的 API Keys (已配置):
```env
OPENROUTER_API_KEY=sk-or-v1-35c... # ✅ AI 生成功能
GOOGLE_TTS_API_KEY=AIzaSyD...      # ✅ 语音合成
```

### 🌐 前端配置 (已设置):
```env
VITE_API_URL=http://localhost:4000  # 后端连接
VITE_ENABLE_DEMO_LOGIN=true         # 演示登录启用
VITE_ENABLE_SUPABASE_AUTH=false     # Supabase 认证禁用
```

### 🎛️ 功能开关 (全部启用):
```env
VITE_ENABLE_GOOGLE_TTS=true         # 语音合成
VITE_ENABLE_SCRIPT_DOCTOR=true      # 脚本医生  
VITE_ENABLE_PREMIUM_FEATURES=true   # 高级功能
```

## 🔧 高级配置 (可选)

### 如果要启用 Supabase 认证:
```env
VITE_ENABLE_SUPABASE_AUTH=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 如果要添加邮件功能:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 如果要添加分析:
```env
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## 🛠️ 安全建议

### 生产环境时请更新:
```env
# 生成强密码用于生产环境
JWT_SECRET=your_very_secure_jwt_secret_key_here
SESSION_SECRET=your_very_secure_session_secret_here
NODE_ENV=production
VITE_DEBUG_MODE=false
```

## 🐞 故障排除

### 如果遇到问题:

1. **API 调用失败**:
   - 确认后端服务器运行在 port 4000
   - 检查 `VITE_API_URL` 设置

2. **AI 功能不工作**:
   - 验证 `OPENROUTER_API_KEY` 有效
   - 检查 API 配额

3. **登录问题**:
   - 确认 `VITE_ENABLE_DEMO_LOGIN=true`
   - 演示登录无需真实凭据

4. **环境变量不生效**:
   - 重启开发服务器 (`npm run dev`)
   - 前端变量必须以 `VITE_` 开头

## ✨ 下一步

你的应用现在已经完全配置好了！可以：

1. 🎬 **测试完整功能流程**:
   - 注册/登录 → Dashboard → AI Studio → Script Doctor

2. 🎨 **自定义应用**:
   - 修改 `VITE_APP_NAME` 和 `VITE_APP_DESCRIPTION`
   - 调整功能开关

3. 🚀 **部署到生产**:
   - 设置 Supabase 数据库
   - 配置域名和 HTTPS
   - 更新安全密钥

## 📞 支持

如果有任何问题，环境变量配置都已经为开发和演示准备就绪！