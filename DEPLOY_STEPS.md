# 万万没想到项目 - 快速部署指南

## 🚀 方式一：通过 Vercel Dashboard 部署（推荐新手）

### 步骤 1：准备 GitHub 仓库

```bash
# 在项目根目录
cd "D:\Code\自创项目\万万没想到"

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit: 万万没想到项目"

# 推送到 GitHub
# 1. 在 GitHub 创建新仓库：wanwan-xiangdao
# 2. 然后执行：
git remote add origin https://github.com/你的用户名/wanwan-xiangdao.git
git branch -M main
git push -u origin main
```

### 步骤 2：在 Vercel 部署

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 选择你的 `wanwan-xiangdao` 仓库

3. **配置项目**
   ```
   Project Name: wanwan-xiangdao
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **配置环境变量**
   - 在 Environment Variables 部分添加：
   ```
   VITE_SUPABASE_URL = https://qfeajzwaliulepahckdx.supabase.co
   VITE_SUPABASE_ANON_KEY = sb_publishable_xCWnrAYv9J7jvRBbsLGLqA_oWWVuRwG
   ```

5. **点击 Deploy**
   - 等待部署完成（约 1-2 分钟）
   - 获得：`https://wanwan-xiangdao.vercel.app`

---

## 🎯 方式二：通过 Vercel CLI 部署（推荐进阶用户）

### 前置要求

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login
```

### 部署步骤

```bash
# 在项目根目录
cd "D:\Code\自创项目\万万没想到"

# 第一次部署（会提示创建项目）
vercel

# 生产部署
vercel --prod
```

---

## 🌐 配置腾讯云 CDN

### 准备工作

- Vercel 部署 URL：`https://wanwan-xiangdao.vercel.app`
- 域名（可选，建议购买）

### 步骤 1：开通腾讯云 CDN

1. 访问：https://console.cloud.tencent.com/cdn
2. 完成实名认证
3. 点击"域名管理" → "添加域名"

### 步骤 2：配置 CDN

**如果你有域名：**
```
域名：wanwan.example.com
业务类型：静态网站
源站类型：域名
源站地址：wanwan-xiangdao.vercel.app
回源协议：HTTPS
回源 Host：wanwan-xiangdao.vercel.app
```

**如果没有域名：**
- 腾讯云会提供测试域名
- 建议购买自己的域名（如 .top, .com, .cn）

### 步骤 3：配置 HTTPS

1. 在域名管理页面，点击你的域名
2. 点击"HTTPS 配置"
3. 选择"免费证书"（如果有域名）
4. 等待证书签发（约 5-10 分钟）

### 步骤 4：配置 DNS 解析

在域名注册商添加 CNAME 记录：

```
类型：CNAME
主机记录：@
记录值：你的CDN域名.cdn.dnsv1.com
TTL：600
```

---

## ✅ 验证部署

### 检查清单

- [ ] Vercel 部署成功
- [ ] 可以访问 `https://wanwan-xiangdao.vercel.app`
- [ ] 所有页面正常加载
- [ ] Supabase 连接正常
- [ ] CDN 加速生效（访问速度提升）

### 测试功能

1. **基础功能**
   - ✅ 浏览问题
   - ✅ 灵感老虎机
   - ✅ 用户登录

2. **性能测试**
   - 使用 Chrome DevTools → Lighthouse
   - 目标：Performance > 90

---

## 🔄 更新部署

### 自动部署（推荐）

```bash
# 修改代码后
git add .
git commit -m "更新内容"
git push

# Vercel 会自动检测并重新部署
```

### 手动部署

```bash
npm run build
vercel --prod
```

---

## 📊 成本估算

### Vercel（免费套餐）
- ✅ 100GB 带宽/月
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ Serverless Functions

### 腾讯云 CDN（按量计费）
- 国内流量：¥0.21/GB
- 海外流量：¥0.25/GB
- 有免费额度

### 总成本
- **个人使用**：几乎免费（在免费额度内）
- **小型应用**：约 ¥10-50/月
- **中型应用**：约 ¥50-200/月

---

## 🎉 部署完成后的架构

```
用户 → 腾讯云 CDN（国内加速）
       ↓
    Vercel 全球边缘节点
       ↓
    静态文件 + API 调用
       ↓
    Supabase（后端服务）
```

**优势：**
- 🚀 全球加速
- 💰 成本低廉
- 🔒 自动 HTTPS
- 📈 自动扩展
- 🔄 自动部署

---

## 🆘 遇到问题？

### Vercel 部署失败
1. 检查构建日志
2. 确认环境变量配置
3. 尝试本地构建：`npm run build`

### CDN 不生效
1. 检查 DNS 解析
2. 清除浏览器缓存
3. 等待 CDN 刷新（最多 24 小时）

### Supabase 连接问题
1. 检查环境变量是否正确
2. 确认 Supabase 项目状态
3. 查看 Vercel 部署日志

---

## 📚 相关资源

- Vercel 文档：https://vercel.com/docs
- 腾讯云 CDN：https://cloud.tencent.com/document/product/228
- Supabase 文档：https://supabase.com/docs

---

**现在就开始部署吧！** 🚀
