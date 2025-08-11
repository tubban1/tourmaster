# 🚀 Vercel 部署检查清单

## ✅ 第一步：代码准备 (已完成)
- [x] 代码已推送到 GitHub: https://github.com/tubban1/tourmaster.git
- [x] 创建了 vercel.json 配置文件
- [x] 创建了部署说明文档

## 🔧 第二步：Vercel 项目创建
- [ ] 登录 [Vercel](https://vercel.com)
- [ ] 点击 "New Project"
- [ ] 选择 "Import Git Repository"
- [ ] 选择 `tubban1/tourmaster` 仓库
- [ ] 点击 "Import"

## ⚙️ 第三步：项目配置
- [ ] Project Name: `tourmaster`
- [ ] Framework Preset: `Next.js` (自动检测)
- [ ] Root Directory: `./` (默认)
- [ ] Build Command: `npm run build` (自动检测)
- [ ] Output Directory: `.next` (自动检测)
- [ ] Install Command: `npm install` (自动检测)

## 🔑 第四步：环境变量配置
在 Vercel 项目设置 → Environment Variables 中添加：

### 必需的环境变量：
- [ ] `DATABASE_URL` - 生产环境 PostgreSQL 连接字符串
- [ ] `JWT_SECRET` - 生产环境 JWT 密钥
- [ ] `NEXTAUTH_SECRET` - 生产环境 NextAuth 密钥
- [ ] `NEXTAUTH_URL` - 设置为 `https://tourmaster.ch`

## 🌐 第五步：域名配置
- [ ] 在 Vercel 项目设置中点击 "Domains"
- [ ] 添加域名: `tourmaster.ch`
- [ ] 按照 Vercel 的 DNS 配置说明更新域名解析

## 🗄️ 第六步：数据库配置
- [ ] 创建生产环境 PostgreSQL 数据库
- [ ] 确保数据库可以从 Vercel 服务器访问
- [ ] 测试数据库连接

## 🚀 第七步：部署
- [ ] 点击 "Deploy" 开始部署
- [ ] 等待构建完成
- [ ] 检查部署日志是否有错误

## ✅ 第八步：部署后检查
- [ ] 访问 https://tourmaster.ch 确认网站正常加载
- [ ] 测试用户注册/登录功能
- [ ] 测试主要功能模块
- [ ] 检查 API 接口响应

---

**快速链接**:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/tubban1/tourmaster.git)
- [详细部署说明](./DEPLOYMENT.md) 