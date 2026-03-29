# 绑定腾讯云域名到 Vercel 完整指南

## 📋 前置条件

- ✅ Vercel 项目已部署成功
- ✅ 拥有腾讯云购买的域名（如 `example.com`）
- ✅ 能够管理域名的 DNS 解析

---

## 🎯 配置目标

**配置前**：
- Vercel 域名：`https://wanwan-xiangdao.vercel.app`

**配置后**：
- 自定义域名：`https://wanwan.example.com`（你的品牌域名）
- Vercel 域名仍可用：`https://wanwan-xiangdao.vercel.app`

---

## 📝 配置步骤

### 步骤 1：在 Vercel 添加域名

1. **登录 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 选择你的项目：`wanwan-xiangdao`

2. **进入域名设置**
   - 点击项目顶部的 **Settings** 标签
   - 在左侧菜单点击 **Domains**

3. **添加域名**
   - 在输入框中输入你的域名
   - 建议使用子域名：`wanwan.example.com`
   - 或主域名：`www.example.com`

4. **点击 "Add"** 按钮

   Vercel 会显示 DNS 配置信息，类似：
   ```
   Type: CNAME
   Name: wanwan
   Value: cname.vercel-dns.com
   ```

   **记录这些信息，下一步需要用到！**

---

### 步骤 2：在腾讯云配置 DNS 解析

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/cns

2. **找到你的域名**
   - 在域名列表中找到你的域名（如 `example.com`）
   - 点击域名右侧的 **"解析"** 按钮

3. **添加 DNS 记录**

   点击 **"添加记录"**，填写以下信息：

   | 记录类型 | 主机记录 | 记录值 | TTL |
   |----------|----------|--------|-----|
   | **CNAME** | `wanwan` | `cname.vercel-dns.com` | 600 |

   **说明**：
   - **主机记录**：填写子域名前缀，如 `wanwan`、`www`
   - **记录值**：从 Vercel 复制的 CNAME 地址
   - **TTL**：缓存时间，600 秒（10 分钟）即可

4. **点击 "保存"**

---

### 步骤 3：等待 DNS 生效

- **DNS 生效时间**：通常 5-30 分钟
- **全球生效**：最多 48 小时

**如何检查 DNS 是否生效**：

**方法 1：使用命令行检查**
```bash
# Windows
nslookup wanwan.example.com

# 应该返回 Vercel 的 IP 地址
```

**方法 2：在线工具检查**
- 访问：https://dnschecker.org/
- 输入你的域名，查看全球解析状态

---

### 步骤 4：在 Vercel 等待证书配置

1. **回到 Vercel Domains 页面**
   - 域名状态会显示：
     - 🔴 **Pending**（等待 DNS 生效）
     - 🟡 **Configuring**（配置证书中）
     - 🟢 **Valid Configuration**（配置成功）

2. **自动配置 SSL 证书**
   - Vercel 会自动为你的域名申请 Let's Encrypt SSL 证书
   - 通常 5-10 分钟完成

3. **当状态变为 "Valid Configuration"**
   - ✅ 配置成功！
   - 现在可以使用 `https://wanwan.example.com` 访问

---

### 步骤 5：测试访问

1. **浏览器访问测试**
   ```
   https://wanwan.example.com
   ```

2. **检查项**：
   - ✅ 页面正常加载
   - ✅ 地址栏显示 🔒（HTTPS 已启用）
   - ✅ 没有"不安全"警告
   - ✅ 所有功能正常（导航、按钮、登录等）

3. **测试多个页面**
   - 首页：`https://wanwan.example.com/`
   - 问题页：`https://wanwan.example.com/questions`
   - 老虎机：`https://wanwan.example.com/slot-machine`

---

## 🎨 高级配置（可选）

### 配置 A：添加多个子域名

如果你想要多个子域名指向同一个项目：

**在 Vercel 添加域名**：
1. 在 Domains 页面继续添加域名
2. 可以添加：
   - `www.example.com`
   - `app.example.com`
   - `wanwan.example.com`

**在腾讯云添加对应的 DNS 记录**：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| www | CNAME | cname.vercel-dns.com |
| app | CNAME | cname.vercel-dns.com |
| wanwan | CNAME | cname.vercel-dns.com |

---

### 配置 B：设置主域名跳转

如果你希望用户访问 `example.com` 时自动跳转到 `www.example.com`：

**在 Vercel 添加域名**：
- 添加主域名 `example.com`（不带 www）
- Vercel 会自动配置跳转

**在腾讯云添加 DNS 记录**：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| @ | CNAME | cname.vercel-dns.com |
| www | CNAME | cname.vercel-dns.com |

---

### 配置 C：配置域名重定向（推荐）

