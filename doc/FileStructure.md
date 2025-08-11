# TourMaster.ch 项目文件结构

## 项目概述
TourMaster.ch 是一个基于 Next.js 的旅游管理系统，使用 TypeScript、Prisma ORM 和 PostgreSQL 数据库。项目采用 App Router 架构，实现了完整的旅游行程管理、导游安排、车辆调度等功能。

## 根目录结构

```
tourmaster.ch/
├── .next/                    # Next.js 构建输出目录
├── .git/                     # Git 版本控制目录
├── doc/                      # 项目文档目录
├── node_modules/             # Node.js 依赖包
├── prisma/                   # 数据库相关文件
├── public/                   # 静态资源文件
├── scripts/                  # 脚本文件
├── src/                      # 源代码目录
├── .gitignore               # Git 忽略文件配置
├── .cursorignore            # Cursor IDE 忽略文件配置
├── env.example              # 环境变量示例文件
├── eslint.config.mjs        # ESLint 配置
├── next-env.d.ts            # Next.js TypeScript 类型定义
├── next.config.ts            # Next.js 配置文件
├── package.json              # 项目依赖和脚本配置
├── package-lock.json         # 依赖版本锁定文件
├── postcss.config.mjs        # PostCSS 配置
├── README.md                 # 项目说明文档
├── README_SCHEDULING.md      # 排班功能说明文档
├── test-scheduling.js        # 排班功能测试脚本
├── tsconfig.json             # TypeScript 配置
└── .DS_Store                 # macOS 系统文件
```

## 源代码目录结构 (src/)

### 主要目录

#### 1. app/ - Next.js App Router 页面和API
```
src/app/
├── api/                      # API 路由目录
│   ├── agencies/             # 旅行社管理API
│   ├── auth/                 # 认证相关API
│   ├── guides/               # 导游管理API
│   ├── init/                 # 系统初始化API
│   ├── itineraries/          # 行程管理API
│   ├── members/              # 团员管理API
│   ├── scheduling/           # 排班管理API
│   ├── suppliers/            # 供应商管理API
│   ├── tours/                # 旅行团管理API
│   ├── users/                # 用户管理API
│   └── vehicles/             # 车辆管理API
├── dashboard/                # 仪表板页面
├── guides/                   # 导游管理页面
├── init/                     # 系统初始化页面
├── itineraries/              # 行程管理页面
├── members/                  # 团员管理页面
├── scheduling/               # 排班管理页面
├── suppliers/                # 供应商管理页面
├── tours/                    # 旅行团管理页面
├── vehicles/                 # 车辆管理页面
├── favicon.ico               # 网站图标
├── globals.css               # 全局样式文件
├── layout.tsx                # 根布局组件
└── page.tsx                  # 首页组件
```

#### 2. components/ - 可复用组件
```
src/components/
├── AppLayout.tsx             # 应用主布局组件
├── Sidebar.tsx               # 侧边栏导航组件
└── VehicleCalendar.tsx       # 车辆日历组件
```

#### 3. types/ - TypeScript 类型定义
```
src/types/
└── index.ts                  # 全局类型定义文件
```

#### 4. lib/ - 工具库和配置
```
src/lib/
├── auth.ts                   # 认证相关工具函数
└── prisma.ts                 # Prisma 数据库客户端配置
```

#### 5. hooks/ - 自定义 React Hooks
```
src/hooks/                    # 自定义 Hooks 目录（当前为空）
```

#### 6. utils/ - 工具函数
```
src/utils/                    # 工具函数目录（当前为空）
```

#### 7. middleware.ts - 中间件
```
src/middleware.ts             # Next.js 中间件，处理认证和路由保护
```

## 核心功能模块详解

### 1. 行程管理模块 (itineraries/)
```
src/app/itineraries/
├── page.tsx                  # 行程列表页面
├── new/                      # 新建行程
│   └── page.tsx             # 新建行程表单页面
└── [id]/                     # 动态路由 - 具体行程
    ├── page.tsx              # 行程详情页面
    └── edit/                 # 编辑行程
        └── page.tsx          # 行程编辑页面
```

**功能说明：**
- 行程列表展示和管理
- 新建行程（包含每日活动安排）
- 行程详情查看（包含导游安排、车辆信息）
- 行程编辑（支持修改每日活动、酒店信息等）

