import { useState } from 'react'
import { Skull, RefreshCw, Power, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Process {
  id: string
  name: string
  pid: number
  cpu: string
  memory: string
  status: 'running' | 'stopped'
}

export default function KillView() {
  const [processes, setProcesses] = useState<Process[]>([
    { id: '1', name: 'claude-code', pid: 12345, cpu: '2.3%', memory: '120MB', status: 'running' },
    { id: '2', name: 'node', pid: 23456, cpu: '0.8%', memory: '80MB', status: 'running' },
    { id: '3', name: 'electron', pid: 34567, cpu: '5.2%', memory: '450MB', status: 'running' }
  ])
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setRefreshMessage(null)
    try {
      // TODO: 实现真实的刷新逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRefreshMessage('进程列表已刷新')
    } catch {
      setRefreshMessage('刷新失败，请重试')
    } finally {
      setIsRefreshing(false)
      setTimeout(() => setRefreshMessage(null), 3000)
    }
  }

  const handleKill = (processId: string) => {
    if (confirm('确定要终止这个进程吗？')) {
      setProcesses(processes.filter(p => p.id !== processId))
      setSelectedProcess(null)
    }
  }

  const handleKillSelected = () => {
    if (selectedProcess) {
      handleKill(selectedProcess)
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">进程管理</h1>
          <p className="text-muted-foreground mt-1">查看和管理 AI 相关进程</p>
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
            {isRefreshing ? '刷新中...' : '刷新'}
          </Button>
        </div>
      </div>

      {/* 警告卡片 */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-300">注意：</span>
            <span className="text-amber-700 dark:text-amber-400"> 终止进程可能导致数据丢失，请谨慎操作</span>
          </div>
        </CardContent>
      </Card>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedProcess ? `已选择 1 个进程` : '请选择要终止的进程'}
        </div>
        <Button
          variant="destructive"
          className="gap-2"
          disabled={!selectedProcess}
          onClick={handleKillSelected}
        >
          <Power className="w-4 h-4" />
          终止选中进程
        </Button>
      </div>

      {/* 进程列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Skull className="w-5 h-5" />
            运行中的进程
          </CardTitle>
          <CardDescription>
            当前系统中的 AI 相关进程列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProcess === process.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/30 hover:bg-accent'
                }`}
                onClick={() => setSelectedProcess(selectedProcess === process.id ? null : process.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      process.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">{process.name}</span>
                  </div>
                  <Badge variant="outline">PID: {process.pid}</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>CPU: {process.cpu}</span>
                  <span>内存: {process.memory}</span>
                  <Badge variant={process.status === 'running' ? 'default' : 'secondary'}>
                    {process.status === 'running' ? '运行中' : '已停止'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleKill(process.id)
                    }}
                  >
                    终止
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {processes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Skull className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无运行中的进程</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
