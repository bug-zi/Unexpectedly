# 万万没想到 - 独立介绍网页

这是一个完全独立的精美介绍网页，采用**亮色主题**设计，与主项目（https://unexpectedly.debugzi.com/）风格高度契合。可以单独部署到任何静态网站托管服务（Vercel、Netlify、GitHub Pages 等）。

## 🎨 设计特点

- ✨ **亮色主题**：清爽明快的视觉体验
- 🌈 **多彩渐变**：橙色、黄色、绿色、蓝色四色渐变卡片
- 🎭 **精美动画**：AOS 滚动动画、悬停效果、渐变流动
- 📱 **完全响应式**：完美适配桌面、平板、手机
- 🖼️ **图标已修复**：使用在线 CDN，确保图标正常显示

## 📁 文件结构

```
landing-page/
├── index.html          # 主页面文件
├── README.md           # 说明文档
└── config.example.json # 配置示例（用于自定义）
```

## 🚀 快速开始

### 方式一：直接使用

1. 将 `landing-page` 文件夹部署到你的静态托管服务
2. 访问部署后的 URL 即可
3. 点击"进入应用"按钮会跳转到主应用

### 方式二：本地预览

1. 在浏览器中直接打开 `index.html` 文件
2. 或使用本地服务器：
   ```bash
   cd landing-page
   python -m http.server 8000
   # 然后访问 http://localhost:8000
   ```

## ⚙️ 自定义配置

### 修改主应用链接

找到所有指向主应用的链接并修改 URL：

```html
<!-- 原来的链接 -->
<a href="./../index.html">

<!-- 修改为你的实际部署 URL -->
<a href="https://your-app-url.com">
```

需要修改的位置：
- 导航栏的"进入应用"按钮
- Hero 区域的"开始思考"按钮
- 最终 CTA 区域的"现在就开始"按钮

### 修改品牌信息

1. **Logo 和图标**：修改 `src="../favicon.png"` 为你的实际 logo 路径
2. **标题和描述**：搜索并修改相关文本内容
3. **颜色主题**：修改 Tailwind 配置中的颜色值

### 修改 Open Graph 元标签

在 `<head>` 部分修改 Open Graph 元标签，以便在社交媒体分享时显示正确的信息：

```html
<meta property="og:url" content="https://yourwebsite.com/">
<meta property="og:image" content="https://yourwebsite.com/og-image.jpg">
```

## 🎨 设计特点

- ✨ 现代化设计：渐变色彩、玻璃态效果
- 🎭 精美动画：AOS 滚动动画、悬停效果
- 📱 完全响应式：适配桌面、平板、手机
- 🚀 性能优化：CDN 加载、最小化依赖
- 🔍 SEO 优化：完整的元标签、语义化 HTML

## 🌐 部署建议

### Vercel 部署

1. 将 `landing-page` 文件夹推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置根目录为 `landing-page`
4. 部署完成

### Netlify 部署

1. 将 `landing-page` 文件夹拖拽到 Netlify
2. 或连接 GitHub 仓库
3. 设置发布目录为 `landing-page`
4. 部署完成

### GitHub Pages 部署

1. 在 GitHub 仓库中创建 `gh-pages` 分支
2. 将 `landing-page` 内容放在分支根目录
3. 在仓库设置中启用 GitHub Pages
4. 选择 `gh-pages` 分支
5. 访问 `https://username.github.io/repo-name/`

## 🔧 技术栈

- **HTML5**：语义化标签
- **Tailwind CSS**：通过 CDN 加载
- **AOS**：滚动动画库
- **Lucide Icons**：图标库
- **Google Fonts**：Noto Sans SC 字体

## 📝 注意事项

1. **图片资源**：确保 favicon.png 的路径正确
2. **链接检查**：部署前测试所有链接是否有效
3. **性能监控**：使用 Lighthouse 检查性能
4. **跨浏览器测试**：在 Chrome、Firefox、Safari 中测试

## 🎯 下一步

1. 根据你的实际部署 URL 修改链接
2. 自定义颜色、文本内容
3. 添加你自己的 Open Graph 图片
4. 部署到你喜欢的托管平台
5. 在社交媒体上分享你的产品！

## 📧 联系方式

如有问题或建议，欢迎反馈！
