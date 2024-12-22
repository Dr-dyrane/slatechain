"use client";

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch } from "react-redux";
import { logout } from "@/lib/slices/authSlice";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/lib/store";
import { LogOut, Moon, Sun, Bell, Plug } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [integration, setIntegration] = useState("none")

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login')
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Sun className="h-6 w-6" />
              <span>User Preferences</span>
            </CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="theme" className="text-lg">Theme</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value)}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <Label htmlFor="notifications" className="text-lg">Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Plug className="h-6 w-6" />
              <span>Integrations</span>
            </CardTitle>
            <CardDescription>Connect SlateChain with your existing systems.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="erp-integration" className="text-lg">ERP Integration</Label>
              <Select value={integration} onValueChange={setIntegration}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ERP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sap">SAP</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                  <SelectItem value="microsoft">Microsoft Dynamics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Connect Integration</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <LogOut className="h-6 w-6" />
              <span>Account Actions</span>
            </CardTitle>
            <CardDescription>Manage your account access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

