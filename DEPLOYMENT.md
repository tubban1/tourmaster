# Tourmaster.ch 部署说明

## 部署到 Vercel

### 1. 准备工作
- ✅ 代码已推送到 GitHub: https://github.com/tubban1/tourmaster.git
- ✅ 域名: tourmaster.ch
- ✅ 使用 Vercel 进行部署

### 2. Vercel 项目配置步骤

#### 2.1 创建新项目
1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择 `tubban1/tourmaster` 仓库
5. 点击 "Import"

#### 2.2 项目设置
- **Project Name**: tourmaster
- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (自动检测)
- **Output Directory**: `.next` (自动检测)
- **Install Command**: `npm install` (自动检测)

#### 2.3 环境变量配置
在 Vercel 项目设置中添加以下环境变量：

```bash
# 数据库连接 (生产环境)
DATABASE_URL="postgresql://username:password@host:5432/tourmaster"

# JWT 密钥 (生产环境)
JWT_SECRET="your-production-jwt-secret-key"

# Next.js 配置
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://tourmaster.ch"
```

#### 2.4 域名配置
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加域名: `tourmaster.ch`
3. 按照 Vercel 的 DNS 配置说明更新域名解析

### 3. 数据库配置

#### 3.1 生产环境数据库
- 推荐使用 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com) 的 PostgreSQL 服务
- 确保数据库可以从 Vercel 的服务器访问

#### 3.2 数据库迁移
部署后需要运行数据库迁移：

```bash
# 在 Vercel 的部署日志中查看或手动运行
npx prisma migrate deploy
npx prisma generate
```

### 4. 部署后检查

#### 4.1 功能测试
- [ ] 首页加载正常
- [ ] 用户认证功能正常
- [ ] 数据库连接正常
- [ ] API 接口响应正常

#### 4.2 性能优化
- [ ] 图片优化
- [ ] 代码分割
- [ ] 缓存策略

### 5. 常见问题

#### 5.1 构建失败
- 检查 Node.js 版本 (推荐 18.x 或 20.x)
- 检查依赖包版本兼容性
- 查看构建日志错误信息

#### 5.2 数据库连接失败
- 检查 DATABASE_URL 格式
- 确认数据库服务器允许外部连接
- 检查防火墙设置

#### 5.3 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查环境变量名称拼写
- 重启部署以应用新的环境变量

### 6. 维护和更新

#### 6.1 自动部署
- 每次推送到 `main` 分支会自动触发部署
- 可以在 Vercel 中配置预览部署分支

#### 6.2 回滚部署
- 在 Vercel 部署历史中选择之前的版本
- 点击 "Redeploy" 进行回滚

### 7. 监控和分析

#### 7.1 Vercel Analytics
- 启用 Vercel Analytics 监控网站性能
- 查看用户访问数据和错误日志

#### 7.2 性能监控
- 监控 Core Web Vitals
- 检查 API 响应时间
- 监控数据库查询性能

---

**注意**: 部署前请确保所有敏感信息（如数据库密码、JWT密钥）都已正确配置，并且生产环境的安全性已得到保障。 