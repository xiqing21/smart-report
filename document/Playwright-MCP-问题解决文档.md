# Playwright MCP 问题解决文档

## 概述

本文档记录了在智能报告系统项目中解决 Playwright MCP (Model Context Protocol) 集成问题的完整过程，包括问题分析、解决方案和验证测试。

## 问题背景

Playwright MCP 是一个强大的浏览器自动化测试工具，但在 Linux 环境下初次部署时经常遇到依赖缺失和环境配置问题。

## 核心问题分析

### 1. 浏览器执行环境缺失
**根本原因**：系统缺少浏览器运行所需的基础库和依赖

**错误表现**：
```
Executable doesn't exist at /home/user/.cache/ms-playwright/chromium-1179/chrome-linux/chrome
```

### 2. 系统依赖问题
**缺失的关键依赖**：
- `libnspr4` - Mozilla 网络安全运行时库
- `libnss3` - 网络安全服务库
- `libasound2t64` - 音频处理库
- `libgtk-3-0t64` - GTK+ 图形界面库
- 其他图形和音频相关依赖

### 3. Playwright 包管理问题
**问题描述**：
- 缺少 `@playwright/test` npm 包
- 浏览器文件未正确下载
- 版本兼容性问题

## 解决方案

### 阶段一：系统依赖安装

#### 1.1 安装基础依赖
```bash
sudo apt-get update
sudo apt-get install -y libnspr4 libnss3 libasound2t64
```

#### 1.2 安装完整系统依赖
```bash
sudo npx playwright install-deps
```

**说明**：这个命令会自动安装 Playwright 所需的所有系统依赖，包括：
- 图形渲染库
- 音频处理库
- 字体和编码库
- 多媒体处理库

### 阶段二：Playwright 包安装

#### 2.1 安装 npm 包
```bash
npm install @playwright/test
```

#### 2.2 下载浏览器文件
```bash
npx playwright install
```

### 阶段三：版本兼容性处理

#### 3.1 问题识别
MCP 服务器期望特定版本的浏览器（如 chromium-1179），但实际安装了更新版本（如 chromium-1181）。

#### 3.2 解决方案
创建符号链接映射版本差异：
```bash
cd ~/.cache/ms-playwright
ln -sf chromium-1181 chromium-1179
ln -sf chromium_headless_shell-1181 chromium_headless_shell-1179
```

## 功能验证测试

### 测试用例 1：页面导航
```javascript
// 导航到目标页面
playwright_navigate({
  url: "http://localhost:5173/reports",
  browserType: "chromium",
  width: 1280,
  height: 720,
  headless: true
})
```

### 测试用例 2：页面截图
```javascript
// 生成页面截图
playwright_screenshot({
  name: "reports_page_test",
  width: 1280,
  height: 720,
  storeBase64: true,
  fullPage: true
})
```

### 测试用例 3：元素交互
```javascript
// 点击按钮
playwright_click({
  selector: "button:has-text('卡片')"
})

// 填写表单
playwright_fill({
  selector: "input[placeholder*='搜索']",
  value: "销售"
})

// 按键操作
playwright_press_key({
  key: "Enter",
  selector: "input[placeholder*='搜索']"
})
```

## 关键经验总结

### 1. 依赖安装顺序
**正确顺序**：
1. 系统依赖 (`sudo npx playwright install-deps`)
2. npm 包 (`npm install @playwright/test`)
3. 浏览器文件 (`npx playwright install`)
4. 版本兼容处理（如需要）

### 2. 常见错误处理

#### 错误："Package 'libasound2' has no installation candidate"
**解决**：使用正确的包名 `libasound2t64`

#### 错误：浏览器版本不匹配
**解决**：创建符号链接映射版本差异

#### 错误：权限问题
**解决**：使用 `sudo` 安装系统依赖

### 3. 最佳实践

1. **环境检查**：安装前检查系统环境和已有依赖
2. **完整安装**：使用官方推荐的安装命令
3. **版本管理**：注意 MCP 服务器和本地 Playwright 的版本兼容性
4. **功能验证**：安装后进行完整的功能测试

## 故障排除指南

### 问题：浏览器启动失败
**检查步骤**：
1. 确认系统依赖是否完整安装
2. 检查浏览器文件是否存在
3. 验证版本兼容性
4. 查看详细错误日志

### 问题：MCP 连接失败
**检查步骤**：
1. 确认 MCP 服务器状态
2. 检查网络连接
3. 验证配置参数

### 问题：测试执行超时
**可能原因**：
1. 选择器不正确
2. 页面加载缓慢
3. 元素不可见或不可交互

**解决方案**：
1. 使用更精确的选择器
2. 增加等待时间
3. 检查页面状态

## 技术架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │───▶│  Playwright MCP  │───▶│   Browser       │
│   (Trae AI)     │    │    Server        │    │  (Chromium)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  System Dependencies │
                       │  - libnspr4      │
                       │  - libnss3       │
                       │  - libasound2t64 │
                       │  - libgtk-3-0t64 │
                       └──────────────────┘
```

## 结论

Playwright MCP 的成功部署需要系统性地解决依赖、包管理和版本兼容性问题。通过本文档提供的解决方案，可以在 Linux 环境下稳定运行 Playwright 自动化测试功能。

## 附录

### A. 完整的安装脚本
```bash
#!/bin/bash
# Playwright MCP 完整安装脚本

echo "开始安装 Playwright MCP..."

# 1. 更新系统包
sudo apt-get update

# 2. 安装基础依赖
sudo apt-get install -y libnspr4 libnss3 libasound2t64

# 3. 安装完整系统依赖
sudo npx playwright install-deps

# 4. 安装 npm 包
npm install @playwright/test

# 5. 下载浏览器文件
npx playwright install

# 6. 处理版本兼容性（如需要）
cd ~/.cache/ms-playwright
if [ -d "chromium-1181" ] && [ ! -d "chromium-1179" ]; then
    ln -sf chromium-1181 chromium-1179
    ln -sf chromium_headless_shell-1181 chromium_headless_shell-1179
fi

echo "Playwright MCP 安装完成！"
```

### B. 验证脚本
```bash
#!/bin/bash
# Playwright MCP 功能验证脚本

echo "验证 Playwright 安装..."
npx playwright --version

echo "检查浏览器文件..."
ls -la ~/.cache/ms-playwright/

echo "验证完成！"
```

---

**文档版本**：v1.0  
**创建日期**：2025-08-19  
**最后更新**：2025-08-19  
**作者**：智能报告系统开发团队