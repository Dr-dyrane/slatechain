"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Bell, SunMoon, Settings2, FlaskConical } from 'lucide-react';

export function UserPreferences() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Load demo toggle state from local storage
    const demoState = localStorage.getItem("isLive");
    setIsDemo(demoState === "false");
  }, [isDemo]);

  const handleToggle = () => {
    const newState = !isDemo;
    setIsDemo(newState);
    localStorage.setItem("isLive", (!newState).toString());
    window.location.reload();
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center space-x-2">
          <Settings2 className="h-6 w-6" />
          <span>User Preferences</span>
        </CardTitle>
        <CardDescription>Manage your account settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <SunMoon className="h-5 w-5" />
            <Label htmlFor="theme" className="text-lg">Theme</Label>
          </div>
          <Select value={theme} onValueChange={(value) => setTheme(value)}>
            <SelectTrigger className="w-full">
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

        {/* Demo Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-5 w-5" />
            <Label htmlFor="demo" className="text-lg">Demo Mode</Label>
          </div>
          <Switch
            id="demo"
            checked={isDemo}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