**场景**：用户访问 `wanwan-xiangdao.vercel.app` 自动跳转到 `wanwan.example.com`

**在 Vercel 配置**：
1. 进入项目设置 → **Domains**
2. 找到 `wanwan-xiangdao.vercel.app`
3. 点击右侧的 **...** 菜单
4. 选择 **"Edit Redirect"**
5. 设置重定向到 `wanwan.example.com`

---

## 🔍 故障排查

### 问题 1：域名显示 "Pending" 状态超过 30 分钟

**可能原因**：
- DNS 记录配置错误
- DNS 未完全生效

**解决方法**：
1. 检查 DNS 记录是否正确
   ```bash
   nslookup wanwan.example.com
   ```
2. 确认记录值是 `cname.vercel-dns.com`
3. 使用 https://dnschecker.org/ 检查全球解析状态
4. 如果还不行，删除记录重新添加

---

### 问题 2：访问域名显示 404 错误

**可能原因**：
- Vercel 项目未正确部署
- 域名配置错误

**解决方法**：
1. 确认 Vercel 项目部署成功
2. 检查域名状态是否为 "Valid Configuration"
3. 尝试访问 Vercel 原域名确认项目正常
4. 在 Vercel 查看 Deployments 日志

---

### 问题 3：HTTPS 证书配置失败

**可能原因**：
- DNS 未完全指向 Vercel
- 域名之前的证书未过期

**解决方法**：
1. 等待 DNS 完全生效（最多 48 小时）
2. 确认只有一条 CNAME 记录指向 Vercel
3. 在 Vercel Domains 页面点击 **"Retry"** 重试

---

### 问题 4：访问域名显示连接不安全

**可能原因**：
- HTTPS 证书未生效
- 浏览器缓存问题

**解决方法**：
1. 等待 5-10 分钟，让证书生效
2. 清除浏览器缓存
3. 使用无痕模式访问
4. 检查 Vercel 域名状态是否为 "Valid Configuration"

---

## 💰 费用说明

### Vercel 域名费用

**Hobby 免费套餐**：
- ✅ 无限自定义域名
- ✅ 自动 SSL 证书（Let's Encrypt）
- ✅ 全球 CDN 加速
- ✅ 自动 HTTP/3 支持

**费用**：完全免费！

### 腾讯云域名费用

**域名续费**（按年支付）：
- `.com` 域名：约 ¥50-80/年
- `.cn` 域名：约 ¥30-50/年
- `.net` 域名：约 ¥60-90/年

**DNS 解析**：免费

---

## 📊 性能对比

| 访问地址 | 国内延迟 | 国外延迟 | 推荐度 |
|----------|----------|----------|--------|
| `wanwan-xiangdao.vercel.app` | 200-500ms | 20-50ms | ⭐⭐⭐ |
| `wanwan.example.com`（Vercel） | 200-500ms | 20-50ms | ⭐⭐⭐⭐ |
| `wanwan.example.com`（腾讯云 CDN） | 20-50ms | 50-150ms | ⭐⭐⭐⭐⭐ |

**结论**：绑定自己的域名主要优势是**品牌形象**，不是性能提升。

---

## 🎯 配置完成后的访问地址

配置完成后，你有两个可用的访问地址：

1. **自定义域名（推荐）**：
   - `https://wanwan.example.com` ← 用于推广

2. **Vercel 原域名（仍可用）**：
   - `https://wanwan-xiangdao.vercel.app` ← 用于备用

---

## ✅ 配置检查清单

完成配置后，检查以下项目：

- [ ] Vercel 域名状态显示 "Valid Configuration"
- [ ] 腾讯云 DNS 记录配置正确（CNAME → cname.vercel-dns.com）
- [ ] 浏览器访问自定义域名正常
- [ ] 地址栏显示 🔒（HTTPS 已启用）
- [ ] 所有页面功能正常
- [ ] 移动端访问正常
- [ ] 多个浏览器测试通过

---

## 🚀 下一步优化

配置完成后，可以考虑：

1. **更新所有推广链接**
   - 社交媒体链接
   - 二维码链接
   - 名片/宣传材料

2. **配置 301 重定向**
   - 将 Vercel 域名重定向到自定义域名
   - 统一品牌形象

3. **设置域名邮箱**（可选）
   - `contact@example.com`
   - `support@example.com`

4. **监控域名性能**
   - 使用 Vercel Analytics
   - 查看访问速度和用户分布

---

**配置完成后，记得更新所有推广链接到新的自定义域名！** 🎉

---

## 📞 需要帮助？

如果遇到问题：
- Vercel 文档：https://vercel.com/docs/concepts/projects/domains
- Vercel 社区：https://vercel.com/docs
- 腾讯云 DNS 文档：https://cloud.tencent.com/document/product/302
