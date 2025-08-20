# 智能报告系统 (Smart Report System)

一个基于 React + TypeScript + Vite 构建的现代化智能报告管理系统，提供报告创建、编辑、分析和管理的完整解决方案。

## ✨ 功能特性

### 📊 核心功能
- **智能报告生成** - 基于模板快速创建专业报告
- **可视化编辑器** - 所见即所得的报告编辑体验
- **AI 智能分析** - 数据洞察和智能建议
- **模板管理** - 丰富的报告模板库
- **多视图展示** - 支持列表视图和卡片视图
- **实时搜索** - 快速定位目标报告

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
│   │   └── Login.tsx       # 登录页面
│   ├── router/             # 路由配置
│   ├── styles/             # 样式文件
│   │   ├── global.css
│   │   └── variables.css
│   ├── hooks/              # 自定义 Hooks
│   ├── utils/              # 工具函数
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

## 📚 文档

- [用户故事文档](./document/用户故事文档.md)
- [系统架构文档](./document/智能报告生成系统%20(v1.0%20-%20202507).md)
- [Playwright MCP 问题解决文档](./Playwright-MCP-问题解决文档.md)

## 🏗️ 架构图

项目包含完整的架构设计图：
- [业务架构图](./architecture/业务架构图.drawio)
- [产品架构图](./architecture/产品架构图.drawio)
- [技术架构图](./architecture/技术架构图.drawio)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 团队

- **开发团队** - 负责系统开发和维护
- **产品团队** - 负责需求分析和产品设计
- **测试团队** - 负责质量保证和测试

## 📞 联系我们

如有问题或建议，请通过以下方式联系我们：
- 提交 Issue
- 发送邮件
- 参与讨论

---

**智能报告系统** - 让报告创建更简单、更智能、更高效！ 🚀
