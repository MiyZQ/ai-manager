import { useState, useEffect } from 'react'
import { Plus, Search, FolderKanban, Clock, Tag, Trash2, Edit2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

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

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group: 'default',
    tags: '',
    envVars: '',
    mcpConfig: ''
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await window.electronAPI.getData()
      setProjects(data.projects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.name) return

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    const envVars: Record<string, string> = {}
    formData.envVars.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    const mcpConfig = formData.mcpConfig.split('\n').filter(Boolean)

    await window.electronAPI.createProject({
      name: formData.name,
      description: formData.description,
      group: formData.group,
      tags,
      promptIds: [],
      envVars,
      mcpConfig
    })

    resetForm()
    setIsCreateOpen(false)
    loadProjects()
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      group: project.group,
      tags: project.tags.join(', '),
      envVars: Object.entries(project.envVars).map(([k, v]) => `${k}=${v}`).join('\n'),
      mcpConfig: project.mcpConfig.join('\n')
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingProject || !formData.name) return

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    const envVars: Record<string, string> = {}
    formData.envVars.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    const mcpConfig = formData.mcpConfig.split('\n').filter(Boolean)

    await window.electronAPI.updateProject(editingProject.id, {
      name: formData.name,
      description: formData.description,
      group: formData.group,
      tags,
      envVars,
      mcpConfig
    })

    resetForm()
    setEditingProject(null)
    setIsEditOpen(false)
    loadProjects()
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      await window.electronAPI.deleteProject(id)
      loadProjects()
    }
  }

  const handleSwitch = (project: Project) => {
    // TODO: 实现项目切换逻辑
    alert(`切换到项目: ${project.name}`)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      group: 'default',
      tags: '',
      envVars: '',
      mcpConfig: ''
    })
  }

  const groups = ['default', 'work', 'personal', 'experiments']

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = groupFilter === 'all' || project.group === groupFilter
    return matchesSearch && matchesGroup
  })

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">项目管理</h1>
          <p className="text-muted-foreground mt-1">管理您的 AI 项目配置和环境变量</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          新建项目
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="分组" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分组</SelectItem>
            {groups.map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 项目列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSwitch(project)}
                    title="切换项目"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description || '暂无描述'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">{project.group}</Badge>
                {project.tags.length > 0 && (
                  <div className="flex gap-1">
                    {project.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>关联提示词: {project.promptIds.length} 个</div>
                <div>环境变量: {Object.keys(project.envVars).length} 个</div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无项目，点击"新建项目"开始创建</p>
        </div>
      )}

      {/* 创建对话框 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新建项目</DialogTitle>
            <DialogDescription>创建一个新项目，配置环境变量和 MCP 设置</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="项目名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group">分组</Label>
                <Select value={formData.group} onValueChange={(v) => setFormData({ ...formData, group: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="项目描述（可选）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">标签（逗号分隔）</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="常用, 实验"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="envVars">环境变量（每行一个 KEY=VALUE）</Label>
              <Textarea
                id="envVars"
                value={formData.envVars}
                onChange={(e) => setFormData({ ...formData, envVars: e.target.value })}
                placeholder="API_KEY=your-key&#10;MODEL=gpt-4"
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcpConfig">MCP 配置（每行一个服务器名称）</Label>
              <Textarea
                id="mcpConfig"
                value={formData.mcpConfig}
                onChange={(e) => setFormData({ ...formData, mcpConfig: e.target.value })}
                placeholder="mcp-server-openai&#10;mcp-server-filesystem"
                className="min-h-[80px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm() }}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
            <DialogDescription>修改项目配置</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">名称</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-group">分组</Label>
                <Select value={formData.group} onValueChange={(v) => setFormData({ ...formData, group: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">描述</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">标签（逗号分隔）</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-envVars">环境变量（每行一个 KEY=VALUE）</Label>
              <Textarea
                id="edit-envVars"
                value={formData.envVars}
                onChange={(e) => setFormData({ ...formData, envVars: e.target.value })}
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mcpConfig">MCP 配置（每行一个服务器名称）</Label>
              <Textarea
                id="edit-mcpConfig"
                value={formData.mcpConfig}
                onChange={(e) => setFormData({ ...formData, mcpConfig: e.target.value })}
                className="min-h-[80px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm() }}>取消</Button>
            <Button onClick={handleUpdate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
