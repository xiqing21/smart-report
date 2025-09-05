# 智能报告系统 (Smart Report System)

一个基于 React + TypeScript + Vite 构建的现代化智能报告管理系统，提供报告创建、编辑、分析和管理的完整解决方案。

## ✨ 功能特性

### 📊 核心功能
- **智能报告生成** - 基于模板快速创建专业报告
- **可视化编辑器** - 所见即所得的报告编辑体验
- **AI 智能分析** - 集成智谱GLM，提供数据洞察和智能建议
- **模板管理** - 丰富的报告模板库
- **多视图展示** - 支持列表视图和卡片视图
- **实时搜索** - 快速定位目标报告
- **功能测试** - 内置测试页面，验证AI服务和数据存储功能

### 🎨 用户界面
- **现代化设计** - 基于 Ant Design 的精美界面
- **响应式布局** - 完美适配各种屏幕尺寸
- **流畅动画** - 基于 Framer Motion 的交互动效
- **主题定制** - 支持个性化主题配置

### 🔧 技术特性
- **TypeScript** - 完整的类型安全保障
- **模块化架构** - 清晰的代码组织结构
- **性能优化** - 懒加载和代码分割
- **测试支持** - 集成 Playwright 端到端测试
- **AI服务集成** - 智谱GLM API集成，支持智能对话和分析
- **数据持久化** - Supabase数据库集成，完整的CRUD功能

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 📁 项目结构

```
smart-report/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── AdvancedAnimations.tsx
│   │   ├── AnimatedComponents.tsx
│   │   ├── InteractiveEnhancements.tsx
│   │   └── ResponsiveContainer.tsx
│   ├── layouts/            # 布局组件
│   │   └── MainLayout.tsx
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── Reports.tsx     # 报告管理
│   │   ├── ReportEditor.tsx # 报告编辑器
│   │   ├── Templates.tsx   # 模板管理
│   │   ├── AIAnalysis.tsx  # AI 分析
│   │   ├── TestPage.tsx    # 功能测试页面
│   │   └── Login.tsx       # 登录页面
│   ├── router/             # 路由配置
│   ├── services/           # 服务层
│   │   ├── ai/            # AI服务管理
│   │   └── api/           # API服务
│   ├── config/             # 配置文件
│   │   └── ai-config.ts   # AI服务配置
│   ├── contexts/           # React上下文
│   │   └── AuthContext.tsx # 认证上下文
│   ├── styles/             # 样式文件
│   │   ├── global.css
│   │   └── variables.css
│   ├── hooks/              # 自定义 Hooks
│   ├── types/              # TypeScript类型定义
│   ├── lib/                # 工具库
│   └── assets/             # 静态资源
├── public/                 # 公共资源
├── document/               # 项目文档
├── architecture/           # 架构图
├── shell/                  # 脚本文件
└── ui-modern-version/      # UI 现代版本
```

## 🛠️ 技术栈

### 前端框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 现代化构建工具

### 后端服务
- **Supabase** - 开源的Firebase替代方案
- **PostgreSQL** - 关系型数据库
- **智谱GLM** - AI大语言模型服务

### UI 组件库
- **Ant Design** - 企业级 UI 设计语言
- **Ant Design Icons** - 图标库
- **Framer Motion** - 动画库

### 路由管理
- **React Router DOM** - 客户端路由

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript 代码规范
- **Playwright** - 端到端测试框架

### 工具库
- **Day.js** - 日期时间处理
- **Axios** - HTTP客户端
- **React Hook Form** - 表单处理

## 📖 页面说明

### 🏠 仪表盘 (Dashboard)
- 系统概览和关键指标展示
- 快速访问常用功能
- 数据可视化图表

### 📋 报告管理 (Reports)
- 报告列表展示（支持列表/卡片视图）
- 报告搜索和筛选
- 报告状态管理
- 批量操作功能

### ✏️ 报告编辑器 (Report Editor)
- 富文本编辑功能
- 模板应用和自定义
- 实时预览
- 协作编辑支持

### 📄 模板管理 (Templates)
- 模板库浏览
- 自定义模板创建
- 模板分类管理

### 🤖 AI 分析 (AI Analysis)
- 智能数据分析
- 报告质量评估
- 改进建议生成
- 集成智谱GLM模型

### 🧪 功能测试 (Test Page)
- AI服务调用测试
- 数据存储功能验证
- 系统集成测试
- 实时响应监控

## 🧪 测试

项目集成了 Playwright 进行端到端测试，确保应用的稳定性和可靠性。

### 运行测试
```bash
npx playwright test
```

