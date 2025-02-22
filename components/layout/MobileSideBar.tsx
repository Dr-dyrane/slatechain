"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { LogOut, MoonIcon, Settings, SunIcon, User, ChevronRight, Bell, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { KYCStatus, User as UserType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Image from "next/image"

interface ProfileSheetProps {
  user: UserType
  onLogout: () => Promise<void>
  unreadCount?: number
  setIsMobileNotificationDrawerOpen: (open: boolean) => void;
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  variant?: "default" | "danger"
  badge?: number
  serviceIcon?: string
}

export const MenuItem = ({ icon, label, onClick, variant = "default", badge, serviceIcon }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex rounded-lg items-center justify-between px-6 py-4 text-base transition-colors",
      "hover:bg-accent/50 active:bg-accent/45 focus-visible:outline-none",
      variant === "danger" && "text-destructive hover:bg-destructive/10 hover:text-destructive",
    )}
  >
    <div className="flex items-center gap-4">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {serviceIcon && (
        <div className="relative bg-muted/35 w-8 h-8 rounded-full overflow-clip">
          <Image src={serviceIcon || "/placeholder.svg"} alt={`${label} service`} fill className="object-cover h-8 w-8 p-1" />
        </div>
      )}
      {badge && (
        <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0 w-7 h-7 flex items-center justify-center leading-none aspect-square rounded-full">{badge}</span>
      )}
      <ChevronRight className={cn('h-4 w-4 text-muted-foreground',
        variant === "danger" && "text-destructive"
      )} />
    </div>
  </button>
)

export const getKycStatusBadge = (status: KYCStatus) => {
  const variants = {
    NOT_STARTED: "secondary",
    IN_PROGRESS: "warning",
    PENDING_REVIEW: "default",
    APPROVED: "success",
    REJECTED: "destructive",
  } as const

  const labels = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    PENDING_REVIEW: "Pending Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  }

  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

export function ProfileSheet({ user, onLogout, unreadCount = 0, setIsMobileNotificationDrawerOpen }: ProfileSheetProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setOpen(false)
  }
  const handleNotificationNavigation = () => {
    setIsMobileNotificationDrawerOpen(true)
    setOpen(false)
  }

  const handleLogout = async () => {
    await onLogout()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative md:hidden">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="sm:max-w-sm flex flex-col justify-between overflow-hidden border-none shadow-lg rounded-r-2xl p-0 backdrop-blur-md bg-background/85"
      >
        <SheetHeader className="sr-only">
          <SheetTitle className="sr-only">User Profile</SheetTitle>
        </SheetHeader>

        {/* Top Section - Profile Card */}
        <div className="relative px-2 py-6 ">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background/0" />
          <div className="relative px-2 mt-4 space-y-4">
            <div className="flex items-center gap-4 rounded-xl border hover:bg-accent/35 bg-accent/25 border-border p-3" onClick={() => handleNavigation("/profile")} >
              <Avatar className="h-14 w-14 ring-4 ring-background/50">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-lg">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5 overflow-scroll scrollbar-hide">
                <h3 className="text-lg font-semibold tracking-tight">{user?.name}</h3>
                <p className="text-sm text-muted-foreground text-wrap">{user?.email}</p>
              </div>
            </div>
            <div className="flex w-full justify-end gap-4 items-center overflow-scroll scrollbar-hide">
              {getKycStatusBadge(user.kycStatus)}
              <Badge variant="secondary" className="font-normal">
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>


        {/* Middle Section - Menu Items */}
        <div className="flex-1 p-2 overflow-scroll scrollbar-hide">
          <div className="space-y-1">
            <MenuItem
              icon={<User className="h-5 w-5" />}
              label="Profile"
              onClick={() => handleNavigation("/profile")}
            />
            <MenuItem
              icon={<Bell className="h-5 w-5" />}
              label="Notifications"
              onClick={() =>
                handleNotificationNavigation()
              }
              badge={unreadCount}
            />
            {user?.integrations?.ecommerce?.enabled && (
              <MenuItem
                icon={<LayoutGrid className="h-5 w-5" />}
                label="Apps"
                onClick={() => handleNavigation("/apps")}
                serviceIcon="/icons/shopify.svg"
              />
            )}
            <MenuItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              onClick={() => handleNavigation("/settings")}
            />
          </div>

        </div>

        <div className="flex flex-col gap-2">
          {/* Theme Switcher */}
          <div className="p-2">
            <div onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="flex items-center justify-between rounded-lg bg-accent/15 px-4 py-3 cursor-pointer hover:bg-accent/45">
              <span className="font-medium">Theme</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="hover:bg-background/50"
              >
                <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>

          {/* Bottom Section - Footer */}
          <div className="mt-auto bg-background/10 p-2">
            <MenuItem icon={<LogOut className="h-5 w-5" />} label="Log out" onClick={handleLogout} variant="danger" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

