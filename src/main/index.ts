import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log/main'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'

// 禁用 GPU 加速以避免 Windows 环境下的 GPU 问题
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu-compositing')

// 初始化日志
log.initialize()
log.info('AI Manager starting...')

// 存储路径
const userDataPath = app.getPath('userData')
const dataFilePath = join(userDataPath, 'data.json')

// 初始化默认数据
interface Prompt {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  variables: string[]
  versions: { version: number; content: string; createdAt: string }[]
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description: string
  group: string
  tags: string[]
  promptIds: string[]
  envVars: Record<string, string>
  mcpConfig: string[]
  createdAt: string
  updatedAt: string
}

interface Repository {
  path: string
  name: string
  fileCount: number
  totalSize: number
  lastAccessed: string
}

interface UsageRecord {
  date: string
  requests: number
  inputTokens: number
  outputTokens: number
  cost: number
}

interface ApiProvider {
  id: string
  name: string
  provider: string
  apiKey: string
  endpoint?: string
  models: string[]
  isActive: boolean
  usageStats: UsageRecord[]
  costLimit?: number
  createdAt: string
  updatedAt: string
}

interface AppData {
  prompts: Prompt[]
  projects: Project[]
  repositories: Repository[]
  apiProviders: ApiProvider[]
  settings: {
    theme: 'light' | 'dark' | 'system'
    sidebarWidth: number
  }
}

const defaultData: AppData = {
  prompts: [],
  projects: [],
  repositories: [],
  apiProviders: [],
  settings: {
    theme: 'system',
    sidebarWidth: 240
  }
}

// 加载数据
async function loadData(): Promise<AppData> {
  try {
    if (existsSync(dataFilePath)) {
      const content = await readFile(dataFilePath, 'utf-8')
      const data = JSON.parse(content)
      // 确保 apiProviders 存在（兼容旧数据）
      if (!data.apiProviders) {
        data.apiProviders = []
      }
      if (!data.repositories) {
        data.repositories = []
      }
      if (!data.prompts) {
        data.prompts = []
      }
      if (!data.projects) {
        data.projects = []
      }
      return data
    }
  } catch (error) {
    log.error('Failed to load data:', error)
  }
  return defaultData
}

// 保存数据
async function saveData(data: AppData): Promise<void> {
  try {
    await writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    log.error('Failed to save data:', error)
  }
}

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    log.info('Main window ready')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发模式下加载本地URL
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// IPC 处理程序

// 获取所有数据
ipcMain.handle('get-data', async () => {
  return await loadData()
})

// 保存所有数据
ipcMain.handle('save-data', async (_, data: AppData) => {
  await saveData(data)
  return { success: true }
})

// Prompt CRUD
ipcMain.handle('prompts:create', async (_, prompt: Omit<Prompt, 'id' | 'versions' | 'createdAt' | 'updatedAt'>) => {
  const data = await loadData()
  const now = new Date().toISOString()
  const newPrompt: Prompt = {
    ...prompt,
    id: generateId(),
    versions: [],
    createdAt: now,
    updatedAt: now
  }
  data.prompts.push(newPrompt)
  await saveData(data)
  return newPrompt
})

