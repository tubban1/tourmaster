# TourMaster.ch - 旅行社核心管理系统

TourMaster.ch 是一个基于 Next.js 和 Node.js 构建的现代化旅行社管理系统，专为多租户旅行社平台设计。

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Node.js, Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + HTTP-only Cookies
- **部署**: Vercel

## 核心功能

### 多租户架构
- 支持多个旅行社独立管理
- 严格的数据隔离
- 平台超级管理员统一管理

### 用户权限管理
- 平台超级管理员
- 旅行社管理员
- 调度员
- 销售经理
- 导游
- 财务
- 普通用户

### 核心业务模块
- **行程管理**: 创建和管理可复用的旅行行程模板
- **旅行团管理**: 基于行程模板创建具体旅行团
- **团员管理**: 管理旅行团成员信息
- **导游管理**: 全局导游池 + 旅行社关联
- **车辆管理**: 旅行社专属车辆资源
- **排班管理**: 导游和车辆的排班调度
- **供应商管理**: 酒店、餐厅等供应商信息
- **违章责任查询**: 根据车牌和日期追溯责任导游

## 项目结构

```
tourmaster.ch/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关
│   │   │   ├── agencies/      # 旅行社管理
│   │   │   ├── tours/         # 旅行团管理
│   │   │   ├── itineraries/   # 行程管理
│   │   │   ├── members/       # 团员管理
│   │   │   ├── guides/        # 导游管理
│   │   │   ├── vehicles/      # 车辆管理
│   │   │   ├── bookings/      # 排班管理
│   │   │   └── suppliers/     # 供应商管理
│   │   ├── dashboard/         # 仪表板页面
│   │   ├── admin/             # 管理员页面
│   │   └── page.tsx           # 登录页面
│   ├── components/            # 可复用组件
│   ├── lib/                   # 工具库
│   │   ├── prisma.ts         # Prisma 客户端
│   │   └── auth.ts           # 认证工具
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   └── hooks/                 # 自定义 Hooks
├── prisma/                    # 数据库模型
│   └── schema.prisma         # Prisma 模型定义
├── public/                    # 静态资源
└── package.json
```

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp env.example .env.local
```

2. 配置数据库连接：
```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/tourmaster"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 数据库设置
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 查看数据库（可选）
npx prisma studio
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 初始化测试数据

首次使用需要初始化测试数据：

1. 访问 http://localhost:3000/init
2. 点击"开始初始化"按钮
3. 系统将创建测试账号和示例数据

### 测试账号

初始化后可以使用以下账号登录：

| 角色 | 用户名 | 密码 | 描述 |
|------|--------|------|------|
| 平台超级管理员 | superadmin | admin123 | 可以管理所有旅行社 |
| 旅行社管理员 | admin | admin123 | 管理单个旅行社的所有数据 |
| 销售经理 | sales | sales123 | 管理旅行团和团员 |
| 调度员 | scheduler | scheduler123 | 管理导游和车辆排班 |

### 测试数据

初始化后会创建：
- 1个示例旅行社（环球旅行社）
- 2个导游（李明、王芳）
- 2辆车辆（京A12345、京B67890）
- 1个行程模板（瑞士深度探索之旅）
- 1个旅行团（2025年3月团）

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `DATABASE_URL`: PostgreSQL 连接字符串
   - `JWT_SECRET`: JWT 密钥
4. 部署

## 数据模型

### 核心实体
- **Agency**: 旅行社
- **User**: 用户（多租户）
- **Itinerary**: 行程模板
- **Tour**: 旅行团
- **TourMember**: 团员
- **TourGuide**: 导游（全局）
- **AgencyGuideAssignment**: 导游-旅行社关系
- **Vehicle**: 车辆
- **Booking**: 排班记录
- **Supplier**: 供应商
- **ServiceReservation**: 服务预订

### 多租户设计
- 所有业务实体都包含 `agencyId` 字段
- 严格的数据隔离
- 导游可以在多个旅行社间共享

## API 文档

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 旅行社管理
- `GET /api/agencies` - 获取所有旅行社（超级管理员）
- `POST /api/agencies` - 创建新旅行社（超级管理员）

### 旅行团管理
- `GET /api/tours` - 获取旅行团列表
- `POST /api/tours` - 创建新旅行团
- `GET /api/tours/[id]` - 获取旅行团详情
- `PUT /api/tours/[id]` - 更新旅行团
- `DELETE /api/tours/[id]` - 删除旅行团

### 其他模块
每个模块都有完整的 CRUD API，遵循 RESTful 设计原则。

## 开发指南

### 添加新功能
1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npx prisma migrate dev` 更新数据库
3. 创建 API 路由
4. 创建前端页面和组件
5. 添加类型定义

### 权限控制
- 使用 JWT 进行身份验证
- 基于用户角色进行权限控制
- 所有 API 都需要验证用户权限

### 数据验证
- 使用 Prisma 进行数据验证
- API 层面进行输入验证
- 前端表单验证

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。
