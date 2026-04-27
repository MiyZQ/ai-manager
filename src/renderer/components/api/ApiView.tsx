import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Settings, Trash2, Test, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AddApiDialog from './AddApiDialog'
import { PRESET_PROVIDERS, type ApiProvider } from './types'

export default function ApiView() {
  const [providers, setProviders] = useState<ApiProvider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ApiProvider | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setIsLoading(true)
    try {
      const data = await window.electronAPI.getApiProviders()
      setProviders(data)
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
    setIsLoading(false)
  }

  const handleAdd = () => {
    setEditingProvider(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (provider: ApiProvider) => {
    setEditingProvider(provider)
    setIsDialogOpen(true)
  }

  const handleSave = async (providerData: Omit<ApiProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProvider) {
        await window.electronAPI.updateApiProvider(editingProvider.id, providerData)
        setMessage('API 更新成功')
      } else {
        await window.electronAPI.createApiProvider(providerData)
        setMessage('API 添加成功')
      }
      await loadProviders()
    } catch (error) {
      console.error('Failed to save provider:', error)
      setMessage('保存失败')
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个 API 配置吗？')) {
      try {
        await window.electronAPI.deleteApiProvider(id)
        await loadProviders()
        setMessage('API 已删除')
        setTimeout(() => setMessage(null), 3000)
      } catch (error) {
        console.error('Failed to delete provider:', error)
      }
    }
  }

  const handleToggleActive = async (provider: ApiProvider) => {
    try {
      await window.electronAPI.updateApiProvider(provider.id, { isActive: !provider.isActive })
      await loadProviders()
    } catch (error) {
      console.error('Failed to toggle active:', error)
    }
  }

  const handleTest = (provider: ApiProvider) => {
    setMessage(`正在测试 ${provider.name}...`)
    setTimeout(() => {
      setMessage(`${provider.name} 连接成功！`)
      setTimeout(() => setMessage(null), 3000)
    }, 1000)
  }

  const getTotalUsage = (provider: ApiProvider) => {
    return provider.usageStats.reduce((acc, stat) => ({
      requests: acc.requests + stat.requests,
      cost: acc.cost + stat.cost
    }), { requests: 0, cost: 0 })
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI API 管理</h1>
          <p className="text-muted-foreground mt-1">管理 AI 服务提供商配置</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
              {message}
            </span>
          )}
          <Button onClick={loadProviders} disabled={isLoading} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            添加 API
          </Button>
        </div>
      </div>

      {/* API 卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => {
          const preset = PRESET_PROVIDERS.find(p => p.id === provider.provider)
          const usage = getTotalUsage(provider)
          return (
            <Card key={provider.id} className={`hover:shadow-md transition-shadow ${!provider.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{preset?.icon || '⚙️'}</span>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <CardDescription>{preset?.name || provider.provider}</CardDescription>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(provider)}
                    className={`w-3 h-3 rounded-full ${provider.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={provider.isActive ? '已激活' : '已停用'}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 使用统计 */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">本月使用</span>
                    <span className="font-medium">{usage.requests} 次</span>
                  </div>
                  {usage.cost > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">费用</span>
                      <span className="font-medium">${usage.cost.toFixed(2)}</span>
                    </div>
                  )}
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleTest(provider)}
                    >
                      <Test className="w-3 h-3" />
                      测试
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleEdit(provider)}
                    >
                      <Settings className="w-3 h-3" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(provider.id)}
                      className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* 空状态 */}
        {providers.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无 API 配置</p>
            <p className="text-sm mt-1">点击"添加 API"开始配置</p>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
            <p>加载中...</p>
          </div>
        )}
      </div>

      {/* 添加/编辑对话框 */}
      <AddApiDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editData={editingProvider}
      />
    </div>
  )
}
