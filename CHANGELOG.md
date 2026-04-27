# 更新日志

## 已实现功能

### 核心功能
- [x] Electron 桌面应用框架搭建
- [x] React + TypeScript 前端架构
- [x] TailwindCSS + shadcn/ui 组件库
- [x] JSON 文件数据持久化
- [x] 侧边栏导航布局

### 提示词管理
- [x] 提示词 CRUD 操作
- [x] 分类管理
- [x] 标签系统
- [x] 模板变量提取 (`{{variable}}` 语法)
- [x] 版本历史记录

### 项目管理
- [x] 项目 CRUD 操作
- [x] 项目分组
- [x] 关联提示词
- [x] 环境变量配置
- [x] MCP 配置绑定

### API 管理
- [x] API Provider CRUD 操作
- [x] 多 Provider 支持 (Claude, OpenAI, DeepSeek, GLM, MiniMax, Kimi, Qwen, SiliconFlow)
- [x] 自定义 Provider
- [x] API 密钥管理
- [x] **真实 API 连接测试** (HTTP 请求验证，非 Mock)
- [x] 激活/停用状态切换
- [x] 使用量统计

### MCP 管理
- [x] MCP 配置界面
- [x] 服务器管理

### 仓库统计
- [x] Claude Code 项目路径扫描
- [x] 文件数量统计
- [x] 目录大小统计
- [x] 最后访问时间

### 其他
- [x] 主题支持 (浅色/深色/系统)
- [x] Windows exe 打包

---

## 待实现功能

### 优先级高
- [ ] 设置页面完善 (当前点击无响应)
- [ ] API 使用量详细统计图表
- [ ] API Key 安全加密存储 (当前明文存储)
- [ ] 提示词市场/导入导出

### 优先级中
- [ ] 项目环境快速切换
- [ ] MCP 服务器启动/停止控制
- [ ] 仓库路径管理 (添加/删除/自定义路径)
- [ ] 暗色主题完善

### 优先级低
- [ ] 云端同步 (Gist 备份)
- [ ] 快捷键支持
- [ ] 通知系统
- [ ] 多语言支持

### 已知问题
- [ ] GPU 加速在部分 Windows 设备上可能有问题 (已禁用 GPU)

---

## 版本历史

### v1.0.0 (2026-04-27)
- 初始版本发布
- 完成核心功能：提示词、项目、API、MCP、仓库管理
- 支持 Windows exe 打包