### 2. 旅行团管理模块 (tours/)
```
src/app/tours/
├── page.tsx                  # 旅行团列表页面
├── new/                      # 新建旅行团
│   └── page.tsx             # 新建旅行团表单页面
└── [id]/                     # 动态路由 - 具体旅行团
    └── page.tsx              # 旅行团详情页面
```

**功能说明：**
- 旅行团创建和管理
- 绑定行程到旅行团
- 旅行团状态跟踪

### 3. 排班管理模块 (scheduling/)
```
src/app/scheduling/
├── page.tsx                  # 排班总览页面
└── [tourId]/                 # 动态路由 - 具体旅行团排班
    └── page.tsx              # 旅行团排班详情页面
```

**功能说明：**
- 导游排班管理
- 车辆分配
- 每日行程安排
- 住宿安排管理

### 4. 导游管理模块 (guides/)
```
src/app/guides/
└── page.tsx                  # 导游管理页面
```

**功能说明：**
- 导游信息管理
- 导游技能和语言设置
- 导游可用性管理

### 5. 车辆管理模块 (vehicles/)
```
src/app/vehicles/
└── page.tsx                  # 车辆管理页面
```

**功能说明：**
- 车辆信息管理
- 车辆类型和容量设置
- 车辆占用时间管理

### 6. 团员管理模块 (members/)
```
src/app/members/
└── page.tsx                  # 团员管理页面
```

**功能说明：**
- 旅行团成员信息管理
- 护照和健康信息记录
- 紧急联系人管理

### 7. 供应商管理模块 (suppliers/)
```
src/app/suppliers/
└── page.tsx                  # 供应商管理页面
```

**功能说明：**
- 供应商信息管理
- 服务类型和报价管理
- 供应商联系信息

### 8. 仪表板模块 (dashboard/)
```
src/app/dashboard/
└── page.tsx                  # 系统仪表板页面
```

**功能说明：**
- 系统概览和统计信息
- 快速访问各功能模块
- 重要数据展示

### 9. 系统初始化模块 (init/)
```
src/app/init/
└── page.tsx                  # 系统初始化页面
```

**功能说明：**
- 系统首次运行时的初始化
- 创建默认管理员账户
- 设置基础配置

## API 路由结构

### 认证相关 API
```
/api/auth/                    # 用户认证、登录、注册等
```

### 数据管理 API
```
/api/agencies/                # 旅行社CRUD操作
/api/guides/                  # 导游CRUD操作
/api/itineraries/             # 行程CRUD操作
/api/members/                 # 团员CRUD操作
/api/scheduling/              # 排班相关操作
/api/suppliers/               # 供应商CRUD操作
/api/tours/                   # 旅行团CRUD操作
/api/users/                   # 用户CRUD操作
/api/vehicles/                # 车辆CRUD操作
```

## 数据库结构 (prisma/)

```
prisma/
└── schema.prisma             # Prisma 数据库模式定义
```

**主要数据模型：**
- Agency (旅行社)
- User (用户)
- Itinerary (行程)
- Tour (旅行团)
- TourMember (团员)
- TourGuide (导游)
- Vehicle (车辆)
- Supplier (供应商)
- ServiceReservation (服务预订)

## 配置文件说明

### TypeScript 配置
- `tsconfig.json` - TypeScript 编译配置
- `next-env.d.ts` - Next.js 类型定义

### Next.js 配置
- `next.config.ts` - Next.js 框架配置
- `postcss.config.mjs` - CSS 后处理器配置

### 代码质量配置
- `eslint.config.mjs` - 代码规范检查配置

### 环境配置
- `env.example` - 环境变量示例
- `.gitignore` - Git 忽略文件配置

## 项目特点

1. **现代化架构**: 使用 Next.js 13+ App Router
2. **类型安全**: 完整的 TypeScript 支持
3. **数据库集成**: Prisma ORM + PostgreSQL
4. **组件化设计**: 可复用的 React 组件
5. **API 优先**: RESTful API 设计
6. **响应式设计**: 支持多设备访问
7. **模块化组织**: 清晰的功能模块划分

## 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 Next.js 13+ App Router 规范
- 组件采用函数式组件 + Hooks
- API 路由遵循 RESTful 设计原则
- 数据库操作通过 Prisma 进行
- 样式使用 Tailwind CSS 框架 