import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PRESET_PROVIDERS, type ApiProvider } from './types'

interface AddApiDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (provider: Omit<ApiProvider, 'id' | 'createdAt' | 'updatedAt'>) => void
  editData?: ApiProvider | null
}

export default function AddApiDialog({ isOpen, onClose, onSave, editData }: AddApiDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState(editData?.provider || 'claude')
  const [name, setName] = useState(editData?.name || '')
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState(editData?.endpoint || '')

  if (!isOpen) return null

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = PRESET_PROVIDERS.find(p => p.id === presetId)
    if (preset && preset.id !== 'custom') {
      setEndpoint(preset.defaultEndpoint)
      setName(preset.name)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const preset = PRESET_PROVIDERS.find(p => p.id === selectedPreset)
    onSave({
      name,
      provider: selectedPreset,
      apiKey,
      endpoint: endpoint || preset?.defaultEndpoint || '',
      models: preset?.models || [],
      isActive: editData?.isActive ?? true,
      usageStats: editData?.usageStats || []
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editData ? '编辑 API' : '添加 API 提供商'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>提供商</Label>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              {PRESET_PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>名称</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="API 显示名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>API 密钥</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={editData ? '输入新密钥可更新' : '输入 API 密钥'}
              required={!editData}
            />
          </div>

          <div className="space-y-2">
            <Label>端点 URL（可选）</Label>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>取消</Button>
            <Button type="submit">{editData ? '保存' : '添加'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
