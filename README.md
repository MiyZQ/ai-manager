# AI Manager

一个面向 Claude Code 开发者的桌面端 AI 管理工具，统一管理提示词、项目配置、MCP 服务器和 AI API。

## 功能特性

### 提示词管理
- 创建、编辑、删除提示词模板
- 支持分类和标签管理
- 模板变量系统 (`{{variable}}` 语法)
- 版本历史记录

### 项目管理
- 管理多个项目的配置
- 关联提示词到项目
- 环境变量配置
- MCP 服务器配置绑定

### AI API 管理
- 支持多种 AI 服务提供商：
  - Claude (Anthropic)
  - OpenAI
  - DeepSeek
  - 智谱 GLM
  - MiniMax
  - Kimi (Moonshot)
  - 通义千问 (Qwen)
  - 硅基流动 (SiliconFlow)
  - 自定义 Provider
- API 密钥管理
- 连接测试功能
- 使用量统计

### MCP 服务器管理
- MCP 配置管理
- 服务器启停控制

### 仓库统计
- 自动扫描 Claude Code 项目
- 文件数量和大小统计
- 最近访问时间

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron |
| 前端 | React 18 + TypeScript |
| UI | TailwindCSS + shadcn/ui |
| 构建 | electron-vite |
| 图标 | lucide-react |
| 数据存储 | 本地 JSON 文件 |

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run build
```

### 构建 Windows 安装包

```bash
npm run build:win
```

## 项目结构

```
src/
├── main/                     # Electron 主进程
│   └── index.ts              # 入口、IPC 处理、数据持久化
├── preload/                   # 预加载脚本
│   └── index.ts
└── renderer/                  # 渲染进程 (React)
    ├── App.tsx                # 应用入口
    ├── components/
    │   ├── ui/               # shadcn/ui 基础组件
    │   ├── prompts/          # 提示词管理
    │   ├── projects/         # 项目管理
    │   ├── api/               # API 管理
    │   ├── mcp/              # MCP 管理
    │   ├── kill/             # 进程管理
    │   └── repos/             # 仓库统计
    ├── types/
    └── lib/
```

## 数据存储

所有数据存储在用户数据目录下的 `data.json` 文件中：
- Windows: `%APPDATA%/ai-manager/data.json`
- macOS: `~/Library/Application Support/ai-manager/data.json`

## License

MIT
