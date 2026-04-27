import type { ElectronAPI } from '@electron-toolkit/preload'

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

interface ExtendedElectronAPI extends ElectronAPI {
  getApiProviders: () => Promise<ApiProvider[]>
  createApiProvider: (provider: Omit<ApiProvider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApiProvider>
  updateApiProvider: (id: string, updates: Partial<ApiProvider>) => Promise<ApiProvider | null>
  deleteApiProvider: (id: string) => Promise<{ success: boolean }>
}

declare global {
  interface Window {
    electronAPI: ExtendedElectronAPI
  }
}

export {}
