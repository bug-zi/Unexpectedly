# 万万没想到项目部署指南

## 🚀 部署架构

```
用户 → 腾讯云 CDN → Vercel 边缘节点 → Vercel 服务器
```

## 📋 部署前检查清单

- [ ] Node.js 已安装 (v18+)
- [ ] Vercel 账号
- [ ] 腾讯云账号
- [ ] 域名（可选，但推荐）
- [ ] Supabase 项目配置完成

---

## 第一步：部署到 Vercel

### 1.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 1.2 登录 Vercel

```bash
vercel login
```

### 1.3 构建项目

```bash
# 在项目根目录
cd "D:\Code\自创项目\万万没想到"
npm run build
```

### 1.4 部署

```bash
vercel --prod
```

按照提示操作：
1. 选择 Create a new project
2. 项目名称：`wanwan-xiangdao`
3. 选择团队（如果没有团队就选个人账号）
4. 确认构建配置
5. 等待部署完成

### 1.5 配置环境变量

在 Vercel Dashboard 中设置：

1. 访问 https://vercel.com/dashboard
2. 选择项目 `wanwan-xiangdao`
3. 点击 Settings → Environment Variables
4. 添加以下变量：

```
VITE_SUPABASE_URL = https://qfeajzwaliulepahckdx.supabase.co
VITE_SUPABASE_ANON_KEY = sb_publishable_xCWnrAYv9J7jvRBbsLGLqA_oWWVuRwG
```

### 1.6 获取 Vercel 部署 URL

部署完成后会得到：
```
https://wanwan-xiangdao.vercel.app
```

记下这个 URL，下一步配置 CDN 会用到。

---

## 第二步：配置腾讯云 CDN

### 2.1 开通腾讯云 CDN 服务

1. 访问 https://console.cloud.tencent.com/cdn
2. 点击"立即开通"（需要实名认证）

### 2.2 添加 CDN 加速域名

#### 2.2.1 如果你有自己的域名

1. 在 CDN 控制台点击"域名管理" → "添加域名"
2. 输入你的域名（如：`wanwan.example.com`）
3. 业务类型选择：**静态网站**
4. 源站类型选择：**对象存储** 或 **自有服务器**
5. 源站地址：输入 Vercel URL
   ```
   wanwan-xiangdao.vercel.app
   ```

#### 2.2.2 如果没有域名（使用临时域名）

腾讯云会提供测试域名，但建议购买自己的域名。

### 2.3 配置 HTTPS

1. 在域名管理页面，点击你的域名
2. 点击"HTTPS 配置"
3. 选择证书：
   - **有域名**：申请免费证书（腾讯云自动签发）
   - **无域名**：暂时跳过，使用 HTTP

### 2.4 配置缓存规则

1. 点击"缓存配置"
2. 添加缓存规则：

```
规则名称：静态资源缓存
条件：文件路径
文件后缀：.js,.css,.png,.jpg,.svg,.woff,.woff2
缓存过期时间：365天

规则名称：HTML 文件
条件：文件路径
文件后缀：.html
缓存过期时间：1小时
```

### 2.5 回源配置

1. 点击"回源配置"
2. 添加回源规则：

```
回源协议：HTTPS
回源 Host：wanwan-xiangdao.vercel.app
回源 SNI：开启
HTTP 回源端口：443
```

---

## 第三步：域名解析（如果你有域名）

### 3.1 在域名注册商设置 DNS

如果你的域名在腾讯云购买：

```
主机记录：@ 或 www
记录类型：CNAME
记录值：你的 CDN 域名（如：wanwan.example.com.cdn.dnsv1.com）
```

如果域名在其他注册商（阿里云、Cloudflare 等）：

```
类型：CNAME
名称：@ 或 www
值：你的 CDN 域名
TTL：600
```

---

## 第四步：验证部署

### 4.1 检查 Vercel 部署

1. 访问：`https://wanwan-xiangdao.vercel.app`
2. 测试所有功能：
   - ✅ 页面正常加载
   - ✅ 静态资源（图片、CSS、JS）加载
   - ✅ 路由跳转正常
   - ✅ Supabase 连接正常

### 4.2 检查 CDN 加速

1. 访问你的域名（或 CDN 测试域名）
2. 打开浏览器开发者工具 → Network
3. 查看响应头：
   ```
   CF-Cache-Status: HIT
   X-Cache: HIT from tencentcdn
   ```

### 4.3 性能测试

使用 Lighthouse 测试：
- Performance: > 90
- SEO: > 90
- Best Practices: > 90

---

## 第五步：监控和维护

### 5.1 Vercel 监控

- 访问 Vercel Dashboard
- 查看部署日志
- 监控错误和性能
- 设置告警通知

### 5.2 腾讯云 CDN 监控

- 访问腾讯云 CDN 控制台
- 查看流量统计
- 查看命中率
- 查看回源流量

---

## 🎯 优化建议

### 1. 性能优化

```javascript
// vercel.json 已配置
- 资源缓存：1年
- 安全头部：已添加
- 路由重写：SPA 支持
```

### 2. CDN 优化

- 启用 GZip 压缩
- 启用 Brotli 压缩
- 配置合理的缓存时间
- 启用 HTTPS/2

### 3. 成本优化

- Vercel 免费套餐：
  - 100GB 带宽/月
  - 无限部署
  - 自动 HTTPS
  - 全球 CDN

- 腾讯云 CDN：
  - 按流量计费
  - 有免费额度
  - 国内访问速度更快

---

## 🔄 更新部署

### 方式一：通过 CLI 更新

```bash
# 修改代码后
git add .
git commit -m "更新内容"
git push

# 自动部署到 Vercel（已连接 GitHub）
```

### 方式二：手动部署

```bash
npm run build
vercel --prod
```

---

## 📞 常见问题

### Q1: 部署后 Supabase 连接失败？

A: 检查环境变量是否正确配置在 Vercel Dashboard

### Q2: CDN 加速不生效？

A:
1. 检查 DNS 解析是否生效
2. 清除浏览器缓存
3. 等待 CDN 缓存刷新（最多 24 小时）

### Q3: 如何撤销部署？

A:
1. 在 Vercel Dashboard 中
2. 找到对应的部署记录
3. 点击 "Rollback"

### Q4: 国内访问速度慢？

A:
1. 必须配置腾讯云 CDN
2. 使用国内域名
3. 优化资源大小

---

## ✅ 部署完成后的架构

```
用户访问
    ↓
腾讯云 CDN（国内加速）
    ↓
Vercel 全球边缘网络
    ↓
Vercel 服务器
    ↓
静态文件 + Supabase API
```

现在你的项目已经：
- ✅ 全球部署（Vercel）
- ✅ 国内加速（腾讯云 CDN）
- ✅ 自动 HTTPS
- ✅ 持续集成（Git 推送自动部署）
