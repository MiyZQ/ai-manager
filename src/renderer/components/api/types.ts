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

export interface UsageRecord {
  date: string
  requests: number
  inputTokens: number
  outputTokens: number
  cost: number
}

export interface PresetProvider {
  id: string
  name: string
  icon: string
  defaultEndpoint: string
  models: string[]
}

export const PRESET_PROVIDERS: PresetProvider[] = [
  { id: 'claude', name: 'Claude Official', icon: '🤖', defaultEndpoint: 'https://api.anthropic.com', models: ['claude-3-5-sonnet', 'claude-3-opus'] },
  { id: 'openai', name: 'OpenAI GPT', icon: '💬', defaultEndpoint: 'https://api.openai.com', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔵', defaultEndpoint: 'https://api.deepseek.com', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'glm', name: '智谱 GLM', icon: '🟢', defaultEndpoint: 'https://open.bigmodel.cn', models: ['glm-4', 'glm-4-flash'] },
  { id: 'minimax', name: 'MiniMax', icon: '🟠', defaultEndpoint: 'https://api.minimax.chat', models: ['abab6-chat', 'abab5.5-chat'] },
  { id: 'kimi', name: 'Kimi', icon: '🌙', defaultEndpoint: 'https://api.moonshot.cn', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
  { id: 'qwen', name: '通义千问', icon: '🐉', defaultEndpoint: 'https://dashscope.aliyuncs.com', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
  { id: 'silicon', name: '硅基流动', icon: '💎', defaultEndpoint: 'https://api.siliconflow.cn', models: ['Qwen/Qwen2-7B-Instruct', 'deepseek-ai/DeepSeek-V2.5'] },
  { id: 'custom', name: '自定义', icon: '⚙️', defaultEndpoint: '', models: [] }
]