ipcMain.handle('prompts:update', async (_, id: string, updates: Partial<Prompt>) => {
  const data = await loadData()
  const index = data.prompts.findIndex(p => p.id === id)
  if (index !== -1) {
    // 保存版本历史
    if (updates.content && updates.content !== data.prompts[index].content) {
      const currentVersion = data.prompts[index].versions.length + 1
      data.prompts[index].versions.push({
        version: currentVersion,
        content: data.prompts[index].content,
        createdAt: data.prompts[index].updatedAt
      })
    }
    data.prompts[index] = {
      ...data.prompts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await saveData(data)
    return data.prompts[index]
  }
  return null
})

ipcMain.handle('prompts:delete', async (_, id: string) => {
  const data = await loadData()
  data.prompts = data.prompts.filter(p => p.id !== id)
  await saveData(data)
  return { success: true }
})

// Project CRUD
ipcMain.handle('projects:create', async (_, project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const data = await loadData()
  const now = new Date().toISOString()
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
  data.projects.push(newProject)
  await saveData(data)
  return newProject
})

ipcMain.handle('projects:update', async (_, id: string, updates: Partial<Project>) => {
  const data = await loadData()
  const index = data.projects.findIndex(p => p.id === id)
  if (index !== -1) {
    data.projects[index] = {
      ...data.projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await saveData(data)
    return data.projects[index]
  }
  return null
})

ipcMain.handle('projects:delete', async (_, id: string) => {
  const data = await loadData()
  data.projects = data.projects.filter(p => p.id !== id)
  await saveData(data)
  return { success: true }
})

// 扫描仓库
ipcMain.handle('repos:scan', async () => {
  // 常见的 Claude Code 配置路径
  const possiblePaths = [
    join(app.getPath('home'), '.claude', 'projects'),  // 用户主目录下的 .claude/projects
    join(app.getPath('home'), '.claude', 'repos'),
    join(app.getPath('appData'), 'Claude', 'projects'),
    join(app.getPath('userData'), 'claude-repos'),
    join(app.getPath('userData'), 'projects')
  ]

  log.info('Scanning for repos, checking paths:', possiblePaths)

  const repos: Repository[] = []

  for (const claudeConfigPath of possiblePaths) {
    try {
      if (existsSync(claudeConfigPath)) {
        log.info('Found config path:', claudeConfigPath)
        const entries = await readdir(claudeConfigPath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const repoPath = join(claudeConfigPath, entry.name)
            try {
              const stats = await stat(repoPath)
              const files = await countFiles(repoPath)
              repos.push({
                path: repoPath,
                name: entry.name,
                fileCount: files,
                totalSize: stats.size,
                lastAccessed: stats.mtime.toISOString()
              })
              log.info('Added repo:', entry.name)
            } catch {
              // 跳过无法访问的目录
            }
          }
        }
        // 如果找到了仓库就停止搜索
        if (repos.length > 0) {
          log.info('Found repos, stopping search')
          break
        }
      }
    } catch (error) {
      log.error('Failed to scan path', claudeConfigPath, ':', error)
    }
  }

log.info('Total repos found:', repos.length)

  const data = await loadData()
  data.repositories = repos
  await saveData(data)
  return repos
})

// API Providers CRUD
ipcMain.handle('apiProviders:getAll', async () => {
  const data = await loadData()
  return data.apiProviders
})

ipcMain.handle('apiProviders:create', async (_, provider: Omit<ApiProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
  const data = await loadData()
  const now = new Date().toISOString()
  const newProvider: ApiProvider = {
    ...provider,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
  data.apiProviders.push(newProvider)
  await saveData(data)
  return newProvider
})

ipcMain.handle('apiProviders:update', async (_, id: string, updates: Partial<ApiProvider>) => {
  const data = await loadData()
  const index = data.apiProviders.findIndex(p => p.id === id)
  if (index !== -1) {
    data.apiProviders[index] = {
      ...data.apiProviders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await saveData(data)
    return data.apiProviders[index]
  }
  return null
})

ipcMain.handle('apiProviders:delete', async (_, id: string) => {
  const data = await loadData()
  data.apiProviders = data.apiProviders.filter(p => p.id !== id)
  await saveData(data)
  return { success: true }
})

// 辅助函数：递归计算文件数量
async function countFiles(dir: string): Promise<number> {
  let count = 0
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile()) {
        count++
      } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        count += await countFiles(join(dir, entry.name))
      }
    }
  } catch {
    // 忽略错误
  }
  return count
}

// 打开外部链接
ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url)
})

// 打开文件夹
ipcMain.handle('shell:openPath', async (_, path: string) => {
  await shell.openPath(path)
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.aimanager.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