### 安装浏览器
```bash
npx playwright install
```

## ⚙️ 配置说明

### AI服务配置
系统目前集成了智谱GLM AI服务，配置文件位于 `src/config/ai-config.ts`：

```typescript
// 环境变量配置
VITE_ZHIPU_API_KEY=your_zhipu_api_key
```

### 数据库配置
使用Supabase作为后端服务，需要配置以下环境变量：

```typescript
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 功能测试
访问 `/test` 路径可以进入功能测试页面，测试以下功能：
- AI服务调用和响应
- 报告数据的创建和存储
- 系统集成状态检查

## 🔄 最新更新

### v1.1.0 (2024-01-15)
- ✨ 简化AI服务配置，专注智谱GLM集成
- ✨ 新增功能测试页面 (`/test`)
- 🔧 优化AI服务管理器，增强错误处理和日志记录
- 🔧 完善数据持久化功能，支持报告、数据源、分析任务的CRUD操作
- 🐛 修复用户认证上下文中的profiles表查询问题
- 📝 更新导航菜单，添加功能测试入口

## 📚 文档

- [用户故事文档](./document/用户故事文档.md)
- [系统架构文档](./document/智能报告生成系统%20(v1.0%20-%20202507).md)
- [Playwright MCP 问题解决文档](./Playwright-MCP-问题解决文档.md)

## 📞 联系我们

如有问题或建议，请通过以下方式联系我们：
- 提交 Issue
- 发送邮件
- 参与讨论

---

**智能报告系统** - 让报告创建更简单、更智能、更高效！ 🚀

## 🧩 常见问题排查

### 1) 登录页样式不生效 / 页面看起来像“默认表单”
- 典型症状：背景纯白，按钮/阴影/圆角等 Tailwind 样式都没有效果；或首次打开浏览器控制台看到加载 `/src/main.tsx` 失败。
- 根因定位：
  1) 升级到 Tailwind CSS v4 后，仍使用 v3 的指令写法（`@tailwind base; @tailwind components; @tailwind utilities;`）。导致实用类未被生成，页面展示为朴素样式。修复为 v4 推荐写法 `@import "tailwindcss";`。
     - 修改位置：<mcfile name="global.css" path="/home/zhengyihan/cloud_enviroment/sx-yx2.0/smart-report/src/styles/global.css"></mcfile>
  2) 开发服务器端口占用，Vite 自动切到新的端口（如从 5173 切到 5174），浏览器仍访问旧端口，出现 `net::ERR_ABORTED` 指向 `/src/main.tsx`。
- 修复步骤：
  1) 在 <mcfile name="global.css" path="/home/zhengyihan/cloud_enviroment/sx-yx2.0/smart-report/src/styles/global.css"></mcfile> 顶部使用：`@import "tailwindcss";`
  2) 重新启动开发服务器 `npm run dev`，并使用终端提示的实际地址访问（默认 5173，若被占用会自动切换，例如 5174）。
- 验证清单：
  - 访问示例：`http://localhost:5174/login`（以终端输出为准）。
  - 浏览器 DevTools > Elements 中能看到 `bg-gradient-to-br`、`shadow-2xl` 等类；Styles 面板能看到来自 Tailwind 的规则。
  - Network 面板中全局样式已成功加载。
  - 强制刷新（Win: Ctrl+F5 / Mac: Cmd+Shift+R）。

> 说明：登录页左侧的“品牌区”在 <mcfile name="Login.tsx" path="/home/zhengyihan/cloud_enviroment/sx-yx2.0/smart-report/src/pages/Login.tsx"></mcfile> 中默认只在 `lg`(≥1024px) 及以上屏幕显示（类名：`hidden lg:flex`）。若浏览器窗口较窄，看不到品牌区属于预期行为。需要更早展示可将其改为 `hidden md:flex` 或 `flex`。

### 2) Google 图标异常放大
- 原因：SVG 未设置显式宽高，在某些环境被当作可伸缩块级元素放大。
- 处理：在 <mcfile name="Login.tsx" path="/home/zhengyihan/cloud_enviroment/sx-yx2.0/smart-report/src/pages/Login.tsx"></mcfile> 的 Google 按钮里，为 SVG 增加 `width/height` 与 `preserveAspectRatio="xMidYMid meet"`，避免溢出。

### 3) 端口相关错误（`net::ERR_ABORTED` 指向 /src/main.tsx）
- 原因：默认端口 5173 被占用时，Vite 会自动切到 5174/5175…
- 处理：始终以终端输出为准访问地址；如需固定端口，可在脚本中指定端口或先释放占用端口后再启动。
