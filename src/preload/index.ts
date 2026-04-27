import { contextBridge, ipcRenderer } from 'electron'

export interface Prompt {
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

export interface Project {
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

export interface Repository {
  path: string
  name: string
  fileCount: number
  totalSize: number
  lastAccessed: string
}

export interface UsageRecord {
  date: string
  requests: number
  inputTokens: number
  outputTokens: number
  cost: number
}

export interface ApiProvider {
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

export interface AppData {
  prompts: Prompt[]
  projects: Project[]
  repositories: Repository[]
  settings: {
    theme: 'light' | 'dark' | 'system'
    sidebarWidth: number
  }
}

export interface ElectronAPI {
  // 数据操作
  getData: () => Promise<AppData>
  saveData: (data: AppData) => Promise<{ success: boolean }>

  // Prompt CRUD
  createPrompt: (prompt: Omit<Prompt, 'id' | 'versions' | 'createdAt' | 'updatedAt'>) => Promise<Prompt>
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<Prompt | null>
  deletePrompt: (id: string) => Promise<{ success: boolean }>

  // Project CRUD
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>
  deleteProject: (id: string) => Promise<{ success: boolean }>

  // 仓库扫描
  scanRepos: () => Promise<Repository[]>

  // API Providers
  getApiProviders: () => Promise<ApiProvider[]>
  createApiProvider: (provider: Omit<ApiProvider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApiProvider>
  updateApiProvider: (id: string, updates: Partial<ApiProvider>) => Promise<ApiProvider | null>
  deleteApiProvider: (id: string) => Promise<{ success: boolean }>

  // Shell
  openExternal: (url: string) => Promise<void>
  openPath: (path: string) => Promise<void>
}

const electronAPI: ElectronAPI = {
  // 数据操作
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),

  // Prompt CRUD
  createPrompt: (prompt) => ipcRenderer.invoke('prompts:create', prompt),
  updatePrompt: (id, updates) => ipcRenderer.invoke('prompts:update', id, updates),
  deletePrompt: (id) => ipcRenderer.invoke('prompts:delete', id),

  // Project CRUD
  createProject: (project) => ipcRenderer.invoke('projects:create', project),
  updateProject: (id, updates) => ipcRenderer.invoke('projects:update', id, updates),
  deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),

  // 仓库扫描
  scanRepos: () => ipcRenderer.invoke('repos:scan'),

  // API Providers
  getApiProviders: () => ipcRenderer.invoke('apiProviders:getAll'),
  createApiProvider: (provider) => ipcRenderer.invoke('apiProviders:create', provider),
  updateApiProvider: (id, updates) => ipcRenderer.invoke('apiProviders:update', id, updates),
  deleteApiProvider: (id) => ipcRenderer.invoke('apiProviders:delete', id),

  // Shell
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openPath: (path) => ipcRenderer.invoke('shell:openPath', path)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
