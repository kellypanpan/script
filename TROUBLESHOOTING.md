# 🐛 剧本生成问题排查

## 问题诊断

### ✅ 现在的配置状态：
- **API模式**: 已禁用 (`useAPI: false`)
- **本地生成**: 已启用
- **显示逻辑**: 已修复
- **格式转换**: 已实现

### 🔍 测试步骤：

#### 1. 基本测试
1. 启动前端: `npm run dev`
2. 打开浏览器: http://localhost:5173
3. 填写表单：
   - 类型: Comedy
   - 关键词: coffee shop
   - 角色: Alex (点击Add)
   - 语调: Casual
4. 点击 "Generate Script"

#### 2. 查看浏览器控制台
打开开发者工具 (F12)，查看Console，应该看到：
```
🎬 Starting script generation...
Config: {useAPI: false, baseUrl: "http://localhost:4000"}
📝 Script input: {genre: "comedy", keywords: "coffee shop", ...}
🏠 Using local generation...
✅ Local generation success! Script length: 406
🎉 Script generation completed successfully!
```

#### 3. 测试输出格式切换
生成脚本后，测试三个按钮：
- **Dialog Only**: 只显示对白
- **Shoot-Ready**: 完整格式
- **Voiceover**: 叙述格式

### 🎯 预期结果：

生成的脚本应该类似：
```
INT. COFFEE SHOP – DAY

ALEX (20s, professional appearance) approaches the counter with nervous energy.

                    ALEX
          Well, here goes nothing.

JORDAN suddenly appears, changing the dynamic.

                    ALEX
          This is getting weird.

ALEX and JORDAN share a meaningful look.

                    ALEX
          Actually, that worked out.

                                        FADE OUT.
```

### 🔧 如果还是不工作：

#### 方案1: 清除缓存
```bash
# 清除开发缓存
rm -rf node_modules/.vite
npm run dev
```

#### 方案2: 硬刷新浏览器
- Windows: Ctrl + F5
- Mac: Cmd + Shift + R

#### 方案3: 检查导入
确保 `generateScript` 函数正确导入：
```typescript
import { generateScript } from '../utils/scriptGenerator';
```

#### 方案4: 临时测试
在浏览器控制台直接测试：
```javascript
// 测试生成函数
const testInput = {
  genre: 'comedy',
  keywords: 'test',
  characters: ['Alex'],
  tone: 'casual',
  maxLength: 'default',
  mode: 'shooting-script'
};

// 应该能看到生成的脚本
console.log('Test result:', generateScript(testInput));
```

## 🎉 如果一切正常：

您应该能够：
1. ✅ 生成剧本 (本地模式)
2. ✅ 切换输出格式
3. ✅ 导出TXT文件
4. ✅ 查看格式化/原始文本

## 🔄 启用API模式：

当想要使用AI生成时：
1. 确保后端运行: `npm run server`
2. 设置API key在 `.env` 文件中
3. 修改配置: `useAPI: true`

现在本地生成应该完全正常工作了！