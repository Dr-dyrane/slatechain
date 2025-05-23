// src/components/layout/Navbar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { logout } from "@/lib/slices/authSlice"
import { CircleUserRound, MoonIcon, SunIcon, Settings, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "../Logo"
import { useRouter } from "next/navigation"
import type { Notification, User } from "@/lib/types"
import { ProfileSheet } from "./MobileSideBar"
import { fetchNotifications } from "@/lib/slices/notificationSlice"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import SearchDrawer from "../search/SearchDrawer"
import { setSearchDrawerOpen } from "@/lib/slices/searchSlice"

interface Props {
  setIsMobileNotificationDrawerOpen: (open: boolean) => void
  notifications: Notification[]
}

export function Navbar({ setIsMobileNotificationDrawerOpen, notifications }: Props) {
  const { theme, setTheme } = useTheme()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  React.useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    dispatch(fetchNotifications())

    let interval = 60000; // Initial interval of 1 minute
    let maxInterval = 600000; // Max interval of 10 minutes

    const notificationInterval = setInterval(() => {
      dispatch(fetchNotifications());

      // Gradually increase the polling interval (double it each time, but don't exceed maxInterval)
      interval = Math.min(interval * 2, maxInterval);
    }, interval);


    return () => {
      clearInterval(notificationInterval)
    }
  }, [dispatch, isAuthenticated])

  const unreadCount = notifications?.length
    ? notifications.filter((notification) => !notification.read).length
    : 0;

  const handleLogout = async () => {
    await dispatch(logout())
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex flex-row space-x-2">
          <Logo />
          <div className="text-2xl hidden sm:block font-bold">SupplyCycles</div>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              className="hidden md:flex"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              <SunIcon className="h-5 w-5 dark:hidden" />
              <MoonIcon className="h-5 w-5 hidden dark:block" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              <SunIcon className="h-5 w-5 dark:hidden" />
              <MoonIcon className="h-5 w-5 hidden dark:block" />
            </Button>
          )}
          {isAuthenticated && ( // Show only if authenticated
            <>
              <Button
                size="icon"
                variant="ghost"
                className="relative"
                onClick={() => dispatch(setSearchDrawerOpen(true))}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="xl:hidden relative"
                onClick={() => setIsMobileNotificationDrawerOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </>
          )}
          {isAuthenticated && (
            <ProfileSheet
              user={user as User}
              onLogout={handleLogout}
              unreadCount={unreadCount}
              setIsMobileNotificationDrawerOpen={setIsMobileNotificationDrawerOpen}
            />
          )}
          {isAuthenticated && (
            <SearchDrawer />
          )}
          {isAuthenticated ? (
            <>
              <Button className="hidden md:flex" variant="outline" onClick={() => router.push("/profile")}>
                <Avatar className="h-6 w-6">
                  {user?.avatarUrl ? <AvatarImage src={user?.avatarUrl} />
                    :
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                  }
                </Avatar>
                <span className="hidden md:block ml-1">{user?.name}</span>
              </Button>
              <Button className="hidden md:flex" variant="outline" onClick={() => router.push("/settings")}>
                <Settings className="h-5 w-5" />
                <span className="hidden md:block ml-1">Settings</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

