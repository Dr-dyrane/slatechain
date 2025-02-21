"use client";

import { useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/slices/authSlice";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/lib/store";
import { LogOut, Moon, Sun, Bell, Plug } from 'lucide-react';
import { Input } from "@/components/ui/input";

import { setApiKey, setStoreUrl, setIntegrationEnabled } from "@/lib/slices/shopifySlice" //Actions
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useSelector((state: RootState) => state.auth);

  const [notifications, setNotifications] = useState(true)

  //Integration State
    const [shopifyEnabled, setShopifyEnabled] = useState(user?.integrations?.shopify?.enabled || false);
    const [shopifyApiKey, setShopifyApiKey] = useState(user?.integrations?.shopify?.apiKey || "");
    const [shopifyStoreUrl, setShopifyStoreUrl] = useState(user?.integrations?.shopify?.storeUrl || "");

  useEffect(() => {
    if (user) {
            setShopifyEnabled(user.integrations?.shopify?.enabled || false);
            setShopifyApiKey(user.integrations?.shopify?.apiKey || "");
            setShopifyStoreUrl(user.integrations?.shopify?.storeUrl || "");
        }
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login')
  };

  const handleSaveShopifySettings = async () => {
      dispatch(setApiKey(shopifyApiKey));
      dispatch(setStoreUrl(shopifyStoreUrl));
      dispatch(setIntegrationEnabled(shopifyEnabled)); // Set to true or false depending on your logic
        toast({
            title: "Settings Saved",
            description: "Shopify settings have been updated.",
        });
    };

  const renderShopifySettings = () => (
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center justify-center bg-muted rounded-3xl w-10 h-10">
            <img src="/icons/shopify.svg" alt="shopify" className="w-6 h-6" />
          </div>
          <Label htmlFor="shopify" className="text-lg">Shopify Integration</Label>
        </div>
        <Switch
          id="shopify"
          checked={shopifyEnabled}
          onCheckedChange={setShopifyEnabled}
        />
      </div>

      {shopifyEnabled && (
        <div className="flex gap-4 flex-col">
          <div className="flex flex-col space-y-2">
            <Label className="mb-2" htmlFor="shopifyApiKey">Shopify API Key</Label>
            <Input
              id="shopifyApiKey"
              type="password"
              placeholder="Enter API Key"
              value={shopifyApiKey}
              onChange={(e) => setShopifyApiKey(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label className="mb-2" htmlFor="shopifyStoreUrl">Shopify Store URL</Label>
            <Input
              id="shopifyStoreUrl"
              type="url"
              placeholder="Enter Store URL"
              value={shopifyStoreUrl}
              onChange={(e) => setShopifyStoreUrl(e.target.value)}
            />
          </div>
            <Button className="w-full" onClick={handleSaveShopifySettings}>Save Shopify Settings</Button>
        </div>
      )}
    </CardContent>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Settings</h1>
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
          {renderShopifySettings()}
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