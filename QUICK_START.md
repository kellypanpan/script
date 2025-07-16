# 🚀 ScriptProShot Quick Start Guide

## ✅ 修复完成！Output Format 按钮现在可以正常工作了

### 🔧 已修复的问题：

1. **Output Format Toggle 按钮现在真正有用了！**
   - Dialog Only: 只显示角色名和对白
   - Shoot-Ready: 完整拍摄脚本格式
   - Voiceover: 旁白友好格式

2. **真正接入了API生成**
   - 使用Claude AI进行专业剧本生成
   - 支持多种输出模式
   - 场景重写功能

3. **格式转换功能**
   - 实时格式切换
   - 保留原始脚本数据
   - 智能格式化

## 🚀 启动方式

### 1. 安装依赖
```bash
npm install
```

### 2. 设置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的 OpenRouter API key
```

### 3. 启动后端服务器
```bash
npm run server
```
服务器将在 http://localhost:4000 运行

### 4. 启动前端 (新终端)
```bash
npm run dev
```
前端将在 http://localhost:5173 运行

## 🎯 如何测试 Output Format 功能

1. **填写脚本参数**：
   - 选择类型（喜剧、剧情等）
   - 输入关键词
   - 添加角色
   - 选择语调

2. **生成脚本**：
   - 点击 "Generate Script" 
   - 等待AI生成（需要API key）

3. **测试格式切换**：
   - 点击 "Dialog Only" - 只看对白
   - 点击 "Shoot-Ready" - 完整拍摄脚本
   - 点击 "Voiceover" - 旁白格式

## 🔧 API 端点

- `POST /api/generate-script` - 生成脚本
- `POST /api/rewrite-scene` - 重写场景
- `POST /api/generate-audio` - 生成音频

## 💡 功能特点

### ✅ 现在可以工作的功能：
- 🎬 AI剧本生成（需要API key）
- 🔄 三种输出格式实时切换
- 📝 场景重写功能
- 💾 样例脚本预览
- 📤 TXT导出

### 🚧 Pro功能（UI就绪）：
- 📄 FDX导出
- 🎵 音频生成
- 📊 项目管理
- 👥 团队协作

## 🐛 故障排除

### API调用失败？
- 检查 `.env` 文件中的 API key
- 确保后端服务器在运行
- 查看浏览器控制台错误

### 格式切换不工作？
- 先生成或加载一个脚本
- 格式切换需要有脚本内容才能工作

### 服务器启动失败？
- 检查端口4000是否被占用
- 确保安装了所有依赖

## 🎉 完成！

现在 Output Format 按钮应该可以正常工作，并且真正接入了Claude API进行智能剧本生成！