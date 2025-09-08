# GitHub Pages 部署指南

本项目已配置好自动部署到 GitHub Pages 的功能。按照以下步骤即可完成部署：

## 1. 推送代码到 GitHub

首先确保你的代码已经推送到 GitHub 仓库的 `main` 分支：

```bash
git add .
git commit -m "配置 GitHub Pages 部署"
git push origin main
```

## 2. 启用 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 点击 **Settings** 选项卡
3. 在左侧菜单中找到 **Pages** 选项
4. 在 **Source** 部分选择 **GitHub Actions**
5. 保存设置

## 3. 触发自动部署

一旦启用 GitHub Pages 并推送代码到 `main` 分支，GitHub Actions 工作流将自动触发：

1. 自动安装依赖
2. 构建项目
3. 部署到 GitHub Pages

## 4. 访问你的网站

部署完成后，你的网站将可以通过以下地址访问：

```
https://[你的用户名].github.io/smart-report/
```

## 5. 查看部署状态

你可以在以下位置查看部署状态：

- **Actions** 选项卡：查看工作流运行状态
- **Settings > Pages**：查看部署状态和网站地址

## 配置说明

项目已包含以下配置：

### Vite 配置 (`vite.config.ts`)
```typescript
base: process.env.NODE_ENV === 'production' ? '/smart-report/' : '/'
```

### GitHub Actions 工作流 (`.github/workflows/deploy.yml`)
- 自动在 `main` 分支推送时触发
- 使用 Node.js 18
- 自动构建并部署到 GitHub Pages

## 故障排除

### 如果部署失败：

1. 检查 **Actions** 选项卡中的错误日志
2. 确保仓库设置中启用了 GitHub Pages
3. 确保工作流有足够的权限（已在配置中设置）

### 如果网站无法访问：

1. 等待几分钟，GitHub Pages 部署可能需要一些时间
2. 检查 **Settings > Pages** 中显示的实际网站地址
3. 确保使用正确的 URL 格式

## 自定义域名（可选）

如果你有自定义域名，可以在 **Settings > Pages** 中的 **Custom domain** 部分进行配置。

---

🎉 **恭喜！** 你的智能报告系统现在已经部署到 GitHub Pages 上了！