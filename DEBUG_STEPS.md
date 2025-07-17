# 🐛 ScriptProShot 调试步骤

## 问题: 输入后剧本无法输出

### 🔍 调试步骤：

#### 1. 检查浏览器控制台
打开浏览器开发者工具 (F12)，查看 Console 标签页：
- 查找 `🎬 Starting script generation...` 消息
- 查看是否有错误信息
- 确认 API 配置信息

#### 2. 检查网络请求
在开发者工具的 Network 标签页：
- 查看是否有对 `http://localhost:4000/api/generate-script` 的请求
- 检查请求状态码
- 查看响应内容

#### 3. 检查后端服务器
确保后端服务器正在运行：
```bash
# 在项目根目录
npm run server
```

应该看到：
```
API server running on port 4000
```

#### 4. 测试API连接
在浏览器或 curl 中测试：
```bash
curl -X POST http://localhost:4000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{"genre":"comedy","keywords":"test","characters":["Alex"],"tone":"casual","maxLength":"default","mode":"shooting-script"}'
```

#### 5. 检查前端状态
在浏览器控制台运行：
```javascript
// 检查配置
console.log(window.appConfig);

// 检查当前状态
console.log('Current state:', {
  genre: document.querySelector('select').value,
  keywords: document.querySelector('textarea').value
});
```

## 🔧 可能的解决方案：

### 方案1: 确保服务器运行
```bash
# 终端1: 启动后端
npm run server

# 终端2: 启动前端
npm run dev
```

### 方案2: 检查CORS设置
如果看到CORS错误，确保后端服务器有正确的CORS设置。

### 方案3: 使用本地生成
临时禁用API，使用本地生成：
```typescript
// 在 src/config/app.ts 中
generation: {
  useAPI: false,  // 改为 false
  // ...
}
```

### 方案4: 检查API Key
如果使用API模式，确保 `.env` 文件中有正确的API key：
```
OPENROUTER_API_KEY=your_key_here
```

## 🎯 测试用例：

### 最简单的测试：
1. 类型: Comedy
2. 关键词: coffee shop
3. 角色: Alex
4. 语调: Casual
5. 点击 "Generate Script"

### 预期结果：
- 看到 "Generating..." 状态
- 1-3秒后显示生成的剧本
- 可以切换不同的输出格式

## 📊 常见问题：

### 问题1: API调用失败
- 检查后端服务器是否运行
- 检查端口是否正确 (4000)
- 查看浏览器控制台的网络错误

### 问题2: 本地生成失败
- 检查 `generateScript` 函数是否正确导入
- 确认 scriptGenerator.ts 文件存在

### 问题3: 界面卡死
- 检查是否有 JavaScript 错误
- 确认按钮没有被禁用
- 重新刷新页面

请按照这些步骤进行调试，并告诉我在哪一步遇到了问题！