"use client"

import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/slices/authSlice"
import type { AppDispatch } from "@/lib/store"

export function AccountActions() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleLogout = async () => {
    await dispatch(logout())
    router.push("/login")
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center space-x-2">
          <LogOut className="h-6 w-6" />
          <span>Account Actions</span>
        </CardTitle>
        <CardDescription>Manage your account access.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </CardContent>
    </Card>
  )
}

