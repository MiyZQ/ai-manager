import { useState } from 'react'
import { Link2, RefreshCw, CheckCircle, XCircle, Settings, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MCPView() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  // 模拟 MCP 服务器列表
  const servers = [
    { id: '1', name: 'mcp-server-openai', status: 'connected', description: 'OpenAI GPT 模型接口' },
    { id: '2', name: 'mcp-server-filesystem', status: 'connected', description: '本地文件系统访问' },
    { id: '3', name: 'mcp-server-github', status: 'disconnected', description: 'GitHub API 集成' }
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setRefreshMessage(null)
    try {
      // TODO: 实现真实的刷新逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRefreshMessage('MCP 服务器状态已刷新')
    } catch {
      setRefreshMessage('刷新失败，请重试')
    } finally {
      setIsRefreshing(false)
      setTimeout(() => setRefreshMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP 管理</h1>
          <p className="text-muted-foreground mt-1">管理 Model Context Protocol 服务器</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshMessage && (
            <span className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
              {refreshMessage}
            </span>
          )}
          <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRefreshing ? '刷新中...' : '刷新状态'}
          </Button>
        </div>
      </div>

      {/* 说明卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">什么是 MCP？</CardTitle>
          <CardDescription>
            Model Context Protocol (MCP) 是一种用于连接 AI 模型和外部数据源/工具的开放协议。
            通过 MCP 服务器，您可以扩展 AI 的能力，使其能够访问文件系统、API、数据库等资源。
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 服务器列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <Card key={server.id} className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{server.name}</CardTitle>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  server.status === 'connected'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {server.status === 'connected' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {server.status === 'connected' ? '已连接' : '未连接'}
                </div>
              </div>
              <CardDescription>{server.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 hover:bg-accent">
                  <Settings className="w-3 h-3" />
                  配置
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无 MCP 服务器配置</p>
          <p className="text-sm mt-1">在项目中添加 MCP 配置以启用服务器</p>
        </div>
      )}
    </div>
  )
}
