# Cloudflare Pages 部署指南

## 环境变量配置

在Cloudflare Pages Dashboard中设置以下环境变量：

### 生产环境变量
1. 进入你的Cloudflare Pages项目
2. 点击 Settings → Environment variables
3. 添加以下变量：

```
OPENROUTER_API_KEY=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
GOOGLE_TTS_API_KEY=AIzaSyDORn-ZP1dhLHb9HM5BrJBkUfo3p8PAAW4
SUPABASE_URL=https://aktlmpggbugcqhapfopi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdGxtcGdnYnVnY3FoYXBmb3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODUwNzIsImV4cCI6MjA2ODc2MTA3Mn0.rbUGe3wwczmjA-7nxx7wFxuqxeYHyaVIVJDHtw5qnSc
```

## 构建配置

### Build command (构建命令):
```
npm run build
```

### Build output directory (输出目录):
```
dist
```

### Root directory (根目录):
```
/
```

## Functions 部署

Cloudflare Pages会自动识别 `functions/` 目录中的函数并部署为边缘函数。

### API 端点

部署后，以下端点将可用：

- `https://your-site.pages.dev/api/generate-script` - 生成脚本
- `https://your-site.pages.dev/api/script-doctor/analyze` - 分析脚本

## 部署步骤

1. 提交所有更改到Git仓库
2. 在Cloudflare Pages中连接你的GitHub仓库
3. 设置构建配置（见上方）
4. 配置环境变量（见上方）
5. 触发部署

## 验证部署

部署完成后，访问：
- `https://your-site.pages.dev/` - 主网站
- `https://your-site.pages.dev/api/generate-script` - API测试（POST请求）

## 故障排除

如果API不工作：
1. 检查Functions标签页是否显示函数已部署
2. 检查环境变量是否正确设置
3. 查看Functions日志获取错误信息
4. 确保API密钥有效且有足够余额