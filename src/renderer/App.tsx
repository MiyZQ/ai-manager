import { useState } from 'react'
import { Settings, MessageSquare, FolderKanban, Link2, Skull, BarChart3, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PromptsView from '@/components/prompts/PromptsView'
import ProjectsView from '@/components/projects/ProjectsView'
import ReposView from '@/components/repos/ReposView'
import MCPView from '@/components/mcp/MCPView'
import ApiView from '@/components/api/ApiView'
import KillView from '@/components/kill/KillView'

type NavItem = 'prompts' | 'projects' | 'api' | 'mcp' | 'kill' | 'repos'

const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
  { id: 'prompts', label: '提示词', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'projects', label: '项目', icon: <FolderKanban className="w-5 h-5" /> },
  { id: 'api', label: 'API', icon: <Globe className="w-5 h-5" /> },
  { id: 'mcp', label: 'MCP', icon: <Link2 className="w-5 h-5" /> },
  { id: 'kill', label: 'Kill', icon: <Skull className="w-5 h-5" /> },
  { id: 'repos', label: '仓库', icon: <BarChart3 className="w-5 h-5" /> }
]

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('prompts')

  const renderContent = () => {
    switch (activeNav) {
      case 'prompts':
        return <PromptsView />
      case 'projects':
        return <ProjectsView />
      case 'api':
        return <ApiView />
      case 'mcp':
        return <MCPView />
      case 'kill':
        return <KillView />
      case 'repos':
        return <ReposView />
      default:
        return <PromptsView />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="flex flex-col w-60 border-r bg-card">
        {/* Logo 区域 */}
        <div className="flex items-center justify-between h-14 px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold">AI Manager</span>
          </div>
<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert('设置功能开发中...')}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeNav === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 状态栏 */}
        <div className="h-8 px-4 border-t flex items-center text-xs text-muted-foreground">
          <span>就绪</span>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
