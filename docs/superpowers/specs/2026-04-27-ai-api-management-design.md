# AI API 管理功能设计文档

> 创建日期：2026-04-27

## 1. 功能概述

**功能名称：** AI API 管理器
**功能描述：** 管理多种 AI API 提供商的配置，支持密钥管理、切换激活、项目绑定、使用量统计和 GitHub Gist 同步备份。
**目标用户：** 使用 Claude Code 等 AI 工具的开发者

## 2. 用户界面

### 2.1 布局结构

- **导航入口：** 侧边栏新增"API"导航项（独立于现有 5 个模块）
- **主内容区：** 卡片网格布局展示 API 提供商
- **响应式：** 2-4 列自适应网格

### 2.2 界面元素

```
┌─────────────────────────────────────────────────────────────┐
│  AI API 管理                              [+ 添加] [↻ 同步] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Claude      │  │ OpenAI GPT  │  │ DeepSeek    │        │
│  │ ● 激活      │  │ ○ 停用      │  │ ● 激活      │        │
│  │ 本月: 123次 │  │ 本月: 0次   │  │ 本月: 456次 │        │
│  │ [编辑][测试]│  │ [编辑][测试]│  │ [编辑][测试]│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │ GLM         │  │ MiniMax     │                         │
│  │ ● 激活      │  │ ○ 停用      │                         │
│  │ 本月: 89次  │  │ 本月: 200次 │                         │
│  │ [编辑][测试]│  │ [编辑][测试]│                         │
│  └─────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 添加/编辑对话框

```
┌─────────────────────────────────────────────────────────────┐
│  添加 API 提供商                                        [X] │
├─────────────────────────────────────────────────────────────┤
│  提供商: [预设选择 ▼]                                      │
│          - Claude Official                                 │
│          - OpenAI GPT                                      │
│          - DeepSeek                                        │
│          - 智谱 GLM                                         │
│          - MiniMax                                          │
│          - Kimi                                            │
│          - 通义千问                                         │
│          - 硅基流动                                         │
│          - 自定义                                           │
│                                                             │
│  API 密钥: [••••••••••••••••••••]                          │
│                                                             │
│  端点 URL: [https://api.xxx.com    ] (可选)                │
│                                                             │
│  费用上限: [___________] (可选)                             │
│                                                             │
│                                     [取消]  [保存]          │
└─────────────────────────────────────────────────────────────┘
```

## 3. 数据模型

```typescript
interface ApiProvider {
  id: string
  name: string           // 显示名称
  provider: string       // 提供商标识
  apiKey: string         // 加密存储
  endpoint?: string      // 自定义端点
  models: string[]       // 支持的模型
  isActive: boolean      // 激活状态
  usageStats: UsageRecord[]
  costLimit?: number     // 费用上限
  createdAt: string
  updatedAt: string
}

interface UsageRecord {
  date: string
  requests: number
  inputTokens: number
  outputTokens: number
  cost: number
}

interface GistConfig {
  enabled: boolean
  gistId?: string
  filename: string
  lastSyncAt?: string
}
```

## 4. 预设提供商

| 提供商 | 标识 | 默认端点 |
|--------|------|----------|
| Claude Official | claude | https://api.anthropic.com |
| OpenAI GPT | openai | https://api.openai.com |
| DeepSeek | deepseek | https://api.deepseek.com |
| 智谱 GLM | glm | https://open.bigmodel.cn |
| MiniMax | minimax | https://api.minimax.chat |
| Kimi | kimi | https://api.moonshot.cn |
| 通义千问 | qwen | https://dashscope.aliyuncs.com |
| 硅基流动 | silicon | https://api.siliconflow.cn |
| 自定义 | custom | 用户自定义 |

## 5. 核心功能

### 5.1 API 管理
- 添加新 API（选择预设或自定义）
- 编辑 API 配置
- 删除 API（需确认对话框）
- 激活/停用 API

### 5.2 测试连接
- 验证 API 密钥有效性
- 显示测试结果（成功/失败）

### 5.3 使用量统计
- 记录每日请求次数
- 估算 tokens 使用量
- 计算费用（基于各平台定价）

### 5.4 GitHub Gist 同步
- 加密后同步到 GitHub Gist
- 多设备同步备份

### 5.5 项目绑定
- 项目可选择默认 API
- 切换项目时自动切换 API

## 6. 技术实现

- **存储：** 复用现有 data.json，新增 apiProviders 和 gistConfig 字段
- **加密：** 使用 Node.js crypto AES 加密 API 密钥
- **IPC：** 复用现有通道
- **状态管理：** Zustand

## 7. 实现任务

1. 更新 main/index.ts - 添加 ApiProvider 接口和 IPC 处理
2. 更新 App.tsx - 添加 API 导航项
3. 创建 ApiView.tsx - API 管理界面
4. 创建 AddApiDialog.tsx - 添加/编辑对话框
5. 添加加密工具函数
6. 添加 GitHub Gist 同步功能
