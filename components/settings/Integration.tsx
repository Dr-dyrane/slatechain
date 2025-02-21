"use client"

import { useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeOff, Eye } from "lucide-react"

interface IntegrationProps {
  name: string
  icon: string
  enabled: boolean
  apiKey: string
  url: string
  onToggle: (enabled: boolean) => void
  onSave: (apiKey: string, url: string) => void
}

export function Integration({ name, icon, enabled, apiKey, url, onToggle, onSave }: IntegrationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [localUrl, setLocalUrl] = useState(url)

  const handleSave = () => {
    onSave(localApiKey, localUrl)
    setIsEditing(false)
  }

  return (
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center justify-center bg-muted rounded-3xl w-10 h-10">
            <img src={icon || "/placeholder.svg"} alt={name} className="w-6 h-6" />
          </div>
          <Label htmlFor={name} className="text-lg">
            {name} Integration
          </Label>
        </div>
        <Switch
          id={name}
          checked={enabled}
          onCheckedChange={(checked) => {
            onToggle(checked)
            if (!checked) setIsEditing(false)
          }}
        />
      </div>

      {enabled && (
        <>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-sm font-semibold">{name} API Key</Label>
                <p className="flex mt-2 items-center text-sm bg-muted/50 px-4 rounded-md border w-full overflow-hidden">
                  {showApiKey ? localApiKey || "Not Set" : "••••••••••••"}
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">{name} Store URL</Label>
                <p className="text-sm py-2.5 px-3 mt-2 bg-muted/50 rounded-md border">{localUrl || "Not Set"}</p>
              </div>
              <Button className="w-full mt-2" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 flex-col">
              <div className="flex flex-col space-y-2">
                <Label className="mb-2" htmlFor={`${name}ApiKey`}>
                  {name} API Key
                </Label>
                <Input
                  id={`${name}ApiKey`}
                  type="password"
                  placeholder="Enter API Key"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="mb-2" htmlFor={`${name}StoreUrl`}>
                  {name} Store URL
                </Label>
                <Input
                  id={`${name}StoreUrl`}
                  type="url"
                  placeholder="Enter Store URL"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </CardContent>
  )
}

