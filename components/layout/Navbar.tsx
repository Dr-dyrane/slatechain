// src/components/layout/Navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { logout } from "@/lib/slices/authSlice";
import { CircleUserRound, MoonIcon, SunIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../Logo";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login')
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex flex-row space-x-2">
          <Logo />
          <div className="text-2xl hidden sm:block font-bold">SlateChain</div>
        </Link>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            <SunIcon className="h-5 w-5 dark:hidden" />
            <MoonIcon className="h-5 w-5 hidden dark:block" />
          </Button>
          {isAuthenticated ? (
            <>
              <Button variant="outline" onClick={() => router.push('/profile')}>
                <CircleUserRound size={20}/>
                <span className="hidden md:block ml-1">{user?.name}</span>
              </Button>
              <Button variant="outline" onClick={() => router.push('/settings')} >
                <Settings className="h-5 w-5" />
                <span className="hidden md:block ml-1">Settings
                </span>
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
  );
}