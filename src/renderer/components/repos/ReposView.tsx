import { useState, useEffect } from 'react'
import { BarChart3, RefreshCw, Copy, FolderOpen, File, HardDrive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatSize, formatDate } from '@/lib/utils'
import type { Repository } from '@/components/repos/types'

export default function ReposView() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalStats, setTotalStats] = useState({ fileCount: 0, totalSize: 0, repoCount: 0 })
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  useEffect(() => {
    loadRepos()
  }, [])

  const loadRepos = async () => {
    setIsLoading(true)
    setRefreshMessage(null)
    try {
      const scannedRepos = await window.electronAPI.scanRepos()
      setRepos(scannedRepos)

      // 计算统计
      const stats = scannedRepos.reduce(
        (acc, repo) => ({
          fileCount: acc.fileCount + repo.fileCount,
          totalSize: acc.totalSize + repo.totalSize,
          repoCount: acc.repoCount + 1
        }),
        { fileCount: 0, totalSize: 0, repoCount: 0 }
      )
      setTotalStats(stats)
      setRefreshMessage(`已扫描 ${scannedRepos.length} 个仓库`)
    } catch (error) {
      console.error('Failed to scan repos:', error)
      setRefreshMessage('扫描失败，请重试')
    }
    setIsLoading(false)
    setTimeout(() => setRefreshMessage(null), 3000)
  }

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setRefreshMessage('路径已复制')
    setTimeout(() => setRefreshMessage(null), 2000)
  }

  const handleOpenFolder = async (path: string) => {
    await window.electronAPI.openPath(path)
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">仓库统计</h1>
          <p className="text-muted-foreground mt-1">查看 Claude Code 有权限的仓库</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshMessage && (
            <span className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
              {refreshMessage}
            </span>
          )}
          <Button onClick={loadRepos} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoading ? '扫描中...' : '重新扫描'}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">仓库数量</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.repoCount}</div>
            <p className="text-xs text-muted-foreground">已扫描的仓库</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">文件总数</CardTitle>
            <File className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.fileCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">所有仓库的文件</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总大小</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(totalStats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">所有仓库占用空间</p>
          </CardContent>
        </Card>
      </div>

      {/* 仓库列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">仓库列表</CardTitle>
          <CardDescription>
            Claude Code 当前有权限访问的仓库路径
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {repos.map((repo) => (
              <div
                key={repo.path}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <span className="font-medium truncate">{repo.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {repo.path}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {repo.fileCount.toLocaleString()} 文件
                    </span>
                    <span>{formatSize(repo.totalSize)}</span>
                    <span>访问: {formatDate(repo.lastAccessed)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent"
                    onClick={() => handleCopyPath(repo.path)}
                    title="复制路径"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent"
                    onClick={() => handleOpenFolder(repo.path)}
                    title="打开文件夹"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {repos.length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无仓库数据</p>
              <p className="text-sm mt-1">点击"重新扫描"获取仓库信息</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
              <p>正在扫描仓库...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
