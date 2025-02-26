// src/components/layout/Navbar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { logout } from "@/lib/slices/authSlice"
import { CircleUserRound, MoonIcon, SunIcon, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "../Logo"
import { useRouter } from "next/navigation"
import type { Notification, User } from "@/lib/types"
import { ProfileSheet } from "./MobileSideBar"
import { fetchNotifications, fetchUnreadCount } from "@/lib/slices/notificationSlice"

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
    dispatch(fetchUnreadCount())

    // Set up polling interval - every 30 seconds
    const notificationInterval = setInterval(() => {
      dispatch(fetchNotifications())
    }, 30000)

    // Set up a faster polling for unread count - every 10 seconds
    const unreadCountInterval = setInterval(() => {
      dispatch(fetchUnreadCount())
    }, 10000)

    return () => {
      clearInterval(notificationInterval)
      clearInterval(unreadCountInterval)
    }
  }, [dispatch, isAuthenticated])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const handleLogout = async () => {
    await dispatch(logout())
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex flex-row space-x-2">
          <Logo />
          <div className="text-2xl hidden sm:block font-bold">SlateChain</div>
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
            <Button
              size="icon"
              variant="ghost"
              className="xl:hidden relative"
              onClick={() => setIsMobileNotificationDrawerOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-medium">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          )}
          {isAuthenticated && (
            <ProfileSheet
              user={user as User}
              onLogout={handleLogout}
              unreadCount={unreadCount}
              setIsMobileNotificationDrawerOpen={setIsMobileNotificationDrawerOpen}
            />
          )}
          {isAuthenticated ? (
            <>
              <Button className="hidden md:flex" variant="outline" onClick={() => router.push("/profile")}>
                <CircleUserRound size={20} />
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

